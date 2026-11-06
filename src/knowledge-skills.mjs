/**
 * @gemitron/agy-tron — 9-App Domain Knowledgebase, Skills & Workflows Registry (`src/knowledge-skills.mjs`)
 *
 * Covers all 9 core applications controlled by AGYTron:
 *   1. PhotoTron  (phototron)  — Raster compositing, Arabic HarfBuzz typography, 4-ratio Key Art
 *   2. AfterTron  (aftertron)  — VFX, 3D camera tracking, easy-ease keyframe choreography
 *   3. FilmTron   (filmtron)   — 3-Act NLE editorial, Lumetri color, Fairlight -14 LUFS audio
 *   4. GemiMotion (gemimotion) — 3D PBR + WGSL Shader motion, 48kHz Vibe Score, Auto-SFX
 *   5. FigTron    (figtron)    — Design tokens, RTL/LTR auto-layout UI/UX & interactive prototypes
 *   6. LightTron  (lighttron)  — RAW photographic develop, filmic curves & batch look calibration
 *   7. ScaleTron  (scaletron)  — Edge-directed steerable SR (2x-16x), OKLab filtering & neural upscale
 *   8. Rankly     (rankly)     — d4vinci/Scrapling stealth spider, 12 APIs, 27 recipes, Tier 1-2-3 link wheels & Spintax
 *   9. Tarweeg    (tarweeg)    — 9-Platform Advertising OS, LaunchSaga, 4-ratio creatives & 5 CAPI/CRM connectors
 */

export const KNOWLEDGE_SKILLS_SCHEMA = "tronagy.knowledge_skills_workflows.v1";

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
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Preserve non-destructive smart layer stacks, vector masks, and adjustment layers in .pcraft documents.",
        "Shape Arabic display headlines via HarfBuzz RTL with Cairo/Tajawal/Readex Pro and enforce WCAG >= 4.5:1 contrast.",
        "Export ad & SEO visuals across all 4 canonical aspect ratios: 1:1 (1080x1080), 4:5 (1080x1350), 9:16 (1080x1920), and 1.91:1 (1200x628)."
      ],
      invariants: [
        "Never flatten editable text layers before final raster export.",
        "Never substitute real hero product photography with primitive shapes."
      ]
    }),
    skills: Object.freeze([
      {
        id: "skill.phototron.arabic_key_art",
        labelEn: "Arabic RTL Key Art & Poster Compositor",
        labelAr: "تصميم البوسترات والخطوط العربية الإعلانية",
        model: "gemini-4-argon-high",
        tools: ["photo.document.place", "photo.text.create", "photo.layerStyle.dropShadow"]
      },
      {
        id: "skill.phototron.product_retouch",
        labelEn: "Non-Destructive Hero Product Retouching",
        labelAr: "معالجة صور المنتجات الاحترافية غير المدمرة",
        model: "claude-sonnet-5-5-high",
        tools: ["photo.adjustment.curves", "photo.adjustment.levels", "photo.mask.revealAll"]
      },
      {
        id: "skill.phototron.infographic_linkbait",
        labelEn: "High-DR SEO Infographic & OpenGraph Designer",
        labelAr: "تصميم إنفوجرافيك السيو وبطاقات المشاركة",
        model: "gemini-4-argon-high",
        tools: ["photo.document.place", "photo.text.create", "photo.adjustment.curves"]
      }
    ]),
    workflows: Object.freeze([
      {
        id: "wf.phototron.4ratio_ad_pack",
        labelEn: "4-Ratio Ad Key Art Pack (for Tarweeg)",
        labelAr: "حزمة إعلانات ٤ مقاسات (لمنصة ترويج)",
        steps: [
          "Place upscaled hero asset from ScaleTron/LightTron onto non-destructive smart layer",
          "Apply Curves & Levels tonal separation and subtle drop shadow",
          "Typeset bilingual Arabic/English headline & CTA badge with WCAG >= 4.5:1 contrast",
          "Render 1:1, 4:5, 9:16, and 1.91:1 master exports for Tarweeg LaunchSaga"
        ]
      },
      {
        id: "wf.phototron.seo_infographic_card",
        labelEn: "Linkable E-E-A-T Infographic (for Rankly Tier 1)",
        labelAr: "إنفوجرافيك مرجعي لبناء الباك لينك (لرانكلي)",
        steps: [
          "Structure 5-point visual data summary from Rankly SERP/PAA research",
          "Compose branded diagram & citation footer with domain watermark",
          "Export WebP/PNG for Telegraph, Dev.to, Medium, and WordPress Tier 1 embeds"
        ]
      }
    ])
  }),

  aftertron: Object.freeze({
    appId: "aftertron",
    name: "AfterTron",
    arName: "أفتر ترون",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Align all keyframes to the 254,016,000,000 ticks/sec rational frame clock.",
        "Apply continuous cubic-bezier easy-ease velocity curves on all primary spatial/opacity transforms.",
        "Maintain clean track matte and optical glow adjustment layer hierarchy in .acraft compositions."
      ],
      invariants: [
        "Zero linear/jerky motion on hero product or typography entrances.",
        "Respect Title/Action Safe margins across 9:16 vertical and 16:9 widescreen comps."
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
      }
    ])
  }),

  filmtron: Object.freeze({
    appId: "filmtron",
    name: "FilmTron",
    arName: "فيلم ترون",
    recommendedModel: "claude-opus-5-5-medium",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Structure commercial and explainer edits using 3-Act pacing (0-3s Hook, 3-12s Value/Proof, 12-15s CTA).",
        "Enforce Rec.709 luminance bounds and skin-tone vectorscope protection in Lumetri color grading.",
        "Normalize master audio to -14.0 LUFS broadcast standard with -6dB Fairlight voiceover ducking."
      ],
      invariants: [
        "Zero frame-boundary rounding errors.",
        "Burned-in or sidecar captions must stay inside the vertical 9:16 safe zone."
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
        labelEn: "60s Authority Explainer Video (for Rankly Video Backlinks)",
        labelAr: "فيديو شرح مرجعي ٦٠ ثانية لبناء باك لينك الفيديو",
        steps: [
          "Cut educational 3-point summary from Rankly article script",
          "Add bilingual captions and CTA watermark pointing to target Money Site URL"
        ]
      }
    ])
  }),

  gemimotion: Object.freeze({
    appId: "gemimotion",
    name: "GemiMotion",
    arName: "جيمي موشن",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Operate on exact integer Qt6 flicks (705,600,000 flicks/second) using gemimotion-recipe/v3.",
        "Combine WGSL ShaderWorld backgrounds, 3D PBR Scene3D models, and Karaoke captions.",
        "Synthesize 48kHz stereo Vibe Soundtrack aligned to beat-grid with 6 frame-accurate SFX cues."
      ],
      invariants: [
        "Zero SafeRect title/action margin violations.",
        "Validate expectedStateVersion before executing native timeline mutations."
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
        labelEn: "48kHz Vibe Soundtrack & Frame-Accurate SFX",
        labelAr: "تأليف الموسيقى التصويرية والمؤثرات الصوتية المتزامنة",
        model: "gemini-4-argon-medium",
        tools: ["motion.timeline.clip.daw", "motion.timeline.clip.keyframe.add", "motion.caption.upsert"]
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
      }
    ])
  }),

  figtron: Object.freeze({
    appId: "figtron",
    name: "FigTron",
    arName: "فيج ترون",
    recommendedModel: "claude-sonnet-5-5-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Bind 100% of colors, spacing, and typography to design tokens (zero hardcoded hex values).",
        "Enforce automatic RTL/LTR auto-layout mirroring for Arabic and English viewports.",
        "Define complete interactive component state matrices (default, hover, focus, disabled)."
      ],
      invariants: [
        "Every landing page or embed chart must pass WCAG AA contrast and mobile responsive constraints.",
        "Zero hardcoded hex colors; 100% design token variable binding across light and dark modes."
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
      }
    ])
  }),

  lighttron: Object.freeze({
    appId: "lighttron",
    name: "LightTron",
    arName: "لايت ترون",
    recommendedModel: "gemini-3.8-flash-high",
    recommendedEffort: "medium",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Keep highlight and shadow clipping strictly below 0.5% of total pixels.",
        "Store all adjustments as non-destructive parametric XMP sidecar history.",
        "Synchronize white balance and HSL color calibration across entire product catalog shoots."
      ],
      invariants: [
        "Never overwrite raw sensor data.",
        "Maintain uniform Kelvin color temperature across multi-SKU catalog batches."
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
      }
    ])
  }),

  scaletron: Object.freeze({
    appId: "scaletron",
    name: "ScaleTron",
    arName: "سكيل ترون",
    recommendedModel: "gemini-3.8-flash-high",
    recommendedEffort: "medium",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Enforce 3x3 source range clamping to guarantee zero ringing or overshoot halos.",
        "Use OKLab guided chroma filtering and steerable edge-directed super-resolution at 2x/4x/8x/16x.",
        "Ensure seamless tile continuity and positive acutance delta on all upscaled assets."
      ],
      invariants: [
        "Zero tile boundary seams at 4x/8x/16x magnification.",
        "Strictly positive acutance delta with zero ringing halo artifacts."
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
      }
    ])
  }),

  rankly: Object.freeze({
    appId: "rankly",
    name: "Rankly",
    arName: "رانكلي (الأتمتة والسيو)",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Use d4vinci/Scrapling v0.5 (StealthyFetcher, DynamicFetcher, Fetcher) with adaptive=True self-healing DOM relocation.",
        "Publish across 12 zero-cost API adapters (Telegraph, Dev.to, Hashnode, Medium, Ghost, WordPress REST/XML-RPC, Blogger, Tumblr, GitHub Gist, Mastodon, Discourse, MediaWiki) and 27 stealth browser recipes across 1,000 classified sources.",
        "Enforce natural anchor-text safety ratios across Tier 1 -> Tier 2 -> Tier 3 topologies (35% branded, 25% naked URL, 20% generic, 15% topical partial-match, <= 5% exact-match).",
        "Generate deeply nested {a|b|{c|d}} Spintax with >= 75% shingle uniqueness and embed TronCS infographics/videos.",
        "Force-index verified backlinks via Ping-O-Matic XML-RPC, WebSub/PubSubHubbub, RSS feeds, Archive.org Wayback, and IndexNow."
      ],
      invariants: [
        "Zero paid third-party SEO APIs; 100% zero-cost native protocols & Scrapling.",
        "Zero fabricated URLs or fake crc32/md5 backlink metrics."
      ]
    }),
    skills: Object.freeze([
      {
        id: "rankly.tiered_link_architect",
        aliases: ["skill.rankly.tiered_wheel_architect"],
        labelEn: "Tier 1→2→3 Link Wheel & Anchor Ratio Architect",
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
        id: "rankly.zero_cost_indexer",
        aliases: ["skill.rankly.zero_cost_indexer"],
        labelEn: "Zero-Cost Multi-Protocol Backlink Indexer",
        labelAr: "مُفهرس الباك لينك الفوري المجاني (IndexNow + WebSub + Ping-O-Matic)",
        model: "gemini-3.8-flash-medium",
        tools: ["rankly.indexer.ping", "rankly.backlinks.verify"]
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
          "Fire Tier 3 Ping-O-Matic, WebSub, Wayback & IndexNow pings and verify live dofollow DOM links"
        ]
      },
      {
        id: "rankly.wf.scrapling_audit_and_footprint_harvest",
        aliases: ["wf.rankly.scrapling_audit_and_footprint_harvest"],
        labelEn: "Deep Scrapling Technical Audit & Web 2.0 Footprint Harvester",
        labelAr: "الفحص التقني العميق واكتشاف منصات النشر الجديدة عبر Scrapling",
        steps: [
          "Run rankly.scrapling.audit to inspect status codes, canonicals, headings, JSON-LD, and broken links",
          "Harvest new high-DR CMS targets using rankly.scrapling.footprints and probe signup forms"
        ]
      }
    ])
  }),

  tarweeg: Object.freeze({
    appId: "tarweeg",
    name: "Tarweeg",
    arName: "ترويج (منصة الإعلانات الموحدة)",
    recommendedModel: "gemini-4-argon-high",
    recommendedEffort: "high",
    knowledgeBase: Object.freeze({
      domainRules: [
        "Compile and execute campaigns across all 9 real AdvertisingProviderInterface adapters: Google Ads (Search, PMax, Shopping, YouTube, DemandGen), Meta (Image, Reels, Carousel, Catalog DPA, LeadGen, Click-to-WhatsApp CTWA), TikTok (Video, Spark Ads, Carousel, Shopping; Saudi Geo ID = 102358), Snapchat (Single, Story, Collection), OpenAI Ads (Sponsored Search/Chat/Feed), LinkedIn, X, Pinterest, and Microsoft Ads.",
        "Execute mutations atomically through LaunchSagaCoordinatorService (campaign_create -> adset_create -> ad_create -> budget_set) with MultiNetworkMutationGuardService compensating rollbacks.",
        "Produce studio-grade 4-ratio raster & video creatives via TronCS (LightTron -> ScaleTron -> PhotoTron -> GemiMotion/AfterTron/FilmTron -> FigTron) and local ImageCreativeService.",
        "Sync real server-side conversions and orders from Shopify, Salla, Zid, WooCommerce, and HubSpot CRM to maximize EMQ and ROAS."
      ],
      invariants: [
        "Never use fake sha256 entity IDs or unpersisted in-memory ReadSync.",
        "Enforce workspace tenant isolation and idempotent approval assertions on live spend mutations."
      ]
    }),
    skills: Object.freeze([
      {
        id: "tarweeg.9platform_saga_compiler",
        aliases: ["skill.tarweeg.9platform_saga_compiler"],
        labelEn: "9-Platform LaunchSaga Campaign Architect",
        labelAr: "مهندس إطلاق الحملات الموحدة عبر ٩ منصات إعلانية",
        model: "gemini-4-argon-high",
        tools: ["tarweeg.campaign.launch_saga", "tarweeg.audiences.manage", "tarweeg.providers.sync"]
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
        id: "tarweeg.capi_roas_autopilot",
        aliases: ["skill.tarweeg.capi_roas_autopilot"],
        labelEn: "Shopify/Salla/Zid/Woo/HubSpot CAPI & ROAS Guard Brain",
        labelAr: "محلل التتبع (CAPI) وحارس الميزانية والعائد الإعلاني (ROAS)",
        model: "claude-sonnet-5-5-high",
        tools: ["tarweeg.connectors.sync", "tarweeg.campaign.budget.update", "tarweeg.reporting.daily_brief"]
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
          "Trigger TronCS pipeline: LightTron color grade -> ScaleTron 4x upscale -> PhotoTron 4-ratio posters -> GemiMotion/AfterTron/FilmTron vertical video ad",
          "Compile platform payloads and execute 4-step LaunchSaga with CAPI tracking enabled"
        ]
      },
      {
        id: "tarweeg.wf.winning_ad_to_rankly_seo",
        aliases: ["wf.tarweeg.winning_ad_to_rankly_seo"],
        labelEn: "Cross-Service Growth Loop: Winning Ad Keywords -> Rankly 3-Tier SEO",
        labelAr: "حلقة النمو المشترك: تحويل الكلمات الإعلانية الرابحة في ترويج إلى تصدر عضوي في رانكلي",
        steps: [
          "Sync Shopify/Salla/Zid conversion attribution and identify highest-ROAS search queries & ad hooks in Tarweeg",
          "Send winning keywords and landing URLs to Rankly to build Tier 1->2->3 link wheels and E-E-A-T articles automatically"
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
  return {
    ok: true,
    schema: KNOWLEDGE_SKILLS_SCHEMA,
    totalApps: NINE_CORE_APPS.length,
    totalSkills,
    totalWorkflows,
    apps
  };
}

