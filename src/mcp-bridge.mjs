/**
 * @gemitron/tron-agy — Dual-Transport GemiMCP Bridge (`src/mcp-bridge.mjs`)
 *
 * Explains and implements how GemiMCP operates across BOTH Cloud and Local Workstation:
 *   1. Cloud GemiMCP (`https://mcp.gemitron.net/mcp` & `/products/<app>/mcp`)
 *      - Authoritative OAuth/Zitadel gateway, GemiGuard lease verification, durable job store,
 *        and outbound-only Desktop Agent WebSocket/HTTP hub (`desktop-agent.mjs`).
 *   2. Local Workstation GemiMCP (`http://127.0.0.1:18210/mcp` + `http://127.0.0.1:8090`)
 *      - Runs locally on the creator's workstation for zero-latency native IPC with
 *        PhotoTron, AfterTron, FilmTron, GemiMotion, FigTron, and LightTron.
 */

export const GEMIMCP_ENDPOINTS = Object.freeze({
  cloud: Object.freeze({
    id: "cloud-gemimcp",
    origin: "https://mcp.gemitron.net",
    federatedMcpUrl: "https://mcp.gemitron.net/mcp",
    tronCsMcpUrl: "https://mcp.gemitron.net/products/troncs/mcp",
    motionMcpUrl: "https://mcp.gemitron.net/products/motion/mcp",
    ranklyMcpUrl: "https://mcp.gemitron.net/products/rankly/mcp",
    tarweegMcpUrl: "https://mcp.gemitron.net/products/tarweeg/mcp",
    smartMindUrl: "https://mcp.gemitron.net/v1/agy/smart-mind",
    oidcIssuer: "https://auth.gemitron.net",
    role: "Cloud OAuth/Zitadel Gateway, GemiGuard Lease Verifier, Global AGYTron Smart Mind Hub & Paired Desktop Agent Hub"
  }),
  localWorkstation: Object.freeze({
    id: "local-workstation-mcp",
    origin: "http://127.0.0.1:18210",
    federatedMcpUrl: "http://127.0.0.1:18210/mcp",
    tronCsMcpUrl: "http://127.0.0.1:18210/products/troncs/mcp",
    motionMcpUrl: "http://127.0.0.1:18210/products/motion/mcp",
    ranklyMcpUrl: "http://127.0.0.1:18210/products/rankly/mcp",
    tarweegMcpUrl: "http://127.0.0.1:18210/products/tarweeg/mcp",
    smartMindUrl: "http://127.0.0.1:18210/v1/agy/smart-mind",
    localLlamaServerUrl: "http://127.0.0.1:8090",
    localGemiAiUrl: "http://127.0.0.1:18090",
    localTronBrokerUrl: "http://127.0.0.1:30001",
    role: "Zero-Latency Workstation/VPS Loopback Server + Global AGYTron Smart Mind & Native App IPC"
  })
});

export function resolveMcpTransportConfig({
  transport = "hybrid-auto",
  authMode = "agy-mcp-host",
  product = "troncs",
  cloudOrigin = GEMIMCP_ENDPOINTS.cloud.origin,
  localOrigin = GEMIMCP_ENDPOINTS.localWorkstation.origin
} = {}) {
  const cleanProduct = String(product || "troncs").trim().toLowerCase();
  const routeSuffix =
    cleanProduct === "federated" || cleanProduct === "studio" || cleanProduct === "dashboard"
      ? "/mcp"
      : `/products/${cleanProduct}/mcp`;

  if (transport === "local-only" || authMode === "local-tron-loopback") {
    return {
      activeTransport: "local-only",
      product: cleanProduct,
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
      primaryMcpUrl: `${cloudOrigin}${routeSuffix}`,
      smartMindUrl: `${cloudOrigin}/v1/agy/smart-mind`,
      fallbackMcpUrl: null,
      requiresGemiGuardLease: true,
      zeroCloudTraffic: false,
      description:
        "Cloud GemiMCP gateway (https://mcp.gemitron.net) dispatching to paired workstation via Outbound Desktop Agent Hub."
    };
  }
  return {
    activeTransport: "hybrid-auto",
    product: cleanProduct,
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

