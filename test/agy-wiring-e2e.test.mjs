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

test("Daemon :18220 /v1/agy/suite/*, /v1/agy/chat-stream, /v1/agy/smart-mind, mcp-bridge, and TronAgyControlCenter.tsx enforce AGY_TOS_SAFETY_GUARD, 20-palette GemiTokens, AR/EN RTL, color-neutral badges, and 7+7 companion matrix", async () => {
  const { createAgyNodeDaemonServer } = await import("../bin/agy-node-daemon.mjs");
  const { resolveMcpTransportConfig } = await import("../src/mcp-bridge.mjs");
  const { TRONCS_SEVEN_DESKTOP_APPS, TRONCS_SEVEN_MOBILE_COMPANIONS } = await import("../src/index.mjs");

  for (const mobId of TRONCS_SEVEN_MOBILE_COMPANIONS) {
    const route = resolveMcpTransportConfig({ product: mobId, transport: "hybrid-auto" });
    assert.equal(route.isMobileCompanion, true);
    assert.equal(route.mobileBridgeScope, `${mobId}:*`);
    assert.equal(route.tosSafePolicyId, "tronagy.google_tos_safe.v1");
  }

  const daemon = createAgyNodeDaemonServer({ nodeId: "vps-01" });
  await new Promise((resolve) => daemon.listen(0, "127.0.0.1", resolve));
  const { port } = daemon.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const catRes = await fetch(`${base}/v1/agy/suite/catalog`);
    assert.equal(catRes.status, 200);
    const catBody = await catRes.json();
    assert.equal(catBody.ok, true);
    assert.equal(catBody.desktopApps.length, 7);
    assert.equal(catBody.mobileCompanions.length, 7);
    assert.equal(catBody.allProducts.length, 14);
    assert.equal(catBody.tosSafetyGuard.forbidExternalGoogleOauthExtraction, true);

    const streamRes = await fetch(`${base}/v1/agy/chat-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ prompt: "تحريك 3D", service: "gemimotion-mobile", format: "json" })
    });
    assert.equal(streamRes.status, 200);
    const streamBody = await streamRes.json();
    assert.equal(streamBody.ok, true);
    assert.equal(streamBody.tosSafetyGuard.policyId, "tronagy.google_tos_safe.v1");
    assert.equal(streamBody.events.length, 6);

    const smRes = await fetch(`${base}/v1/agy/smart-mind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "تكبير فائق الدقة", service: "scaletron-mobile", effort: "high" })
    });
    assert.equal(smRes.status, 200);
    const smBody = await smRes.json();
    assert.equal(smBody.ok, true);
    assert.equal(smBody.service, "scaletron-mobile");
    assert.equal(smBody.plan.tosSafetyGuard.policyId, "tronagy.google_tos_safe.v1");
  } finally {
    await new Promise((resolve) => daemon.close(resolve));
  }

  const uiTsx = fs.readFileSync(
    new URL("../ui/TronAgyControlCenter.tsx", import.meta.url),
    "utf8"
  );
  assert.match(uiTsx, /GEMI_TOKENS_PALETTES_UI/);
  assert.match(uiTsx, /inferno-dark/);
  assert.match(uiTsx, /Inferno Pixel Glass/);
  assert.match(uiTsx, /GemiBaba/);
  assert.match(uiTsx, /GemiFontSans/);
  assert.match(uiTsx, /tron-agy-locale-toggle/);
  assert.match(uiTsx, /tron-agy-color-neutral-badges/);
  assert.match(uiTsx, /#808080/);
  assert.match(uiTsx, /tron-agy-suite-companion-matrix/);
  for (const id of [...TRONCS_SEVEN_DESKTOP_APPS, ...TRONCS_SEVEN_MOBILE_COMPANIONS]) {
    assert.equal(uiTsx.includes(`'${id}'`), true, `UI missing product ID ${id}`);
  }
});
