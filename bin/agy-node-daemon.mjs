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
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGY_FLEET_NODES,
  CLOUD_FLEET_DEFAULT_NODES,
  DEFAULT_FLEET_ADDRESSES,
  buildCreatorFriendlyStreamEvents,
  normalizeNodeEndpoint,
  probeFleetNodeLiveStatus,
  validateCloudFleetAddress
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
const FLEET_STORAGE_PATH = flag(
  "--storage-path",
  process.env.AGY_FLEET_STORAGE_PATH || ""
);

function sanitizeNodeSlug(raw = "") {
  const cleaned = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || `cloud-node-${Date.now().toString(36)}`;
}

export function createAgyFleetRegistry({
  primaryNodeId = "vps-01",
  storagePath = FLEET_STORAGE_PATH,
  cloudOnly = true
} = {}) {
  const nodes = new Map();
  let defaultNodeId = primaryNodeId || "vps-01";

  const seedDefaults = () => {
    for (const seed of CLOUD_FLEET_DEFAULT_NODES) {
      nodes.set(seed.nodeId, {
        nodeId: seed.nodeId,
        icon: seed.icon || "☁️",
        labelAr: seed.labelAr,
        labelEn: seed.labelEn,
        kind: seed.kind || "standalone-vps",
        region: seed.region || "Cloud",
        address: seed.address,
        cloudOnly: true,
        isDefault: seed.nodeId === defaultNodeId,
        online: seed.nodeId === primaryNodeId,
        latencyMs: seed.nodeId === primaryNodeId ? 1 : null,
        lastCheckedAt: seed.nodeId === primaryNodeId ? new Date().toISOString() : null,
        registeredAt: seed.nodeId === primaryNodeId ? new Date().toISOString() : null
      });
    }
  };

  const persistToDisk = () => {
    if (!storagePath) return;
    try {
      fs.mkdirSync(path.dirname(storagePath), { recursive: true });
      const payload = {
        schema: "gemitron.agy.cloud-fleet.v1",
        cloudOnly: true,
        defaultNodeId,
        updatedAt: new Date().toISOString(),
        nodes: Array.from(nodes.values())
      };
      fs.writeFileSync(storagePath, JSON.stringify(payload, null, 2), "utf8");
    } catch {
      // Non-fatal in read-only test sandboxes
    }
  };

  seedDefaults();

  if (storagePath && fs.existsSync(storagePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(storagePath, "utf8"));
      if (raw && typeof raw === "object") {
        if (typeof raw.defaultNodeId === "string" && raw.defaultNodeId.trim()) {
          defaultNodeId = raw.defaultNodeId.trim();
        }
        if (Array.isArray(raw.nodes) && raw.nodes.length > 0) {
          nodes.clear();
          for (const item of raw.nodes) {
            if (!item || !item.nodeId) continue;
            if (cloudOnly) {
              const check = validateCloudFleetAddress(item.address);
              if (!check.valid) continue;
            }
            nodes.set(item.nodeId, {
              nodeId: item.nodeId,
              icon: item.icon || "☁️",
              labelAr: item.labelAr || item.nodeId,
              labelEn: item.labelEn || item.nodeId,
              kind: item.kind || "standalone-vps",
              region: item.region || "Cloud",
              address: item.address,
              cloudOnly: true,
              isDefault: item.nodeId === defaultNodeId,
              online: Boolean(item.online || item.nodeId === primaryNodeId),
              latencyMs: typeof item.latencyMs === "number" ? item.latencyMs : null,
              lastCheckedAt: item.lastCheckedAt || null,
              registeredAt: item.registeredAt || null
            });
          }
          if (nodes.size === 0) {
            seedDefaults();
          }
        }
      }
    } catch {
      // Fallback to seeded defaults
    }
  }

  return {
    getDefaultNodeId() {
      return defaultNodeId;
    },
    setDefaultNodeId(nextId = "vps-01") {
      const target = String(nextId || "").trim();
      if (target !== "auto-best" && !nodes.has(target)) {
        return { ok: false, error: "UNKNOWN_NODE_ID", nodeId: target };
      }
      defaultNodeId = target;
      for (const [id, entry] of nodes.entries()) {
        nodes.set(id, { ...entry, isDefault: id === defaultNodeId });
      }
      persistToDisk();
      return { ok: true, defaultNodeId };
    },
    register(entry = {}) {
      const id = sanitizeNodeSlug(entry.nodeId || primaryNodeId);
      const existing = nodes.get(id);
      const fallbackMeta = AGY_FLEET_NODES[id] || AGY_FLEET_NODES["vps-02"];
      const rawAddress =
        entry.address || existing?.address || DEFAULT_FLEET_ADDRESSES[id] || "";
      if (cloudOnly && rawAddress) {
        const check = validateCloudFleetAddress(rawAddress);
        if (!check.valid) {
          return {
            ok: false,
            error: "CLOUD_ONLY_ADDRESS_REQUIRED",
            reason: check.reason,
            messageAr: check.messageAr,
            messageEn: check.messageEn
          };
        }
      }
      const record = {
        nodeId: id,
        icon: entry.icon || existing?.icon || fallbackMeta?.icon || "🚀",
        labelAr: entry.labelAr || existing?.labelAr || fallbackMeta?.labelAr || `خادم سحابي (${id})`,
        labelEn: entry.labelEn || existing?.labelEn || fallbackMeta?.labelEn || `Cloud Server (${id})`,
        kind: entry.kind || existing?.kind || fallbackMeta?.kind || "standalone-vps",
        region: entry.region || existing?.region || "EU-Central",
        address: rawAddress,
        port: entry.port || 18220,
        hostname: entry.hostname || os.hostname(),
        platform: entry.platform || os.platform(),
        cloudOnly: true,
        isDefault: id === defaultNodeId,
        online: true,
        latencyMs: typeof entry.latencyMs === "number" ? entry.latencyMs : existing?.latencyMs ?? 5,
        lastCheckedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString()
      };
      nodes.set(id, record);
      persistToDisk();
      return record;
    },
    upsertNode(payload = {}) {
      const id = sanitizeNodeSlug(payload.nodeId || payload.id || payload.labelEn || payload.labelAr);
      const rawAddress = String(payload.address || "").trim();
      const validation = validateCloudFleetAddress(rawAddress);
      if (cloudOnly && !validation.valid) {
        return {
          ok: false,
          error: "CLOUD_ONLY_ADDRESS_REQUIRED",
          reason: validation.reason,
          messageAr: validation.messageAr,
          messageEn: validation.messageEn
        };
      }
      const existing = nodes.get(id);
      const labelAr = String(
        payload.labelAr || payload.nameAr || existing?.labelAr || `خادم سحابي (${id})`
      ).trim();
      const labelEn = String(
        payload.labelEn || payload.nameEn || existing?.labelEn || `Cloud Node (${id})`
      ).trim();
      const wantDefault = Boolean(payload.isDefault);
      if (wantDefault) {
        defaultNodeId = id;
        for (const [k, v] of nodes.entries()) {
          nodes.set(k, { ...v, isDefault: k === id });
        }
      }
      const record = {
        nodeId: id,
        icon: payload.icon || existing?.icon || (id === "vps-01" ? "☁️" : "🚀"),
        labelAr,
        labelEn,
        kind: payload.kind || existing?.kind || (id === "vps-01" ? "cloud-hub-vps" : "standalone-vps"),
        region: String(payload.region || existing?.region || "Cloud").trim(),
        address: rawAddress,
        normalizedEndpoint: validation.normalized,
        cloudOnly: true,
        isDefault: id === defaultNodeId,
        online: existing?.online ?? (id === primaryNodeId),
        latencyMs: existing?.latencyMs ?? null,
        lastCheckedAt: existing?.lastCheckedAt ?? null,
        registeredAt: existing?.registeredAt || new Date().toISOString()
      };
      nodes.set(id, record);
      persistToDisk();
      return { ok: true, node: record };
    },
    removeNode(nodeId = "") {
      const id = sanitizeNodeSlug(nodeId);
      if (id === "vps-01") {
        return {
          ok: false,
          error: "PRIMARY_HUB_PROTECTED",
          messageAr: "لا يمكن حذف الخادم السحابي الرئيسي (vps-01 · gemitron.net)، يمكنك تعديل عنوانه أو اسمه فقط.",
          messageEn: "Primary cloud hub (vps-01) cannot be deleted; you may update its name or endpoint."
        };
      }
      if (!nodes.has(id)) {
        return {
          ok: false,
          error: "NODE_NOT_FOUND",
          messageAr: "الخادم المطلوب غير موجود في الأسطول السحابي.",
          messageEn: "Cloud node not found in fleet."
        };
      }
      nodes.delete(id);
      if (defaultNodeId === id) {
        defaultNodeId = "vps-01";
        const primary = nodes.get("vps-01");
        if (primary) {
          nodes.set("vps-01", { ...primary, isDefault: true });
        }
      }
      persistToDisk();
      return { ok: true, removedNodeId: id, defaultNodeId };
    },
    async pingNode(nodeId = "", { fetchFn = globalThis.fetch } = {}) {
      const id = sanitizeNodeSlug(nodeId);
      const entry = nodes.get(id);
      if (!entry) {
        return { ok: false, error: "NODE_NOT_FOUND", nodeId: id };
      }
      const probe = await probeFleetNodeLiveStatus({
        nodeId: id,
        address: entry.address,
        fetchFn
      });
      const updated = {
        ...entry,
        online: probe.online,
        latencyMs: probe.latencyMs,
        statusTextAr: probe.statusTextAr,
        statusTextEn: probe.statusTextEn,
        lastCheckedAt: new Date().toISOString()
      };
      nodes.set(id, updated);
      persistToDisk();
      return { ok: true, probe, node: updated };
    },
    async pingAll({ fetchFn = globalThis.fetch } = {}) {
      const results = [];
      for (const id of nodes.keys()) {
        const r = await this.pingNode(id, { fetchFn });
        if (r.ok && r.node) {
          results.push(r.node);
        }
      }
      return { ok: true, nodes: results };
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

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    return {};
  }
}

function checkClusterAuth(req, res, clusterSecret) {
  if (!clusterSecret) return true;
  const authHeader = String(req.headers?.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (token && token !== clusterSecret) {
    res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "INVALID_CLUSTER_SECRET" }));
    return false;
  }
  return true;
}

export async function handleAgyNodeHttpRequest(
  req,
  res,
  {
    nodeId = NODE_ID,
    clusterSecret = CLUSTER_SECRET,
    registry = null,
    fetchFn = globalThis.fetch
  } = {}
) {
  const effectiveRegistry = registry || createAgyFleetRegistry({ primaryNodeId: nodeId });
  const nodeMeta = AGY_FLEET_NODES[nodeId] || AGY_FLEET_NODES["vps-01"];
  const rawUrl = String(req.url || "/");
  const pathname = rawUrl.split("?")[0];

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
    const registeredItem = effectiveRegistry.list().find((n) => n.nodeId === requestedId);
    const targetMeta = AGY_FLEET_NODES[requestedId] || registeredItem || nodeMeta;
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        status: "ok",
        cloudOnly: true,
        nodeId: targetMeta.id || targetMeta.nodeId || requestedId,
        labelAr: targetMeta.labelAr,
        labelEn: targetMeta.labelEn,
        kind: targetMeta.kind,
        platform: os.platform(),
        hostname: os.hostname(),
        online: true,
        clusterAuthConfigured: Boolean(clusterSecret),
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
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
        cloudOnly: true,
        hubNodeId: nodeMeta.id,
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
        nodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  if (req.method === "POST" && pathname === "/v1/agy/nodes/register") {
    if (!checkClusterAuth(req, res, clusterSecret)) return true;
    const payload = await readJsonBody(req);
    const registered = effectiveRegistry.register(payload);
    if (registered && registered.ok === false) {
      res.writeHead(422, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(registered));
      return true;
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, registered }));
    return true;
  }

  if (req.method === "POST" && pathname === "/v1/agy/nodes/default") {
    if (!checkClusterAuth(req, res, clusterSecret)) return true;
    const payload = await readJsonBody(req);
    const result = effectiveRegistry.setDefaultNodeId(
      payload.defaultNodeId || payload.nodeId || "vps-01"
    );
    res.writeHead(result.ok ? 200 : 422, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ...result,
        nodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  if (req.method === "POST" && pathname === "/v1/agy/nodes/ping") {
    const pingRes = await effectiveRegistry.pingAll({ fetchFn });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
        nodes: pingRes.nodes
      })
    );
    return true;
  }

  const singlePingMatch = pathname.match(/^\/v1\/agy\/nodes\/([a-z0-9-]+)\/ping$/i);
  if (req.method === "POST" && singlePingMatch) {
    const targetId = singlePingMatch[1];
    const pingRes = await effectiveRegistry.pingNode(targetId, { fetchFn });
    res.writeHead(pingRes.ok ? 200 : 404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ...pingRes,
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
        nodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  const deleteNodeMatch =
    pathname.match(/^\/v1\/agy\/nodes\/([a-z0-9-]+)\/delete$/i) ||
    (req.method === "DELETE" ? pathname.match(/^\/v1\/agy\/nodes\/([a-z0-9-]+)$/i) : null);
  if (deleteNodeMatch && (req.method === "DELETE" || req.method === "POST")) {
    if (!checkClusterAuth(req, res, clusterSecret)) return true;
    const targetId = deleteNodeMatch[1];
    const delRes = effectiveRegistry.removeNode(targetId);
    res.writeHead(delRes.ok ? 200 : 422, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ...delRes,
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
        nodes: effectiveRegistry.list()
      })
    );
    return true;
  }

  const updateNodeMatch =
    req.method === "PUT" ? pathname.match(/^\/v1\/agy\/nodes\/([a-z0-9-]+)$/i) : null;
  if ((req.method === "POST" && pathname === "/v1/agy/nodes") || updateNodeMatch) {
    if (!checkClusterAuth(req, res, clusterSecret)) return true;
    const payload = await readJsonBody(req);
    if (updateNodeMatch) {
      payload.nodeId = updateNodeMatch[1];
    }
    const upRes = effectiveRegistry.upsertNode(payload);
    if (!upRes.ok) {
      res.writeHead(422, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(upRes));
      return true;
    }
    let finalNode = upRes.node;
    if (payload.probeNow !== false) {
      const pinged = await effectiveRegistry.pingNode(finalNode.nodeId, { fetchFn });
      if (pinged.ok && pinged.node) {
        finalNode = pinged.node;
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: true,
        node: finalNode,
        defaultNodeId: effectiveRegistry.getDefaultNodeId(),
        nodes: effectiveRegistry.list()
      })
    );
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
    const payload = await readJsonBody(req);
    const effectiveNodeId = nodeRouteStreamMatch
      ? nodeRouteStreamMatch[1]
      : payload.nodeId || effectiveRegistry.getDefaultNodeId() || nodeMeta.id;

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
