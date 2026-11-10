/**
 * @gemitron/agy-tron — Multi-Provider ToS-Safe LLM Inference Router (`src/llm-providers.mjs`)
 *
 * Strictly enforces `tronagy.google_tos_safe.v1`:
 *   - NEVER reads, scrapes, or decrypts `~/.gemini/oauth_creds.json` or internal IDE auth files.
 *   - NEVER calls undocumented Google internal endpoints (`cloudaicompanion.googleapis.com`, `cloudcode-pa.googleapis.com`).
 *   - Supports:
 *       1. `agy-mcp-host`: Host-Inversion sampling (`AGY_HOST_SAMPLING_URL`) or opt-in official `agy` CLI (`AGY_CLI_BRIDGE_ENABLED=1`).
 *       2. `api-key-env`: Official public REST APIs (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMIAI_API_KEY`).
 *       3. `local-tron-loopback`: Local Ollama (`127.0.0.1:11434/api/chat`), `llama-server` (`127.0.0.1:8090`), and GemiAI (`127.0.0.1:18090`).
 *   - Integrates with `defaultAgyQuotaLedger` for HTTP 429 rate-limit recording and automatic fallback-chain retry.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { defaultAgyQuotaLedger, resolveModelFamilyId } from "./quota-ledger.mjs";

const execFileAsync = promisify(execFile);

const FORBIDDEN_CREDENTIAL_PATTERNS = [
  /\.gemini[\\/]+oauth_creds\.json/i,
  /oauth_creds\.json/i,
  /application_default_credentials\.json.*antigravity/i
];

const FORBIDDEN_INTERNAL_HOST_PATTERNS = [
  /cloudaicompanion\.googleapis\.com/i,
  /cloudcode-pa\.googleapis\.com/i,
  /antigravity-pa\.googleapis\.com/i
];

export function assertTosSafeInferenceTarget({ endpointUrl = "", credentialPath = "" } = {}) {
  const cleanUrl = String(endpointUrl || "").trim();
  const cleanPath = String(credentialPath || "").trim();

  for (const rx of FORBIDDEN_CREDENTIAL_PATTERNS) {
    if (cleanPath && rx.test(cleanPath)) {
      return {
        ok: false,
        code: "TOS_VIOLATION_BLOCKED",
        reason: "Reading internal .gemini OAuth credential files is strictly prohibited by AGY_TOS_SAFETY_GUARD."
      };
    }
  }
  for (const rx of FORBIDDEN_INTERNAL_HOST_PATTERNS) {
    if (cleanUrl && rx.test(cleanUrl)) {
      return {
        ok: false,
        code: "TOS_VIOLATION_BLOCKED",
        reason: "Calling undocumented internal Google Cloud endpoints is strictly prohibited by AGY_TOS_SAFETY_GUARD."
      };
    }
  }
  return {
    ok: true,
    tosSafe: true,
    policyId: "tronagy.google_tos_safe.v1"
  };
}

export function mapAgyModelToCommercialApiModel(agyModelId = "gemini-4-argon-high", env = process.env) {
  const id = String(agyModelId || "gemini-4-argon-high").trim().toLowerCase();
  if (id.startsWith("gemini-3.8-flash") || id === "gemini-3-flash") {
    return { vendor: "gemini", apiModel: env.GEMINI_FLASH_API_MODEL || "gemini-2.5-flash" };
  }
  if (id.startsWith("gemini-")) {
    return { vendor: "gemini", apiModel: env.GEMINI_API_MODEL || "gemini-2.5-pro" };
  }
  if (id.startsWith("claude-opus")) {
    return { vendor: "anthropic", apiModel: env.ANTHROPIC_OPUS_API_MODEL || "claude-opus-4-6" };
  }
  if (id.startsWith("claude-")) {
    return { vendor: "anthropic", apiModel: env.ANTHROPIC_SONNET_API_MODEL || "claude-sonnet-4-6" };
  }
  if (id.startsWith("qwen")) {
    return { vendor: "local", apiModel: agyModelId };
  }
  return { vendor: "openai", apiModel: env.OPENAI_API_MODEL || "gpt-4.1" };
}

async function fetchWithTimeout(fetchFn, url, options, timeoutMs = 4500) {
  const safety = assertTosSafeInferenceTarget({ endpointUrl: url });
  if (!safety.ok) {
    const err = new Error(safety.reason);
    err.code = safety.code;
    throw err;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(250, timeoutMs));
  try {
    return await fetchFn(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function defaultSpawnAgyCli({ args = [], timeoutMs = 8000 } = {}) {
  const bin = process.platform === "win32" ? "agy.cmd" : "agy";
  const { stdout, stderr } = await execFileAsync(bin, args, {
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 2 * 1024 * 1024
  });
  return { exitCode: 0, stdout: String(stdout || ""), stderr: String(stderr || "") };
}

async function trySingleCommercialModel({
  modelId,
  systemPrompt,
  prompt,
  messages,
  maxTokens = 1400,
  temperature = 0.35,
  env,
  fetchFn,
  timeoutMs
}) {
  if (typeof fetchFn !== "function") {
    return { ok: false, reason: "NO_FETCH" };
  }
  const mapped = mapAgyModelToCommercialApiModel(modelId, env);
  const userMessages =
    Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: "user", content: prompt }];

  // 1. Official Google Gemini API (`GEMINI_API_KEY`)
  if (mapped.vendor === "gemini" && env.GEMINI_API_KEY) {
    const base = String(env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
    const url = `${base}/models/${encodeURIComponent(mapped.apiModel)}:generateContent`;
    const contents = userMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));
    const body = {
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };
    const res = await fetchWithTimeout(
      fetchFn,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify(body)
      },
      timeoutMs
    );
    if (res && res.status === 429) {
      return { ok: false, rateLimited: true, status: 429, upstreamProvider: "google-gemini-api" };
    }
    if (res && res.ok && typeof res.json === "function") {
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p) => p?.text || "").join("").trim();
      if (text) {
        return {
          ok: true,
          liveInferenceUsed: true,
          upstreamProvider: "google-gemini-api",
          text,
          promptTokens: data?.usageMetadata?.promptTokenCount || 0,
          completionTokens: data?.usageMetadata?.candidatesTokenCount || 0
        };
      }
    }
  }

  // 2. Official Anthropic Messages API (`ANTHROPIC_API_KEY`)
  if (mapped.vendor === "anthropic" && env.ANTHROPIC_API_KEY) {
    const base = String(env.ANTHROPIC_API_BASE_URL || "https://api.anthropic.com").replace(/\/+$/, "");
    const url = `${base}/v1/messages`;
    const body = {
      model: mapped.apiModel,
      max_tokens: maxTokens,
      temperature,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: userMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "")
      }))
    };
    const res = await fetchWithTimeout(
      fetchFn,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(body)
      },
      timeoutMs
    );
    if (res && res.status === 429) {
      return { ok: false, rateLimited: true, status: 429, upstreamProvider: "anthropic-messages-api" };
    }
    if (res && res.ok && typeof res.json === "function") {
      const data = await res.json();
      const blocks = Array.isArray(data?.content) ? data.content : [];
      const text = blocks
        .filter((b) => b && (b.type === "text" || typeof b.text === "string"))
        .map((b) => b.text)
        .join("")
        .trim();
      if (text) {
        return {
          ok: true,
          liveInferenceUsed: true,
          upstreamProvider: "anthropic-messages-api",
          text,
          promptTokens: data?.usage?.input_tokens || 0,
          completionTokens: data?.usage?.output_tokens || 0
        };
      }
    }
  }

  // 3. Official OpenAI-compatible or GemiAI Cloud API (`OPENAI_API_KEY` or `GEMIAI_API_KEY`)
  const openAiKey = env.OPENAI_API_KEY || env.GEMIAI_API_KEY || "";
  const openAiBase = env.OPENAI_BASE_URL || env.GEMIAI_CLOUD_URL || "";
  if (openAiKey && (mapped.vendor === "openai" || openAiBase)) {
    const base = String(openAiBase || "https://api.openai.com").replace(/\/+$/, "");
    const url = `${base}/v1/chat/completions`;
    const res = await fetchWithTimeout(
      fetchFn,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: mapped.apiModel,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            ...userMessages
          ],
          temperature,
          max_tokens: maxTokens
        })
      },
      timeoutMs
    );
    if (res && res.status === 429) {
      return { ok: false, rateLimited: true, status: 429, upstreamProvider: "openai-compatible-api" };
    }
    if (res && res.ok && typeof res.json === "function") {
      const data = await res.json();
      const text = String(data?.choices?.[0]?.message?.content || "").trim();
      if (text) {
        return {
          ok: true,
          liveInferenceUsed: true,
          upstreamProvider: "openai-compatible-api",
          text,
          promptTokens: data?.usage?.prompt_tokens || 0,
          completionTokens: data?.usage?.completion_tokens || 0
        };
      }
    }
  }

  // Cross-vendor fallback if user requested Gemini model id with only ANTHROPIC_API_KEY or vice versa
  if (mapped.vendor !== "gemini" && env.GEMINI_API_KEY) {
    return trySingleCommercialModel({
      modelId: "gemini-4-argon-high",
      systemPrompt,
      prompt,
      messages,
      maxTokens,
      temperature,
      env,
      fetchFn,
      timeoutMs
    });
  }
  if (mapped.vendor !== "anthropic" && env.ANTHROPIC_API_KEY) {
    return trySingleCommercialModel({
      modelId: "claude-sonnet-5-5-high",
      systemPrompt,
      prompt,
      messages,
      maxTokens,
      temperature,
      env,
      fetchFn,
      timeoutMs
    });
  }

  return { ok: false, reason: "NO_MATCHING_API_KEY" };
}

async function tryLocalLoopbackProviders({
  modelId,
  systemPrompt,
  prompt,
  messages,
  maxTokens = 1200,
  temperature = 0.35,
  env,
  fetchFn,
  timeoutMs
}) {
  if (typeof fetchFn !== "function") {
    return { ok: false, reason: "NO_FETCH" };
  }
  const chatMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...(Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: "user", content: prompt }])
  ];

  // 1. Ollama local loopback (`127.0.0.1:11434/api/chat`)
  const ollamaOrigin = String(env.OLLAMA_HOST || env.AGY_OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  const ollamaModel = String(modelId || "").startsWith("qwen")
    ? modelId
    : env.AGY_LOCAL_OLLAMA_MODEL || "qwen3.5:4b-q4_K_M";
  try {
    const res = await fetchWithTimeout(
      fetchFn,
      `${ollamaOrigin}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: chatMessages,
          stream: false,
          options: { temperature, num_predict: maxTokens }
        })
      },
      Math.min(timeoutMs, 2500)
    );
    if (res && res.ok && typeof res.json === "function") {
      const data = await res.json();
      const content = String(data?.message?.content || data?.response || "").trim();
      if (content) {
        return {
          ok: true,
          liveInferenceUsed: true,
          upstreamProvider: "ollama-local-loopback",
          text: content
        };
      }
    }
  } catch {
    // Continue to llama-server / GemiAI local loopback
  }

  // 2. Local OpenAI-compatible endpoints (`127.0.0.1:18090` GemiAI & `127.0.0.1:8090` llama-server)
  const candidates = [
    {
      provider: "gemiai-local-loopback",
      base: env.AGY_LOCAL_LLM_URL || env.GEMIAI_BASE_URL || "http://127.0.0.1:18090"
    },
    {
      provider: "tron-llama-server-loopback",
      base: env.TRON_LLAMA_SERVER_URL || "http://127.0.0.1:8090"
    }
  ];

  for (const cand of candidates) {
    try {
      const res = await fetchWithTimeout(
        fetchFn,
        `${String(cand.base).replace(/\/+$/, "")}/v1/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelId,
            messages: chatMessages,
            temperature,
            max_tokens: maxTokens
          })
        },
        Math.min(timeoutMs, 2500)
      );
      if (res && res.status === 429) {
        return { ok: false, rateLimited: true, status: 429, upstreamProvider: cand.provider };
      }
      if (res && res.ok && typeof res.json === "function") {
        const data = await res.json();
        const content = String(data?.choices?.[0]?.message?.content || data?.response || "").trim();
        if (content) {
          return {
            ok: true,
            liveInferenceUsed: true,
            upstreamProvider: cand.provider,
            text: content
          };
        }
      }
    } catch {
      // Try next local candidate
    }
  }

  return { ok: false, reason: "LOCAL_LOOPBACK_UNREACHABLE" };
}

/**
 * Executes ToS-safe model inference across Host-Inversion MCP/CLI, Commercial API keys,
 * and Local TRON/Ollama Loopback with automatic 429 quota-ledger failover.
 */
export async function invokeAgyModel({
  model = "gemini-4-argon-high",
  authMode = "agy-mcp-host",
  serviceId = "gemiai",
  systemPrompt = "",
  prompt = "",
  messages = [],
  maxTokens = 1400,
  temperature = 0.35,
  env = process.env,
  fetchFn = globalThis.fetch,
  spawnCliFn = defaultSpawnAgyCli,
  quotaLedger = defaultAgyQuotaLedger,
  timeoutMs = 4500
} = {}) {
  if (env?.AGY_DISABLE_LIVE_UPSTREAM === "1") {
    return {
      ok: false,
      liveInferenceUsed: false,
      upstreamProvider: "disabled-by-env",
      effectiveModel: model,
      failoverTriggered: false,
      text: null
    };
  }

  const initialSelection = quotaLedger
    ? quotaLedger.selectQuotaSafeModel(model)
    : { selectedModelId: model, failoverTriggered: false };
  let activeModel = initialSelection.selectedModelId || model;
  let failoverTriggered = Boolean(initialSelection.failoverTriggered);

  // 1. Host-Inversion MCP Sampling (`AGY_HOST_SAMPLING_URL`) or Official CLI (`AGY_CLI_BRIDGE_ENABLED=1`)
  if (authMode === "agy-mcp-host" || authMode === "gemi-access-token") {
    if (env?.AGY_HOST_SAMPLING_URL && typeof fetchFn === "function") {
      try {
        const hostUrl = String(env.AGY_HOST_SAMPLING_URL).trim();
        const res = await fetchWithTimeout(
          fetchFn,
          hostUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(env.GEMIMCP_ACCESS_TOKEN ? { Authorization: `Bearer ${env.GEMIMCP_ACCESS_TOKEN}` } : {})
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: `agy-sample-${Date.now()}`,
              method: "sampling/createMessage",
              params: {
                modelPreferences: { hints: [{ name: activeModel }] },
                systemPrompt,
                messages: [
                  {
                    role: "user",
                    content: { type: "text", text: prompt }
                  }
                ],
                maxTokens
              }
            })
          },
          timeoutMs
        );
        if (res && res.ok && typeof res.json === "function") {
          const data = await res.json();
          const text = String(
            data?.result?.content?.text ||
              data?.choices?.[0]?.message?.content ||
              data?.text ||
              ""
          ).trim();
          if (text) {
            return {
              ok: true,
              liveInferenceUsed: true,
              upstreamProvider: "agy-mcp-host-sampling",
              effectiveModel: activeModel,
              failoverTriggered,
              text
            };
          }
        }
      } catch {
        // Fall through to CLI or API-key / local cascade
      }
    }

    if (env?.AGY_CLI_BRIDGE_ENABLED === "1" && typeof spawnCliFn === "function") {
      try {
        const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const cliOut = await spawnCliFn({
          args: ["chat", "--print", "--model", activeModel, combinedPrompt],
          timeoutMs
        });
        const cleanStdout = String(cliOut?.stdout || "").trim();
        if (cliOut?.exitCode === 0 && cleanStdout) {
          return {
            ok: true,
            liveInferenceUsed: true,
            upstreamProvider: "agy-cli-host-bridge",
            effectiveModel: activeModel,
            failoverTriggered,
            text: cleanStdout
          };
        }
      } catch {
        // Fall through to API-key / local cascade
      }
    }
  }

  // 2. Official Commercial API Keys (`GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`)
  if (authMode !== "local-tron-loopback") {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const apiAttempt = await trySingleCommercialModel({
          modelId: activeModel,
          systemPrompt,
          prompt,
          messages,
          maxTokens,
          temperature,
          env: env || {},
          fetchFn,
          timeoutMs
        });
        if (apiAttempt.ok) {
          return {
            ...apiAttempt,
            effectiveModel: activeModel,
            failoverTriggered
          };
        }
        if (apiAttempt.rateLimited && quotaLedger && typeof quotaLedger.recordUsage === "function") {
          quotaLedger.recordUsage({
            modelId: activeModel,
            serviceId,
            promptTokens: Math.max(8, Math.ceil(prompt.length / 4)),
            rateLimited: true,
            cooldownSeconds: 300
          });
          const nextSafe = quotaLedger.selectQuotaSafeModel(activeModel);
          if (nextSafe.selectedModelId && nextSafe.selectedModelId !== activeModel) {
            activeModel = nextSafe.selectedModelId;
            failoverTriggered = true;
            continue;
          }
        }
        break;
      } catch {
        break;
      }
    }
  }

  // 3. Local TRON / Ollama / GemiAI Loopback (`127.0.0.1:11434`, `127.0.0.1:18090`, `127.0.0.1:8090`)
  const localRes = await tryLocalLoopbackProviders({
    modelId: activeModel,
    systemPrompt,
    prompt,
    messages,
    maxTokens,
    temperature,
    env: env || {},
    fetchFn,
    timeoutMs
  });
  if (localRes.ok) {
    return {
      ...localRes,
      effectiveModel: activeModel,
      failoverTriggered
    };
  }
  if (localRes.rateLimited) {
    return {
      ok: false,
      liveInferenceUsed: false,
      rateLimited: true,
      upstreamProvider: localRes.upstreamProvider,
      effectiveModel: activeModel,
      failoverTriggered,
      text: null
    };
  }

  return {
    ok: false,
    liveInferenceUsed: false,
    upstreamProvider: "offline-no-live-upstream",
    effectiveModel: activeModel,
    familyId: resolveModelFamilyId(activeModel),
    failoverTriggered,
    text: null
  };
}
