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
    oidcIssuer: "https://auth.gemitron.net",
    role: "Cloud OAuth/Zitadel Gateway, GemiGuard Lease Verifier, Durable Job Store & Paired Desktop Agent Hub"
  }),
  localWorkstation: Object.freeze({
    id: "local-workstation-mcp",
    origin: "http://127.0.0.1:18210",
    federatedMcpUrl: "http://127.0.0.1:18210/mcp",
    tronCsMcpUrl: "http://127.0.0.1:18210/products/troncs/mcp",
    motionMcpUrl: "http://127.0.0.1:18210/products/motion/mcp",
    localLlamaServerUrl: "http://127.0.0.1:8090",
    localTronBrokerUrl: "http://127.0.0.1:30001",
    role: "Zero-Latency Workstation Loopback Server + Local TRON Llama-Server & Native App IPC"
  })
});

export function resolveMcpTransportConfig({
  transport = "hybrid-auto",
  authMode = "agy-mcp-host",
  cloudOrigin = GEMIMCP_ENDPOINTS.cloud.origin,
  localOrigin = GEMIMCP_ENDPOINTS.localWorkstation.origin
} = {}) {
  if (transport === "local-only" || authMode === "local-tron-loopback") {
    return {
      activeTransport: "local-only",
      primaryMcpUrl: `${localOrigin}/products/troncs/mcp`,
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
      primaryMcpUrl: `${cloudOrigin}/products/troncs/mcp`,
      fallbackMcpUrl: null,
      requiresGemiGuardLease: true,
      zeroCloudTraffic: false,
      description:
        "Cloud GemiMCP gateway (https://mcp.gemitron.net) dispatching to paired workstation via Outbound Desktop Agent Hub."
    };
  }
  return {
    activeTransport: "hybrid-auto",
    primaryMcpUrl: `${localOrigin}/products/troncs/mcp`,
    fallbackMcpUrl: `${cloudOrigin}/products/troncs/mcp`,
    requiresGemiGuardLease: true,
    zeroCloudTraffic: false,
    description:
      "Hybrid Auto-Route: prefers low-latency local workstation GemiMCP (127.0.0.1:18210) when on the same machine, and seamlessly falls back to Cloud GemiMCP (https://mcp.gemitron.net) for remote/cloud orchestration."
  };
}
