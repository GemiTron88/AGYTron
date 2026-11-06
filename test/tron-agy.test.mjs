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

test("TronAGY covers all 7 TronCS Creative Suite apps (including ScaleTron) and builds multi-app production plans", () => {
  const appIds = Object.keys(TRONCS_SUITE_APPS);
  assert.deepEqual(appIds, [
    "phototron",
    "aftertron",
    "filmtron",
    "gemimotion",
    "figtron",
    "lighttron",
    "scaletron"
  ]);
  assert.equal(AGY_MODELS.length, 14);
  assert.equal(AGY_EFFORT_TIERS.xhigh.thinkingBudgetTokens, 24576);
  assert.equal(AGY_EFFORT_TIERS.max.thinkingBudgetTokens, 32768);
  assert.equal(AGY_EFFORT_TIERS.max.maxCritiquePasses, 5);

  const plan = buildTronAgyCreativePlan({
    prompt: "إطلاق ساعة أورورا X1 عبر جميع تطبيقات TronCS السبعة",
    apps: appIds,
    model: "claude-opus-4-6",
    effort: "max",
    authMode: "antigravity-oauth",
    executionScope: "account-remote-agent",
    accountId: "gamal@gemitron.net",
    mcpTransport: "hybrid-auto"
  });
  assert.equal(plan.ok, true);
  assert.equal(plan.schema, TRON_AGY_SCHEMA);
  assert.equal(plan.authMode, "agy-mcp-host");
  assert.equal(plan.executionScope, "account-remote-agent");
  assert.equal(plan.accountId, "gamal@gemitron.net");
  assert.equal(plan.remoteAgentRelayUrl, "https://mcp.gemitron.net/v1/agy/remote-agent");
  assert.equal(plan.stages.length, 7);
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

test("AGY Fleet Router persists custom IPs, probes /v1/agy/health with /health fallback, and streams SSE chat events", async () => {
  const {
    AGY_FLEET_NODES,
    FLEET_STORAGE_KEYS,
    DEFAULT_FLEET_ADDRESSES,
    selectOptimalFleetNode,
    buildCreatorFriendlyStreamEvents,
    normalizeNodeEndpoint,
    probeFleetNodeLiveStatus,
    loadPersistedFleetAddresses,
    savePersistedFleetAddresses,
    loadPersistedActiveFleetNode,
    savePersistedActiveFleetNode,
    streamFleetNodeChat
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

  assert.equal(DEFAULT_FLEET_ADDRESSES["vps-01"], "https://mcp.gemitron.net");
  assert.equal(normalizeNodeEndpoint("192.168.1.10"), "http://192.168.1.10:18220");
  assert.equal(normalizeNodeEndpoint("https://mcp.gemitron.net/"), "https://mcp.gemitron.net");

  // Verify localStorage persistence helpers (`agy.fleet.addresses.v1` and `agy.fleet.activeNode.v1`)
  const memStore = new Map();
  const fakeStorage = {
    getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
    setItem: (k, v) => memStore.set(k, v)
  };
  savePersistedFleetAddresses(
    {
      ...DEFAULT_FLEET_ADDRESSES,
      "win-local": "192.168.1.99:18220",
      "vps-02": "173.212.237.207:18220"
    },
    fakeStorage
  );
  savePersistedActiveFleetNode("vps-02", fakeStorage);
  assert.ok(memStore.has(FLEET_STORAGE_KEYS.addresses));
  assert.ok(memStore.has(FLEET_STORAGE_KEYS.activeNode));

  const loadedAddresses = loadPersistedFleetAddresses(fakeStorage);
  assert.equal(loadedAddresses["win-local"], "192.168.1.99:18220");
  assert.equal(loadedAddresses["vps-02"], "173.212.237.207:18220");
  assert.equal(loadPersistedActiveFleetNode(fakeStorage), "vps-02");

  // Verify live probe on /v1/agy/health
  const liveProbe = await probeFleetNodeLiveStatus({
    nodeId: "vps-02",
    address: "185.220.101.42:18220",
    fetchFn: async () => ({ ok: true })
  });
  assert.equal(liveProbe.online, true);
  assert.equal(liveProbe.healthUrl, "http://185.220.101.42:18220/v1/agy/health");
  assert.ok(liveProbe.latencyMs >= 1);

  // Verify fallback to /health on mcp.gemitron.net when /v1/agy/health returns 404
  const calledUrls = [];
  const fallbackProbe = await probeFleetNodeLiveStatus({
    nodeId: "vps-01",
    address: "https://mcp.gemitron.net",
    fetchFn: async (url) => {
      calledUrls.push(url);
      if (url.endsWith("/v1/agy/health")) {
        return { ok: false, status: 404 };
      }
      return { ok: true, status: 200 };
    }
  });
  assert.equal(fallbackProbe.online, true);
  assert.equal(fallbackProbe.fallbackUsed, true);
  assert.deepEqual(calledUrls, [
    "https://mcp.gemitron.net/v1/agy/health",
    "https://mcp.gemitron.net/health"
  ]);

  // Verify live SSE stream client against real in-memory agy-node-daemon
  const { createAgyNodeDaemonServer, registerNodeWithHub } = await import(
    "../bin/agy-node-daemon.mjs"
  );
  const daemon = createAgyNodeDaemonServer({
    nodeId: "vps-01",
    clusterSecret: "test-cluster-secret"
  });
  await new Promise((resolve) => daemon.listen(0, "127.0.0.1", resolve));
  const { port } = daemon.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const regRes = await registerNodeWithHub({
      nodeId: "vps-02",
      port: 18220,
      address: "173.212.237.207:18220",
      hubUrl: baseUrl,
      clusterSecret: "test-cluster-secret"
    });
    assert.equal(regRes.ok, true);
    assert.equal(regRes.data.registered.nodeId, "vps-02");

    const streamed = [];
    const chatRes = await streamFleetNodeChat({
      nodeId: "vps-01",
      address: baseUrl,
      prompt: "إعلان ساعة تيتانيوم",
      locale: "ar-EG",
      onEvent: (ev) => streamed.push(ev)
    });
    assert.equal(chatRes.ok, true);
    assert.equal(chatRes.events.length, 6);
    assert.equal(streamed.length, 6);
    assert.equal(streamed[0].type, "thinking");
    assert.equal(streamed[5].type, "chat_message");
  } finally {
    await new Promise((resolve) => daemon.close(resolve));
  }
});

test("TronAgyControlCenter.tsx wires localStorage persistence, live /v1/agy/health + /health fallback probing, and 4-device daemon profiles", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const uiPath = path.resolve(import.meta.dirname, "../ui/TronAgyControlCenter.tsx");
  const uiSource = await fs.readFile(uiPath, "utf8");

  assert.match(uiSource, /agy\.fleet\.addresses\.v1/);
  assert.match(uiSource, /agy\.fleet\.activeNode\.v1/);
  assert.match(uiSource, /\/v1\/agy\/health/);
  assert.match(uiSource, /\/health/);
  assert.match(uiSource, /performance\.now\(\)/);
  assert.match(uiSource, /📡 فحص الاتصال/);
  assert.match(uiSource, /📡 فحص جميع الأجهزة الأربعة ✦/);
  assert.match(uiSource, /اتصال بهذا الجهاز ✦/);
  assert.match(uiSource, /'online' \| 'checking' \| 'offline'/);

  const { createAgyNodeDaemonServer } = await import("../bin/agy-node-daemon.mjs");
  for (const nodeId of ["win-local", "mac-local", "vps-01", "vps-02"]) {
    const server = createAgyNodeDaemonServer({
      nodeId,
      clusterSecret: "fleet-secret"
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const res = await fetch(`http://127.0.0.1:${port}/v1/agy/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.ok, true);
      assert.equal(body.nodeId, nodeId);
      assert.equal(body.online, true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
});

test("AGY Cloud-Only Fleet CRUD API adds/updates/removes cloud nodes, rejects local LAN IPs, and persists to disk", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const http = await import("node:http");
  const { createAgyFleetRegistry, handleAgyNodeHttpRequest } = await import(
    "../bin/agy-node-daemon.mjs"
  );

  const tmpFile = path.join(os.tmpdir(), `agy-fleet-test-${Date.now()}.json`);
  const registry = createAgyFleetRegistry({
    primaryNodeId: "vps-01",
    storagePath: tmpFile,
    cloudOnly: true
  });

  const server = http.createServer(async (req, res) => {
    const handled = await handleAgyNodeHttpRequest(req, res, {
      nodeId: "vps-01",
      clusterSecret: "cloud-secret",
      registry,
      fetchFn: async () => ({ ok: true, status: 200 })
    });
    if (!handled) {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    // 1. Rejects local LAN IP (192.168.1.50:18220)
    const lanRes = await fetch(`${base}/v1/agy/nodes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer cloud-secret"
      },
      body: JSON.stringify({
        nodeId: "home-lan",
        labelAr: "جهاز منزلي",
        labelEn: "Home LAN Box",
        address: "192.168.1.50:18220"
      })
    });
    assert.equal(lanRes.status, 422);
    const lanBody = await lanRes.json();
    assert.equal(lanBody.error, "CLOUD_ONLY_ADDRESS_REQUIRED");

    // 2. Adds a new cloud node (vps-03) and sets it as default
    const addRes = await fetch(`${base}/v1/agy/nodes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer cloud-secret"
      },
      body: JSON.stringify({
        nodeId: "vps-03-gpu",
        labelAr: "خادم VPS 03 (GPU السحابي)",
        labelEn: "Linux VPS 03 (Cloud GPU)",
        address: "203.0.113.88:18220",
        region: "EU-West",
        isDefault: true
      })
    });
    assert.equal(addRes.status, 200);
    const addBody = await addRes.json();
    assert.equal(addBody.ok, true);
    assert.equal(addBody.defaultNodeId, "vps-03-gpu");
    assert.equal(addBody.node.online, true);
    assert.equal(addBody.nodes.length, 3);

    // 3. Reloads from disk persistence and verifies vps-03-gpu is preserved
    const reloadedRegistry = createAgyFleetRegistry({
      primaryNodeId: "vps-01",
      storagePath: tmpFile,
      cloudOnly: true
    });
    assert.equal(reloadedRegistry.getDefaultNodeId(), "vps-03-gpu");
    assert.equal(reloadedRegistry.list().length, 3);

    // 4. Deletes vps-03-gpu and resets default to vps-01
    const delRes = await fetch(`${base}/v1/agy/nodes/vps-03-gpu/delete`, {
      method: "POST",
      headers: {
        Authorization: "Bearer cloud-secret"
      }
    });
    assert.equal(delRes.status, 200);
    const delBody = await delRes.json();
    assert.equal(delBody.ok, true);
    assert.equal(delBody.defaultNodeId, "vps-01");
    assert.equal(delBody.nodes.length, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      // Ignore cleanup error
    }
  }
});

test("AGYTron Global Smart Mind supports ANY GemiTron service (Rankly, Tarweeg, Studio, Dashboard, Cyber, Code & custom services) with auto-model routing and /v1/agy/smart-mind HTTP API", async () => {
  const {
    GEMITRON_GLOBAL_SERVICES,
    selectOptimalAgyModel,
    buildGlobalAgySmartMindPlan,
    executeGlobalAgySmartMind
  } = await import("../src/index.mjs");
  const { createAgyNodeDaemonServer } = await import("../bin/agy-node-daemon.mjs");

  assert.ok(GEMITRON_GLOBAL_SERVICES.rankly);
  assert.ok(GEMITRON_GLOBAL_SERVICES.tarweeg);
  assert.ok(GEMITRON_GLOBAL_SERVICES.studio);
  assert.ok(GEMITRON_GLOBAL_SERVICES.dashboard);
  assert.ok(GEMITRON_GLOBAL_SERVICES.gemicode);
  assert.ok(GEMITRON_GLOBAL_SERVICES.gemicyber);

  // Auto-model selection picks fast model for DOM relocate and Opus 5.5 / Argon 4 for deep campaigns
  const fastChoice = selectOptimalAgyModel({
    service: "rankly",
    task: "dom-relocate-selector",
    requestedModel: "auto"
  });
  assert.equal(fastChoice.model, "gemini-3.8-flash-medium");
  assert.equal(fastChoice.effort, "low");

  const deepChoice = selectOptimalAgyModel({
    service: "tarweeg",
    task: "multi-platform-saga-critique",
    requestedModel: "auto"
  });
  assert.equal(deepChoice.model, "claude-opus-5-5-high");
  assert.equal(deepChoice.effort, "max");

  // Full-funnel cross-service plan (FigTron -> PhotoTron -> GemiMotion -> Tarweeg -> Rankly)
  const funnelPlan = buildGlobalAgySmartMindPlan({
    prompt: "إطلاق حملة شاملة لمنتج تقني جديد مع إعلانات ترويج وأتمتة سيو رانكلي",
    services: ["figtron", "phototron", "gemimotion", "tarweeg", "rankly"],
    model: "gemini-4-argon-high",
    effort: "max"
  });
  assert.equal(funnelPlan.ok, true);
  assert.equal(funnelPlan.stages.length, 5);
  assert.deepEqual(funnelPlan.targetServices, [
    "figtron",
    "phototron",
    "gemimotion",
    "tarweeg",
    "rankly"
  ]);

  // Execute Smart Mind for Rankly and Tarweeg via HTTP daemon
  const daemon = createAgyNodeDaemonServer({
    nodeId: "vps-01",
    clusterSecret: "smart-secret"
  });
  await new Promise((resolve) => daemon.listen(0, "127.0.0.1", resolve));
  const { port } = daemon.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const modelsRes = await fetch(`${base}/v1/agy/models`);
    assert.equal(modelsRes.status, 200);
    const modelsBody = await modelsRes.json();
    assert.equal(modelsBody.ok, true);
    assert.equal(modelsBody.models.length, 14);
    assert.ok(modelsBody.services.some((s) => s.id === "rankly"));
    assert.ok(modelsBody.services.some((s) => s.id === "tarweeg"));

    const ranklyRes = await fetch(`${base}/v1/agy/smart-mind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "rankly",
        task: "tiered-seo-campaign",
        prompt: "أفضل منصة سحابة وأمن سيبراني في الشرق الأوسط",
        model: "gemini-4-argon-high",
        effort: "high",
        context: { keyword: "منصة سحابة", topology: "wheel" }
      })
    });
    assert.equal(ranklyRes.status, 200);
    const ranklyBody = await ranklyRes.json();
    assert.equal(ranklyBody.ok, true);
    assert.equal(ranklyBody.service, "rankly");
    assert.equal(ranklyBody.model, "gemini-4-argon-high");
    assert.equal(ranklyBody.critiquePassesCompleted, 3);
    assert.equal(ranklyBody.structured.tieredTopology.topology, "wheel");
    assert.equal(ranklyBody.structured.troncsCompanionPipeline.enabled, true);
    assert.ok(ranklyBody.choices[0].message.content.includes("Spintax"));

    const tarweegRes = await fetch(`${base}/v1/agy/smart-mind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "tarweeg",
        task: "launch-saga-compiler",
        prompt: "حملة تخفيضات الجمعة البيضاء لمتجر إلكتروني",
        model: "claude-opus-5-5-high",
        effort: "max"
      })
    });
    assert.equal(tarweegRes.status, 200);
    const tarweegBody = await tarweegRes.json();
    assert.equal(tarweegBody.ok, true);
    assert.equal(tarweegBody.service, "tarweeg");
    assert.equal(tarweegBody.model, "claude-opus-5-5-high");
    assert.equal(tarweegBody.critiquePassesCompleted, 5);
    assert.equal(tarweegBody.structured.platforms.length, 9);
    assert.equal(tarweegBody.structured.adCopyVariants.length, 2);
    assert.equal(tarweegBody.structured.troncsCompanionPipeline.enabled, true);

    // Custom future service works out of the box
    const customExec = await executeGlobalAgySmartMind({
      service: "gemilogistics",
      task: "route-optimization",
      prompt: "Optimize last-mile delivery routes in Riyadh",
      model: "auto",
      fetchFn: null
    });
    assert.equal(customExec.ok, true);
    assert.equal(customExec.service, "gemilogistics");
  } finally {
    await new Promise((resolve) => daemon.close(resolve));
  }
});

test("AGYTron enforces 100% Google-ToS-Safe Model Family Quota Tracking with auto-failover and provides Knowledgebase, Workflows & Skills for all 9 core apps", async () => {
  const {
    NINE_CORE_APPS,
    createAgyQuotaLedger,
    resolveModelFamilyId,
    getAppKnowledgeAndSkills,
    listAllNineAppsKnowledgeCatalog
  } = await import("../src/index.mjs");
  const { createAgyNodeDaemonServer } = await import("../bin/agy-node-daemon.mjs");

  // 1. Verify all 9 core apps have Knowledgebase, Skills, and Workflows
  assert.deepEqual(NINE_CORE_APPS, [
    "phototron",
    "aftertron",
    "filmtron",
    "gemimotion",
    "figtron",
    "lighttron",
    "scaletron",
    "rankly",
    "tarweeg"
  ]);
  const catalog = listAllNineAppsKnowledgeCatalog();
  assert.equal(catalog.totalApps, 9);
  assert.ok(catalog.totalSkills >= 18);
  assert.ok(catalog.totalWorkflows >= 9);

  for (const appId of NINE_CORE_APPS) {
    const profile = getAppKnowledgeAndSkills(appId);
    assert.equal(profile.appId, appId);
    assert.ok(Array.isArray(profile.knowledgeBase.domainRules) && profile.knowledgeBase.domainRules.length >= 2);
    assert.ok(Array.isArray(profile.knowledgeBase.invariants) && profile.knowledgeBase.invariants.length >= 2);
    assert.ok(Array.isArray(profile.skills) && profile.skills.length >= 2);
    assert.ok(Array.isArray(profile.workflows) && profile.workflows.length >= 1);
  }

  // 2. Verify ToS-Safe Model Family Quota Ledger + Automatic Failover
  assert.equal(resolveModelFamilyId("gemini-4-argon-high"), "gemini-4-argon");
  assert.equal(resolveModelFamilyId("claude-opus-5-5-medium"), "claude-opus-5-5");
  assert.equal(resolveModelFamilyId("qwen3.5:4b-q4_K_M"), "local-tron");

  const ledger = createAgyQuotaLedger();
  const initialSnap = ledger.getSnapshot();
  assert.equal(initialSnap.tosSafe, true);
  assert.equal(initialSnap.families.length, 6);

  // Trigger HTTP 429 rate-limit cooldown on claude-opus-5-5 and verify automatic failover to gemini-4-argon-high
  ledger.recordUsage({
    modelId: "claude-opus-5-5-high",
    service: "tarweeg",
    promptTokens: 500,
    completionTokens: 200,
    rateLimited: true,
    cooldownSeconds: 300
  });

  const safeSelection = ledger.selectQuotaSafeModel("claude-opus-5-5-high");
  assert.equal(safeSelection.requestedFamilyId, "claude-opus-5-5");
  assert.equal(safeSelection.failoverTriggered, true);
  assert.equal(safeSelection.selectedFamilyId, "gemini-4-argon");
  assert.equal(safeSelection.selectedModel, "gemini-4-argon-high");

  // 3. Verify HTTP endpoints (/v1/agy/quota, /v1/agy/knowledge, and /v1/agy/smart-mind with skillId/workflowId)
  const daemon = createAgyNodeDaemonServer({
    nodeId: "vps-01",
    clusterSecret: "quota-secret"
  });
  await new Promise((resolve) => daemon.listen(0, "127.0.0.1", resolve));
  const { port } = daemon.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const kbRes = await fetch(`${base}/v1/agy/knowledge?app=rankly`);
    assert.equal(kbRes.status, 200);
    const kbBody = await kbRes.json();
    assert.equal(kbBody.ok, true);
    assert.equal(kbBody.app.appId, "rankly");
    assert.ok(kbBody.app.skills.some((s) => s.id === "rankly.tiered_link_architect"));

    const execRes = await fetch(`${base}/v1/agy/smart-mind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "rankly",
        skillId: "rankly.scrapling_self_healer",
        workflowId: "rankly.wf.full_seo_autopilot",
        prompt: "إصلاح محددات CSS لمنصة Telegraph وبناء حملة هرمية",
        model: "gemini-3.8-flash-medium",
        effort: "medium"
      })
    });
    assert.equal(execRes.status, 200);
    const execBody = await execRes.json();
    assert.equal(execBody.ok, true);
    assert.equal(execBody.appKnowledge.activeSkill.id, "rankly.scrapling_self_healer");
    assert.equal(execBody.appKnowledge.activeWorkflow.id, "rankly.wf.full_seo_autopilot");
    assert.ok(execBody.quotaStatus);
    assert.equal(execBody.quotaStatus.familyId, "gemini-3.8-flash");

    const quotaRes = await fetch(`${base}/v1/agy/quota`);
    assert.equal(quotaRes.status, 200);
    const quotaBody = await quotaRes.json();
    assert.equal(quotaBody.ok, true);
    assert.equal(quotaBody.tosSafe, true);
    assert.ok(quotaBody.totalRequests24h >= 1);
  } finally {
    await new Promise((resolve) => daemon.close(resolve));
  }
});




