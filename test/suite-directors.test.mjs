import test from "node:test";
import assert from "node:assert/strict";

test("FIGTRON_DESIGN_PRESETS, GEMI_TOKENS_PALETTES, and computeWcagContrastRatio provide exact mathematical design foundations", async () => {
  const {
    FIGTRON_DESIGN_PRESETS,
    GEMI_TOKENS_PALETTES,
    computeWcagContrastRatio
  } = await import("../src/suite-directors.mjs");

  assert.deepEqual(Object.keys(FIGTRON_DESIGN_PRESETS), [
    "auto-layout-responsive-system",
    "wcag-aaa-token-harmonizer",
    "bilingual-rtl-ltr-mirror",
    "interactive-prototype-flow",
    "flutter-react-code-codegen"
  ]);
  assert.equal(Object.keys(GEMI_TOKENS_PALETTES).length, 20);
  assert.equal(GEMI_TOKENS_PALETTES["inferno-dark"].bgCanvas, "#08080A");
  assert.equal(GEMI_TOKENS_PALETTES["inferno-dark"].accentPrimary, "#F83942");

  const bwRatio = computeWcagContrastRatio("#FFFFFF", "#000000");
  assert.ok(bwRatio > 20.9 && bwRatio <= 21.01);

  const poorRatio = computeWcagContrastRatio("#777777", "#888888");
  assert.ok(poorRatio < 1.5);
});

test("buildSuiteCreativeDirection and translateSubjectiveSuiteFeedback cover all 7 TronCS apps with bilingual AR/EN tool choreography", async () => {
  const {
    buildSuiteCreativeDirection,
    translateSubjectiveSuiteFeedback
  } = await import("../src/suite-directors.mjs");

  for (const appId of [
    "figtron",
    "phototron",
    "aftertron",
    "filmtron",
    "gemimotion",
    "lighttron",
    "scaletron"
  ]) {
    const dir = buildSuiteCreativeDirection({
      appId,
      prompt: "تصميم حملة دفع إلكتروني عربية فاخرة",
      presetId: appId === "figtron" ? "bilingual-rtl-ltr-mirror" : undefined,
      locale: "ar-EG"
    });
    assert.equal(dir.ok, true);
    assert.equal(dir.appId, appId);
    assert.equal(dir.directions.length, 2);
    assert.ok(dir.directions[0].toolSteps.length >= 3);
  }

  const figFeedback = translateSubjectiveSuiteFeedback({
    appId: "figtron",
    feedbackText: "العناصر زحمة والمسافات ضيقة، التباين ضعيف، العربي معكوس والزرار صغير للموبايل",
    locale: "ar-EG"
  });
  assert.equal(figFeedback.ok, true);
  assert.ok(figFeedback.actions.length >= 4);
  assert.ok(figFeedback.actions.some((a) => a.tool === "figtron.frame.set_autolayout"));
  assert.ok(figFeedback.actions.some((a) => a.tool === "figtron.tokens.bind_wcag_safe"));
  assert.ok(figFeedback.actions.some((a) => a.tool === "figtron.layout.mirror_rtl"));
  assert.ok(figFeedback.actions.some((a) => a.tool === "figtron.node.enforce_touch_target"));
});

test("critiqueAndRepairSuitePlan detects mathematical defects and auto-repairs FigTron, LightTron, AfterTron, and ScaleTron specs", async () => {
  const {
    critiqueAndRepairSuitePlan,
    generateFigTronCodeSnippet
  } = await import("../src/suite-directors.mjs");

  const brokenFigSpec = {
    paletteId: "inferno-dark",
    locale: "ar-EG",
    frames: [
      {
        id: "frame-checkout",
        name: "شاشة الدفع",
        width: 390,
        height: 844,
        autoLayout: { enabled: true, gap: 13, padding: 7 },
        children: [
          {
            id: "txt-heading",
            type: "TEXT",
            text: "إتمام الدفع الآمن",
            direction: "ltr",
            horizontalConstraint: "left",
            fgHex: "#777777",
            bgHex: "#888888",
            x: 16,
            y: 20,
            width: 240,
            height: 36
          },
          {
            id: "btn-pay",
            type: "COMPONENT_INSTANCE",
            name: "زر الدفع",
            x: 16,
            y: 30,
            width: 120,
            height: 34,
            fgHex: "#FFFFFF",
            bgHex: "#F83942",
            prototypeLink: { trigger: "ON_TAP", targetFrameId: null }
          }
        ]
      },
      {
        id: "frame-success",
        name: "تم الدفع بنجاح",
        width: 390,
        height: 844,
        autoLayout: { enabled: true, gap: 16, padding: 24 },
        children: []
      }
    ]
  };

  const figCritique = critiqueAndRepairSuitePlan({
    appId: "figtron",
    spec: brokenFigSpec,
    maxPasses: 3
  });
  assert.equal(figCritique.ok, true);
  assert.equal(figCritique.initialDefectsCount >= 4, true);
  assert.equal(figCritique.finalStatus, "PASSED");
  assert.equal(figCritique.passes[0].status, "REPAIRED");
  assert.equal(figCritique.passes[figCritique.passes.length - 1].status, "PASSED");

  const repairedFrame = figCritique.repairedSpec.frames[0];
  assert.equal(repairedFrame.autoLayout.gap % 4, 0);
  assert.equal(repairedFrame.autoLayout.padding % 4, 0);
  assert.equal(repairedFrame.children[0].direction, "rtl");
  assert.equal(repairedFrame.children[0].horizontalConstraint, "start");
  assert.equal(repairedFrame.children[1].height >= 48, true);
  assert.equal(repairedFrame.children[1].prototypeLink.targetFrameId, "frame-success");

  // Codegen verification (Flutter + React)
  const flutterCode = generateFigTronCodeSnippet({
    target: "flutter",
    spec: figCritique.repairedSpec
  });
  assert.equal(flutterCode.ok, true);
  assert.match(flutterCode.code, /Directionality/);
  assert.match(flutterCode.code, /TextDirection\.rtl/);
  assert.match(flutterCode.code, /GemiTokens/);

  const reactCode = generateFigTronCodeSnippet({
    target: "react",
    spec: figCritique.repairedSpec
  });
  assert.equal(reactCode.ok, true);
  assert.match(reactCode.code, /dir="rtl"/);
  assert.match(reactCode.code, /--gemi-/);

  // LightTron RAW clipping & ScaleTron halo clamp checks
  const lightCritique = critiqueAndRepairSuitePlan({
    appId: "lighttron",
    spec: { highlightClippingPct: 2.8, shadowClippingPct: 1.4, exposureEv: 1.9 },
    maxPasses: 2
  });
  assert.equal(lightCritique.finalStatus, "PASSED");
  assert.ok(lightCritique.repairedSpec.highlightClippingPct < 0.5);
  assert.ok(lightCritique.repairedSpec.shadowClippingPct < 0.5);

  const scaleCritique = critiqueAndRepairSuitePlan({
    appId: "scaletron",
    spec: { scaleFactor: 4, haloOvershoot: 0.78, unsharpAmount: 2.4 },
    maxPasses: 2
  });
  assert.equal(scaleCritique.finalStatus, "PASSED");
  assert.ok(scaleCritique.repairedSpec.haloOvershoot <= 0.35);
});

test("Full 7-desktop + 7-mobile companion matrix, 7 Egyptian Arabic professional feedback refinements per domain (zero street slang), and closed-loop critics across all 14 products", async () => {
  const {
    TRONCS_SEVEN_DESKTOP_APPS,
    TRONCS_SEVEN_MOBILE_COMPANIONS,
    TRONCS_ALL_FOURTEEN_PRODUCTS,
    SUITE_COMPANION_MATRIX,
    buildSuiteCreativeDirection,
    translateSubjectiveSuiteFeedback,
    getSuiteArabicFeedbackCatalog,
    critiqueAndRepairSuitePlan
  } = await import("../src/suite-directors.mjs");

  assert.equal(TRONCS_SEVEN_DESKTOP_APPS.length, 7);
  assert.equal(TRONCS_SEVEN_MOBILE_COMPANIONS.length, 7);
  assert.equal(TRONCS_ALL_FOURTEEN_PRODUCTS.length, 14);
  assert.equal(Object.keys(SUITE_COMPANION_MATRIX).length, 14);

  const forbiddenSlangRegex = /(جامد|فشخ|روش|طرش|فشيخ|خرابيط|اي كلام|هبد)/i;

  for (const productId of TRONCS_ALL_FOURTEEN_PRODUCTS) {
    const matrixEntry = SUITE_COMPANION_MATRIX[productId];
    assert.ok(matrixEntry, `Missing companion matrix entry for ${productId}`);
    assert.ok(matrixEntry.skills.length >= 2, `Expected >=2 skills for ${productId}`);
    assert.ok(matrixEntry.workflows.length >= 1, `Expected >=1 workflow for ${productId}`);

    const direction = buildSuiteCreativeDirection({
      appId: productId,
      prompt: "حملة إطلاق هوية عربية رقمية متكاملة",
      locale: "ar-EG"
    });
    assert.equal(direction.ok, true);
    assert.equal(direction.requestedAppId, productId);
    assert.equal(direction.isMobileCompanion, productId.endsWith("-mobile"));
    assert.equal(direction.directions.length, 2);

    const fbCatalog = getSuiteArabicFeedbackCatalog(productId);
    assert.equal(fbCatalog.ok, true);
    assert.equal(fbCatalog.zeroStreetSlangPolicy, true);
    assert.equal(
      fbCatalog.refinementsCount,
      7,
      `Expected 7 Arabic feedback refinements for ${productId}, got ${fbCatalog.refinementsCount}`
    );
    for (const ref of fbCatalog.refinements) {
      assert.equal(
        forbiddenSlangRegex.test(ref.rationaleAr),
        false,
        `Street slang forbidden in rationaleAr for ${productId}: ${ref.rationaleAr}`
      );
      const translated = translateSubjectiveSuiteFeedback({
        appId: productId,
        feedbackText: ref.sampleFeedbackAr || "يرجى تحسين التوازن البصري",
        locale: "ar-EG"
      });
      assert.equal(translated.ok, true);
      assert.ok(translated.actions.length >= 1);
    }
  }

  // Verify GemiMotion mathematical closed-loop critic (flicks + SafeRect + density + 48kHz)
  const motionCritique = critiqueAndRepairSuitePlan({
    appId: "gemimotion",
    spec: {
      safeRectMarginPct: 3,
      activeSceneElementsCount: 9,
      sampleRateHz: 44100,
      sfxCuesCount: 2,
      clips: [{ startFlicks: 12345 }]
    },
    maxPasses: 3
  });
  assert.equal(motionCritique.finalStatus, "PASSED");
  assert.equal(motionCritique.repairedSpec.safeRectMarginPct >= 8, true);
  assert.equal(motionCritique.repairedSpec.activeSceneElementsCount <= 5, true);
  assert.equal(motionCritique.repairedSpec.sampleRateHz, 48000);
  assert.equal(motionCritique.repairedSpec.sfxCuesCount, 6);
  assert.equal(motionCritique.repairedSpec.clips[0].startFlicks % 29_400_000, 0);

  // Verify Mobile Companion 48dp touch-target + SafeRect auto-repair across all 7 mobile apps
  for (const mobileId of TRONCS_SEVEN_MOBILE_COMPANIONS) {
    const mobCritique = critiqueAndRepairSuitePlan({
      appId: mobileId,
      spec: { minTouchTargetDp: 32, mobileSafeRectMarginPct: 2 },
      maxPasses: 3
    });
    assert.equal(mobCritique.finalStatus, "PASSED", `Mobile critique failed to repair ${mobileId}`);
    assert.equal(mobCritique.isMobileCompanion, true);
    assert.equal(mobCritique.repairedSpec.minTouchTargetDp >= 48, true);
    assert.equal(mobCritique.repairedSpec.mobileSafeRectMarginPct >= 8, true);
  }
});
