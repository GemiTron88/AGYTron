#!/usr/bin/env node
/**
 * tron-agy CLI — Standalone Global AGY AI Creative Director for all 6 TronCS Apps
 */
import { buildTronAgyCreativePlan, TRONCS_SUITE_APPS } from "../src/index.mjs";
import { resolveMcpTransportConfig } from "../src/mcp-bridge.mjs";

const args = process.argv.slice(2);

function readFlag(name, fallback) {
  const idx = args.indexOf(name);
  if (idx >= 0 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return fallback;
}

const prompt = readFlag(
  "--prompt",
  "أورورا كرونوغراف X1 — فخامة التيتانيوم السويسري | حملة متكاملة عبر جناح TronCS الإبداعي"
);
const appsRaw = readFlag("--apps", "phototron,aftertron,gemimotion,filmtron");
const model = readFlag("--model", "gemini-3.1-pro");
const effort = readFlag("--effort", "high");
const authMode = readFlag("--auth-mode", "agy-mcp-host");
const mcpTransport = readFlag("--transport", "hybrid-auto");
const locale = readFlag("--locale", "ar-EG");

const apps = appsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const transportInfo = resolveMcpTransportConfig({
  transport: mcpTransport,
  authMode
});

const plan = buildTronAgyCreativePlan({
  prompt,
  apps: apps.length ? apps : Object.keys(TRONCS_SUITE_APPS),
  model,
  effort,
  authMode,
  mcpTransport,
  locale
});

console.log(
  JSON.stringify(
    {
      ...plan,
      transportConfig: transportInfo
    },
    null,
    2
  )
);
process.exit(plan.ok ? 0 : 1);
