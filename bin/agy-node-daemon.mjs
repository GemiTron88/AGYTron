#!/usr/bin/env node
/**
 * agy-node-daemon — Lightweight Antigravity Bridge Daemon for Windows, Mac, VPS 01 & VPS 02
 *
 * Topology:
 *   - VPS 01 hosts `gemitron.net` (`https://mcp.gemitron.net`) AND runs local AGY node `vps-01`.
 *   - VPS 02 is a separate standalone Linux server (no domain needed): connects either via
 *     direct IP (`http://<VPS_02_IP>:18220`) OR registers outbound into VPS 01 (`--hub-url https://mcp.gemitron.net`).
 *   - Windows & Mac run on Local LAN (`127.0.0.1:18220` / `192.168.x.x:18220`) and can also
 *     register outbound into VPS 01 (`--hub-url https://mcp.gemitron.net`).
 *
 * Startup commands:
 *   - VPS 01 (Main gemitron.net): node bin/agy-node-daemon.mjs --node-id vps-01 --port 18220
 *   - VPS 02 (Standalone Linux):  node bin/agy-node-daemon.mjs --node-id vps-02 --port 18220 --hub-url https://mcp.gemitron.net
 *   - Windows PC (Local LAN):     node bin/agy-node-daemon.mjs --node-id win-local --port 18220
 *   - Mac Studio (Local LAN):     node bin/agy-node-daemon.mjs --node-id mac-local --port 18220
 */

import http from "node:http";
import os from "node:os";
import {
  AGY_FLEET_NODES,
  buildCreatorFriendlyStreamEvents
} from "../src/fleet-router.mjs";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : fallback;
}

const NODE_ID = flag("--node-id", process.env.AGY_NODE_ID || "vps-01");
const PORT = parseInt(flag("--port", process.env.AGY_NODE_PORT || "18220"), 10);
const HOST = flag("--host", process.env.AGY_NODE_HOST || "0.0.0.0");
const HUB_URL = flag("--hub-url", process.env.AGY_HUB_URL || "https://mcp.gemitron.net");

export function createAgyNodeDaemonServer({ nodeId = NODE_ID } = {}) {
  const nodeMeta = AGY_FLEET_NODES[nodeId] || AGY_FLEET_NODES["vps-01"];

  return http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/v1/agy/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          ok: true,
          nodeId: nodeMeta.id,
          labelAr: nodeMeta.labelAr,
          labelEn: nodeMeta.labelEn,
          kind: nodeMeta.kind,
          platform: os.platform(),
          hostname: os.hostname(),
          online: true
        })
      );
      return;
    }

    if (req.method === "POST" && req.url === "/v1/agy/chat/stream") {
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

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      });

      const events = buildCreatorFriendlyStreamEvents({
        prompt: payload.prompt || "",
        locale: payload.locale || "ar-EG",
        nodeId: nodeMeta.id,
        styleTitle: payload.styleTitle || "إعلان سينمائي فاخر"
      });

      for (const ev of events) {
        res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`);
      }
      res.write(`event: done\ndata: {"ok":true}\n\n`);
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "NOT_FOUND" }));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createAgyNodeDaemonServer({ nodeId: NODE_ID });
  server.listen(PORT, HOST, () => {
    console.log(
      `[AGY Node Daemon] Online (${NODE_ID}) listening on http://${HOST}:${PORT}/v1/agy/chat/stream`
    );
  });
}
