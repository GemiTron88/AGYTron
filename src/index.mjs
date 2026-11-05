/**
 * @gemitron/tron-agy — Core Global AGY AI Creative Brain & ToS-Safe SDK
 *
 * Powers all 6 TronCS Creative Suite applications alongside TRON AI:
 *   1. PhotoTron  (phototron  / .pcraft)
 *   2. AfterTron  (aftertron  / .acraft)
 *   3. FilmTron   (filmtron   / .fcraft)
 *   4. GemiMotion (gemimotion / .gmotion)
 *   5. FigTron    (figtron    / .figtron)
 *   6. LightTron  (lighttron  / .lcraft)
 */

export const TRON_AGY_VERSION = "1.0.0";
export const TRON_AGY_SCHEMA = "tronagy.global_brain.v1";

export const AGY_TOS_SAFETY_GUARD = Object.freeze({
  policyId: "tronagy.google_tos_safe.v1",
  forbidExternalGoogleOauthExtraction: true,
  forbidGeminiCredentialFileScraping: true,
  forbidUndocumentedInternalEndpoints: true,
  architecturePattern: "host-inversion-mcp-client",
  summary:
    "Zero Google OAuth tokens are ever read, scraped, or proxied outside the official Antigravity runtime. " +
    "Either (1) Antigravity IDE/CLI connects as an MCP Client Host into GemiMCP using GemiGuard/Zitadel tokens, " +
    "(2) standalone apps use official public Google AI Studio / Vertex AI / Anthropic API keys, or " +
    "(3) standalone apps run 100% offline via Local TRON Loopback (127.0.0.1:8090)."
});

export const TRONCS_SUITE_APPS = Object.freeze({
  phototron: Object.freeze({
    id: "phototron",
    name: "PhotoTron",
    arName: "فوتو ترون",
    ext: ".pcraft",
    planSchema: "phototron.tron.plan.v1",
    mcpRoute: "/products/photo/mcp",
    accentHex: "#38bdf8",
    roleEn: "Key Art Compositing, Hero Retouching & Arabic Display Typography",
    roleAr: "تركيب البوسترات، معالجة الصور الاحترافية، والخطوط العربية الإعلانية",
    nativeTools: [
      "photo.document.place",
      "photo.text.create",
      "photo.adjustment.curves",
      "photo.adjustment.levels",
      "photo.mask.revealAll",
      "photo.layerStyle.dropShadow"
    ],
    critiqueChecks: [
      "Non-destructive layer stack & smart masks intact",
      "Licensed raster/product hero asset verified",
      "Arabic HarfBuzz RTL glyph shaping & WCAG >= 4.5:1 contrast"
    ]
  }),
  aftertron: Object.freeze({
    id: "aftertron",
    name: "AfterTron",
    arName: "أفتر ترون",
    ext: ".acraft",
    planSchema: "aftertron.tron.plan.v1",
    mcpRoute: "/products/after/mcp",
    accentHex: "#a855f7",
    roleEn: "Node/Layer VFX, 3D Camera Tracking & Easy-Ease Keyframe Choreography",
    roleAr: "خدع بصرية سينمائية، تتبع كاميرا 3D، وتحريك منحنيات السرعة",
    nativeTools: [
      "after.layer.create_text",
      "after.layer.create_shape",
      "after.layer.create_adjustment",
      "after.keyframe.add",
      "after.keyframe.easy_ease",
      "after.effect.apply"
    ],
    critiqueChecks: [
      "254,016,000,000 ticks/sec rational frame alignment",
      "Continuous velocity curves on all primary transforms",
      "Track matte and optical glow hierarchy verified"
    ]
  }),
  filmtron: Object.freeze({
    id: "filmtron",
    name: "FilmTron",
    arName: "فيلم ترون",
    ext: ".fcraft",
    planSchema: "filmtron.tron.plan.v1",
    mcpRoute: "/products/film/mcp",
    accentHex: "#f43f5e",
    roleEn: "3-Act NLE Editorial, J/L Cuts, Lumetri Cinema Grading & Fairlight DAW",
    roleAr: "مونتاج سينمائي متعدد المسارات، تلوين Lumetri، ومكساج صوتي إذاعي",
    nativeTools: [
      "film.timeline.place_clip",
      "film.timeline.ripple_trim",
      "film.transitions.apply",
      "film.color.set_lumetri",
      "film.audio.set_gain",
      "film.captions.add"
    ],
    critiqueChecks: [
      "Exact rational frame boundary alignment",
      "Rec.709 luminance & skin-tone vectorscope safety",
      "-14.0 LUFS broadcast master loudness & voiceover ducking"
    ]
  }),
  gemimotion: Object.freeze({
    id: "gemimotion",
    name: "GemiMotion",
    arName: "جيمي موشن",
    ext: ".gmotion",
    planSchema: "gemimotion.tron.plan.v1",
    recipeSchema: "gemimotion-recipe/v3",
    mcpRoute: "/products/motion/mcp",
    accentHex: "#f59e0b",
    roleEn: "Procedural 3D PBR + WGSL Shader Choreography, 48kHz Vibe Score & Auto-SFX",
    roleAr: "إخراج مشاهد 3D وشيدر، موسيقى تصويرية 48kHz، ومؤثرات صوتية متزامنة",
    nativeTools: [
      "motion.timeline.clip.vfx",
      "motion.timeline.clip.scene3d",
      "motion.timeline.clip.transform",
      "motion.timeline.clip.keyframe.add",
      "motion.timeline.clip.daw",
      "motion.caption.upsert"
    ],
    critiqueChecks: [
      "SafeRect title/action margin compliance (0 violations)",
      "WCAG >= 4.5:1 contrast & overcrowding density guard",
      "48kHz stereo Vibe Score beat-grid + 6 frame-accurate SFX cues"
    ]
  }),
  figtron: Object.freeze({
    id: "figtron",
    name: "FigTron",
    arName: "فيج ترون",
    ext: ".figtron",
    planSchema: "figtron.tron.plan.v1",
    mcpRoute: "/products/troncs/mcp",
    accentHex: "#10b981",
    roleEn: "Design System Tokens, Auto-Layout Components & Interactive UX Flows",
    roleAr: "أنظمة التصميم، مكونات Auto-Layout التفاعلية، وتجربة المستخدم",
    nativeTools: [
      "figtron.frame.create_autolayout",
      "figtron.token.bind_variable",
      "figtron.component.instantiate",
      "figtron.text.create_rtl",
      "figtron.prototype.link_interaction"
    ],
    critiqueChecks: [
      "100% design token binding (zero hardcoded hex)",
      "Bidirectional RTL/LTR auto-layout mirroring",
      "Complete interactive state matrix (default/hover/focus/disabled)"
    ]
  }),
  lighttron: Object.freeze({
    id: "lighttron",
    name: "LightTron",
    arName: "لايت ترون",
    ext: ".lcraft",
    planSchema: "lighttron.tron.plan.v1",
    mcpRoute: "/products/troncs/mcp",
    accentHex: "#6366f1",
    roleEn: "RAW Demosaic Develop, Filmic Tone Curves & Batch Shoot Calibration",
    roleAr: "تحميض ملفات RAW، منحنيات الإضاءة السينمائية، ومعايرة الألوان",
    nativeTools: [
      "lighttron.develop.exposure_wb",
      "lighttron.develop.tone_curve",
      "lighttron.develop.hsl_calibration",
      "lighttron.mask.radial_gradient",
      "lighttron.catalog.sync_settings"
    ],
    critiqueChecks: [
      "Highlight/shadow clipping guard (< 0.5% clipped pixels)",
      "Non-destructive parametric XMP history",
      "Batch color temperature consistency"
    ]
  })
});

export const AGY_MODELS = Object.freeze([
  {
    id: "gemini-3.1-pro",
    labelEn: "Gemini 3.1 Pro (Default ✦)",
    labelAr: "Gemini 3.1 Pro (افتراضي ✦)",
    provider: "google-official",
    strengths: "Deep multi-app choreography, 3D/Shader math, Arabic RTL art direction & visual critique"
  },
  {
    id: "gemini-3-flash",
    labelEn: "Gemini 3 Flash (Fast ⚡)",
    labelAr: "Gemini 3 Flash (سريع ⚡)",
    provider: "google-official",
    strengths: "Sub-second interactive storyboard iteration & live parameter tweaking"
  },
  {
    id: "claude-opus-4-6",
    labelEn: "Claude Opus 4.6 (OpenCode Master)",
    labelAr: "Claude Opus 4.6 (إخراج عميق)",
    provider: "anthropic-official",
    strengths: "OpenCode-grade complex multi-card layouts, kinetic typography & dense choreography"
  },
  {
    id: "claude-sonnet-4-6",
    labelEn: "Claude Sonnet 4.6 (Balanced)",
    labelAr: "Claude Sonnet 4.6 (متوازن)",
    provider: "anthropic-official",
    strengths: "Rapid agency SaaS walkthroughs & UI component flows"
  },
  {
    id: "qwen3.5:4b-q4_K_M",
    labelEn: "Qwen 3.5 4B (Local TRON Loopback)",
    labelAr: "Qwen 3.5 4B (محلي TRON)",
    provider: "local-workstation",
    strengths: "100% offline zero-cloud workstation planning on 127.0.0.1:8090"
  }
]);

export const AGY_EFFORT_TIERS = Object.freeze({
  low: Object.freeze({
    id: "low",
    labelEn: "Low (1,024t · 1 Pass)",
    labelAr: "سريع (1,024 توكن · تمريرة واحدة)",
    thinkingBudgetTokens: 1024,
    maxCritiquePasses: 1
  }),
  medium: Object.freeze({
    id: "medium",
    labelEn: "Medium (4,096t · 2 Passes)",
    labelAr: "متوازن (4,096 توكن · تمريرتان)",
    thinkingBudgetTokens: 4096,
    maxCritiquePasses: 2
  }),
  high: Object.freeze({
    id: "high",
    labelEn: "High (16,384t · 3 Passes)",
    labelAr: "عميق (16,384 توكن · 3 تمريرات)",
    thinkingBudgetTokens: 16384,
    maxCritiquePasses: 3
  }),
  max: Object.freeze({
    id: "max",
    labelEn: "Max (32,768t · 5 Passes)",
    labelAr: "أقصى تفكير (32,768 توكن · 5 تمريرات)",
    thinkingBudgetTokens: 32768,
    maxCritiquePasses: 5
  })
});

export const AGY_AUTH_MODES = Object.freeze({
  "agy-mcp-host": Object.freeze({
    id: "agy-mcp-host",
    legacyAlias: "antigravity-oauth",
    labelEn: "AGY Host Bridge (ToS-Safe MCP/CLI)",
    labelAr: "جسر مضيف AGY الآمن (MCP/CLI Host)",
    tosSafe: true,
    description:
      "Official Antigravity IDE/CLI acts as the MCP Client Host calling GemiMCP/TronCS tools. Zero Google tokens ever leave Antigravity."
  }),
  "gemi-access-token": Object.freeze({
    id: "gemi-access-token",
    labelEn: "GemiMCP Access Token (Zitadel / gemi_at_*)",
    labelAr: "توكن GemiMCP الرسمي (Zitadel / OWNER)",
    tosSafe: true,
    description:
      "Authenticates against https://auth.gemitron.net with OWNER audience and active GemiGuard hardware lease."
  }),
  "api-key-env": Object.freeze({
    id: "api-key-env",
    labelEn: "Official API Key (Google AI Studio / Anthropic)",
    labelAr: "مفتاح API رسمي (GEMINI / ANTHROPIC)",
    tosSafe: true,
    description:
      "Uses standard commercial GEMINI_API_KEY or ANTHROPIC_API_KEY from workstation environment."
  }),
  "local-tron-loopback": Object.freeze({
    id: "local-tron-loopback",
    labelEn: "Local TRON Loopback (127.0.0.1:8090)",
    labelAr: "حلقة TRON المحلية (بدون سحابة)",
    tosSafe: true,
    description:
      "100% offline local inference via workstation llama-server (127.0.0.1:8090) or Ollama (127.0.0.1:11434)."
  })
});

export function normalizeAgyAuthMode(rawMode = "agy-mcp-host") {
  if (rawMode === "antigravity-oauth" || rawMode === "agy-mcp-host") {
    return "agy-mcp-host";
  }
  if (Object.hasOwn(AGY_AUTH_MODES, rawMode)) {
    return rawMode;
  }
  return null;
}

export function buildTronAgyCreativePlan({
  prompt,
  apps = ["gemimotion"],
  model = "gemini-3.1-pro",
  effort = "high",
  authMode = "agy-mcp-host",
  mcpTransport = "hybrid-auto",
  locale = "ar-EG",
  workspaceRoot = "/workspace/troncs-production"
} = {}) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    return { ok: false, code: "EMPTY_PROMPT", status: "REJECTED" };
  }
  const modelMeta = AGY_MODELS.find((m) => m.id === model);
  if (!modelMeta) {
    return { ok: false, code: "INVALID_MODEL", status: "REJECTED" };
  }
  const effortMeta = AGY_EFFORT_TIERS[effort];
  if (!effortMeta) {
    return { ok: false, code: "INVALID_EFFORT", status: "REJECTED" };
  }
  const normalizedAuth = normalizeAgyAuthMode(authMode);
  if (!normalizedAuth) {
    return { ok: false, code: "INVALID_AUTH_MODE", status: "REJECTED" };
  }
  const validApps = (Array.isArray(apps) ? apps : [apps]).filter((a) =>
    Object.hasOwn(TRONCS_SUITE_APPS, a)
  );
  if (validApps.length === 0) {
    return { ok: false, code: "INVALID_TARGET_APPS", status: "REJECTED" };
  }

  const cleanPrompt = prompt.trim();
  const stages = validApps.map((appId, index) => {
    const app = TRONCS_SUITE_APPS[appId];
    return {
      stage: index + 1,
      appId: app.id,
      appName: app.name,
      planSchema: app.planSchema,
      mcpRoute: app.mcpRoute,
      outputArtifact: `${workspaceRoot}/${app.id}-master${app.ext}`,
      role: locale.startsWith("ar") ? app.roleAr : app.roleEn,
      selectedTools: app.nativeTools.slice(0, 4),
      critiqueChecks: app.critiqueChecks,
      critiquePassesScheduled: effortMeta.maxCritiquePasses
    };
  });

  return {
    ok: true,
    schema: TRON_AGY_SCHEMA,
    version: TRON_AGY_VERSION,
    status: "PREPARED_NOT_EXECUTED",
    tosSafetyGuard: AGY_TOS_SAFETY_GUARD,
    prompt: cleanPrompt,
    locale,
    model: modelMeta.id,
    modelLabel: locale.startsWith("ar") ? modelMeta.labelAr : modelMeta.labelEn,
    effort: effortMeta.id,
    thinkingBudgetTokens: effortMeta.thinkingBudgetTokens,
    maxCritiquePasses: effortMeta.maxCritiquePasses,
    authMode: normalizedAuth,
    authModeMeta: AGY_AUTH_MODES[normalizedAuth],
    mcpTransport,
    targetApps: validApps,
    stages,
    cliCommand: `tron-agy direct --prompt "${cleanPrompt.replace(/"/g, '\\"')}" --apps ${validApps.join(",")} --model ${modelMeta.id} --effort ${effortMeta.id} --auth-mode ${normalizedAuth} --transport ${mcpTransport}`
  };
}
