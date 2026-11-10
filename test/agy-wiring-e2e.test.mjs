import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("executeGlobalAgySmartMind wires multi-provider invokeAgyModel, figtron-mobile profile, real closed-loop critique, and optional GemiMCP dispatch", async () => {
  const {
    GEMITRON_GLOBAL_SERVICES,
    resolveGemitronServiceProfile,
    getAppKnowledgeAndSkills,
    executeGlobalAgySmartMind
  } = await import("../src/index.mjs");

  assert.ok(GEMITRON_GLOBAL_SERVICES["figtron-mobile"]);
  assert.equal(resolveGemitronServiceProfile("fig-mobile").id, "figtron-mobile");
  assert.equal(getAppKnowledgeAndSkills("figtron-mobile").appId, "figtron");

  const mcpCalls = [];
  const res = await executeGlobalAgySmartMind({
    service: "figtron-mobile",
    authMode: "api-key-env",
    model: "gemini-4-argon-high",
    effort: "high",
    prompt: "صمم شاشة دفع عربي متجاوبة بمتغيرات GemiTokens",
    env: { GEMINI_API_KEY: "live-gem-key" },
    context: {
      presetId: "bilingual-rtl-ltr-mirror",
      feedback: "العناصر زحمة والتباين ضعيف",
      dispatchMcpTools: true,
      spec: {
        paletteId: "inferno-dark",
        locale: "ar-EG",
        frames: [
          {
            id: "f1",
            name: "Checkout",
            width: 390,
            height: 844,
            autoLayout: { enabled: true, gap: 11, padding: 9 },
            children: [
              {
                id: "t1",
                type: "TEXT",
                text: "الدفع الآمن",
                direction: "ltr",
                fgHex: "#777777",
                bgHex: "#888888"
              }
            ]
          }
        ]
      }
    },
    fetchFn: async (url, init) => {
      const u = String(url);
      if (u.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          status: 200,
          async json() {
            return {
              candidates: [{ content: { parts: [{ text: "Live Gemini RTL Checkout Plan" }] } }],
              usageMetadata: { promptTokenCount: 48, candidatesTokenCount: 36 }
            };
          }
        };
      }
      if (u.includes("/products/figtron/mcp")) {
        const rpc = JSON.parse(init.body);
        mcpCalls.push(rpc.params.name);
        return {
          ok: true,
          status: 200,
          async json() {
            return { jsonrpc: "2.0", id: rpc.id, result: { applied: true } };
          }
        };
      }
      throw new Error(`Unexpected URL: ${u}`);
    }
  });

  assert.equal(res.ok, true);
  assert.equal(res.liveInferenceUsed, true);
  assert.equal(res.upstreamProvider, "google-gemini-api");
  assert.equal(res.content, "Live Gemini RTL Checkout Plan");
  assert.equal(res.structured.engine, "figtron-mobile-agy-smart-mind");
  assert.equal(res.structured.closedLoopCritique.finalStatus, "PASSED");
  assert.equal(res.structured.closedLoopCritique.repairedSpec.frames[0].autoLayout.gap % 4, 0);
  assert.ok(mcpCalls.length >= 1);
});

test("agy-node-daemon serves /ui Control Studio (zero fake Math.random latency), /v1/agy/suite/* endpoints, and CLI suite subcommands", async () => {
  const { createAgyNodeDaemonServer } = await import("../bin/agy-node-daemon.mjs");
  const { runTronAgyCli } = await import("../bin/tron-agy.mjs");

  const htmlSource = fs.readFileSync(
    new URL("../ui/tron-agy-control-studio.html", import.meta.url),
    "utf8"
  );
  assert.equal(/Math\.random\(\)/.test(htmlSource), false, "Control Studio HTML must not fabricate latencies via Math.random()");

  const daemon = createAgyNodeDaemonServer({ nodeId: "win-local" });
  await new Promise((resolve) => daemon.listen(0, "127.0.0.1", resolve));
  const { port } = daemon.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const uiRes = await fetch(`${base}/ui`);
    assert.equal(uiRes.status, 200);
    const uiHtml = await uiRes.text();
    assert.match(uiHtml, /<!DOCTYPE html>/i);

    const dirRes = await fetch(`${base}/v1/agy/suite/direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: "figtron",
        presetId: "auto-layout-responsive-system",
        prompt: "لوحة تحكم مدفوعات عربية"
      })
    });
    assert.equal(dirRes.status, 200);
    const dirBody = await dirRes.json();
    assert.equal(dirBody.ok, true);
    assert.equal(dirBody.appId, "figtron");
    assert.equal(dirBody.directions.length, 2);

    const fbRes = await fetch(`${base}/v1/agy/suite/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: "figtron",
        feedback: "وسع المسافات واظبط العربي"
      })
    });
    assert.equal(fbRes.status, 200);
    const fbBody = await fbRes.json();
    assert.equal(fbBody.ok, true);
    assert.ok(fbBody.actions.length >= 2);

    const cgRes = await fetch(`${base}/v1/agy/suite/codegen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "flutter",
        spec: { paletteId: "inferno-dark", locale: "ar-EG", frames: [] }
      })
    });
    assert.equal(cgRes.status, 200);
    const cgBody = await cgRes.json();
    assert.equal(cgBody.ok, true);
    assert.match(cgBody.code, /Directionality/);
  } finally {
    await new Promise((resolve) => daemon.close(resolve));
  }

  const cliFig = await runTronAgyCli([
    "figtron-director",
    "--preset",
    "wcag-aaa-token-harmonizer",
    "--prompt",
    "تطبيق بنكي عربي"
  ]);
  assert.equal(cliFig.ok, true);
  assert.equal(cliFig.appId, "figtron");

  const cliCodegen = await runTronAgyCli(["codegen", "--target", "react"]);
  assert.equal(cliCodegen.ok, true);
  assert.equal(cliCodegen.target, "react");
});
