#!/usr/bin/env node
/**
 * agy-node-daemon — Lightweight Antigravity Bridge Daemon for Windows, Mac, VPS 01 & VPS 02
 *
 * Topology:
 *   - VPS 01 hosts `gemitron.net` (`https://mcp.gemitron.net`) AND runs local AGY node `vps-01`.
 *   - VPS 02 is a separate standalone Linux server (no domain needed): connects either via
 *     direct IP (`http://<VPS_02_IP>:18220`) OR registers outbound into VPS 01 (`--hub https://mcp.gemitron.net`).
 *   - Windows & Mac run on Local LAN (`127.0.0.1:18220` / `192.168.x.x:18220`) and can also
 *     register outbound into VPS 01 (`--hub https://mcp.gemitron.net`).
 *
 * Startup commands:
 *   - VPS 01 (Main gemitron.net): node bin/agy-node-daemon.mjs --node-id vps-01 --port 18220
 *   - VPS 02 (Standalone Linux):  node bin/agy-node-daemon.mjs --node-id vps-02 --port 18220 --hub https://mcp.gemitron.net
 *   - Windows PC (Local LAN):     node bin/agy-node-daemon.mjs --node-id win-local --port 18220
 *   - Mac Studio (Local LAN):     node bin/agy-node-daemon.mjs --node-id mac-local --port 18220
 */

import http from "node:http";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AGY_FLEET_NODES,
  DEFAULT_FLEET_ADDRESSES,
  buildCreatorFriendlyStreamEvents,
  normalizeNodeEndpoint
} from "../src/fleet-router.mjs";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : fallback;
}

function detectPrimaryExternalIpv4() {
  const nets = os.networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const entry of entries || []) {
      if (entry && entry.family === "IPv4" && !entry.internal && entry.address) {
        return entry.address;
      }
    }
  }
  return "";
}

const NODE_ID = flag("--node-id", process.env.AGY_NODE_ID || "vps-01");
const PORT = parseInt(flag("--port", process.env.AGY_NODE_PORT || "18220"), 10);
const HOST = flag("--host", process.env.AGY_NODE_HOST || "0.0.0.0");
const ADVERTISED_ADDRESS = flag("--address", process.env.AGY_NODE_ADDRESS || "");
const HUB_URL = flag(
  "--hub",
  flag("--hub-url", process.env.AGY_HUB_URL || "")
);
const CLUSTER_SECRET = flag(
  "--cluster-secret",
  process.env.AGY_CLUSTER_SECRET || ""
);

export function createAgyFleetRegistry({ primaryNodeId = "vps-01" } = {}) {
  const nodes = new Map();
  for (const id of ["win-local", "mac-local", "vps-01", "vps-02"]) {
    const meta = AGY_FLEET_NODES[id];
    nodes.set(id, {
      nodeId: id,
      labelAr: meta.labelAr,
      labelEn: meta.labelEn,
      kind: meta.kind,
      address: DEFAULT_FLEET_ADDRESSES[id],
      online: id === primaryNodeId,
      registeredAt: id === primaryNodeId ? new Date().toISOString() : null
    });
  }
  return {
    register(entry = {}) {
      const id = AGY_FLEET_NODES[entry.nodeId] ? entry.nodeId : primaryNodeId;
      const meta = AGY_FLEET_NODES[id] || AGY_FLEET_NODES["vps-01"];
      const record = {
        nodeId: id,
        labelAr: meta.labelAr,
        labelEn: meta.labelEn,
        kind: meta.kind,
        address: entry.address || DEFAULT_FLEET_ADDRESSES[id],
        port: entry.port || 18220,
        hostname: entry.hostname || os.hostname(),
        platform: entry.platform || os.platform(),
        online: true,
        registeredAt: new Date().toISOString()
      };
      nodes.set(id, record);
      return record;
    },
    list() {
      return Array.from(nodes.values());
    }
  };
}

export async function registerNodeWithHub({
  nodeId = NODE_ID,
  port = PORT,
  address = "",
  hubUrl = HUB_URL,
  clusterSecret = CLUSTER_SECRET,
  fetchFn = globalThis.fetch
} = {}) {
  if (!hubUrl || typeof fetchFn !== "function") {
    return { ok: false, skipped: true };
  }
  const baseHub = normalizeNodeEndpoint(hubUrl, 18220);
  const registerUrl = `${baseHub}/v1/agy/nodes/register`;
  const headers = {
    "Content-Type": "application/json"
  };
  if (clusterSecret) {
    headers.Authorization = `Bearer ${clusterSecret}`;
  }
  try {
    const res = await fetchFn(registerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        nodeId,
        port,
        address: address || DEFAULT_FLEET_ADDRESSES[nodeId] || `http://127.0.0.1:${port}`,
        hostname: os.hostname(),
        platform: os.platform()
      })
    });
    if (res && res.ok) {
      const data = typeof res.json === "function" ? await res.json() : { ok: true };
      return { ok: true, registerUrl, data };
    }
    return { ok: false, registerUrl, status: res?.status ?? 0 };
  } catch (err) {
    return {
      ok: false,
      registerUrl,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function handleAgyNodeHttpRequest(
  req,
  res,
  {
    nodeId = NODE_ID,
    clusterSecret = CLUSTER_SECRET,
    registry = null
  } = {}
) {
  const effectiveRegistry = registry || createAgyFleetRegistry({ primaryNodeId: nodeId });
  const nodeMeta = AGY_FLEET_NODES[nodeId] || AGY_FLEET_NODES["vps-01"];
  const rawUrl = String(req.url || "/");
  const pathname = rawUrl.split("?")[0];

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }

  const nodeRouteHealthMatch = pathname.match(/^\/v1\/agy\/nodes\/([a-z0-9-]+)\/health$/i);
  if (
    req.method === "GET" &&
    (pathname === "/v1/agy/health" || pathname === "/health" || Boolean(nodeRouteHealthMatch))
  ) {
    const requestedId = nodeRouteHealthMatch ? nodeRouteHealthMatch[1] : nodeMeta.id;
    const targetMeta = AGY_FLEET_NODES[requestedId] || nodeMeta;
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        status: "ok",
        nodeId: targetMeta.id,
        labelAr: targetMeta.labelAr,
        labelEn: targetMeta.labelEn,
        kind: targetMeta.kind,
        platform: os.platform(),
        hostname: os.hostname(),
        online: true,
        clusterAuthConfigured: Boolean(clusterSecret),
        registeredNodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  if (req.method === "GET" && pathname === "/v1/agy/nodes") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        hubNodeId: nodeMeta.id,
        nodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  if (req.method === "POST" && pathname === "/v1/agy/nodes/register") {
    if (clusterSecret) {
      const authHeader = String(req.headers?.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
      if (token && token !== clusterSecret) {
        res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: "INVALID_CLUSTER_SECRET" }));
        return true;
      }
    }
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      payload = {};
    }
    const registered = effectiveRegistry.register(payload);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, registered }));
    return true;
  }

  const nodeRouteStreamMatch = pathname.match(
    /^\/v1\/agy\/nodes\/([a-z0-9-]+)\/chat[-/]stream$/i
  );
  if (
    req.method === "POST" &&
    (pathname === "/v1/agy/chat-stream" ||
      pathname === "/v1/agy/chat/stream" ||
      Boolean(nodeRouteStreamMatch))
  ) {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      payload = {};
    }

    const effectiveNodeId = nodeRouteStreamMatch
      ? nodeRouteStreamMatch[1]
      : payload.nodeId && AGY_FLEET_NODES[payload.nodeId]
        ? payload.nodeId
        : nodeMeta.id;

    const events = buildCreatorFriendlyStreamEvents({
      prompt: payload.prompt || "",
      locale: payload.locale || "ar-EG",
      nodeId: effectiveNodeId,
      styleTitle: payload.styleTitle || "إعلان سينمائي فاخر"
    });

    const acceptHeader = String(req.headers?.accept || "");
    if (payload.format === "json" || (acceptHeader.includes("application/json") && !acceptHeader.includes("text/event-stream"))) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true, nodeId: effectiveNodeId, events }));
      return true;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });

    for (const ev of events) {
      res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`);
    }
    res.write(
      `event: done\ndata: ${JSON.stringify({ ok: true, nodeId: effectiveNodeId, eventsCount: events.length })}\n\n`
    );
    res.end();
    return true;
  }

  return false;
}

export function createAgyNodeDaemonServer({
  nodeId = NODE_ID,
  clusterSecret = CLUSTER_SECRET
} = {}) {
  const registry = createAgyFleetRegistry({ primaryNodeId: nodeId });

  return http.createServer(async (req, res) => {
    const handled = await handleAgyNodeHttpRequest(req, res, {
      nodeId,
      clusterSecret,
      registry
    });
    if (!handled) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "NOT_FOUND" }));
    }
  });
}

const isMain =
  process.argv[1] &&
  (import.meta.url === `file://${process.argv[1]}` ||
    (() => {
      try {
        return (
          fs.realpathSync(fileURLToPath(import.meta.url)) ===
          fs.realpathSync(process.argv[1])
        );
      } catch {
        return false;
      }
    })());

if (isMain) {
  const server = createAgyNodeDaemonServer({
    nodeId: NODE_ID,
    clusterSecret: CLUSTER_SECRET
  });
  const extIp = detectPrimaryExternalIpv4();
  let boundHost = HOST;

  const onListening = async () => {
    const advertisedAddr =
      ADVERTISED_ADDRESS ||
      (extIp ? `${extIp}:${PORT}` : DEFAULT_FLEET_ADDRESSES[NODE_ID] || `${boundHost}:${PORT}`);
    console.log(
      `[AGY Node Daemon] Online (${NODE_ID}) listening on http://${boundHost}:${PORT}/v1/agy/chat-stream (advertised: ${advertisedAddr})`
    );
    if (HUB_URL) {
      const reg = await registerNodeWithHub({
        nodeId: NODE_ID,
        port: PORT,
        address: advertisedAddr,
        hubUrl: HUB_URL,
        clusterSecret: CLUSTER_SECRET
      });
      if (reg.ok) {
        console.log(`[AGY Node Daemon] Registered ${NODE_ID} with hub ${reg.registerUrl}`);
      }
    }
  };

  server.once("error", (err) => {
    if (err && err.code === "EADDRINUSE" && boundHost === "0.0.0.0" && extIp) {
      boundHost = extIp;
      server.listen(PORT, boundHost, onListening);
      return;
    }
    throw err;
  });

  server.listen(PORT, boundHost, onListening);
}
