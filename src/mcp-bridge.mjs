/**
 * @gemitron/tron-agy — Dual-Transport GemiMCP Bridge & Local Editor RPC Client (`src/mcp-bridge.mjs`)
 *
 * Explains and implements how GemiMCP operates across BOTH Cloud and Local Workstation:
 *   1. Cloud GemiMCP (`https://mcp.gemitron.net/mcp` & `/products/<app>/mcp`)
 *      - Authoritative OAuth/Zitadel gateway, GemiGuard lease verification, durable job store,
 *        and outbound-only Desktop Agent WebSocket/HTTP hub (`desktop-agent.mjs`).
 *   2. Local Workstation GemiMCP (`http://127.0.0.1:18210/mcp` + `http://127.0.0.1:8090`)
 *      - Runs locally on the creator's workstation for zero-latency native IPC with
 *        PhotoTron, AfterTron, FilmTron, GemiMotion, FigTron, LightTron, and ScaleTron.
 */

import fs from "node:fs";

export const GEMIMCP_ENDPOINTS = Object.freeze({
  cloud: Object.freeze({
    id: "cloud-gemimcp",
    origin: "https://mcp.gemitron.net",
    federatedMcpUrl: "https://mcp.gemitron.net/mcp",
    tronCsMcpUrl: "https://mcp.gemitron.net/products/troncs/mcp",
    phototronMcpUrl: "https://mcp.gemitron.net/products/phototron/mcp",
    filmtronMcpUrl: "https://mcp.gemitron.net/products/filmtron/mcp",
    aftertronMcpUrl: "https://mcp.gemitron.net/products/aftertron/mcp",
    gemimotionMcpUrl: "https://mcp.gemitron.net/products/gemimotion/mcp",
    figtronMcpUrl: "https://mcp.gemitron.net/products/figtron/mcp",
    lighttronMcpUrl: "https://mcp.gemitron.net/products/lighttron/mcp",
    scaletronMcpUrl: "https://mcp.gemitron.net/products/scaletron/mcp",
    motionMcpUrl: "https://mcp.gemitron.net/products/motion/mcp",
    ranklyMcpUrl: "https://mcp.gemitron.net/products/rankly/mcp",
    tarweegMcpUrl: "https://mcp.gemitron.net/products/tarweeg/mcp",
    smartMindUrl: "https://mcp.gemitron.net/v1/agy/smart-mind",
    oidcIssuer: "https://auth.gemitron.net",
    role: "Cloud OAuth/Zitadel Gateway, GemiGuard Lease Verifier, Global AGYTron Smart Mind Hub & Paired Desktop/Mobile Companion Hub"
  }),
  localWorkstation: Object.freeze({
    id: "local-workstation-mcp",
    origin: "http://127.0.0.1:18210",
    federatedMcpUrl: "http://127.0.0.1:18210/mcp",
    tronCsMcpUrl: "http://127.0.0.1:18210/products/troncs/mcp",
    phototronMcpUrl: "http://127.0.0.1:18210/products/phototron/mcp",
    filmtronMcpUrl: "http://127.0.0.1:18210/products/filmtron/mcp",
    aftertronMcpUrl: "http://127.0.0.1:18210/products/aftertron/mcp",
    gemimotionMcpUrl: "http://127.0.0.1:18210/products/gemimotion/mcp",
    figtronMcpUrl: "http://127.0.0.1:18210/products/figtron/mcp",
    lighttronMcpUrl: "http://127.0.0.1:18210/products/lighttron/mcp",
    scaletronMcpUrl: "http://127.0.0.1:18210/products/scaletron/mcp",
    motionMcpUrl: "http://127.0.0.1:18210/products/motion/mcp",
    ranklyMcpUrl: "http://127.0.0.1:18210/products/rankly/mcp",
    tarweegMcpUrl: "http://127.0.0.1:18210/products/tarweeg/mcp",
    smartMindUrl: "http://127.0.0.1:18210/v1/agy/smart-mind",
    localLlamaServerUrl: "http://127.0.0.1:8090",
    localGemiAiUrl: "http://127.0.0.1:18090",
    localTronBrokerUrl: "http://127.0.0.1:30001",
    role: "Zero-Latency Workstation/VPS Loopback Server + Global AGYTron Smart Mind & Native 7-Desktop + 7-Mobile IPC"
  })
});

const MOBILE_COMPANION_PRODUCT_MAP = Object.freeze({
  "phototron-mobile": "phototron",
  "filmtron-mobile": "filmtron",
  "aftertron-mobile": "aftertron",
  "gemimotion-mobile": "gemimotion",
  "figtron-mobile": "figtron",
  "lighttron-mobile": "lighttron",
  "scaletron-mobile": "scaletron"
});

export function resolveMcpTransportConfig({
  transport = "hybrid-auto",
  authMode = "agy-mcp-host",
  product = "troncs",
  cloudOrigin = GEMIMCP_ENDPOINTS.cloud.origin,
  localOrigin = GEMIMCP_ENDPOINTS.localWorkstation.origin
} = {}) {
  const rawProduct = String(product || "troncs").trim().toLowerCase();
  const isMobileCompanion = Object.hasOwn(MOBILE_COMPANION_PRODUCT_MAP, rawProduct);
  const cleanProduct = isMobileCompanion ? MOBILE_COMPANION_PRODUCT_MAP[rawProduct] : rawProduct;
  const mobileBridgeScope = isMobileCompanion ? `${rawProduct}:*` : null;
  const routeSuffix =
    cleanProduct === "federated" || cleanProduct === "studio" || cleanProduct === "dashboard"
      ? "/mcp"
      : `/products/${cleanProduct}/mcp`;

  if (transport === "local-only" || authMode === "local-tron-loopback") {
    return {
      activeTransport: "local-only",
      product: cleanProduct,
      requestedProduct: rawProduct,
      isMobileCompanion,
      mobileBridgeScope,
      tosSafePolicyId: "tronagy.google_tos_safe.v1",
      primaryMcpUrl: `${localOrigin}${routeSuffix}`,
      smartMindUrl: `${localOrigin}/v1/agy/smart-mind`,
      fallbackMcpUrl: null,
      requiresGemiGuardLease: true,
      zeroCloudTraffic: true,
      description:
        "Direct workstation loopback to local GemiMCP (127.0.0.1:18210) and local TRON runtime (127.0.0.1:8090)."
    };
  }
  if (transport === "cloud-only") {
    return {
      activeTransport: "cloud-only",
      product: cleanProduct,
      requestedProduct: rawProduct,
      isMobileCompanion,
      mobileBridgeScope,
      tosSafePolicyId: "tronagy.google_tos_safe.v1",
      primaryMcpUrl: `${cloudOrigin}${routeSuffix}`,
      smartMindUrl: `${cloudOrigin}/v1/agy/smart-mind`,
      fallbackMcpUrl: null,
      requiresGemiGuardLease: true,
      zeroCloudTraffic: false,
      description:
        "Cloud GemiMCP gateway (https://mcp.gemitron.net) dispatching to paired workstation/mobile companion via Outbound Bridge Hub."
    };
  }
  return {
    activeTransport: "hybrid-auto",
    product: cleanProduct,
    requestedProduct: rawProduct,
    isMobileCompanion,
    mobileBridgeScope,
    tosSafePolicyId: "tronagy.google_tos_safe.v1",
    primaryMcpUrl: `${localOrigin}${routeSuffix}`,
    smartMindUrl: `${localOrigin}/v1/agy/smart-mind`,
    fallbackMcpUrl: `${cloudOrigin}${routeSuffix}`,
    fallbackSmartMindUrl: `${cloudOrigin}/v1/agy/smart-mind`,
    requiresGemiGuardLease: true,
    zeroCloudTraffic: false,
    description:
      "Hybrid Auto-Route: prefers low-latency local workstation GemiMCP (127.0.0.1:18210) when on the same machine, and seamlessly falls back to Cloud GemiMCP (https://mcp.gemitron.net) for remote/cloud orchestration."
  };
}

async function sendJsonRpcRequest({
  url,
  method,
  params = {},
  accessToken = "",
  leaseToken = "",
  fetchFn = globalThis.fetch,
  timeoutMs = 4500
}) {
  if (typeof fetchFn !== "function") {
    return { ok: false, error: "FETCH_UNAVAILABLE" };
  }
  const rpcId = `mcp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (leaseToken) {
    headers["X-GemiGuard-Lease"] = leaseToken;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(250, timeoutMs));
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: rpcId,
        method,
        params
      }),
      signal: controller.signal
    });
    if (!res || !res.ok) {
      return {
        ok: false,
        status: res?.status || 0,
        error: `HTTP_${res?.status || 0}`
      };
    }
    const payload = typeof res.json === "function" ? await res.json() : {};
    if (payload?.error) {
      return {
        ok: false,
        status: res.status,
        error: payload.error.message || "JSONRPC_ERROR",
        rpcError: payload.error
      };
    }
    return {
      ok: true,
      status: res.status,
      id: payload?.id || rpcId,
      result: payload?.result ?? payload
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function callGemiMcpTool({
  product = "troncs",
  transport = "hybrid-auto",
  authMode = "agy-mcp-host",
  toolName,
  args = {},
  accessToken = process.env.GEMIMCP_ACCESS_TOKEN || "",
  leaseToken = process.env.GEMIGUARD_LEASE_TOKEN || "",
  cloudOrigin,
  localOrigin,
  fetchFn = globalThis.fetch,
  timeoutMs = 4500
} = {}) {
  if (!toolName || typeof toolName !== "string") {
    return { ok: false, code: "MISSING_TOOL_NAME" };
  }
  const route = resolveMcpTransportConfig({
    transport,
    authMode,
    product,
    cloudOrigin,
    localOrigin
  });

  const primary = await sendJsonRpcRequest({
    url: route.primaryMcpUrl,
    method: "tools/call",
    params: { name: toolName, arguments: args },
    accessToken,
    leaseToken,
    fetchFn,
    timeoutMs
  });
  if (primary.ok) {
    return {
      ok: true,
      product: route.product,
      toolName,
      endpointUsed: route.primaryMcpUrl,
      usedFallback: false,
      result: primary.result
    };
  }

  if (route.fallbackMcpUrl && !route.zeroCloudTraffic) {
    const fallback = await sendJsonRpcRequest({
      url: route.fallbackMcpUrl,
      method: "tools/call",
      params: { name: toolName, arguments: args },
      accessToken,
      leaseToken,
      fetchFn,
      timeoutMs
    });
    if (fallback.ok) {
      return {
        ok: true,
        product: route.product,
        toolName,
        endpointUsed: route.fallbackMcpUrl,
        usedFallback: true,
        result: fallback.result
      };
    }
    return {
      ok: false,
      product: route.product,
      toolName,
      endpointUsed: route.fallbackMcpUrl,
      usedFallback: true,
      error: fallback.error || primary.error
    };
  }

  return {
    ok: false,
    product: route.product,
    toolName,
    endpointUsed: route.primaryMcpUrl,
    usedFallback: false,
    error: primary.error
  };
}

export async function listGemiMcpTools({
  product = "troncs",
  transport = "hybrid-auto",
  authMode = "agy-mcp-host",
  accessToken = process.env.GEMIMCP_ACCESS_TOKEN || "",
  leaseToken = process.env.GEMIGUARD_LEASE_TOKEN || "",
  cloudOrigin,
  localOrigin,
  fetchFn = globalThis.fetch,
  timeoutMs = 4500
} = {}) {
  const route = resolveMcpTransportConfig({
    transport,
    authMode,
    product,
    cloudOrigin,
    localOrigin
  });

  const primary = await sendJsonRpcRequest({
    url: route.primaryMcpUrl,
    method: "tools/list",
    params: {},
    accessToken,
    leaseToken,
    fetchFn,
    timeoutMs
  });
  if (primary.ok) {
    return {
      ok: true,
      product: route.product,
      endpointUsed: route.primaryMcpUrl,
      usedFallback: false,
      tools: primary.result?.tools || []
    };
  }

  if (route.fallbackMcpUrl && !route.zeroCloudTraffic) {
    const fallback = await sendJsonRpcRequest({
      url: route.fallbackMcpUrl,
      method: "tools/list",
      params: {},
      accessToken,
      leaseToken,
      fetchFn,
      timeoutMs
    });
    if (fallback.ok) {
      return {
        ok: true,
        product: route.product,
        endpointUsed: route.fallbackMcpUrl,
        usedFallback: true,
        tools: fallback.result?.tools || []
      };
    }
  }

  return {
    ok: false,
    product: route.product,
    endpointUsed: route.primaryMcpUrl,
    error: primary.error
  };
}

function isStrictLoopbackUrl(rawUrl = "") {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}

/**
 * Dispatches an authenticated JSON-RPC command to a local native TronCS editor control port
 * (e.g., FigTron `control.rs`, PhotoTron, FilmTron) on strict loopback (`127.0.0.1` / `::1`)
 * with optional `doc.identity` revision fencing.
 */
export async function dispatchLocalEditorControlRpc({
  endpointUrl = "http://127.0.0.1:19420/rpc",
  token = "",
  tokenFilePath = "",
  expectedRevision = null,
  method = "doc.identity",
  params = {},
  fetchFn = globalThis.fetch,
  timeoutMs = 3500
} = {}) {
  if (!isStrictLoopbackUrl(endpointUrl)) {
    return {
      ok: false,
      code: "LOOPBACK_ONLY_REQUIRED",
      error: "Native editor control RPC strictly requires a loopback endpoint (127.0.0.1, localhost, or ::1)."
    };
  }

  let effectiveToken = String(token || "").trim();
  if (!effectiveToken && tokenFilePath) {
    try {
      effectiveToken = fs.readFileSync(tokenFilePath, "utf8").trim();
    } catch {
      return {
        ok: false,
        code: "TOKEN_FILE_UNREADABLE",
        error: "Unable to read local editor control token file."
      };
    }
  }

  if (expectedRevision !== null && expectedRevision !== undefined && method !== "doc.identity") {
    const identityRes = await sendJsonRpcRequest({
      url: endpointUrl,
      method: "doc.identity",
      params: {},
      accessToken: effectiveToken,
      fetchFn,
      timeoutMs
    });
    if (!identityRes.ok) {
      return {
        ok: false,
        code: "IDENTITY_CHECK_FAILED",
        error: identityRes.error
      };
    }
    const actualRev = identityRes.result?.revision;
    if (typeof actualRev === "number" && actualRev !== Number(expectedRevision)) {
      return {
        ok: false,
        code: "REVISION_CONFLICT",
        expectedRevision: Number(expectedRevision),
        actualRevision: actualRev,
        documentId: identityRes.result?.documentId || null
      };
    }
  }

  const execRes = await sendJsonRpcRequest({
    url: endpointUrl,
    method,
    params,
    accessToken: effectiveToken,
    fetchFn,
    timeoutMs
  });

  if (!execRes.ok) {
    return {
      ok: false,
      code: "EDITOR_RPC_FAILED",
      status: execRes.status || 0,
      error: execRes.error
    };
  }

  return {
    ok: true,
    endpointUrl,
    method,
    result: execRes.result
  };
}
