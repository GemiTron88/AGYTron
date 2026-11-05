#!/usr/bin/env node
/**
 * agy-node-daemon — Lightweight Antigravity Bridge Daemon for Windows, Mac, VPS 01 & VPS 02
 *
 * Run this on each of your 4 machines where Antigravity is installed:
 *   - Windows PC:  node bin/agy-node-daemon.mjs --node-id win-local --port 18220
 *   - Mac Studio:  node bin/agy-node-daemon.mjs --node-id mac-local --port 18220
 *   - Linux VPS 1: node bin/agy-node-daemon.mjs --node-id vps-01 --port 18220
 *   - Linux VPS 2: node bin/agy-node-daemon.mjs --node-id vps-02 --port 18220
 *
 * Exposes:
 *   - GET  /v1/agy/health      -> Node status, OS, and active Antigravity session readiness
 *   - POST /v1/agy/chat/stream -> Server-Sent Events (SSE) stream of thinking, tool badges, and chat reply
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
