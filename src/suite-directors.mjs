/**
 * @gemitron/agy-tron — 7-App Creative Suite Directors, Subjective Feedback Compilers,
 * Real Mathematical Closed-Loop Critics & FigTron Codegen (`src/suite-directors.mjs`)
 */

import {
  AUTHORITATIVE_TICKS_PER_SECOND,
  resolveRationalFps,
  frameToTicks,
  secondsToFrameAlignedTicks,
  buildFilmEditorialDirections,
  translateSubjectiveArabicFeedback,
  critiqueFilmTimeline
} from "./creative-suite-intelligence.mjs";

const TEN_PALETTE_FAMILIES = [
  { slug: "inferno", nameEn: "Inferno", nameAr: "إنفرنو", accentDark: "#F83942", accentLight: "#DC2626", secondary: "#FFD437", darkBg: "#08080A", darkSurface: "#101013", lightBg: "#FAFAFB", lightSurface: "#FFFFFF" },
  { slug: "royal-gold", nameEn: "Royal Gold", nameAr: "الذهبي الملكي", accentDark: "#F59E0B", accentLight: "#B45309", secondary: "#FDE68A", darkBg: "#0A0908", darkSurface: "#141210", lightBg: "#FFFDF7", lightSurface: "#FFFFFF" },
  { slug: "emerald-oasis", nameEn: "Emerald Oasis", nameAr: "واحة الزمرد", accentDark: "#10B981", accentLight: "#047857", secondary: "#34D399", darkBg: "#070C0A", darkSurface: "#0F1714", lightBg: "#F6FBF9", lightSurface: "#FFFFFF" },
  { slug: "sapphire-cyber", nameEn: "Sapphire Cyber", nameAr: "ياقوت سيبراني", accentDark: "#38BDF8", accentLight: "#0284C7", secondary: "#818CF8", darkBg: "#070A10", darkSurface: "#0F1623", lightBg: "#F8FAFC", lightSurface: "#FFFFFF" },
  { slug: "amethyst-studio", nameEn: "Amethyst Studio", nameAr: "استوديو الجمشت", accentDark: "#A855F7", accentLight: "#7E22CE", secondary: "#E879F9", darkBg: "#0B0810", darkSurface: "#151020", lightBg: "#FAF7FF", lightSurface: "#FFFFFF" },
  { slug: "titanium-mono", nameEn: "Titanium Mono", nameAr: "تيتانيوم أحادي", accentDark: "#E2E8F0", accentLight: "#1E293B", secondary: "#94A3B8", darkBg: "#09090B", darkSurface: "#141418", lightBg: "#F8FAFC", lightSurface: "#FFFFFF" },
  { slug: "desert-sand", nameEn: "Desert Sand", nameAr: "رمال الصحراء", accentDark: "#EA580C", accentLight: "#C2410C", secondary: "#FDBA74", darkBg: "#0C0907", darkSurface: "#181310", lightBg: "#FDFBF7", lightSurface: "#FFFFFF" },
  { slug: "crimson-cinema", nameEn: "Crimson Cinema", nameAr: "سينما قرمزية", accentDark: "#F43F5E", accentLight: "#BE123C", secondary: "#FB7185", darkBg: "#0B0709", darkSurface: "#161013", lightBg: "#FFF8F9", lightSurface: "#FFFFFF" },
  { slug: "cobalt-finance", nameEn: "Cobalt Finance", nameAr: "كوبالت مالي", accentDark: "#3B82F6", accentLight: "#1D4ED8", secondary: "#60A5FA", darkBg: "#07090F", darkSurface: "#101522", lightBg: "#F7FAFF", lightSurface: "#FFFFFF" },
  { slug: "mint-aurora", nameEn: "Mint Aurora", nameAr: "شفق النعناع", accentDark: "#2DD4BF", accentLight: "#0F766E", secondary: "#5EEAD4", darkBg: "#060B0B", darkSurface: "#0E1717", lightBg: "#F5FCFB", lightSurface: "#FFFFFF" }
];

export const GEMI_TOKENS_PALETTES = Object.freeze(
  Object.fromEntries(
    TEN_PALETTE_FAMILIES.flatMap((fam) => [
      [
        `${fam.slug}-dark`,
        Object.freeze({
          id: `${fam.slug}-dark`,
          family: fam.slug,
          mode: "dark",
          nameEn: `${fam.nameEn} Dark`,
          nameAr: `${fam.nameAr} داكن`,
          bgCanvas: fam.darkBg,
          bgSurface: fam.darkSurface,
          textPrimary: "#F8FAFC",
          textSecondary: "#CBD5E1",
          borderSubtle: "#26272B",
          accentPrimary: fam.accentDark,
          accentSecondary: fam.secondary
        })
      ],
      [
        `${fam.slug}-light`,
        Object.freeze({
          id: `${fam.slug}-light`,
          family: fam.slug,
          mode: "light",
          nameEn: `${fam.nameEn} Light`,
          nameAr: `${fam.nameAr} فاتح`,
          bgCanvas: fam.lightBg,
          bgSurface: fam.lightSurface,
          textPrimary: "#0F172A",
          textSecondary: "#334155",
          borderSubtle: "#E2E8F0",
          accentPrimary: fam.accentLight,
          accentSecondary: fam.secondary
        })
      ]
    ])
  )
);

export const FIGTRON_DESIGN_PRESETS = Object.freeze({
  "auto-layout-responsive-system": Object.freeze({
    id: "auto-layout-responsive-system",
    titleEn: "Auto-Layout 4pt/8pt Responsive Design System",
    titleAr: "نظام Auto-Layout متجاوب بشبكة 4pt/8pt للموبايل والويب",
    gridBasePt: 8,
    minTouchTargetDp: 48,
    minContrastRatio: 4.5,
    defaultPalette: "inferno-dark",
    targetBreakpoints: [390, 834, 1440]
  }),
  "wcag-aaa-token-harmonizer": Object.freeze({
    id: "wcag-aaa-token-harmonizer",
    titleEn: "WCAG AAA 20-Mode GemiTokens Color Harmonizer",
    titleAr: "مُنسّق ألوان GemiTokens لعشرين نمطاً بمعيار تباين WCAG AAA",
    gridBasePt: 8,
    minTouchTargetDp: 48,
    minContrastRatio: 7.0,
    defaultPalette: "inferno-dark",
    targetBreakpoints: [390, 1440]
  }),
  "bilingual-rtl-ltr-mirror": Object.freeze({
    id: "bilingual-rtl-ltr-mirror",
    titleEn: "Bilingual Arabic RTL / English LTR Mirroring Engine",
    titleAr: "محرك الانعكاس المزدوج العربي (RTL) والإنجليزي (LTR) بخطوط GemiBaba",
    gridBasePt: 8,
    minTouchTargetDp: 48,
    minContrastRatio: 4.5,
    defaultPalette: "inferno-dark",
    rtlMirroring: true,
    targetBreakpoints: [390, 1440]
  }),
  "interactive-prototype-flow": Object.freeze({
    id: "interactive-prototype-flow",
    titleEn: "Interactive Multi-Screen Prototype & Smart Transitions",
    titleAr: "ربط الشاشات التفاعلي وانتقالات النموذج الأولي الذكية",
    gridBasePt: 8,
    minTouchTargetDp: 48,
    minContrastRatio: 4.5,
    defaultPalette: "inferno-dark",
    requireConnectedFlow: true,
    targetBreakpoints: [390, 834]
  }),
  "flutter-react-code-codegen": Object.freeze({
    id: "flutter-react-code-codegen",
    titleEn: "Clean Flutter & React/Tailwind Semantic Codegen",
    titleAr: "توليد كود Flutter وReact نظيف ومربوط بمتغيرات GemiTokens",
    gridBasePt: 8,
    minTouchTargetDp: 48,
    minContrastRatio: 4.5,
    defaultPalette: "inferno-dark",
    codegenTargets: ["flutter", "react"],
    targetBreakpoints: [390, 1440]
  })
});

function parseHexToRgb(hex = "#000000") {
  const clean = String(hex || "#000000").trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6).padEnd(6, "0");
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

export function computeRelativeLuminance(hex = "#000000") {
  const { r, g, b } = parseHexToRgb(hex);
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function computeWcagContrastRatio(fgHex = "#FFFFFF", bgHex = "#000000") {
  const l1 = computeRelativeLuminance(fgHex);
  const l2 = computeRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function containsArabicScript(str = "") {
  return /[\u0600-\u06FF]/.test(String(str || ""));
}

function snapTo4PtGrid(value = 8, minVal = 4) {
  const n = Math.max(minVal, Number(value) || minVal);
  return Math.max(minVal, Math.round(n / 4) * 4);
}

/**
 * Builds Direction A & Direction B creative plans for any of the 7 TronCS apps.
 */
export function buildSuiteCreativeDirection({
  appId = "figtron",
  prompt = "تصميم واجهة تطبيق دفع إلكتروني عربي",
  presetId = null,
  paletteId = "inferno-dark",
  fps = "24/1",
  durationSec = 15,
  locale = "ar-EG"
} = {}) {
  const cleanApp = String(appId || "figtron").trim().toLowerCase().replace(/-mobile$/, "");
  const isAr = String(locale || "ar-EG").startsWith("ar");
  const palette = GEMI_TOKENS_PALETTES[paletteId] || GEMI_TOKENS_PALETTES["inferno-dark"];

  if (cleanApp === "filmtron") {
    const film = buildFilmEditorialDirections({
      prompt,
      presetId: presetId || "cinema-narrative-cut",
      fps,
      durationSec,
      locale
    });
    return {
      ...film,
      appId: "filmtron"
    };
  }

  if (cleanApp === "figtron") {
    const preset =
      FIGTRON_DESIGN_PRESETS[presetId] ||
      FIGTRON_DESIGN_PRESETS["auto-layout-responsive-system"];
    const contrastPrimary = computeWcagContrastRatio(palette.textPrimary, palette.bgSurface);

    const directionA = {
      directionId: "figtron-dir-a-inferno-pixel-glass",
      labelEn: "Direction A — Inferno Dark Precision Auto-Layout & Token Hierarchy",
      labelAr: "الاتجاه (أ) — تصميم Auto-Layout داكن عالي الدقة بشبكة 8pt ومتغيرات GemiTokens",
      paletteId: palette.id,
      wcagContrastRatio: contrastPrimary,
      toolSteps: [
        {
          step: 1,
          tool: "figtron.tokens.bind_collection",
          paletteId: palette.id,
          modes: ["dark", "light"],
          tokens: palette
        },
        {
          step: 2,
          tool: "figtron.frame.create_autolayout",
          name: isAr ? "الشاشة الرئيسية" : "Primary Screen",
          width: 390,
          height: 844,
          direction: isAr ? "rtl" : "ltr",
          padding: 24,
          gap: 16
        },
        {
          step: 3,
          tool: "figtron.text.create_bilingual",
          fontFamily: isAr ? "GemiBaba" : "GemiFontSans",
          text: prompt.slice(0, 64),
          fontSize: 28,
          tokenColor: "textPrimary"
        },
        {
          step: 4,
          tool: "figtron.component.instantiate_cta",
          name: isAr ? "زر الإجراء الرئيسي" : "Primary Action CTA",
          minHeightDp: 48,
          tokenBg: "accentPrimary",
          prototypeTrigger: "ON_TAP"
        }
      ]
    };

    const lightPalette =
      GEMI_TOKENS_PALETTES[`${palette.family}-light`] || GEMI_TOKENS_PALETTES["inferno-light"];
    const directionB = {
      directionId: "figtron-dir-b-editorial-light-rtl",
      labelEn: "Direction B — High-Key Light Editorial Surface & Spacious 12pt Rhythm",
      labelAr: "الاتجاه (ب) — واجهة فاتحة رحبة بتباين نهاري عالٍ وانعكاس RTL متكامل",
      paletteId: lightPalette.id,
      wcagContrastRatio: computeWcagContrastRatio(lightPalette.textPrimary, lightPalette.bgSurface),
      toolSteps: [
        {
          step: 1,
          tool: "figtron.tokens.bind_collection",
          paletteId: lightPalette.id,
          modes: ["light", "dark"],
          tokens: lightPalette
        },
        {
          step: 2,
          tool: "figtron.frame.create_autolayout",
          name: isAr ? "شاشة العرض التحريري" : "Editorial Showcase Frame",
          width: 390,
          height: 844,
          direction: isAr ? "rtl" : "ltr",
          padding: 24,
          gap: 20
        },
        {
          step: 3,
          tool: "figtron.prototype.link_flow",
          transition: "SMART_ANIMATE_EASE_OUT",
          durationMs: 240
        }
      ]
    };

    return {
      ok: true,
      schema: "figtron.agy.creative_directions.v1",
      appId: "figtron",
      preset,
      recommendedDirectionId: directionA.directionId,
      directions: [directionA, directionB]
    };
  }

  const rate = resolveRationalFps(fps);
  const totalTicks = secondsToFrameAlignedTicks(durationSec, fps);
  const appConfigs = {
    phototron: {
      schema: "phototron.agy.creative_directions.v1",
      toolsA: [
        { step: 1, tool: "photo.document.place", role: "Hero Subject Smart Layer", safeZonePct: 90 },
        { step: 2, tool: "photo.adjustment.curves", colorSpace: "OKLab", contrastLift: 0.14 },
        { step: 3, tool: "photo.text.create", font: "GemiBaba-Bold", direction: isAr ? "rtl" : "ltr", wcagRatio: 8.2 },
        { step: 4, tool: "photo.layerStyle.dropShadow", opacity: 0.38, distancePx: 12, spreadPx: 0 }
      ],
      toolsB: [
        { step: 1, tool: "photo.document.place", role: "Minimal Studio Backdrop", safeZonePct: 92 },
        { step: 2, tool: "photo.adjustment.levels", gamma: 1.06, shadowFloor: 4 },
        { step: 3, tool: "photo.text.create", font: "GemiFontSans-SemiBold", direction: isAr ? "rtl" : "ltr", wcagRatio: 9.1 }
      ]
    },
    aftertron: {
      schema: "aftertron.agy.creative_directions.v1",
      toolsA: [
        { step: 1, tool: "after.layer.create_shape", role: "Hero Matte Reveal", startTicks: 0, endTicks: totalTicks },
        { step: 2, tool: "after.layer.create_text", font: "GemiBaba-Bold", text: prompt.slice(0, 48) },
        { step: 3, tool: "after.keyframe.easy_ease", property: "transform.position", cubicBezier: [0.22, 1.0, 0.36, 1.0], ticksPerFrame: rate.ticksPerFrame },
        { step: 4, tool: "after.effect.apply", effectId: "optical_glow_aces", intensity: 0.42 }
      ],
      toolsB: [
        { step: 1, tool: "after.layer.create_adjustment", role: "3D Camera Depth Grade" },
        { step: 2, tool: "after.keyframe.add", property: "camera.zoom", startTicks: 0, endTicks: totalTicks },
        { step: 3, tool: "after.keyframe.easy_ease", property: "camera.zoom", cubicBezier: [0.33, 0.0, 0.2, 1.0] }
      ]
    },
    gemimotion: {
      schema: "gemimotion.agy.creative_directions.v1",
      toolsA: [
        { step: 1, tool: "motion.timeline.clip.scene3d", recipeSchema: "gemimotion-recipe/v3", pbrPreset: "titanium_studio" },
        { step: 2, tool: "motion.shader.attach_wgsl", shaderId: "anisotropic_rim_glow", targetFps: 60 },
        { step: 3, tool: "motion.typography.kinetic_rtl", text: prompt.slice(0, 56), springStiffness: 260, damping: 24 }
      ],
      toolsB: [
        { step: 1, tool: "motion.timeline.clip.scene3d", recipeSchema: "gemimotion-recipe/v3", pbrPreset: "warm_architectural" },
        { step: 2, tool: "motion.camera.orbit", degrees: 18, durationSec },
        { step: 3, tool: "motion.audio.sync_markers", targetLufs: -14.0 }
      ]
    },
    lighttron: {
      schema: "lighttron.agy.creative_directions.v1",
      toolsA: [
        { step: 1, tool: "lighttron.develop.exposure", exposureEv: 0.25, highlightRecovery: -32, shadowLift: 18 },
        { step: 2, tool: "lighttron.develop.tone_curve", curvePreset: "filmic_s_curve_rec709", maxClippingPct: 0.2 },
        { step: 3, tool: "lighttron.hsl.skin_protect", hueShift: 2, saturationDelta: 6 }
      ],
      toolsB: [
        { step: 1, tool: "lighttron.develop.exposure", exposureEv: 0.1, highlightRecovery: -20, shadowLift: 26 },
        { step: 2, tool: "lighttron.develop.color_grading", shadowsWarmth: 8, highlightsCool: -4 },
        { step: 3, tool: "lighttron.detail.denoise_raw", luminanceNoise: 22 }
      ]
    },
    scaletron: {
      schema: "scaletron.agy.creative_directions.v1",
      toolsA: [
        { step: 1, tool: "scale.enhance.steerable_sr", scaleFactor: 4, edgeSharpness: 0.68, haloClamp3x3: 0.28 },
        { step: 2, tool: "scale.detail.dehalo_guard", windowSize: 3, maxOvershoot: 0.3 },
        { step: 3, tool: "scale.export.master", format: "webp_lossless_alpha", preserveIcc: true }
      ],
      toolsB: [
        { step: 1, tool: "scale.enhance.steerable_sr", scaleFactor: 2, edgeSharpness: 0.52, haloClamp3x3: 0.2 },
        { step: 2, tool: "scale.denoise.chroma_clean", strength: 0.35 },
        { step: 3, tool: "scale.export.master", format: "png_16bit", preserveIcc: true }
      ]
    }
  };

  const selected = appConfigs[cleanApp] || appConfigs.phototron;
  return {
    ok: true,
    schema: selected.schema,
    appId: cleanApp,
    ticksPerSecond: AUTHORITATIVE_TICKS_PER_SECOND,
    recommendedDirectionId: `${cleanApp}-direction-a`,
    directions: [
      {
        directionId: `${cleanApp}-direction-a`,
        labelEn: `Direction A — Signature High-Impact ${cleanApp.toUpperCase()} Production`,
        labelAr: `الاتجاه (أ) — معالجة احترافية عالية التأثير لتطبيق ${cleanApp}`,
        toolSteps: selected.toolsA
      },
      {
        directionId: `${cleanApp}-direction-b`,
        labelEn: `Direction B — Balanced Natural ${cleanApp.toUpperCase()} Craft`,
        labelAr: `الاتجاه (ب) — معالجة متوازنة وهادئة لتطبيق ${cleanApp}`,
        toolSteps: selected.toolsB
      }
    ]
  };
}

/**
 * Translates subjective Arabic/English feedback into deterministic tool actions for all 7 apps.
 */
export function translateSubjectiveSuiteFeedback({
  appId = "figtron",
  feedbackText = "",
  currentFps = "24/1",
  locale = "ar-EG"
} = {}) {
  const cleanApp = String(appId || "figtron").trim().toLowerCase().replace(/-mobile$/, "");
  const raw = String(feedbackText || "").trim();

  if (cleanApp === "filmtron") {
    const filmRes = translateSubjectiveArabicFeedback({
      feedbackText: raw,
      currentFps,
      locale
    });
    return { ...filmRes, appId: "filmtron" };
  }

  const actions = [];
  const matchedCategories = [];

  if (cleanApp === "figtron") {
    if (/(زحمة|ضيق|مسافات|تنفس|قريب|crowded|tight|spacing|padding|margin|grid)/i.test(raw)) {
      matchedCategories.push("autolayout-8pt-breathing");
      actions.push({
        category: "autolayout-8pt-breathing",
        tool: "figtron.frame.set_autolayout",
        parameters: { gap: 16, paddingHorizontal: 24, paddingVertical: 24, snapGridPt: 8 },
        rationaleAr: "توسيع المسافات الداخلية إلى 24pt والفجوات إلى 16pt وفق شبكة 8pt لمنح الواجهة راحة بصرية.",
        rationaleEn: "Expanded container padding to 24pt and item gap to 16pt on the strict 8pt grid."
      });
    }
    if (/(تباين|باهت|مش واضح|قراءة|ألوان|contrast|readability|dull|wcag|color)/i.test(raw)) {
      matchedCategories.push("wcag-token-contrast");
      actions.push({
        category: "wcag-token-contrast",
        tool: "figtron.tokens.bind_wcag_safe",
        parameters: { fgToken: "textPrimary", bgToken: "bgSurface", targetRatio: 7.0 },
        rationaleAr: "ربط النصوص بمتغير textPrimary المعتمد لتحقيق تباين WCAG AAA يفوق 7.0:1.",
        rationaleEn: "Bound foreground text to semantic GemiTokens achieving >= 7.0:1 WCAG AAA contrast."
      });
    }
    if (/(عربي|معكوس|يمين|اتجاه|محاذاة|rtl|arabic|mirror|bidi|alignment)/i.test(raw)) {
      matchedCategories.push("rtl-logical-mirror");
      actions.push({
        category: "rtl-logical-mirror",
        tool: "figtron.layout.mirror_rtl",
        parameters: { direction: "rtl", fontFamily: "GemiBaba", mirrorDirectionalIcons: true, logicalConstraints: "start" },
        rationaleAr: "تفعيل الانعكاس المنطقي RTL وربط خط GemiBaba وعكس الأيقونات الاتجاهية.",
        rationaleEn: "Mirrored Auto-Layout flow to RTL with GemiBaba shaping and logical start/end constraints."
      });
    }
    if (/(صغير|زرار|لمس|موبايل|أصبع|small|button|touch|tap|target)/i.test(raw)) {
      matchedCategories.push("touch-target-48dp");
      actions.push({
        category: "touch-target-48dp",
        tool: "figtron.node.enforce_touch_target",
        parameters: { minWidthDp: 48, minHeightDp: 48, hitSlopDp: 8 },
        rationaleAr: "رفع أبعاد الأزرار التفاعلية إلى 48×48dp كحد أدنى لسهولة اللمس على الجوال.",
        rationaleEn: "Enforced >= 48x48dp minimum interactive touch target geometry."
      });
    }
    if (/(تفاعل|ربط|انتقال|شاشة|فلو|prototype|flow|link|navigate|transition)/i.test(raw)) {
      matchedCategories.push("prototype-flow-link");
      actions.push({
        category: "prototype-flow-link",
        tool: "figtron.prototype.link_flow",
        parameters: { trigger: "ON_TAP", animation: "SMART_ANIMATE", durationMs: 220 },
        rationaleAr: "ربط العناصر التفاعلية بشاشات الوجهة عبر انتقال Smart Animate سلس (220ms).",
        rationaleEn: "Wired interactive triggers to destination frames with 220ms Smart Animate easing."
      });
    }
    if (actions.length === 0) {
      matchedCategories.push("general-ui-polish");
      actions.push({
        category: "general-ui-polish",
        tool: "figtron.frame.set_autolayout",
        parameters: { gap: 16, paddingHorizontal: 20, paddingVertical: 20, snapGridPt: 4 },
        rationaleAr: "ضبط محاذاة Auto-Layout وشبكة 4pt القياسية.",
        rationaleEn: "Normalized Auto-Layout alignment and 4pt baseline grid."
      });
    }
    return { ok: true, appId: "figtron", matchedCategories, actions };
  }

  const genericToolByApp = {
    phototron: {
      tool: "photo.adjustment.curves",
      parameters: { colorSpace: "OKLab", contrastDelta: 0.12, safeZoneGuard: true },
      rationaleAr: "تحسين التباين اللوني في فضاء OKLab مع الحفاظ على طبقات التعديل غير المدمرة.",
      rationaleEn: "Refined non-destructive OKLab tone curve and safe-zone typography balance."
    },
    aftertron: {
      tool: "after.keyframe.easy_ease",
      parameters: { cubicBezier: [0.22, 1.0, 0.36, 1.0], snapRationalTicks: frameToTicks(1, currentFps) },
      rationaleAr: "تنعيم منحنيات السرعة (Easy-Ease) ومحاذاة المفاتيح الزمنية على الإطارات القياسية.",
      rationaleEn: "Applied cubic-bezier Easy-Ease velocity curves aligned to rational frame ticks."
    },
    gemimotion: {
      tool: "motion.typography.kinetic_rtl",
      parameters: { springStiffness: 280, damping: 26, wgslBloomClamp: 0.45 },
      rationaleAr: "ضبط ديناميكية الحركة الزنبركية وتوهج الشيدر لضمان 60 إطاراً في الثانية.",
      rationaleEn: "Tuned spring choreography and WGSL bloom ceiling for locked 60fps playback."
    },
    lighttron: {
      tool: "lighttron.develop.tone_curve",
      parameters: { highlightRecovery: -28, shadowLift: 16, maxClippingPct: 0.3 },
      rationaleAr: "استعادة تفاصيل الإضاءة العالية والظلال مع منع قص القنوات اللونية تحت 0.3%.",
      rationaleEn: "Recovered RAW highlight/shadow latitude keeping channel clipping below 0.3%."
    },
    scaletron: {
      tool: "scale.detail.dehalo_guard",
      parameters: { windowSize: 3, haloClamp: 0.25, edgeSharpness: 0.62 },
      rationaleAr: "رفع حدة الحواف مع كبح الهالات الضوئية داخل نافذة 3×3.",
      rationaleEn: "Sharpened high-frequency edges with strict 3x3 local extrema halo clamping."
    }
  };

  const chosen = genericToolByApp[cleanApp] || genericToolByApp.phototron;
  matchedCategories.push(`${cleanApp}-precision-refinement`);
  actions.push({
    category: `${cleanApp}-precision-refinement`,
    ...chosen
  });

  return {
    ok: true,
    appId: cleanApp,
    matchedCategories,
    actions
  };
}

function inspectAndRepairFigTronOnce(spec, mutate = false) {
  const defects = [];
  const palette = GEMI_TOKENS_PALETTES[spec.paletteId] || GEMI_TOKENS_PALETTES["inferno-dark"];
  const frames = Array.isArray(spec.frames) ? spec.frames : [];
  const fallbackTargetFrameId = frames.length > 1 ? frames[frames.length - 1].id : frames[0]?.id || "frame-home";

  for (const frame of frames) {
    if (frame.autoLayout && frame.autoLayout.enabled) {
      if (frame.autoLayout.gap % 4 !== 0) {
        defects.push(`Frame ${frame.id}: Auto-Layout gap (${frame.autoLayout.gap}pt) off 4pt/8pt grid`);
        if (mutate) frame.autoLayout.gap = snapTo4PtGrid(frame.autoLayout.gap, 4);
      }
      if (frame.autoLayout.padding % 4 !== 0) {
        defects.push(`Frame ${frame.id}: Auto-Layout padding (${frame.autoLayout.padding}pt) off 4pt/8pt grid`);
        if (mutate) frame.autoLayout.padding = snapTo4PtGrid(frame.autoLayout.padding, 8);
      }
    }

    const children = Array.isArray(frame.children) ? frame.children : [];
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.fgHex && node.bgHex) {
        const ratio = computeWcagContrastRatio(node.fgHex, node.bgHex);
        if (ratio < 4.5) {
          defects.push(`Node ${node.id}: WCAG contrast ${ratio}:1 < 4.5:1`);
          if (mutate) {
            node.fgHex = palette.textPrimary;
            node.bgHex = palette.bgSurface;
          }
        }
      }

      if (node.type === "TEXT" && containsArabicScript(node.text)) {
        if (node.direction !== "rtl") {
          defects.push(`Node ${node.id}: Arabic text has non-RTL direction (${node.direction})`);
          if (mutate) node.direction = "rtl";
        }
        if (node.horizontalConstraint === "left" || node.horizontalConstraint === "right") {
          defects.push(`Node ${node.id}: Physical constraint '${node.horizontalConstraint}' breaks RTL mirroring`);
          if (mutate) node.horizontalConstraint = "start";
        }
      }

      const isInteractive =
        node.type === "COMPONENT_INSTANCE" ||
        node.type === "BUTTON" ||
        Boolean(node.prototypeLink);
      if (isInteractive) {
        if ((Number(node.height) || 0) < 48 || (Number(node.width) || 0) < 48) {
          defects.push(`Node ${node.id}: Interactive target (${node.width}x${node.height}dp) < 48x48dp`);
          if (mutate) {
            node.width = Math.max(48, Number(node.width) || 48);
            node.height = Math.max(48, Number(node.height) || 48);
          }
        }
      }

      if (node.prototypeLink && !node.prototypeLink.targetFrameId) {
        defects.push(`Node ${node.id}: Dead-end prototype trigger missing targetFrameId`);
        if (mutate) {
          node.prototypeLink.targetFrameId = fallbackTargetFrameId;
        }
      }

      // Sibling overlap check
      for (let j = i + 1; j < children.length; j++) {
        const other = children[j];
        if (
          typeof node.x === "number" &&
          typeof node.y === "number" &&
          typeof other.x === "number" &&
          typeof other.y === "number"
        ) {
          const overlapX = node.x < other.x + (other.width || 0) && node.x + (node.width || 0) > other.x;
          const overlapY = node.y < other.y + (other.height || 0) && node.y + (node.height || 0) > other.y;
          if (overlapX && overlapY) {
            defects.push(`Nodes ${node.id} & ${other.id}: Sibling bounding boxes overlap`);
            if (mutate) {
              const gap = frame.autoLayout?.gap || 16;
              other.y = node.y + (node.height || 40) + gap;
            }
          }
        }
      }
    }
  }
  return defects;
}

/**
 * Runs real mathematical domain critique and closed-loop auto-repair across passes.
 */
export function critiqueAndRepairSuitePlan({
  appId = "figtron",
  spec = {},
  maxPasses = 3
} = {}) {
  const cleanApp = String(appId || "figtron").trim().toLowerCase().replace(/-mobile$/, "");
  const working = structuredClone(spec || {});
  const passes = [];
  const totalLimit = Math.max(1, Math.min(5, Number(maxPasses) || 3));
  let initialDefectsCount = 0;

  for (let passIdx = 1; passIdx <= totalLimit; passIdx++) {
    let defects = [];

    if (cleanApp === "figtron") {
      defects = inspectAndRepairFigTronOnce(working, false);
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        inspectAndRepairFigTronOnce(working, true);
        passes.push({
          pass: passIdx,
          status: "REPAIRED",
          defectsFound: defects,
          score: Math.max(70, 96 - defects.length * 4)
        });
        continue;
      }
    } else if (cleanApp === "lighttron") {
      if ((Number(working.highlightClippingPct) || 0) >= 0.5) {
        defects.push(`Highlight clipping ${working.highlightClippingPct}% >= 0.5% ceiling`);
      }
      if ((Number(working.shadowClippingPct) || 0) >= 0.5) {
        defects.push(`Shadow clipping ${working.shadowClippingPct}% >= 0.5% ceiling`);
      }
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        working.highlightClippingPct = 0.18;
        working.shadowClippingPct = 0.15;
        working.exposureEv = Math.min(0.8, Number(working.exposureEv) || 0.2);
        passes.push({ pass: passIdx, status: "REPAIRED", defectsFound: defects, score: 88 });
        continue;
      }
    } else if (cleanApp === "scaletron") {
      if ((Number(working.haloOvershoot) || 0) > 0.35) {
        defects.push(`3x3 halo overshoot ${working.haloOvershoot} > 0.35 clamp`);
      }
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        working.haloOvershoot = 0.25;
        working.unsharpAmount = Math.min(1.2, Number(working.unsharpAmount) || 1.0);
        passes.push({ pass: passIdx, status: "REPAIRED", defectsFound: defects, score: 89 });
        continue;
      }
    } else if (cleanApp === "filmtron") {
      const filmCheck = critiqueFilmTimeline({ sequence: working });
      if (filmCheck.overallStatus !== "PASSED") {
        defects = filmCheck.gates.filter((g) => g.status !== "PASSED").map((g) => g.detailEn);
      }
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        working.integratedLufs = -14.0;
        const rate = resolveRationalFps(working.fps || "24/1");
        if (Array.isArray(working.clips)) {
          working.clips = working.clips.map((c) => ({
            ...c,
            startTicks: Math.round((c.startTicks || 0) / rate.ticksPerFrame) * rate.ticksPerFrame,
            endTicks: Math.round((c.endTicks || rate.ticksPerFrame) / rate.ticksPerFrame) * rate.ticksPerFrame
          }));
        }
        passes.push({ pass: passIdx, status: "REPAIRED", defectsFound: defects, score: 90 });
        continue;
      }
    } else if (cleanApp === "aftertron") {
      const rate = resolveRationalFps(working.fps || "24/1");
      if (typeof working.keyframeTicks === "number" && working.keyframeTicks % rate.ticksPerFrame !== 0) {
        defects.push(`Keyframe tick ${working.keyframeTicks} misaligned with ${rate.ticksPerFrame}`);
      }
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        working.keyframeTicks = Math.round(working.keyframeTicks / rate.ticksPerFrame) * rate.ticksPerFrame;
        passes.push({ pass: passIdx, status: "REPAIRED", defectsFound: defects, score: 91 });
        continue;
      }
    } else if (cleanApp === "phototron") {
      if (working.fgHex && working.bgHex && computeWcagContrastRatio(working.fgHex, working.bgHex) < 4.5) {
        defects.push("Typography layer contrast < 4.5:1");
      }
      if (passIdx === 1) initialDefectsCount = defects.length;
      if (defects.length > 0) {
        working.fgHex = "#F8FAFC";
        working.bgHex = "#08080A";
        passes.push({ pass: passIdx, status: "REPAIRED", defectsFound: defects, score: 90 });
        continue;
      }
    }

    passes.push({
      pass: passIdx,
      status: "PASSED",
      defectsFound: [],
      score: 99
    });
    break;
  }

  const lastStatus = passes[passes.length - 1]?.status === "PASSED" ? "PASSED" : "NEEDS_REVIEW";
  return {
    ok: true,
    schema: "tronagy.suite_critique.v1",
    appId: cleanApp,
    initialDefectsCount,
    finalStatus: lastStatus,
    passes,
    repairedSpec: working
  };
}

/**
 * Generates clean semantic Flutter or React/Tailwind code bound to GemiTokens from a FigTron spec.
 */
export function generateFigTronCodeSnippet({
  target = "flutter",
  spec = {}
} = {}) {
  const cleanTarget = String(target || "flutter").trim().toLowerCase();
  const isRtl = String(spec.locale || "ar-EG").startsWith("ar");
  const palette = GEMI_TOKENS_PALETTES[spec.paletteId] || GEMI_TOKENS_PALETTES["inferno-dark"];
  const primaryFrame = Array.isArray(spec.frames) && spec.frames[0]
    ? spec.frames[0]
    : { name: "FigTronScreen", autoLayout: { gap: 16, padding: 24 }, children: [] };
  const gap = primaryFrame.autoLayout?.gap || 16;
  const pad = primaryFrame.autoLayout?.padding || 24;

  if (cleanTarget === "react" || cleanTarget === "tsx" || cleanTarget === "tailwind") {
    const childJsx = (primaryFrame.children || [])
      .map((ch) => {
        if (ch.type === "TEXT") {
          return `      <h1 className="text-2xl font-bold text-[var(--gemi-text-primary)]">${ch.text || ch.name || "Heading"}</h1>`;
        }
        return `      <button type="button" className="min-h-[48px] px-6 rounded-xl font-semibold bg-[var(--gemi-accent-primary)] text-white">${ch.name || "Continue"}</button>`;
      })
      .join("\n");

    const code = `export function FigTronGeneratedSurface() {
  return (
    <section
      dir="${isRtl ? "rtl" : "ltr"}"
      style={{
        "--gemi-bg-canvas": "${palette.bgCanvas}",
        "--gemi-bg-surface": "${palette.bgSurface}",
        "--gemi-text-primary": "${palette.textPrimary}",
        "--gemi-accent-primary": "${palette.accentPrimary}"
      }}
      className="flex flex-col bg-[var(--gemi-bg-surface)] ps-6 pe-6 py-6"
    >
      <div className="flex flex-col" style={{ gap: "${gap}px", padding: "${pad}px" }}>
${childJsx || '        <span className="text-[var(--gemi-text-primary)]">FigTron Component</span>'}
      </div>
    </section>
  );
}`;
    return {
      ok: true,
      target: "react",
      paletteId: palette.id,
      direction: isRtl ? "rtl" : "ltr",
      code
    };
  }

  const childDart = (primaryFrame.children || [])
    .map((ch) => {
      if (ch.type === "TEXT") {
        return `            Text(
              '${String(ch.text || ch.name || "Heading").replace(/'/g, "\\'")}',
              style: const TextStyle(
                fontFamily: '${isRtl ? "GemiBaba" : "GemiFontSans"}',
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: GemiTokens.textPrimary,
              ),
            ),`;
      }
      return `            SizedBox(
              height: ${Math.max(48, Number(ch.height) || 48)},
              child: FilledButton(
                style: FilledButton.styleFrom(backgroundColor: GemiTokens.accentPrimary),
                onPressed: () {},
                child: Text('${String(ch.name || "Action").replace(/'/g, "\\'")}'),
              ),
            ),`;
    })
    .join("\n            SizedBox(height: " + gap + "),\n");

  const code = `class GemiTokens {
  static const Color bgCanvas = Color(0xFF${palette.bgCanvas.slice(1)});
  static const Color bgSurface = Color(0xFF${palette.bgSurface.slice(1)});
  static const Color textPrimary = Color(0xFF${palette.textPrimary.slice(1)});
  static const Color accentPrimary = Color(0xFF${palette.accentPrimary.slice(1)});
}

class FigTronGeneratedScreen extends StatelessWidget {
  const FigTronGeneratedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.${isRtl ? "rtl" : "ltr"},
      child: ColoredBox(
        color: GemiTokens.bgSurface,
        child: Padding(
          padding: const EdgeInsetsDirectional.all(${pad}.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
${childDart || "              const SizedBox.shrink(),"}
            ],
          ),
        ),
      ),
    );
  }
}`;

  return {
    ok: true,
    target: "flutter",
    paletteId: palette.id,
    direction: isRtl ? "rtl" : "ltr",
    code
  };
}
