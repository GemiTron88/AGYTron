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
