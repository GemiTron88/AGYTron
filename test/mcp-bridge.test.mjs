import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("callGemiMcpTool and listGemiMcpTools execute JSON-RPC 2.0 with hybrid-auto local-to-cloud failover and local-only isolation", async () => {
  const { callGemiMcpTool, listGemiMcpTools } = await import("../src/mcp-bridge.mjs");
  const seenUrls = [];

  const hybridRes = await callGemiMcpTool({
    product: "figtron",
    transport: "hybrid-auto",
    toolName: "figtron.frame.create_autolayout",
    args: { name: "Hero", width: 390, height: 844 },
    accessToken: "gemi_at_test",
    fetchFn: async (url, init) => {
      const u = String(url);
      seenUrls.push(u);
      if (u.startsWith("http://127.0.0.1:18210")) {
        throw new Error("ECONNREFUSED");
      }
      const rpc = JSON.parse(init.body);
      assert.equal(rpc.jsonrpc, "2.0");
      assert.equal(rpc.method, "tools/call");
      assert.equal(rpc.params.name, "figtron.frame.create_autolayout");
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            jsonrpc: "2.0",
            id: rpc.id,
            result: { content: [{ type: "text", text: "Created frame Hero" }], nodeId: "node-1" }
          };
        }
      };
    }
  });

  assert.equal(hybridRes.ok, true);
  assert.equal(hybridRes.usedFallback, true);
  assert.equal(hybridRes.endpointUsed, "https://mcp.gemitron.net/products/figtron/mcp");
  assert.equal(seenUrls.length, 2);

  // local-only never leaks to cloud
  const localOnlyUrls = [];
  const localFail = await listGemiMcpTools({
    product: "figtron",
    transport: "local-only",
    fetchFn: async (url) => {
      localOnlyUrls.push(String(url));
      throw new Error("ECONNREFUSED");
    }
  });
  assert.equal(localFail.ok, false);
  assert.deepEqual(localOnlyUrls, ["http://127.0.0.1:18210/products/figtron/mcp"]);
});

test("dispatchLocalEditorControlRpc enforces loopback-only, reads private token file safely, and guards doc.identity revision fences", async () => {
  const { dispatchLocalEditorControlRpc } = await import("../src/mcp-bridge.mjs");

  const nonLoopback = await dispatchLocalEditorControlRpc({
    endpointUrl: "http://192.168.1.44:19400/rpc",
    method: "figtron.handoff.export"
  });
  assert.equal(nonLoopback.ok, false);
  assert.equal(nonLoopback.code, "LOOPBACK_ONLY_REQUIRED");

  const secretToken = "figtron_ctrl_secret_998877";
  const tokenFile = path.join(os.tmpdir(), `figtron-token-${Date.now()}.tok`);
  fs.writeFileSync(tokenFile, secretToken, "utf8");

  let currentDocRevision = 7;
  const editorServer = http.createServer(async (req, res) => {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${secretToken}`) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "UNAUTHORIZED" }));
      return;
    }
    let raw = "";
    for await (const ch of req) raw += ch;
    const body = JSON.parse(raw || "{}");
    if (body.method === "doc.identity") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: { documentId: "doc-fig-1", revision: currentDocRevision }
        })
      );
      return;
    }
    currentDocRevision += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: { applied: true, method: body.method, newRevision: currentDocRevision }
      })
    );
  });

  await new Promise((resolve) => editorServer.listen(0, "127.0.0.1", resolve));
  const { port } = editorServer.address();

  try {
    // Stale revision fence check
    const conflict = await dispatchLocalEditorControlRpc({
      endpointUrl: `http://127.0.0.1:${port}/rpc`,
      tokenFilePath: tokenFile,
      expectedRevision: 5,
      method: "figtron.frame.create_autolayout",
      params: { name: "Card" }
    });
    assert.equal(conflict.ok, false);
    assert.equal(conflict.code, "REVISION_CONFLICT");
    assert.equal(conflict.actualRevision, 7);

    // Matching revision succeeds
    const applied = await dispatchLocalEditorControlRpc({
      endpointUrl: `http://127.0.0.1:${port}/rpc`,
      tokenFilePath: tokenFile,
      expectedRevision: 7,
      method: "figtron.frame.create_autolayout",
      params: { name: "Card" }
    });
    assert.equal(applied.ok, true);
    assert.equal(applied.result.applied, true);
    assert.equal(applied.result.newRevision, 8);
  } finally {
    await new Promise((resolve) => editorServer.close(resolve));
    try {
      fs.unlinkSync(tokenFile);
    } catch {
      // ignore
    }
  }
});
