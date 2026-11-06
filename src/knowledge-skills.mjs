/**
 * @gemitron/agy-tron — Deep 5-Layer Knowledgebase, Diagnostic Playbooks, Skills & Workflows Registry (`src/knowledge-skills.mjs`)
 *
 * Covers all 9 core applications controlled by AGYTron with:
 *   1. Architecture & Adapter Specifications (`architectureAndCapabilities`)
 *   2. Exhaustive Domain Rules (`domainRules`)
 *   3. Non-Negotiable Production Invariants (`invariants`)
 *   4. Structured If-Then Diagnostic Playbooks (`diagnosticPlaybooks`)
 *   5. Authoritative GemiMCP Tool Bindings (`mcpToolBindings`)
 *   6. 52 Specialized Skills & 31 Multi-Step Workflows across:
 *      - PhotoTron  (phototron)  — 4 Skills · 3 Workflows
 *      - AfterTron  (aftertron)  — 4 Skills · 2 Workflows
 *      - FilmTron   (filmtron)   — 4 Skills · 3 Workflows
 *      - GemiMotion (gemimotion) — 4 Skills · 3 Workflows
 *      - FigTron    (figtron)    — 4 Skills · 2 Workflows
 *      - LightTron  (lighttron)  — 4 Skills · 2 Workflows
 *      - ScaleTron  (scaletron)  — 4 Skills · 2 Workflows
 *      - Rankly     (rankly)     — 12 Skills · 7 Workflows (8-Pillar Webmaster/Analytics + Scrapling + 12 APIs + 27 Recipes + Tier 1-2-3)
 *      - Tarweeg    (tarweeg)    — 12 Skills · 7 Workflows (9 Ad Platforms + LaunchSaga + 5 CAPI Connectors + TronCS Studio)
 */

export const KNOWLEDGE_SKILLS_SCHEMA = "tronagy.knowledge_skills_workflows.v2";

export const NINE_CORE_APPS = Object.freeze([
  "phototron",
  "aftertron",
  "filmtron",
  "gemimotion",
  "figtron",
  "lighttron",
  "scaletron",
  "rankly",
  "tarweeg"
]);

export const APP_KNOWLEDGE_SKILLS_REGISTRY = Object.freeze({
  phototron: Object.freeze({
    appId: "phototron",
    name: "PhotoTron",
    arName: "فوتو ترون",
    category: "creative-suite",
    nativeExtension: ".pcraft",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Native .pcraft non-destructive raster & smart-object compositor with HarfBuzz RTL/LTR Arabic typography engine.",
        "Supports Curves, Levels, Hue/Saturation, Color Balance, Smart Layer Masks, Drop Shadow, Gradient Overlay, and 4-ratio batch ad/SEO canvas export (1:1, 4:5, 9:16, 1.91:1)."
      ],
      domainRules: [
        "Preserve non-destructive smart layer stacks, vector masks, and adjustment layers in .pcraft documents.",
        "Shape Arabic display headlines via HarfBuzz RTL with Cairo/Tajawal/Readex Pro and enforce WCAG >= 4.5:1 contrast.",
        "Export ad & SEO visuals across all 4 canonical aspect ratios: 1:1 (1080x1080), 4:5 (1080x1350), 9:16 (1080x1920), and 1.91:1 (1200x628).",
        "Embed brand watermark, structured citation footer, and WebP/AVIF compression metadata for Rankly Tier 1 infographics."
      ],
      invariants: [
        "Never flatten editable text layers before final raster export.",
        "Never substitute real hero product photography with primitive shapes.",
        "Maintain >= 4.5:1 foreground-to-background luminance contrast under Arabic/English headline zones."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Low ad CTR (< 1.2%) on Meta/TikTok or low GSC image clicks",
          diagnosis: "Weak visual focal hierarchy or low headline contrast on mobile feeds",
          automatedAction: "Increase subject separation via Curves S-curve + add dark gradient scrim behind Arabic/English headline + render 4:5 vertical crop",
          targetTools: ["photo.adjustment.curves", "photo.layerStyle.gradientOverlay", "photo.text.create"]
        },
        {
          trigger: "Rankly article lacks visual E-E-A-T link-bait",
          diagnosis: "Text-only Web 2.0/guest articles earn 60% fewer organic editorial backlinks",
          automatedAction: "Synthesize a 5-point comparison infographic poster with domain citation badge for Telegraph/Dev.to/WordPress embed",
          targetTools: ["photo.document.place", "photo.text.create", "photo.layerStyle.dropShadow"]
        }
      ],
      mcpToolBindings: [
        "photo.document.place",
        "photo.text.create",
        "photo.adjustment.levels",
        "photo.adjustment.curves",
        "photo.adjustment.hueSaturation",
        "photo.mask.revealAll",
        "photo.layerStyle.dropShadow",
        "photo.layerStyle.gradientOverlay"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.phototron.arabic_key_art",
        labelEn: "Arabic RTL Key Art & 4-Ratio Ad Poster Compositor",
        labelAr: "تصميم البوسترات الإعلانية والخطوط العربية (٤ مقاسات)",
        model: "gemini-4-argon-high",
        tools: ["photo.document.place", "photo.text.create", "photo.layerStyle.dropShadow"]
      },
      {
        id: "skill.phototron.product_retouch",
        labelEn: "Non-Destructive Hero Product Retouching & Masking",
        labelAr: "معالجة وعزل صور المنتجات الاحترافية غير المدمرة",
        model: "claude-sonnet-5-5-high",
        tools: ["photo.adjustment.curves", "photo.adjustment.levels", "photo.mask.revealAll"]
      },
      {
        id: "skill.phototron.infographic_linkbait",
        labelEn: "High-DR SEO Infographic & OpenGraph Link-Bait Designer",
        labelAr: "تصميم إنفوجرافيك السيو وبطاقات المشاركة لبناء الباك لينك",
        model: "gemini-4-argon-high",
        tools: ["photo.document.place", "photo.text.create", "photo.adjustment.curves"]
      },
      {
        id: "skill.phototron.gbp_local_offer_card",
        labelEn: "Google Business Profile (GBP) Local Offer & Event Visual Designer",
        labelAr: "تصميم بطاقات عروض خرائط جوجل (Google Business Profile)",
        model: "gemini-3.8-flash-high",
        tools: ["photo.document.place", "photo.text.create", "photo.layerStyle.gradientOverlay"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.phototron.4ratio_ad_pack",
        labelEn: "4-Ratio Ad Key Art Pack (for Tarweeg 9-Platform Saga)",
        labelAr: "حزمة إعلانات ٤ مقاسات (لمنصة ترويج عبر ٩ شبكات)",
        steps: [
          "Place upscaled hero asset from ScaleTron/LightTron onto non-destructive smart layer",
          "Apply Curves & Levels tonal separation and subtle drop shadow",
          "Typeset bilingual Arabic/English headline & CTA badge with WCAG >= 4.5:1 contrast",
          "Render 1:1, 4:5, 9:16, and 1.91:1 master exports for Tarweeg LaunchSaga"
        ]
      },
      {
        id: "wf.phototron.seo_infographic_card",
        labelEn: "Linkable E-E-A-T Infographic (for Rankly Tier 1 & Digital PR)",
        labelAr: "إنفوجرافيك مرجعي لبناء الباك لينك (لرانكلي)",
        steps: [
          "Structure 5-point visual data summary from Rankly SERP/PAA & GSC research",
          "Compose branded diagram & citation footer with domain watermark",
          "Export WebP/PNG for Telegraph, Dev.to, Medium, and WordPress Tier 1 embeds"
        ]
      },
      {
        id: "wf.phototron.gbp_and_social_bundle",
        labelEn: "Local SEO GBP Post + Social OpenGraph Visual Bundle",
        labelAr: "حزمة صور خرائط جوجل وبطاقات المشاركة الاجتماعية",
        steps: [
          "Create 1200x900 Google Business Profile offer card with local CTA badge",
          "Generate matching 1200x630 OpenGraph preview card for Rankly meta tags"
        ]
      }
    ])
  }),

  aftertron: Object.freeze({
    appId: "aftertron",
    name: "AfterTron",
    arName: "أفتر ترون",
    category: "creative-suite",
    nativeExtension: ".acraft",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Layer/Node VFX & Motion Graphics compositor operating on 254,016,000,000 ticks/sec rational frame clock.",
        "Supports 3D camera tracking, cubic-bezier easy-ease velocity curves, track mattes, optical glow, and expression choreography."
      ],
      domainRules: [
        "Align all keyframes to the 254,016,000,000 ticks/sec rational frame clock.",
        "Apply continuous cubic-bezier easy-ease velocity curves on all primary spatial/opacity transforms.",
        "Maintain clean track matte and optical glow adjustment layer hierarchy in .acraft compositions.",
        "Design 0-3s pattern-interrupt visual hooks to maximize TikTok/Reels/Shorts thumb-stop rate."
      ],
      invariants: [
        "Zero linear/jerky motion on hero product or typography entrances.",
        "Respect Title/Action Safe margins across 9:16 vertical and 16:9 widescreen comps."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Tarweeg video ad 3-second thumb-stop rate < 25%",
          diagnosis: "Opening 1.5 seconds lacks kinetic motion contrast or pattern-interrupt typography",
          automatedAction: "Inject 60fps 3D camera whip-pan + optical glow kinetic Arabic hook title in first 45 frames",
          targetTools: ["after.layer.create_text", "after.keyframe.add", "after.keyframe.easy_ease", "after.effect.apply"]
        }
      ],
      mcpToolBindings: [
        "after.comp.create",
        "after.layer.create_text",
        "after.layer.create_solid",
        "after.layer.create_shape",
        "after.layer.create_null",
        "after.layer.create_adjustment",
        "after.keyframe.add",
        "after.keyframe.easy_ease",
        "after.effect.apply"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.aftertron.kinetic_arabic_typography",
        labelEn: "Kinetic Arabic & English Motion Typography",
        labelAr: "تحريك النصوص الإعلانية السينمائية (Kinetic Typography)",
        model: "gemini-4-argon-high",
        tools: ["after.layer.create_text", "after.keyframe.add", "after.keyframe.easy_ease"]
      },
      {
        id: "skill.aftertron.vfx_optical_glow",
        labelEn: "3D Camera Callouts & Optical Glow VFX",
        labelAr: "تتبع الكاميرا 3D والمؤثرات البصرية المتوهجة",
        model: "claude-opus-5-5-medium",
        tools: ["after.layer.create_shape", "after.layer.create_adjustment", "after.effect.apply"]
      },
      {
        id: "skill.aftertron.animated_data_charts",
        labelEn: "Animated ROI & SEO Growth Data Infographics",
        labelAr: "تحريك الرسوم البيانية وإحصائيات النمو والسيو",
        model: "gemini-4-argon-medium",
        tools: ["after.layer.create_shape", "after.keyframe.add", "after.keyframe.easy_ease"]
      },
      {
        id: "skill.aftertron.logo_sonic_stinger",
        labelEn: "Brand Logo Reveal & End-Card CTA Stinger",
        labelAr: "تحريك الشعار وبطاقة الدعوة لاتخاذ إجراء (End-Card)",
        model: "gemini-3.8-flash-high",
        tools: ["after.comp.create", "after.layer.create_text", "after.effect.apply"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.aftertron.hero_product_reveal",
        labelEn: "3-Second Hook & Product VFX Reveal (for Tarweeg Reels/TikTok)",
        labelAr: "مقدمة خطاف بصري ٣ ثوانٍ لإعلانات تيك توك وريلز",
        steps: [
          "Build 60fps composition and animate 3D camera push-in with easy-ease velocity",
          "Add kinetic Arabic hook headline and optical glow accent layer",
          "Hand off rendered .acraft stem to FilmTron for final NLE cut & audio mix"
        ]
      },
      {
        id: "wf.aftertron.animated_case_study_reel",
        labelEn: "Animated Case Study & Data Proof Reel (for Rankly & LinkedIn Ads)",
        labelAr: "فيديو دراسة حالة متحرك بالبيانات (لرانكلي وإعلانات لينكدإن)",
        steps: [
          "Animate key GSC/GA4/ROAS growth metrics using bezier bar/line counters",
          "Overlay verified badge callouts and export alpha stem to FilmTron"
        ]
      }
    ])
  }),

  filmtron: Object.freeze({
    appId: "filmtron",
    name: "FilmTron",
    arName: "فيلم ترون",
    category: "creative-suite",
    nativeExtension: ".fcraft",
    recommendedModel: "claude-opus-5-5-medium",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Multi-track non-linear video editor (.fcraft) with ripple/roll trimming, J/L cuts, Lumetri Rec.709 color grading, dynamic captions, and Fairlight -14.0 LUFS broadcast audio mastering."
      ],
      domainRules: [
        "Structure commercial and explainer edits using 3-Act pacing (0-3s Hook, 3-12s Value/Proof, 12-15s CTA).",
        "Enforce Rec.709 luminance bounds and skin-tone vectorscope protection in Lumetri color grading.",
        "Normalize master audio to -14.0 LUFS broadcast standard with -6dB Fairlight voiceover ducking.",
        "Export platform-compliant bitrates and aspect ratios for YouTube, TikTok Spark, Meta Reels, and Snapchat Stories."
      ],
      invariants: [
        "Zero frame-boundary rounding errors.",
        "Burned-in or sidecar captions must stay inside the vertical 9:16 safe zone."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "High video drop-off between 4s and 10s in Tarweeg analytics",
          diagnosis: "Static mid-roll pacing without J/L audio cuts or b-roll visual resets",
          automatedAction: "Insert J-cut audio transition + 2.2s b-roll proof cutaways + high-contrast dynamic Arabic captions",
          targetTools: ["film.timeline.ripple_trim", "film.transitions.apply", "film.captions.add"]
        }
      ],
      mcpToolBindings: [
        "film.sequence.create",
        "film.timeline.place_clip",
        "film.timeline.ripple_trim",
        "film.transitions.apply",
        "film.color.set_lumetri",
        "film.audio.set_gain",
        "film.captions.add",
        "film.export.queue_render"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.filmtron.3act_commercial_cut",
        labelEn: "3-Act Direct-Response Ad Editor (J/L Cuts)",
        labelAr: "مونتاج الإعلانات البيعية ثلاثية الفصول",
        model: "claude-opus-5-5-medium",
        tools: ["film.timeline.place_clip", "film.timeline.ripple_trim", "film.transitions.apply"]
      },
      {
        id: "skill.filmtron.lumetri_fairlight_master",
        labelEn: "Lumetri Cinema Grade & Fairlight -14 LUFS Mix",
        labelAr: "تلوين سينمائي Lumetri ومكساج صوتي قياسي",
        model: "gemini-4-argon-medium",
        tools: ["film.color.set_lumetri", "film.audio.set_gain", "film.captions.add"]
      },
      {
        id: "skill.filmtron.youtube_seo_chapter_editor",
        labelEn: "YouTube SEO Video & Rich-Snippet Chapter Producer",
        labelAr: "مونتاج فيديوهات يوتيوب المتوافقة مع السيو والفصول الزمنية",
        model: "claude-sonnet-5-5-high",
        tools: ["film.sequence.create", "film.captions.add", "film.export.queue_render"]
      },
      {
        id: "skill.filmtron.multi_ratio_reframe",
        labelEn: "Automated 16:9, 9:16 & 1:1 Multi-Platform Video Reframer",
        labelAr: "إعادة تأطير الفيديو تلقائياً لمقاسات 9:16 و16:9 و1:1",
        model: "gemini-3.8-flash-high",
        tools: ["film.sequence.create", "film.timeline.place_clip", "film.export.queue_render"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.filmtron.tiktok_reels_shorts_master",
        labelEn: "Multi-Platform Vertical Video Ad Master (for Tarweeg)",
        labelAr: "إنتاج فيديو إعلاني جاهز لـ TikTok وReels وShorts وSnap",
        steps: [
          "Assemble GemiMotion 3D scenes and AfterTron VFX hooks on ripple-trimmed timeline",
          "Apply Lumetri brand LUT and sync Arabic/English dynamic captions",
          "Master Fairlight audio to -14.0 LUFS and export MP4 for Tarweeg ProviderVideoBridge"
        ]
      },
      {
        id: "wf.filmtron.explainer_video_backlink",
        labelEn: "60s Authority Explainer Video (for Rankly Video Backlinks & GSC Video Tab)",
        labelAr: "فيديو شرح مرجعي ٦٠ ثانية لبناء باك لينك الفيديو وتصدر بحث الفيديو",
        steps: [
          "Cut educational 3-point summary from Rankly article script",
          "Add bilingual captions, VideoObject JSON-LD timestamps, and CTA watermark pointing to Money Site URL"
        ]
      },
      {
        id: "wf.filmtron.b2b_linkedin_spotlight",
        labelEn: "B2B Executive Video Ad (for Tarweeg LinkedIn & X Ads)",
        labelAr: "فيديو إعلاني احترافي للشركات (لإعلانات لينكدإن وإكس)",
        steps: [
          "Cut 30s 4:5 square/vertical executive pitch with data proof overlays",
          "Burn in clean bilingual subtitles for silent autoplay feeds"
        ]
      }
    ])
  }),

  gemimotion: Object.freeze({
    appId: "gemimotion",
    name: "GemiMotion",
    arName: "جيمي موشن",
    category: "creative-suite",
    nativeExtension: ".gmotion",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Procedural 3D PBR + WGSL Shader motion engine operating on exact Qt6 flicks (705,600,000 flicks/second) using gemimotion-recipe/v3.",
        "Includes 48kHz stereo Vibe Soundtrack synthesizer (luxury-arabic-modal, cinematic-brass, tech-synth) and 6 frame-accurate procedural SFX cues."
      ],
      domainRules: [
        "Operate on exact integer Qt6 flicks (705,600,000 flicks/second) using gemimotion-recipe/v3.",
        "Combine WGSL ShaderWorld backgrounds, 3D PBR Scene3D models, and Karaoke captions.",
        "Synthesize 48kHz stereo Vibe Soundtrack aligned to beat-grid with 6 frame-accurate SFX cues.",
        "Verify SafeRect title/action margins and overcrowding density before rendering."
      ],
      invariants: [
        "Zero SafeRect title/action margin violations.",
        "Validate expectedStateVersion before executing native timeline mutations."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Brand launch needs 3D product hero commercial without physical studio shoot",
          diagnosis: "Requires procedural 3D PBR lighting, camera orbit, and Arabic modal soundtrack",
          automatedAction: "Compile gemimotion-recipe/v3 with Scene3D PBR model + WGSL volumetric shader + 48kHz luxury-arabic-modal score",
          targetTools: ["motion.timeline.clip.scene3d", "motion.timeline.clip.vfx", "motion.timeline.clip.daw"]
        }
      ],
      mcpToolBindings: [
        "motion.timeline.clip.scene3d",
        "motion.timeline.clip.vfx",
        "motion.timeline.clip.transform",
        "motion.timeline.clip.daw",
        "motion.timeline.clip.keyframe.add",
        "motion.caption.upsert"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.gemimotion.pbr_3d_shader_director",
        labelEn: "3D PBR Scene & WGSL Shader Choreographer",
        labelAr: "إخراج مشاهد 3D PBR وشيدر WGSL",
        model: "gemini-4-argon-high",
        tools: ["motion.timeline.clip.scene3d", "motion.timeline.clip.vfx", "motion.timeline.clip.transform"]
      },
      {
        id: "skill.gemimotion.vibe_audio_sfx",
        labelEn: "48kHz Vibe Soundtrack & Frame-Accurate SFX Composer",
        labelAr: "تأليف الموسيقى التصويرية والمؤثرات الصوتية المتزامنة",
        model: "gemini-4-argon-medium",
        tools: ["motion.timeline.clip.daw", "motion.timeline.clip.keyframe.add", "motion.caption.upsert"]
      },
      {
        id: "skill.gemimotion.karaoke_rtl_captions",
        labelEn: "Beat-Synced Arabic RTL Karaoke Caption Choreographer",
        labelAr: "مزامنة الكابشن العربي التفاعلي مع إيقاع الصوت",
        model: "gemini-3.8-flash-high",
        tools: ["motion.caption.upsert", "motion.timeline.clip.keyframe.add"]
      },
      {
        id: "skill.gemimotion.interactive_webgl_embed",
        labelEn: "Interactive 3D Hero Loop for Landing Pages & SEO Dwell-Time",
        labelAr: "مشهد 3D تفاعلي لرفع مدة بقاء الزائر في صفحات الهبوط والسيو",
        model: "claude-sonnet-5-5-high",
        tools: ["motion.timeline.clip.scene3d", "motion.timeline.clip.transform"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.gemimotion.luxury_arabic_commercial",
        labelEn: "Luxury Arabic 3D Commercial (for Tarweeg & Brand Launch)",
        labelAr: "إعلان 3D عربي فاخر مع موسيقى Vibe ومؤثرات صوتية",
        steps: [
          "Initialize gemimotion-recipe/v3 with luxury-arabic-commercial preset",
          "Choreograph 3D PBR hero object and WGSL shader lighting on 705.6M flicks/sec grid",
          "Bind 48kHz luxury-arabic-modal soundtrack + 6 SFX cues and verify SafeRect"
        ]
      },
      {
        id: "wf.gemimotion.social_reel_loop",
        labelEn: "Seamless 9:16 Viral 3D Loop (for TikTok Spark & Meta Reels)",
        labelAr: "فيديو 3D حلقي متكرر (Seamless Loop) لتيك توك وريلز",
        steps: [
          "Match first and last frame camera transforms on integer flick boundaries",
          "Add beat-synced Arabic/English karaoke captions and whoosh/impact SFX"
        ]
      },
      {
        id: "wf.gemimotion.dwell_time_hero_motion",
        labelEn: "Organic Landing Page Dwell-Time Booster (Fixes Clarity Quickbacks)",
        labelAr: "مشهد تفاعلي لخفض معدل الارتداد السريع (Quickbacks) في Clarity",
        steps: [
          "Build lightweight 6-second 3D visual explainer loop illustrating core product value",
          "Export optimized loop for hero section to increase GA4 engaged session duration"
        ]
      }
    ])
  }),

  figtron: Object.freeze({
    appId: "figtron",
    name: "FigTron",
    arName: "فيج ترون",
    category: "creative-suite",
    nativeExtension: ".figtron",
    recommendedModel: "claude-sonnet-5-5-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Vector UI/UX design system & interactive prototyping studio (.figtron) with 100% design token variable binding, bidirectional RTL/LTR auto-layout mirroring, and multi-viewport constraints."
      ],
      domainRules: [
        "Bind 100% of colors, spacing, and typography to design tokens (zero hardcoded hex values).",
        "Enforce automatic RTL/LTR auto-layout mirroring for Arabic and English viewports.",
        "Define complete interactive component state matrices (default, hover, focus, disabled).",
        "Eliminate Cumulative Layout Shift (CLS) by enforcing explicit aspect-ratio containers on all hero/media frames."
      ],
      invariants: [
        "Every landing page or embed chart must pass WCAG AA contrast and mobile responsive constraints.",
        "Zero hardcoded hex colors; 100% design token variable binding across light and dark modes."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Microsoft Clarity reports high Dead Clicks / Rage Clicks or Quickbacks > 20% on landing page",
          diagnosis: "Ambiguous interactive affordances, buried CTA below the fold, or broken mobile RTL tap targets",
          automatedAction: "Redesign above-the-fold auto-layout frame in FigTron with >= 48x48px tap targets, sticky WhatsApp/Lead CTA bar, and clear trust badges",
          targetTools: ["figtron.frame.create_autolayout", "figtron.token.bind_variable", "figtron.component.instantiate"]
        },
        {
          trigger: "Google CrUX / PageSpeed flags CLS > 0.10",
          diagnosis: "Unbounded dynamic hero banners, fonts, or ad slots shifting layout during load",
          automatedAction: "Lock intrinsic aspect-ratio frames and skeleton placeholders in FigTron component spec",
          targetTools: ["figtron.frame.create_autolayout", "figtron.component.instantiate"]
        }
      ],
      mcpToolBindings: [
        "figtron.frame.create_autolayout",
        "figtron.token.bind_variable",
        "figtron.component.instantiate",
        "figtron.text.create_rtl",
        "figtron.prototype.link_interaction"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.figtron.conversion_landing_ui",
        labelEn: "High-Converting Ad Landing Page & Lead Form Architect",
        labelAr: "تصميم صفحات الهبوط ونماذج العملاء عالية التحويل",
        model: "claude-sonnet-5-5-high",
        tools: ["figtron.frame.create_autolayout", "figtron.token.bind_variable", "figtron.text.create_rtl"]
      },
      {
        id: "skill.figtron.seo_data_study_chart",
        labelEn: "Interactive Data Study & Comparison Matrix (Link-Bait)",
        labelAr: "تصميم جداول المقارنة والرسوم البيانية التفاعلية للسيو",
        model: "gemini-4-argon-medium",
        tools: ["figtron.component.instantiate", "figtron.prototype.link_interaction"]
      },
      {
        id: "skill.figtron.clarity_ux_remediator",
        labelEn: "Clarity Rage-Click & Quickback UX Friction Healer",
        labelAr: "معالج مشاكل تجربة المستخدم (Rage Clicks / Quickbacks) المكتشفة عبر Clarity",
        model: "claude-sonnet-5-5-high",
        tools: ["figtron.frame.create_autolayout", "figtron.component.instantiate", "figtron.prototype.link_interaction"]
      },
      {
        id: "skill.figtron.cls_cwv_layout_guard",
        labelEn: "Core Web Vitals CLS & Mobile Viewport Layout Stabilizer",
        labelAr: "ضابط استقرار التخطيط (CLS) وتوافق الجوال في مؤشرات جوجل",
        model: "gemini-3.8-flash-high",
        tools: ["figtron.frame.create_autolayout", "figtron.token.bind_variable"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.figtron.ad_landing_funnel",
        labelEn: "Ad-to-Landing Conversion Funnel (for Tarweeg)",
        labelAr: "بناء صفحة هبوط متوافقة مع حملات ترويج الإعلانية",
        steps: [
          "Create responsive desktop + mobile auto-layout frames bound to brand tokens",
          "Mirror Arabic RTL / English LTR hero section, social proof, and WhatsApp/Lead CTA",
          "Link interactive prototype states and hand off to web/Tarweeg campaign destination"
        ]
      },
      {
        id: "wf.figtron.clarity_crux_ux_overhaul",
        labelEn: "Clarity + CrUX Driven Landing Page UX Overhaul (for Rankly & Tarweeg)",
        labelAr: "إعادة هندسة واجهة صفحة الهبوط بناءً على بيانات Clarity وCrUX",
        steps: [
          "Ingest Microsoft Clarity dead-click/quickback zones and CrUX CLS metrics from Rankly",
          "Restructure above-the-fold CTA hierarchy and reserve fixed aspect-ratio media slots",
          "Verify WCAG AA contrast and 48px touch targets across Arabic RTL & English LTR"
        ]
      }
    ])
  }),

  lighttron: Object.freeze({
    appId: "lighttron",
    name: "LightTron",
    arName: "لايت ترون",
    category: "creative-suite",
    nativeExtension: ".lcraft",
    recommendedModel: "gemini-3.8-flash-high",
    recommendedEffort: "medium",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Non-destructive RAW photographic catalog & color development studio (.lcraft) with filmic tone curves, HSL color calibration, radial/linear masks, and batch XMP sidecar synchronization."
      ],
      domainRules: [
        "Keep highlight and shadow clipping strictly below 0.5% of total pixels.",
        "Store all adjustments as non-destructive parametric XMP sidecar history.",
        "Synchronize white balance and HSL color calibration across entire product catalog shoots.",
        "Embed IPTC/EXIF copyright, creator, and geo-location metadata for Google Images & Local SEO."
      ],
      invariants: [
        "Never overwrite raw sensor data.",
        "Maintain uniform Kelvin color temperature across multi-SKU catalog batches."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "E-commerce product feed in Tarweeg Merchant Center / Catalog DPA has inconsistent lighting",
          diagnosis: "Mixed Kelvin color temperatures across studio shoot batches reduce shopping ad CTR",
          automatedAction: "Normalize exposure/WB on reference SKU and batch-sync .lcraft XMP settings across all catalog items",
          targetTools: ["lighttron.develop.exposure_wb", "lighttron.develop.hsl_calibration", "lighttron.catalog.sync_settings"]
        }
      ],
      mcpToolBindings: [
        "lighttron.develop.exposure_wb",
        "lighttron.develop.tone_curve",
        "lighttron.develop.hsl_calibration",
        "lighttron.mask.radial_gradient",
        "lighttron.catalog.sync_settings"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.lighttron.raw_catalog_develop",
        labelEn: "RAW Product Develop & Filmic Tone Calibration",
        labelAr: "تحميض صور المنتجات الخام ومعايرة الألوان السينمائية",
        model: "gemini-3.8-flash-high",
        tools: ["lighttron.develop.exposure_wb", "lighttron.develop.tone_curve", "lighttron.develop.hsl_calibration"]
      },
      {
        id: "skill.lighttron.radial_mask_batch_sync",
        labelEn: "Radial Subject Masking & Multi-Shoot Look Sync",
        labelAr: "الأقنعة الشعاعية ومزامنة الإضاءة عبر جلسات التصوير",
        model: "gemini-3.8-flash-medium",
        tools: ["lighttron.mask.radial_gradient", "lighttron.catalog.sync_settings"]
      },
      {
        id: "skill.lighttron.google_images_exif_seo",
        labelEn: "Google Images & GBP Photo EXIF/IPTC Metadata Enricher",
        labelAr: "تحسين بيانات EXIF/IPTC لتصدر بحث صور جوجل وخرائط الأعمال",
        model: "gemini-3.8-flash-low",
        tools: ["lighttron.catalog.sync_settings"]
      },
      {
        id: "skill.lighttron.skin_tone_portrait_grade",
        labelEn: "Natural Skin-Tone & Executive Portrait Colorist",
        labelAr: "معايرة ألوان البشرة والصور الشخصية الاحترافية",
        model: "claude-sonnet-5-5-medium",
        tools: ["lighttron.develop.exposure_wb", "lighttron.develop.hsl_calibration"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.lighttron.ecommerce_catalog_grade",
        labelEn: "Batch E-Commerce Catalog Color Sync (for Tarweeg DPA/Shopping)",
        labelAr: "توحيد ألوان وإضاءة كتالوج المتجر لإعلانات التسوق",
        steps: [
          "Normalize exposure and daylight white balance on hero product RAW",
          "Apply filmic S-curve and radial gradient mask, then sync across all catalog SKUs"
        ]
      },
      {
        id: "wf.lighttron.local_seo_photo_pack",
        labelEn: "Google Business Profile & Image Search Authority Pack (for Rankly)",
        labelAr: "تجهيز صور خرائط جوجل وبحث الصور ببيانات وصفية كاملة",
        steps: [
          "Develop interior/exterior/product photos with < 0.5% clipping",
          "Sync brand color profile and hand off to ScaleTron for WebP compression"
        ]
      }
    ])
  }),

  scaletron: Object.freeze({
    appId: "scaletron",
    name: "ScaleTron",
    arName: "سكيل ترون",
    category: "creative-suite",
    nativeExtension: ".stproj",
    recommendedModel: "gemini-3.8-flash-high",
    recommendedEffort: "medium",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Edge-directed steerable super-resolution (2x/4x/8x/16x), OKLab guided chroma filtering, xBR multi-slope pixel/vector restoration, and neural upscaling engine (.stproj)."
      ],
      domainRules: [
        "Enforce 3x3 source range clamping to guarantee zero ringing or overshoot halos.",
        "Use OKLab guided chroma filtering and steerable edge-directed super-resolution at 2x/4x/8x/16x.",
        "Ensure seamless tile continuity and positive acutance delta on all upscaled assets.",
        "Compress output masters into next-gen WebP/AVIF to keep Google PageSpeed LCP < 2.5s."
      ],
      invariants: [
        "Zero tile boundary seams at 4x/8x/16x magnification.",
        "Strictly positive acutance delta with zero ringing halo artifacts."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Google PageSpeed Insights / CrUX flags slow LCP (> 2.5s) or unoptimized images on Rankly project",
          diagnosis: "Oversized PNG/JPEG hero images blocking Largest Contentful Paint",
          automatedAction: "Run ScaleTron OKLab guided filtering + crisp WebP/AVIF encoding to cut byte size by 65%+ while increasing acutance",
          targetTools: ["scale.inspect.classify", "scale.enhance.oklab_guided", "scale.enhance.steerable_sr"]
        }
      ],
      mcpToolBindings: [
        "scale.inspect.classify",
        "scale.enhance.steerable_sr",
        "scale.enhance.xbr_multislope",
        "scale.enhance.oklab_guided",
        "scale.topaz.neural_upscale"
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.scaletron.zero_halo_upscale",
        labelEn: "4x/8x Zero-Halo Super-Resolution & WebP Optimizer",
        labelAr: "تكبير الصور ٤-٨ أضعاف بدقة فائقة وضغط WebP للسيو والإعلانات",
        model: "gemini-3.8-flash-high",
        tools: ["scale.inspect.classify", "scale.enhance.steerable_sr", "scale.enhance.oklab_guided", "scale.topaz.neural_upscale"]
      },
      {
        id: "skill.scaletron.xbr_pixel_vector_restore",
        labelEn: "xBR Multi-Slope Logo & Icon Edge Restoration",
        labelAr: "استعادة حواف الشعارات والأيقونات بدقة فائقة (xBR)",
        model: "gemini-3.8-flash-medium",
        tools: ["scale.inspect.classify", "scale.enhance.xbr_multislope"]
      },
      {
        id: "skill.scaletron.cwv_lcp_image_surgeon",
        labelEn: "Core Web Vitals LCP Image Compressor & Next-Gen Encoder",
        labelAr: "مسرّع مؤشر LCP في PageSpeed عبر ضغط وتحسين الصور الذكي",
        model: "gemini-3.8-flash-high",
        tools: ["scale.inspect.classify", "scale.enhance.oklab_guided"]
      },
      {
        id: "skill.scaletron.ugc_ad_frame_enhancer",
        labelEn: "Low-Light UGC & Product Thumbnail Neural Restorer",
        labelAr: "تحسين جودة صور ومصغرات المنتجات منخفضة الإضاءة للإعلانات",
        model: "gemini-4-argon-medium",
        tools: ["scale.inspect.classify", "scale.topaz.neural_upscale", "scale.enhance.oklab_guided"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.scaletron.ad_and_seo_asset_master",
        labelEn: "Ultra-Sharp Asset Upscale (for Tarweeg Ads & Rankly CWV)",
        labelAr: "تحسين وتكبير صور الإعلانات ومقالات السيو بدون فقدان الجودة",
        steps: [
          "Classify input image edge geometry and noise floor",
          "Run steerable super-resolution + OKLab chroma preservation at 4x",
          "Deliver crisp master to PhotoTron, Tarweeg ImageCreativeService, and Rankly articles"
        ]
      },
      {
        id: "wf.scaletron.pagespeed_lcp_auto_remediation",
        labelEn: "PageSpeed Insights & CrUX LCP Image Remediation Loop",
        labelAr: "حلقة المعالجة التلقائية لبطء الصور المكتشف في Google PageSpeed",
        steps: [
          "Receive unoptimized image URLs from Rankly GooglePageSpeedService",
          "Upscale/denoise in OKLab space with 3x3 clamping and export lightweight WebP/AVIF"
        ]
      }
    ])
  }),

  rankly: Object.freeze({
    appId: "rankly",
    name: "Rankly",
    arName: "رانكلي (الأتمتة الشاملة للسيو وأدوات مشرفي المواقع)",
    category: "seo-autopilot",
    nativeExtension: ".rankly.json",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "8-Pillar 100% Zero-Cost Webmaster, Analytics & Behavioral Intelligence Suite: (1) Deep Google Search Console (Search Analytics, URL Inspection, Sitemaps, Google Indexing API v3 urlNotifications:publish, Google Site Verification API v1, Striking-Distance/Cannibalization/Decay/CTR Opportunity Engine), (2) Deep Google Analytics 4 (Realtime & Data API v1beta, Admin API v1beta discovery, Measurement Protocol mp/collect, and GSC×GA4 Query->LandingPage->Conversion->Revenue Correlator), (3) Google CrUX 25-Week History API (queryHistoryRecord) & PageSpeed Insights v5 CWV Remediation Extractor, (4) Expanded Bing Webmaster Tools (GetQueryStats, GetCrawlStats, GetPageStats, GetRankAndTrafficStats, GetLinkCounts free inbound backlinks, GetUrlInfo, GetKeywordStats, SubmitUrlBatch, SubmitContent direct HTML push), (5) Yandex Webmaster API v4 (SQI Site Quality Index, popular queries, links/external/samples free backlinks, recrawl/queue, diagnostics), (6) Microsoft Clarity Live Insights API (Rage Clicks, Dead Clicks, Quickbacks/pogo-sticking, Scroll Depth, Active Time), (7) Cloudflare GraphQL Bot & AI-Crawler Log Analyzer (Googlebot, Bingbot, YandexBot, Applebot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot), and (8) Google Business Profile (GBP Local Posts & Reviews) + Breakout Trends & AI Overview / GEO Citation Tracker.",
        "d4vinci/Scrapling v0.5 Stealth Spider Engine (StealthyFetcher, DynamicFetcher, Fetcher) with adaptive=True self-healing DOM selector relocation, site audit spider, zero-cost SERP/PAA scraper, CMS footprint harvester, and CommonCrawl + live DOM backlink verifier.",
        "Money-Robot Style Autonomous Publishing Engine: 12 Zero-Cost API Adapters (Telegraph, Dev.to, Hashnode, Medium, Ghost, WordPress REST+XML-RPC, Blogger, Tumblr, GitHub Gist/Pages, Mastodon ActivityPub, Discourse, MediaWiki/BookStack) + 27 Stealth Browser Recipes across 1,000 classified publication sources.",
        "Tiered Link Topology Engine (Tier 1 -> Tier 2 -> Tier 3 Pyramid, Closed/Open Link Wheel, Star) with recursive {a|b|{c|d}} SpintaxService (>= 75% shingle uniqueness) and Omni-Engine Indexer (Google Indexing API + Bing SubmitContent/UrlBatch + Yandex Recrawl + IndexNow + WebSub/PubSubHubbub + Ping-O-Matic XML-RPC + Wayback Machine)."
      ],
      domainRules: [
        "Enforce strict per-project encrypted credential isolation (ProviderCredential + GoogleProjectSelection) across all 8 Webmaster & Analytics pillars.",
        "Prioritize GSC Striking-Distance queries (average position 4.0 to 20.0 with high impressions) for immediate content refresh, TronCS infographic embed, and Tier 1->2 link wheel boost.",
        "Detect and resolve Keyword Cannibalization whenever >= 2 URLs split clicks for the same GSC query by consolidating content, setting canonicals, or differentiating search intent.",
        "Correlate GSC query impressions/clicks with GA4 Organic Search engagedSessions, keyEvents, and totalRevenue so link building and content creation focus on revenue-generating topics.",
        "Cross-check Microsoft Clarity Quickbacks (pogo-sticking) and Rage/Dead Clicks alongside Google CrUX 25-week LCP/INP/CLS history; trigger FigTron layout fixes and ScaleTron WebP optimization when UX friction threatens rankings.",
        "Monitor Cloudflare server-side bot logs to ensure both traditional search bots (Googlebot, Bingbot, YandexBot) and AI Search crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot) receive HTTP 200 without 404/5xx crawl budget waste.",
        "Harvest free verified competitor and domain backlinks by combining Bing GetLinkCounts, Yandex links/external/samples, and CommonCrawl CDX + Scrapling live DOM verification.",
        "Enforce natural anchor-text safety ratios across Tier 1 -> Tier 2 -> Tier 3 topologies (35% branded, 25% naked URL, 20% generic, 15% topical partial-match, <= 5% exact-match).",
        "Generate deeply nested {a|b|{c|d}} Spintax with >= 75% shingle uniqueness and embed TronCS infographics/videos in every Tier 1 property."
      ],
      invariants: [
        "100% Zero-Cost Guard: Never call paid third-party SEO APIs; use official first-party Webmaster/Analytics APIs, native protocols, and d4vinci/Scrapling.",
        "Zero fabricated URLs, zero fake crc32/md5 backlink metrics, and zero counting of seed catalog rows as published links without HTTP 200 + live anchor readback proof.",
        "Never leak cross-project OAuth credentials; R2 write mutations require owner approval assertions and idempotency keys."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "GSC Striking-Distance query detected at position 4–15 with > 500 impressions",
          diagnosis: "Page is on the cusp of Top 3 exponentially higher CTR but needs E-E-A-T depth, fresh visual media, and contextual Tier 1 authority",
          automatedAction: "Expand section with PAA answers + generate PhotoTron/FigTron infographic + publish 3 Tier 1 contextual properties (Telegraph/Dev.to/WordPress) boosted by Tier 2 social bookmarks + fire Omni-Index",
          targetTools: ["rankly.google.gsc.opportunities", "rankly.content.generate", "photo.document.place", "rankly.tiered.build", "rankly.webmaster.omni_index"]
        },
        {
          trigger: "GSC Impressions are high (> 1,000) in Top 5 positions but CTR < 2.0%",
          diagnosis: "Uncompelling title/meta hook or missing FAQ/Product/Review JSON-LD rich result eligibility",
          automatedAction: "Rewrite title tag with power numbers/brackets + inject validated JSON-LD schema + notify Google Indexing API (URL_UPDATED)",
          targetTools: ["rankly.google.gsc.opportunities", "rankly.scrapling.audit", "rankly.google.indexing.notify"]
        },
        {
          trigger: "Microsoft Clarity shows Quickbacks > 22% or Dead Clicks > 5% on a high-ranking organic page",
          diagnosis: "Visitors pogo-stick back to SERP due to slow LCP, layout shift, or buried answer",
          automatedAction: "Run CrUX History & PageSpeed check -> compress images via ScaleTron -> redesign above-the-fold summary box in FigTron -> embed 6s GemiMotion 3D summary loop",
          targetTools: ["rankly.clarity.insights", "rankly.google.crux.history", "scale.enhance.oklab_guided", "figtron.frame.create_autolayout"]
        },
        {
          trigger: "Cloudflare Bot Logs show GPTBot / PerplexityBot / Googlebot hitting 404s or low crawl frequency on key money pages",
          diagnosis: "Orphaned internal link structure or broken crawl paths starving AI Search (GEO) and Google indexing",
          automatedAction: "Fix broken internal links via Scrapling audit + push updated XML sitemap to GSC + fire Bing SubmitContent & Yandex recrawl/queue",
          targetTools: ["rankly.cloudflare.bot_logs", "rankly.scrapling.audit", "rankly.webmaster.omni_index"]
        },
        {
          trigger: "GSC × GA4 Revenue Correlator identifies an organic query with > 4% conversion rate and high revenue per session",
          diagnosis: "High-intent commercial keyword proven organically that should also dominate Paid Search/Social immediately",
          automatedAction: "Push winning keyword & landing page to Tarweeg LaunchSaga for Google Search/PMax + Meta/TikTok retargeting",
          targetTools: ["rankly.google.ga4.revenue_correlate", "rankly.webmaster.closed_loop", "tarweeg.campaign.launch_saga"]
        }
      ],
      mcpToolBindings: [
        "rankly.google.accounts.list",
        "rankly.google.account.select",
        "rankly.google.index.inspect",
        "rankly.google.sitemaps.list",
        "rankly.google.analytics.realtime",
        "rankly.google.pagespeed.inspect",
        "rankly.google.gsc.opportunities",
        "rankly.google.indexing.notify",
        "rankly.google.site_verification.verify",
        "rankly.google.ga4.admin_discover",
        "rankly.google.ga4.revenue_correlate",
        "rankly.google.ga4.measurement_event",
        "rankly.google.crux.history",
        "rankly.bing.intelligence",
        "rankly.yandex.intelligence",
        "rankly.clarity.insights",
        "rankly.cloudflare.bot_logs",
        "rankly.google.gbp.manage",
        "rankly.trends_geo.analyze",
        "rankly.webmaster.omni_index",
        "rankly.webmaster.closed_loop",
        "rankly.scrapling.fetch",
        "rankly.scrapling.audit",
        "rankly.scrapling.serp",
        "rankly.scrapling.footprints",
        "rankly.autopilot.publish",
        "rankly.tiered.build",
        "rankly.content.generate",
        "rankly.indexer.ping",
        "rankly.backlinks.verify"
      ]
    }),
    skills: Object.freeze([
      {
        id: "rankly.gsc_opportunity_strategist",
        aliases: ["skill.rankly.gsc_opportunity_strategist"],
        labelEn: "GSC Striking-Distance, Cannibalization & Decay Strategist",
        labelAr: "محلل فرص Google Search Console (الكلمات القريبة، التآكل، وتراجع النقرات)",
        model: "gemini-4-argon-high",
        tools: ["rankly.google.gsc.opportunities", "rankly.google.index.inspect", "rankly.google.sitemaps.list", "rankly.google.indexing.notify"]
      },
      {
        id: "rankly.ga4_revenue_correlator",
        aliases: ["skill.rankly.ga4_revenue_correlator"],
        labelEn: "GSC × GA4 Organic Revenue Attribution & Measurement Brain",
        labelAr: "محلل ربط الكلمات البحثية بالأرباح والتحويلات (GSC × GA4)",
        model: "claude-sonnet-5-5-high",
        tools: ["rankly.google.ga4.revenue_correlate", "rankly.google.ga4.admin_discover", "rankly.google.ga4.measurement_event", "rankly.google.analytics.realtime"]
      },
      {
        id: "rankly.bing_yandex_backlink_intelligence",
        aliases: ["skill.rankly.bing_yandex_backlink_intelligence"],
        labelEn: "Bing & Yandex Webmaster Intelligence + Free Backlink Harvester",
        labelAr: "محلل أدوات مشرفي المواقع Bing وYandex واكتشاف الباك لينك المجاني",
        model: "gemini-4-argon-medium",
        tools: ["rankly.bing.intelligence", "rankly.yandex.intelligence", "rankly.backlinks.verify"]
      },
      {
        id: "rankly.clarity_crux_ux_cwv_healer",
        aliases: ["skill.rankly.clarity_crux_ux_cwv_healer"],
        labelEn: "Microsoft Clarity UX Signals + CrUX 25-Week CWV Auto-Healer",
        labelAr: "معالج تجربة المستخدم (Clarity) ومؤشرات السرعة (CrUX & PageSpeed)",
        model: "claude-sonnet-5-5-high",
        tools: ["rankly.clarity.insights", "rankly.google.crux.history", "rankly.google.pagespeed.inspect"]
      },
      {
        id: "rankly.cloudflare_bot_ai_log_analyzer",
        aliases: ["skill.rankly.cloudflare_bot_ai_log_analyzer"],
        labelEn: "Cloudflare Server-Side Googlebot & AI-Crawler (GPTBot/ClaudeBot) Log Analyzer",
        labelAr: "محلل سجلات زحف Googlebot وبوتات الذكاء الاصطناعي عبر Cloudflare",
        model: "gemini-3.8-flash-high",
        tools: ["rankly.cloudflare.bot_logs", "rankly.scrapling.audit"]
      },
      {
        id: "rankly.gbp_local_and_geo_trends",
        aliases: ["skill.rankly.gbp_local_and_geo_trends"],
        labelEn: "Google Business Profile (GBP) Local SEO + Breakout Trends & AI GEO Optimizer",
        labelAr: "مدير السيو المحلي (خرائط جوجل) والترندات والظهور في محركات AI (GEO)",
        model: "gemini-4-argon-high",
        tools: ["rankly.google.gbp.manage", "rankly.trends_geo.analyze", "rankly.scrapling.serp"]
      },
      {
        id: "rankly.tiered_link_architect",
        aliases: ["skill.rankly.tiered_wheel_architect"],
        labelEn: "Tier 1→2→3 Link Wheel & Safe Anchor Ratio Architect",
        labelAr: "مهندس شبكات الباك لينك الهرمية (Tier 1-2-3) ونسب الأنكور الآمنة",
        model: "gemini-4-argon-high",
        tools: ["rankly.tiered.build", "rankly.autopilot.publish", "rankly.backlinks.verify"]
      },
      {
        id: "rankly.scrapling_self_healer",
        aliases: ["skill.rankly.scrapling_stealth_healer"],
        labelEn: "d4vinci/Scrapling Stealth Spider & Adaptive DOM Healer",
        labelAr: "زاحف Scrapling الخفي وإصلاح محددات DOM الذاتي",
        model: "gemini-3.8-flash-high",
        tools: ["rankly.scrapling.fetch", "rankly.scrapling.audit", "rankly.scrapling.serp", "rankly.scrapling.footprints"]
      },
      {
        id: "rankly.spintax_eeat_writer",
        aliases: ["skill.rankly.spintax_eeat_writer"],
        labelEn: "Nested Spintax E-E-A-T Article & Digital PR Writer",
        labelAr: "كاتب مقالات السيو المتوافقة مع E-E-A-T والـ Spintax العميق",
        model: "claude-opus-5-5-high",
        tools: ["rankly.content.generate", "rankly.autopilot.publish"]
      },
      {
        id: "rankly.12api_27recipe_publisher",
        aliases: ["skill.rankly.12api_27recipe_publisher"],
        labelEn: "12 Zero-Cost API + 27 Stealth Recipe Autonomous Publisher",
        labelAr: "الناشر التلقائي عبر ١٢ واجهة API مجانية و٢٧ وصفة متصفح خفية",
        model: "claude-sonnet-5-5-high",
        tools: ["rankly.autopilot.publish", "rankly.backlinks.verify"]
      },
      {
        id: "rankly.zero_cost_indexer",
        aliases: ["skill.rankly.zero_cost_indexer"],
        labelEn: "Omni-Engine Multi-Protocol Indexer (Google Indexing + Bing + Yandex + IndexNow + WebSub)",
        labelAr: "مُفهرس الروابط الشامل الفوري (جوجل + بينج + ياندكس + IndexNow + WebSub)",
        model: "gemini-3.8-flash-medium",
        tools: ["rankly.webmaster.omni_index", "rankly.indexer.ping", "rankly.google.indexing.notify"]
      },
      {
        id: "rankly.closed_loop_growth_orchestrator",
        aliases: ["skill.rankly.closed_loop_growth_orchestrator"],
        labelEn: "Closed-Loop Webmaster ↔ TronCS ↔ Tarweeg Autonomous Orchestrator",
        labelAr: "منسق الحلقة المغلقة التلقائية بين أدوات مشرفي المواقع واستوديو TronCS وترويج",
        model: "claude-opus-5-5-high",
        tools: ["rankly.webmaster.closed_loop", "rankly.google.ga4.revenue_correlate", "rankly.tiered.build"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "rankly.wf.full_seo_autopilot",
        aliases: ["wf.rankly.full_money_robot_autopilot"],
        labelEn: "End-to-End Money-Robot 3-Tier SEO Autopilot + TronCS Visuals",
        labelAr: "التشغيل التلقائي الشامل للسيو والباك لينك الهرمي مع إنفوجرافيك TronCS",
        steps: [
          "Crawl target site & live SERP/PAA via d4vinci/Scrapling to extract semantic keyword gaps",
          "Generate nested Spintax E-E-A-T articles (Claude Opus 5.5) + PhotoTron/FigTron infographic link-bait",
          "Publish Tier 1 contextual properties across Telegraph, Dev.to, Hashnode, Medium & WordPress",
          "Cascade Tier 2 social/bookmark properties (Mastodon, Tumblr, Discourse, GitHub) pointing to Tier 1",
          "Fire Omni-Engine Indexer (Google Indexing API, Bing, Yandex, IndexNow, WebSub, Ping-O-Matic) and verify live dofollow DOM links"
        ]
      },
      {
        id: "rankly.wf.8pillar_webmaster_closed_loop",
        labelEn: "8-Pillar Webmaster & Analytics Closed-Loop Autopilot (GSC + GA4 + Clarity + CrUX + Bing + Yandex + CF)",
        labelAr: "حلقة التحسين التلقائي الشاملة عبر المصادر الثمانية (GSC + GA4 + Clarity + CrUX + Bing + Yandex + Cloudflare)",
        steps: [
          "Pull GSC Striking-Distance/Cannibalization/Decay + GA4 Organic Revenue Attribution + Bing & Yandex query/link stats",
          "Inspect Microsoft Clarity Quickbacks/Rage Clicks + CrUX 25-week CWV history + Cloudflare Googlebot/GPTBot logs",
          "Dispatch ScaleTron/FigTron UX & LCP fixes for high-bounce pages and refresh decaying content with PhotoTron infographics",
          "Spawn targeted Tier 1->2 link wheels for striking-distance revenue pages and push winning organic keywords to Tarweeg Ads"
        ]
      },
      {
        id: "rankly.wf.striking_distance_top3_accelerator",
        labelEn: "GSC Striking-Distance (Pos 4–15) to Top-3 Accelerator",
        labelAr: "مسرّع دفع الكلمات القريبة (المراكز ٤-١٥ في جوجل) إلى المراكز الثلاثة الأولى",
        steps: [
          "Identify GSC queries ranking positions 4–15 with high impressions via rankly.google.gsc.opportunities",
          "Enrich target page with missing SERP/PAA entities, FAQ JSON-LD, and a custom PhotoTron data chart",
          "Build 5 contextual Tier 1 backlinks with safe branded/partial anchors and notify Google Indexing API + Bing SubmitContent"
        ]
      },
      {
        id: "rankly.wf.clarity_crux_bounce_recovery",
        labelEn: "Clarity Pogo-Sticking & CrUX Core Web Vitals Recovery",
        labelAr: "معالجة ارتداد الزوار (Pogo-Sticking) وتحسين مؤشرات Core Web Vitals",
        steps: [
          "Detect high Quickbacks and Dead Clicks via rankly.clarity.insights and slow LCP/CLS via rankly.google.crux.history",
          "Compress hero assets via ScaleTron (4x OKLab WebP) and restructure above-the-fold CTA layout in FigTron",
          "Embed a 6s GemiMotion 3D summary loop to boost GA4 engaged session duration"
        ]
      },
      {
        id: "rankly.wf.ai_search_geo_and_bot_log_optimizer",
        labelEn: "AI Search (GEO) Citation & Cloudflare Crawler Budget Optimizer",
        labelAr: "تحسين الظهور في إجابات الذكاء الاصطناعي (ChatGPT/Perplexity/AI Overviews) وسجلات الزحف",
        steps: [
          "Analyze GPTBot, ClaudeBot, PerplexityBot, and Googlebot crawl logs via rankly.cloudflare.bot_logs",
          "Check brand citation share and breakout queries via rankly.trends_geo.analyze",
          "Publish authoritative structured tables, llms.txt/schema summaries, and high-DR Tier 1 citations"
        ]
      },
      {
        id: "rankly.wf.local_gbp_map_pack_dominator",
        labelEn: "Google Business Profile (GBP) Local 3-Pack & Citation Dominator",
        labelAr: "خطة السيطرة على نتائج الخرائط المحلية (Google Maps 3-Pack)",
        steps: [
          "Audit GBP profile, reviews, and Q&A via rankly.google.gbp.manage",
          "Design localized offer/event visual cards in PhotoTron & LightTron and publish directly to GBP Local Posts",
          "Build consistent NAP local citations and ping via Omni-Engine Indexer"
        ]
      },
      {
        id: "rankly.wf.scrapling_audit_and_footprint_harvest",
        aliases: ["wf.rankly.scrapling_audit_and_footprint_harvest"],
        labelEn: "Deep Scrapling Technical Audit + Bing/Yandex/CommonCrawl Backlink Harvester",
        labelAr: "الفحص التقني العميق واكتشاف الباك لينك ومنصات النشر عبر Scrapling وBing وYandex",
        steps: [
          "Run rankly.scrapling.audit to inspect status codes, canonicals, headings, JSON-LD, and broken links",
          "Harvest verified external backlinks from Bing GetLinkCounts, Yandex links/external/samples, and CommonCrawl",
          "Discover new high-DR CMS targets using rankly.scrapling.footprints and probe signup forms"
        ]
      }
    ])
  }),

  tarweeg: Object.freeze({
    appId: "tarweeg",
    name: "Tarweeg",
    arName: "ترويج (منصة الإعلانات الموحدة عبر ٩ شبكات)",
    category: "advertising-os",
    nativeExtension: ".tarweeg.json",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      architectureAndCapabilities: [
        "Centralized 9-Platform Advertising OS unifying real AdvertisingProviderInterface adapters: (1) Google Ads (Search RSA + Negative Keywords, Performance Max AssetGroups + Signals, Shopping Merchant Center, YouTube VideoResponsiveAd, Demand Gen Discovery), (2) Meta Ads (Single Image, Reels/Video, Multi-Card Carousel, Catalog DPA, Lead Generation Forms, Click-to-WhatsApp CTWA), (3) TikTok Ads (In-Feed Video, Spark Ads via auth_code, Carousel Ads, Catalog Video Shopping; Saudi Arabia Geo ID = 102358), (4) Snapchat Ads (Single Image/Video, Story Ads, Collection/Catalog Ads), (5) OpenAI / ChatGPT Ads (Sponsored Search, Conversational Intent Cards, Feed Placements), (6) LinkedIn Ads (Sponsored Single Image/Video/Carousel/Lead Gen for B2B), (7) X / Twitter Ads (Promoted Text/Image/Video/Carousel), (8) Pinterest Ads (Standard/Video/Shopping/Carousel Pins), and (9) Microsoft Advertising / Bing Ads (Search RSA, Shopping, Audience Network).",
        "Atomic 4-Step LaunchSagaCoordinatorService (campaign_create -> adset_create -> ad_create -> budget_set) protected by MultiNetworkMutationGuardService compensating rollbacks (pauseEntity / archiveEntity / budget restore).",
        "Persistent MariaDB ReadSync Engine (GoogleAdsReadSyncService, MetaReadSyncService, TikTokReadSyncService, etc.) writing real provider campaigns, entity states, and daily spend/conversion metrics into imported_provider_campaigns and provider_entity_states.",
        "5 Real Server-Side Ecommerce & CRM CAPI Connectors: Shopify (Admin REST 2024-10), Salla (api.salla.dev/admin/v2), Zid (api.zid.sa/v1), WooCommerce (wp-json/wc/v3), and HubSpot CRM (crm/v3/objects/contacts & deals).",
        "Native 4-Ratio Raster & Video Creative Pipeline (1:1 1080x1080, 4:5 1080x1350, 9:16 1080x1920, 1.91:1 1200x628) powered by PHP GD + local GemiAI + full TronCS 7-App Creative Studio."
      ],
      domainRules: [
        "Compile and execute campaigns across all 9 real AdvertisingProviderInterface adapters using verified provider account assets (resolved Meta page_id, pixel_id, catalog_id; TikTok Saudi Geo ID = 102358).",
        "Execute all multi-step campaign launches atomically through LaunchSagaCoordinatorService (campaign_create -> adset_create -> ad_create -> budget_set) with automatic compensating rollback on partial failure.",
        "Always route live pause, resume, and budget updates through the external provider API adapter before committing local DB state.",
        "Produce studio-grade 4-ratio raster & video creatives via TronCS (LightTron -> ScaleTron -> PhotoTron -> GemiMotion/AfterTron/FilmTron -> FigTron) and local ImageCreativeService.",
        "Sync real server-side conversions and orders from Shopify, Salla, Zid, WooCommerce, and HubSpot CRM to maximize Event Match Quality (EMQ >= 8.5) and true ROAS.",
        "Cross-pollinate keyword & conversion data with Rankly: turn Rankly's high-converting GSC×GA4 organic queries into Tarweeg Search/PMax/Social ads, and send Tarweeg's winning paid search queries to Rankly for 3-Tier organic SEO domination."
      ],
      invariants: [
        "Never use fake sha256 entity IDs, placeholder page_id ('100000000000000'), or unpersisted in-memory ReadSync.",
        "Never disguise daily_budget * 30 as actual synced ad spend; always report verified synced spend and conversion value.",
        "Enforce strict workspace tenant isolation (never fall back to Workspace::first()) and require Ed25519 owner approval assertions on R2/R3 live spend mutations."
      ],
      diagnosticPlaybooks: [
        {
          trigger: "Blended ROAS drops > 20% or CPA exceeds target threshold over 72 hours",
          diagnosis: "Creative fatigue on primary 9:16/4:5 social ad sets or audience saturation",
          automatedAction: "Pause underperforming ad sets via live provider API + generate fresh 3-second hook variants in AfterTron/GemiMotion/PhotoTron + reallocate 20% budget to highest-ROAS Google PMax / Meta CTWA ad sets",
          targetTools: ["tarweeg.providers.sync", "tarweeg.campaign.pause", "tarweeg.creatives.generate", "tarweeg.campaign.budget.update"]
        },
        {
          trigger: "Meta / TikTok / Snapchat pixel attribution under-reports actual store checkouts",
          diagnosis: "Browser ITP/ad-blocker signal loss without server-side CAPI deduplication",
          automatedAction: "Sync Shopify/Salla/Zid/WooCommerce server-side order webhooks via tarweeg.connectors.sync with hashed email/phone + event_id deduplication",
          targetTools: ["tarweeg.connectors.sync", "tarweeg.reporting.daily_brief"]
        },
        {
          trigger: "GCC / Saudi e-commerce campaign has high click-through rate but low checkout completion",
          diagnosis: "High-ticket GCC shoppers prefer instant WhatsApp consultation or COD confirmation before checkout",
          automatedAction: "Launch Meta Click-to-WhatsApp (CTWA) + Snapchat Story retargeting campaign paired with FigTron RTL landing page optimization",
          targetTools: ["tarweeg.campaign.launch_saga", "figtron.frame.create_autolayout"]
        }
      ],
      mcpToolBindings: [
        "tarweeg.providers.sync",
        "tarweeg.campaign.launch_saga",
        "tarweeg.campaign.pause",
        "tarweeg.campaign.resume",
        "tarweeg.campaign.budget.update",
        "tarweeg.creatives.generate",
        "tarweeg.audiences.manage",
        "tarweeg.connectors.sync",
        "tarweeg.reporting.daily_brief",
        "tarweeg.query",
        "tarweeg.command"
      ]
    }),
    skills: Object.freeze([
      {
        id: "tarweeg.9platform_saga_compiler",
        aliases: ["skill.tarweeg.9platform_saga_compiler"],
        labelEn: "9-Platform LaunchSaga Campaign Architect",
        labelAr: "مهندس إطلاق الحملات الموحدة عبر ٩ منصات إعلانية (LaunchSaga)",
        model: "gemini-4-argon-high",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.audiences.manage", "tarweeg.providers.sync"]
      },
      {
        id: "tarweeg.google_pmax_search_shopping_master",
        aliases: ["skill.tarweeg.google_pmax_search_shopping_master"],
        labelEn: "Google Ads Search RSA, PMax, Shopping & YouTube Specialist",
        labelAr: "خبير إعلانات جوجل (Search RSA, Performance Max, Shopping, YouTube)",
        model: "gemini-4-argon-high",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.campaign.budget.update"]
      },
      {
        id: "tarweeg.meta_reels_dpa_ctwa_specialist",
        aliases: ["skill.tarweeg.meta_reels_dpa_ctwa_specialist"],
        labelEn: "Meta Ads (Reels, Carousel, Catalog DPA & Click-to-WhatsApp CTWA) Specialist",
        labelAr: "خبير إعلانات ميتا (ريلز، الكتالوج التلقائي DPA، وإعلانات واتساب CTWA)",
        model: "claude-sonnet-5-5-high",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.audiences.manage", "tarweeg.creatives.generate"]
      },
      {
        id: "tarweeg.tiktok_spark_snapchat_gcc_specialist",
        aliases: ["skill.tarweeg.tiktok_spark_snapchat_gcc_specialist"],
        labelEn: "TikTok Spark/Shopping & Snapchat Story/Collection GCC Specialist (Geo 102358)",
        labelAr: "خبير إعلانات تيك توك (Spark/Shopping) وسناب شات للخليج والسعودية",
        model: "gemini-4-argon-medium",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.creatives.generate"]
      },
      {
        id: "tarweeg.openai_search_and_b2b_networks",
        aliases: ["skill.tarweeg.openai_search_and_b2b_networks"],
        labelEn: "OpenAI Sponsored Search/Chat + LinkedIn B2B, X, Pinterest & Microsoft Ads Specialist",
        labelAr: "خبير إعلانات OpenAI/ChatGPT ولينكدإن وإكس وبينتريست ومايكروسوفت",
        model: "claude-opus-5-5-high",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.audiences.manage"]
      },
      {
        id: "tarweeg.gcc_arabic_ad_copywriter",
        aliases: ["skill.tarweeg.gcc_arabic_ad_copywriter"],
        labelEn: "Saudi/GCC/English High-ROAS Ad Copy & Video Script Writer",
        labelAr: "كاتب الإعلانات وسيناريوهات الفيديو باللهجة السعودية والخليجية والإنجليزية",
        model: "claude-opus-5-5-high",
        tools: ["tarweeg.creatives.generate"]
      },
      {
        id: "tarweeg.troncs_4ratio_creative_director",
        aliases: ["skill.tarweeg.troncs_4ratio_creative_director"],
        labelEn: "TronCS 7-App Creative Studio & 4-Ratio Ad Pack Director",
        labelAr: "مخرج الكرييتف والفيديو الإعلاني عبر تطبيقات TronCS السبعة (٤ مقاسات)",
        model: "gemini-4-argon-high",
        tools: ["tarweeg.creatives.generate", "photo.document.place", "motion.timeline.clip.scene3d", "film.export.queue_render"]
      },
      {
        id: "tarweeg.capi_roas_autopilot",
        aliases: ["skill.tarweeg.capi_roas_autopilot"],
        labelEn: "Shopify/Salla/Zid/Woo/HubSpot CAPI & Server-Side Attribution Engineer",
        labelAr: "مهندس ربط المتاجر (سلة، زد، شوبيفاي، ووكومرس، HubSpot) وتتبع CAPI",
        model: "claude-sonnet-5-5-high",
        tools: ["tarweeg.connectors.sync", "tarweeg.reporting.daily_brief"]
      },
      {
        id: "tarweeg.autonomous_budget_roas_guard",
        aliases: ["skill.tarweeg.autonomous_budget_roas_guard"],
        labelEn: "Autonomous Budget Pacing, Stop-Loss & ROAS Scaling Guard",
        labelAr: "حارس الميزانية التلقائي وإيقاف الخسائر ومضاعفة الحملات الرابحة",
        model: "claude-sonnet-5-5-high",
        tools: ["tarweeg.campaign.budget.update", "tarweeg.campaign.pause", "tarweeg.campaign.resume", "tarweeg.providers.sync"]
      },
      {
        id: "tarweeg.audience_lookalike_retarg_architect",
        aliases: ["skill.tarweeg.audience_lookalike_retarg_architect"],
        labelEn: "Cross-Network Lookalike & Full-Funnel Retargeting Architect",
        labelAr: "مهندس الجماهير المشابهة (Lookalike) وإعادة الاستهداف عبر المنصات",
        model: "gemini-4-argon-medium",
        tools: ["tarweeg.audiences.manage", "tarweeg.connectors.sync"]
      },
      {
        id: "tarweeg.paid_organic_rankly_synergy",
        aliases: ["skill.tarweeg.paid_organic_rankly_synergy"],
        labelEn: "Tarweeg Paid Ads ↔ Rankly GSC/GA4 Organic Synergy Brain",
        labelAr: "منسق التكامل بين إعلانات ترويج المدفوعة وتصدر السيو العضوي في رانكلي",
        model: "claude-opus-5-5-high",
        tools: ["tarweeg.reporting.daily_brief", "rankly.google.ga4.revenue_correlate", "rankly.tiered.build"]
      },
      {
        id: "tarweeg.executive_daily_brief_analyst",
        aliases: ["skill.tarweeg.executive_daily_brief_analyst"],
        labelEn: "Executive Multi-Network Spend, MER & Cohort ROAS Analyst",
        labelAr: "محلل التقارير التنفيذية اليومية للعائد الكلي (MER) وأداء المنصات التسع",
        model: "gemini-3.8-flash-high",
        tools: ["tarweeg.reporting.daily_brief", "tarweeg.providers.sync"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "tarweeg.wf.omni_channel_launch_with_troncs",
        aliases: ["wf.tarweeg.omni_channel_launch_with_troncs"],
        labelEn: "Omni-Channel 9-Platform Ad Launch + Full TronCS Creative Studio",
        labelAr: "إطلاق حملة شاملة عبر ٩ منصات مع إنتاج الكرييتف والفيديو عبر استوديو TronCS",
        steps: [
          "Extract offer positioning and target audiences across Google, Meta, TikTok, Snap, OpenAI, LinkedIn, X, Pinterest & Microsoft",
          "Generate Saudi/GCC & English ad copy variants + TikTok/Reels storyboard via Claude Opus 5.5",
          "Trigger TronCS pipeline: LightTron color grade -> ScaleTron 4x upscale -> PhotoTron 4-ratio posters -> GemiMotion/AfterTron/FilmTron vertical video ad -> FigTron landing page",
          "Compile platform payloads and execute atomic 4-step LaunchSaga with CAPI tracking enabled"
        ]
      },
      {
        id: "tarweeg.wf.gcc_ecommerce_salla_zid_shopify_blitz",
        labelEn: "Saudi/GCC E-Commerce Blitz (Salla/Zid/Shopify CAPI + TikTok/Snap/Meta CTWA + Google Shopping)",
        labelAr: "حملة المتاجر الخليجية (ربط سلة/زد/شوبيفاي + تيك توك وسناب وواتساب وجوجل شوبينج)",
        steps: [
          "Sync product catalog and server-side CAPI orders from Salla, Zid, or Shopify via tarweeg.connectors.sync",
          "Batch-calibrate catalog product photos in LightTron & ScaleTron and generate 4:5/9:16 Arabic price-badge cards in PhotoTron",
          "Launch TikTok Catalog Video + Snapchat Collection/Story (Saudi Geo 102358) + Meta Click-to-WhatsApp + Google PMax Shopping"
        ]
      },
      {
        id: "tarweeg.wf.winning_ad_to_rankly_seo",
        aliases: ["wf.tarweeg.winning_ad_to_rankly_seo"],
        labelEn: "Bidirectional Growth Loop: Tarweeg Winning Ads ↔ Rankly GSC/GA4 3-Tier SEO",
        labelAr: "حلقة النمو المشترك: تبادل الكلمات الرابحة بين إعلانات ترويج وسيو رانكلي",
        steps: [
          "Sync Shopify/Salla/Zid conversion attribution and identify highest-ROAS search queries & ad hooks in Tarweeg",
          "Send winning paid keywords to Rankly to build Tier 1->2->3 link wheels and E-E-A-T articles automatically",
          "Import Rankly's top-converting GSC×GA4 organic queries into Tarweeg as exact-match Search & PMax campaigns"
        ]
      },
      {
        id: "tarweeg.wf.creative_fatigue_auto_refresh",
        labelEn: "Creative Fatigue Detection & Autonomous TronCS Ad Refresh",
        labelAr: "اكتشاف إجهاد الإعلانات وتجديد الكرييتف والفيديو تلقائياً عبر TronCS",
        steps: [
          "Run tarweeg.providers.sync to detect ad sets with declining CTR or rising CPA",
          "Generate 3 new hook angles in AfterTron + GemiMotion + PhotoTron and deploy replacement ads via LaunchSaga"
        ]
      },
      {
        id: "tarweeg.wf.b2b_high_ticket_lead_engine",
        labelEn: "B2B & High-Ticket Lead Engine (LinkedIn + Google Search + OpenAI Ads + HubSpot CRM)",
        labelAr: "محرك عملاء الشركات والصفقات الكبرى (لينكدإن + بحث جوجل + OpenAI + HubSpot)",
        steps: [
          "Build executive decision-maker audiences on LinkedIn, Google Search, Microsoft Ads, and OpenAI Sponsored Search",
          "Produce animated data proof reel in AfterTron/FilmTron and lead-capture landing page in FigTron",
          "Sync qualified offline deal stages from HubSpot CRM back to ad platforms via tarweeg.connectors.sync"
        ]
      },
      {
        id: "tarweeg.wf.roas_guard_and_budget_rebalancer",
        labelEn: "24/7 Autonomous ROAS Guard & Cross-Platform Budget Rebalancer",
        labelAr: "الحارس الذكي للميزانية وإعادة توزيع الإنفاق بين المنصات التسع حسب العائد",
        steps: [
          "Sync real-time spend and conversion value across all 9 providers into MariaDB",
          "Pause bleeding ad sets exceeding CPA stop-loss and scale winning ad sets by +15% daily budget"
        ]
      },
      {
        id: "tarweeg.wf.ramadan_white_friday_mega_seasonal",
        labelEn: "Seasonal Mega-Sale War-Room (White Friday / Ramadan / National Day)",
        labelAr: "غرفة عمليات المواسم الكبرى (الجمعة البيضاء / رمضان / اليوم الوطني)",
        steps: [
          "Pre-warm retargeting audiences 7 days prior with GemiMotion 3D teaser videos across TikTok, Snap, Reels & YouTube",
          "Launch synchronized 9-platform conversion blitz with countdown creatives from PhotoTron/AfterTron and hourly ROAS guardrails"
        ]
      }
    ])
  })
});

export function getAppKnowledgeAndSkills(appId = "rankly") {
  const clean = String(appId || "rankly").trim().toLowerCase();
  const aliasMap = {
    seo: "rankly",
    ads: "tarweeg",
    photo: "phototron",
    after: "aftertron",
    film: "filmtron",
    motion: "gemimotion",
    fig: "figtron",
    light: "lighttron",
    scale: "scaletron"
  };
  const resolved = aliasMap[clean] || clean;
  return APP_KNOWLEDGE_SKILLS_REGISTRY[resolved] || null;
}

export function listAllNineAppsKnowledgeCatalog() {
  const apps = NINE_CORE_APPS.map((id) => APP_KNOWLEDGE_SKILLS_REGISTRY[id]);
  const totalSkills = apps.reduce((acc, a) => acc + (a.skills?.length || 0), 0);
  const totalWorkflows = apps.reduce((acc, a) => acc + (a.workflows?.length || 0), 0);
  const totalPlaybooks = apps.reduce(
    (acc, a) => acc + (a.knowledgeBase?.diagnosticPlaybooks?.length || 0),
    0
  );
  const totalMcpBindings = apps.reduce(
    (acc, a) => acc + (a.knowledgeBase?.mcpToolBindings?.length || 0),
    0
  );
  return {
    ok: true,
    schema: KNOWLEDGE_SKILLS_SCHEMA,
    totalApps: NINE_CORE_APPS.length,
    totalSkills,
    totalWorkflows,
    totalPlaybooks,
    totalMcpBindings,
    apps
  };
}
