import test from "node:test";
import assert from "node:assert/strict";
import {
  TRON_AGY_SCHEMA,
  AGY_TOS_SAFETY_GUARD,
  TRONCS_SUITE_APPS,
  AGY_MODELS,
  AGY_EFFORT_TIERS,
  buildTronAgyCreativePlan
} from "../src/index.mjs";
import {
  GEMIMCP_ENDPOINTS,
  resolveMcpTransportConfig
} from "../src/mcp-bridge.mjs";

test("TronAGY enforces 100% Google-ToS-Safe Host-Inversion auth guardrails", () => {
  assert.equal(AGY_TOS_SAFETY_GUARD.forbidExternalGoogleOauthExtraction, true);
  assert.equal(AGY_TOS_SAFETY_GUARD.forbidGeminiCredentialFileScraping, true);
  assert.equal(AGY_TOS_SAFETY_GUARD.forbidUndocumentedInternalEndpoints, true);
  assert.equal(AGY_TOS_SAFETY_GUARD.architecturePattern, "host-inversion-mcp-client");
});

test("TronAGY covers all 6 TronCS Creative Suite apps and builds multi-app production plans", () => {
  const appIds = Object.keys(TRONCS_SUITE_APPS);
  assert.deepEqual(appIds, [
    "phototron",
    "aftertron",
    "filmtron",
    "gemimotion",
    "figtron",
    "lighttron"
  ]);
  assert.equal(AGY_MODELS.length, 5);
  assert.equal(AGY_EFFORT_TIERS.max.thinkingBudgetTokens, 32768);
  assert.equal(AGY_EFFORT_TIERS.max.maxCritiquePasses, 5);

  const plan = buildTronAgyCreativePlan({
    prompt: "إطلاق ساعة أورورا X1 عبر جميع تطبيقات TronCS الستة",
    apps: appIds,
    model: "claude-opus-4-6",
    effort: "max",
    authMode: "antigravity-oauth",
    mcpTransport: "hybrid-auto"
  });
  assert.equal(plan.ok, true);
  assert.equal(plan.schema, TRON_AGY_SCHEMA);
  assert.equal(plan.authMode, "agy-mcp-host");
  assert.equal(plan.stages.length, 6);
  assert.equal(plan.thinkingBudgetTokens, 32768);
  assert.equal(plan.maxCritiquePasses, 5);
});

test("TronAGY Dual-Transport GemiMCP Bridge resolves Cloud (mcp.gemitron.net) and Local (127.0.0.1:18210) endpoints", () => {
  assert.equal(GEMIMCP_ENDPOINTS.cloud.origin, "https://mcp.gemitron.net");
  assert.equal(GEMIMCP_ENDPOINTS.localWorkstation.origin, "http://127.0.0.1:18210");

  const hybrid = resolveMcpTransportConfig({ transport: "hybrid-auto" });
  assert.equal(hybrid.activeTransport, "hybrid-auto");
  assert.equal(hybrid.primaryMcpUrl, "http://127.0.0.1:18210/products/troncs/mcp");
  assert.equal(hybrid.fallbackMcpUrl, "https://mcp.gemitron.net/products/troncs/mcp");

  const local = resolveMcpTransportConfig({ transport: "local-only" });
  assert.equal(local.zeroCloudTraffic, true);
  assert.equal(local.fallbackMcpUrl, null);
});

test("AGY Fleet Router connects to Windows Local, Mac Local, VPS 01, and VPS 02 and streams zero-jargon chat events", async () => {
  const {
    AGY_FLEET_NODES,
    selectOptimalFleetNode,
    buildCreatorFriendlyStreamEvents
  } = await import("../src/fleet-router.mjs");

  assert.deepEqual(Object.keys(AGY_FLEET_NODES), [
    "auto-best",
    "win-local",
    "mac-local",
    "vps-01",
    "vps-02"
  ]);

  const macSelected = selectOptimalFleetNode({
    preferredNodeId: "mac-local",
    nodeStatusMap: { "mac-local": { online: true } }
  });
  assert.equal(macSelected.selectedNode.id, "mac-local");
  assert.equal(macSelected.failoverUsed, false);

  const failoverToVps01 = selectOptimalFleetNode({
    preferredNodeId: "win-local",
    nodeStatusMap: {
      "win-local": { online: false },
      "mac-local": { online: false },
      "vps-01": { online: true }
    }
  });
  assert.equal(failoverToVps01.selectedNode.id, "vps-01");
  assert.equal(failoverToVps01.failoverUsed, true);

  const events = buildCreatorFriendlyStreamEvents({
    prompt: "إعلان فاخر",
    locale: "ar-EG",
    nodeId: "vps-02"
  });
  assert.equal(events.length, 6);
  assert.equal(events[0].type, "thinking");
  assert.equal(events[5].type, "chat_message");
});

