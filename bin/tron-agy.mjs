#!/usr/bin/env node
/**
 * tron-agy CLI — Standalone Global AGY AI Creative Director & Smart Mind CLI
 *
 * Supports subcommands emitted by `cliCommand` across AGYTron, FilmTron, FilmTron-Mobile & TronCS:
 *   - `tron-agy direct --apps ... --prompt ... --model ... --effort ... --scope ...`
 *   - `tron-agy smart-mind --service ... --task ... --prompt ... --model ... --effort ... --node ...`
 *   - `tron-agy film-director --preset ... --prompt ... --fps ...`
 *   - `tron-agy feedback --feedback "سرع الإيقاع ودفي الألوان" --fps 24/1`
 *   - `tron-agy critique --preset cinema-narrative-cut --effort high`
 *   - `tron-agy presets`
 *   - `tron-agy audit`
 */
import { fileURLToPath } from "node:url";
import {
  AGY_TOS_SAFETY_GUARD,
  TRONCS_SUITE_APPS,
  GEMITRON_GLOBAL_SERVICES,
  AGY_MODELS,
  AGY_EFFORT_TIERS,
  FILMTRON_EDITORIAL_PRESETS,
  buildTronAgyCreativePlan,
  buildGlobalAgySmartMindPlan,
  executeGlobalAgySmartMind,
  buildFilmEditorialDirections,
  translateSubjectiveArabicFeedback,
  critiqueFilmTimeline
} from "../src/index.mjs";
import { resolveMcpTransportConfig } from "../src/mcp-bridge.mjs";

export async function runTronAgyCli(rawArgs = process.argv.slice(2)) {
  const args = Array.isArray(rawArgs) ? rawArgs : [];
  const firstArg = args[0] && !args[0].startsWith("--") ? args[0].toLowerCase() : "direct";

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
  const appsRaw = readFlag("--apps", readFlag("--service", "phototron,aftertron,gemimotion,filmtron"));
  const service = readFlag("--service", "filmtron");
  const task = readFlag("--task", "general-reasoning");
  const preset = readFlag("--preset", "cinema-narrative-cut");
  const feedback = readFlag("--feedback", "");
  const fps = readFlag("--fps", "24/1");
  const durationSec = Number(readFlag("--duration", "30")) || 30;
  const model = readFlag("--model", "gemini-4-argon-high");
  const effort = readFlag("--effort", "high");
  const authMode = readFlag("--auth-mode", "agy-mcp-host");
  const executionScope = readFlag("--scope", "device-fleet");
  const nodeId = readFlag("--node", "auto-best");
  const mcpTransport = readFlag("--transport", "hybrid-auto");
  const locale = readFlag("--locale", "ar-EG");

  if (firstArg === "presets") {
    return {
      ok: true,
      command: "presets",
      presets: Object.values(FILMTRON_EDITORIAL_PRESETS)
    };
  }

  if (firstArg === "audit") {
    return {
      ok: true,
      command: "audit",
      tosSafetyGuard: AGY_TOS_SAFETY_GUARD,
      suiteAppsCount: Object.keys(TRONCS_SUITE_APPS).length,
      globalServicesCount: Object.keys(GEMITRON_GLOBAL_SERVICES).length,
      modelsCount: AGY_MODELS.length,
      effortTiers: Object.keys(AGY_EFFORT_TIERS),
      filmtronPresetsCount: Object.keys(FILMTRON_EDITORIAL_PRESETS).length
    };
  }

  if (firstArg === "film-director") {
    return buildFilmEditorialDirections({
      prompt,
      presetId: preset,
      fps,
      durationSec,
      locale
    });
  }

  if (firstArg === "feedback") {
    return translateSubjectiveArabicFeedback({
      feedbackText: feedback || prompt,
      currentFps: fps,
      locale
    });
  }

  if (firstArg === "critique") {
    return critiqueFilmTimeline({
      sequence: { fps },
      presetId: preset,
      effort,
      locale
    });
  }

  if (firstArg === "smart-mind") {
    const servicesList = appsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (args.includes("--plan-only")) {
      return buildGlobalAgySmartMindPlan({
        prompt,
        service: servicesList[0] || service,
        services: servicesList,
        task,
        model,
        effort,
        authMode,
        executionScope,
        nodeId,
        mcpTransport,
        locale
      });
    }
    return executeGlobalAgySmartMind({
      prompt,
      service: servicesList[0] || service,
      services: servicesList,
      task,
      model,
      effort,
      nodeId,
      authMode,
      executionScope,
      locale,
      context: { presetId: preset, feedback: feedback || undefined, fps },
      fetchFn: null
    });
  }

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
    executionScope,
    mcpTransport,
    locale
  });

  return {
    ...plan,
    transportConfig: transportInfo
  };
}

const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  runTronAgyCli(process.argv.slice(2))
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result && result.ok !== false ? 0 : 1);
    })
    .catch((err) => {
      console.error(
        JSON.stringify({
          ok: false,
          error: err instanceof Error ? err.message : String(err)
        })
      );
      process.exit(1);
    });
}
