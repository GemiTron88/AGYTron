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
  TRONCS_MOBILE_APPS,
  TRONCS_SEVEN_DESKTOP_APPS,
  TRONCS_SEVEN_MOBILE_COMPANIONS,
  SUITE_COMPANION_MATRIX,
  GEMITRON_GLOBAL_SERVICES,
  AGY_MODELS,
  AGY_EFFORT_TIERS,
  FILMTRON_EDITORIAL_PRESETS,
  defaultAgyQuotaLedger,
  getAppKnowledgeAndSkills,
  listAllNineAppsKnowledgeCatalog,
  listFullSuiteCompanionCatalog,
  auditAgySmartMindReadiness,
  buildTronAgyCreativePlan,
  buildGlobalAgySmartMindPlan,
  executeGlobalAgySmartMind,
  buildFilmEditorialDirections,
  translateSubjectiveArabicFeedback,
  critiqueFilmTimeline,
  FIGTRON_DESIGN_PRESETS,
  buildSuiteCreativeDirection,
  translateSubjectiveSuiteFeedback,
  getSuiteArabicFeedbackCatalog,
  critiqueAndRepairSuitePlan,
  generateFigTronCodeSnippet,
  callGemiMcpTool
} from "../src/index.mjs";
import { AGY_FLEET_NODES, DEFAULT_FLEET_ADDRESSES } from "../src/fleet-router.mjs";
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
  const service = readFlag("--service", readFlag("--app", "filmtron"));
  const task = readFlag("--task", "general-reasoning");
  const skillId = readFlag("--skill", null);
  const workflowId = readFlag("--workflow", null);
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
    const readiness = auditAgySmartMindReadiness();
    return {
      ...readiness,
      ok: readiness.ok,
      command: "audit",
      tosSafetyGuard: AGY_TOS_SAFETY_GUARD,
      suiteAppsCount: Object.keys(TRONCS_SUITE_APPS).length,
      mobileCompanionsCount: Object.keys(TRONCS_MOBILE_APPS).length,
      totalSuiteProductsCount:
        TRONCS_SEVEN_DESKTOP_APPS.length + TRONCS_SEVEN_MOBILE_COMPANIONS.length,
      globalServicesCount: Object.keys(GEMITRON_GLOBAL_SERVICES).length,
      modelsCount: AGY_MODELS.length,
      effortTiers: Object.keys(AGY_EFFORT_TIERS),
      filmtronPresetsCount: Object.keys(FILMTRON_EDITORIAL_PRESETS).length
    };
  }

  if (firstArg === "suite-catalog") {
    return {
      ok: true,
      command: "suite-catalog",
      tosSafetyGuard: AGY_TOS_SAFETY_GUARD,
      ...listFullSuiteCompanionCatalog(),
      companionMatrix: SUITE_COMPANION_MATRIX
    };
  }

  if (firstArg === "feedback-catalog") {
    return {
      ...getSuiteArabicFeedbackCatalog(service),
      command: "feedback-catalog",
      tosSafetyGuard: AGY_TOS_SAFETY_GUARD
    };
  }

  if (firstArg === "skills") {
    const appFilter = readFlag("--app", readFlag("--service", ""));
    if (appFilter) {
      const kb = getAppKnowledgeAndSkills(appFilter);
      return {
        ok: Boolean(kb),
        command: "skills",
        appId: kb?.appId || appFilter,
        skills: kb?.skills || []
      };
    }
    const cat = listAllNineAppsKnowledgeCatalog();
    return {
      ok: true,
      command: "skills",
      totalSkills: cat.totalSkills,
      apps: cat.apps.map((a) => ({ appId: a.appId, skillsCount: a.skills.length, skills: a.skills }))
    };
  }

  if (firstArg === "workflows") {
    const appFilter = readFlag("--app", readFlag("--service", ""));
    if (appFilter) {
      const kb = getAppKnowledgeAndSkills(appFilter);
      return {
        ok: Boolean(kb),
        command: "workflows",
        appId: kb?.appId || appFilter,
        workflows: kb?.workflows || []
      };
    }
    const cat = listAllNineAppsKnowledgeCatalog();
    return {
      ok: true,
      command: "workflows",
      totalWorkflows: cat.totalWorkflows,
      apps: cat.apps.map((a) => ({
        appId: a.appId,
        workflowsCount: a.workflows.length,
        workflows: a.workflows
      }))
    };
  }

  if (firstArg === "quota") {
    if (args.includes("--reset")) {
      const family = readFlag("--family", "all");
      const resetRes = defaultAgyQuotaLedger.resetFamily(family);
      return {
        ...resetRes,
        command: "quota",
        quota: defaultAgyQuotaLedger.getSnapshot()
      };
    }
    return {
      ...defaultAgyQuotaLedger.getSnapshot(),
      command: "quota"
    };
  }

  if (firstArg === "fleet") {
    return {
      ok: true,
      command: "fleet",
      defaultAddresses: DEFAULT_FLEET_ADDRESSES,
      nodes: Object.values(AGY_FLEET_NODES)
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

  const directorAppMap = {
    "suite-director": service,
    "figtron-director": "figtron",
    "photo-director": "phototron",
    "after-director": "aftertron",
    "motion-director": "gemimotion",
    "light-director": "lighttron",
    "scale-director": "scaletron"
  };
  if (Object.hasOwn(directorAppMap, firstArg)) {
    return buildSuiteCreativeDirection({
      appId: directorAppMap[firstArg],
      prompt,
      presetId: readFlag("--preset", null),
      paletteId: readFlag("--palette", "inferno-dark"),
      fps,
      durationSec,
      locale
    });
  }

  if (firstArg === "suite-feedback") {
    return translateSubjectiveSuiteFeedback({
      appId: service,
      feedbackText: feedback || prompt,
      currentFps: fps,
      locale
    });
  }

  if (firstArg === "suite-critique") {
    return critiqueAndRepairSuitePlan({
      appId: service,
      spec: {},
      maxPasses: AGY_EFFORT_TIERS[effort]?.maxCritiquePasses || 3
    });
  }

  if (firstArg === "codegen") {
    const target = readFlag("--target", "flutter");
    const paletteId = readFlag("--palette", "inferno-dark");
    return generateFigTronCodeSnippet({
      target,
      spec: { paletteId, locale, frames: [] }
    });
  }

  if (firstArg === "figtron-presets") {
    return {
      ok: true,
      command: "figtron-presets",
      presets: Object.values(FIGTRON_DESIGN_PRESETS)
    };
  }

  if (firstArg === "mcp-call") {
    const toolName = readFlag("--tool", "figtron.frame.create_autolayout");
    return callGemiMcpTool({
      product: service,
      transport: mcpTransport,
      authMode,
      toolName,
      args: {}
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

  if (firstArg === "smart-mind" || firstArg === "execute") {
    const servicesList = appsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (args.includes("--plan-only") && firstArg !== "execute") {
      return buildGlobalAgySmartMindPlan({
        prompt,
        service: servicesList[0] || service,
        services: servicesList,
        task,
        skillId,
        workflowId,
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
      skillId,
      workflowId,
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
