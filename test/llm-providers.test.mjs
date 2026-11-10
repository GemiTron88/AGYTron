import test from "node:test";
import assert from "node:assert/strict";
import { createAgyQuotaLedger } from "../src/quota-ledger.mjs";

test("assertTosSafeInferenceTarget blocks .gemini credential scraping and undocumented Google internal endpoints", async () => {
  const { assertTosSafeInferenceTarget } = await import("../src/llm-providers.mjs");

  const safeCheck = assertTosSafeInferenceTarget({
    endpointUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
    credentialPath: ""
  });
  assert.equal(safeCheck.ok, true);

  const oauthScrape = assertTosSafeInferenceTarget({
    endpointUrl: "http://127.0.0.1:18220",
    credentialPath: "C:/Users/creator/.gemini/oauth_creds.json"
  });
  assert.equal(oauthScrape.ok, false);
  assert.equal(oauthScrape.code, "TOS_VIOLATION_BLOCKED");

  const internalApi = assertTosSafeInferenceTarget({
    endpointUrl: "https://cloudaicompanion.googleapis.com/v1/internal:generate",
    credentialPath: ""
  });
  assert.equal(internalApi.ok, false);
  assert.equal(internalApi.code, "TOS_VIOLATION_BLOCKED");
});

test("invokeAgyModel executes official Gemini, Anthropic, and OpenAI/GemiAI REST APIs when keys are provided", async () => {
  const { invokeAgyModel } = await import("../src/llm-providers.mjs");
  const calls = [];

  const mockFetch = async (url, init = {}) => {
    calls.push({ url: String(url), headers: init.headers || {}, body: JSON.parse(init.body || "{}") });
    const u = String(url);
    if (u.includes("generativelanguage.googleapis.com")) {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            candidates: [{ content: { parts: [{ text: "Gemini official creative plan" }] } }],
            usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 25 }
          };
        }
      };
    }
    if (u.includes("api.anthropic.com/v1/messages")) {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            content: [{ type: "text", text: "Anthropic Claude Opus creative direction" }],
            usage: { input_tokens: 55, output_tokens: 30 }
          };
        }
      };
    }
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          choices: [{ message: { content: "OpenAI compatible response" } }],
          usage: { prompt_tokens: 20, completion_tokens: 15 }
        };
      }
    };
  };

  const geminiRes = await invokeAgyModel({
    model: "gemini-4-argon-high",
    authMode: "api-key-env",
    systemPrompt: "You are FigTron Director",
    prompt: "Design RTL checkout screen",
    env: { GEMINI_API_KEY: "test-gemini-key" },
    fetchFn: mockFetch,
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(geminiRes.ok, true);
  assert.equal(geminiRes.liveInferenceUsed, true);
  assert.equal(geminiRes.upstreamProvider, "google-gemini-api");
  assert.equal(geminiRes.text, "Gemini official creative plan");
  assert.equal(calls[0].headers["x-goog-api-key"], "test-gemini-key");

  const claudeRes = await invokeAgyModel({
    model: "claude-opus-5-5-high",
    authMode: "api-key-env",
    systemPrompt: "You are FilmTron Director",
    prompt: "3-act luxury watch cut",
    env: { ANTHROPIC_API_KEY: "test-anthropic-key" },
    fetchFn: mockFetch,
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(claudeRes.ok, true);
  assert.equal(claudeRes.liveInferenceUsed, true);
  assert.equal(claudeRes.upstreamProvider, "anthropic-messages-api");
  assert.equal(claudeRes.text, "Anthropic Claude Opus creative direction");
  assert.equal(calls[1].headers["x-api-key"], "test-anthropic-key");

  const openAiRes = await invokeAgyModel({
    model: "gpt-oss-120b-medium",
    authMode: "api-key-env",
    prompt: "Cluster bilingual UI copy",
    env: { OPENAI_API_KEY: "test-openai-key", OPENAI_BASE_URL: "https://api.openai.com" },
    fetchFn: mockFetch,
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(openAiRes.ok, true);
  assert.equal(openAiRes.liveInferenceUsed, true);
  assert.equal(openAiRes.upstreamProvider, "openai-compatible-api");
  assert.equal(openAiRes.text, "OpenAI compatible response");
});

test("invokeAgyModel supports ToS-safe agy-mcp-host sampling & CLI bridge, local Ollama/TRON loopback, truthful offline status, and 429 auto-failover", async () => {
  const { invokeAgyModel } = await import("../src/llm-providers.mjs");

  // 1. Host-Inversion CLI bridge when AGY_CLI_BRIDGE_ENABLED=1
  const cliRes = await invokeAgyModel({
    model: "gemini-4-argon-high",
    authMode: "agy-mcp-host",
    prompt: "Generate GemiTokens card",
    env: { AGY_CLI_BRIDGE_ENABLED: "1" },
    spawnCliFn: async ({ args }) => {
      assert.ok(Array.isArray(args));
      return { exitCode: 0, stdout: "Host CLI synthesized UI spec", stderr: "" };
    },
    fetchFn: null,
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(cliRes.ok, true);
  assert.equal(cliRes.liveInferenceUsed, true);
  assert.equal(cliRes.upstreamProvider, "agy-cli-host-bridge");
  assert.equal(cliRes.text, "Host CLI synthesized UI spec");

  // 2. Local Ollama loopback (:11434/api/chat)
  const ollamaRes = await invokeAgyModel({
    model: "qwen3.5:4b-q4_K_M",
    authMode: "local-tron-loopback",
    prompt: "Offline layout check",
    env: {},
    fetchFn: async (url) => {
      if (String(url).includes("11434/api/chat")) {
        return {
          ok: true,
          status: 200,
          async json() {
            return { message: { content: "Local Qwen3.5 offline critique OK" } };
          }
        };
      }
      throw new Error("ECONNREFUSED");
    },
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(ollamaRes.ok, true);
  assert.equal(ollamaRes.liveInferenceUsed, true);
  assert.equal(ollamaRes.upstreamProvider, "ollama-local-loopback");
  assert.equal(ollamaRes.text, "Local Qwen3.5 offline critique OK");

  // 3. Truthful offline status when no live provider is reachable
  const offlineRes = await invokeAgyModel({
    model: "gemini-4-argon-high",
    authMode: "local-tron-loopback",
    prompt: "Offline fallback check",
    env: {},
    fetchFn: async () => {
      throw new Error("ECONNREFUSED");
    },
    quotaLedger: createAgyQuotaLedger()
  });
  assert.equal(offlineRes.ok, false);
  assert.equal(offlineRes.liveInferenceUsed, false);
  assert.equal(offlineRes.upstreamProvider, "offline-no-live-upstream");

  // 4. HTTP 429 rate-limit records cooldown in quotaLedger and auto-fails over to fallback model
  const ledger = createAgyQuotaLedger();
  const seenModels = [];
  const failoverRes = await invokeAgyModel({
    model: "claude-opus-5-5-high",
    authMode: "api-key-env",
    prompt: "High demand request",
    env: {
      ANTHROPIC_API_KEY: "test-anth-key",
      GEMINI_API_KEY: "test-gem-key"
    },
    fetchFn: async (url) => {
      const u = String(url);
      if (u.includes("api.anthropic.com")) {
        seenModels.push("claude-opus-5-5-high");
        return { ok: false, status: 429, async json() { return { error: "rate_limit" }; } };
      }
      seenModels.push("gemini-4-argon-high");
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            candidates: [{ content: { parts: [{ text: "Recovered via Gemini Argon failover" }] } }]
          };
        }
      };
    },
    quotaLedger: ledger
  });
  assert.equal(failoverRes.ok, true);
  assert.equal(failoverRes.liveInferenceUsed, true);
  assert.equal(failoverRes.failoverTriggered, true);
  assert.equal(failoverRes.effectiveModel, "gemini-4-argon-high");
  assert.deepEqual(seenModels, ["claude-opus-5-5-high", "gemini-4-argon-high"]);
});
