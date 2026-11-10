import React, { useEffect, useMemo, useState } from 'react';

export type TronCsAppId =
  | 'phototron'
  | 'aftertron'
  | 'filmtron'
  | 'gemimotion'
  | 'figtron'
  | 'lighttron'
  | 'scaletron';

export type AgyFleetDeviceId = 'win-local' | 'mac-local' | 'vps-01' | 'vps-02';

export type AgyExecutionScope = 'device-fleet' | 'account-remote-agent';

export type AgyModelId =
  | 'gemini-4-argon-high'
  | 'gemini-4-argon-medium'
  | 'gemini-4-argon-low'
  | 'gemini-3.8-flash-high'
  | 'gemini-3.8-flash-medium'
  | 'gemini-3.8-flash-low'
  | 'claude-opus-5-5-high'
  | 'claude-opus-5-5-medium'
  | 'claude-opus-5-5-low'
  | 'claude-sonnet-5-5-high'
  | 'claude-sonnet-5-5-medium'
  | 'claude-sonnet-5-5-low'
  | 'gpt-oss-120b-medium'
  | 'qwen3.5:4b-q4_K_M'
  | 'gemini-3.1-pro'
  | 'gemini-3-flash'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6';

export type AgyEffortTier = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface FleetDeviceLiveStatus {
  state: 'online' | 'checking' | 'offline';
  online: boolean;
  checking: boolean;
  latencyMs: number;
}

export interface QuotaFamilyPill {
  familyId: string;
  labelAr: string;
  labelEn: string;
  remainingPct: number;
}

export interface TronAgyPlanRequest {
  prompt: string;
  apps: TronCsAppId[];
  skillId?: string;
  workflowId?: string;
  executionScope?: AgyExecutionScope;
  deviceId: AgyFleetDeviceId;
  deviceAddress: string;
  remoteAgentRelayUrl?: string | null;
  model: AgyModelId;
  effort: AgyEffortTier;
  locale: 'ar-EG' | 'en-US';
}

export interface TronAgyControlCenterProps {
  locale?: 'ar-EG' | 'en-US';
  defaultApp?: TronCsAppId;
  fetchImpl?: typeof fetch;
  onExecutePlan?: (req: TronAgyPlanRequest) => void;
}

export const FLEET_ADDRESSES_STORAGE_KEY = 'agy.fleet.addresses.v1';
export const FLEET_ACTIVE_NODE_STORAGE_KEY = 'agy.fleet.activeNode.v1';
export const FLEET_EXECUTION_SCOPE_STORAGE_KEY = 'agy.fleet.executionScope.v1';
export const REMOTE_AGENT_RELAY_URL = 'https://mcp.gemitron.net/v1/agy/remote-agent';

export const AGY_MODEL_CATALOG: Array<{
  id: AgyModelId;
  labelAr: string;
  labelEn: string;
  familyId: string;
}> = [
  { id: 'gemini-4-argon-high', labelAr: 'Gemini 4 Argon (High) ✦', labelEn: 'Gemini 4 Argon (High) ✦', familyId: 'gemini-4-argon' },
  { id: 'gemini-4-argon-medium', labelAr: 'Gemini 4 Argon (Medium)', labelEn: 'Gemini 4 Argon (Medium)', familyId: 'gemini-4-argon' },
  { id: 'gemini-4-argon-low', labelAr: 'Gemini 4 Argon (Low)', labelEn: 'Gemini 4 Argon (Low)', familyId: 'gemini-4-argon' },
  { id: 'gemini-3.8-flash-high', labelAr: 'Gemini 3.8 Flash (High) ⚡', labelEn: 'Gemini 3.8 Flash (High) ⚡', familyId: 'gemini-3.8-flash' },
  { id: 'gemini-3.8-flash-medium', labelAr: 'Gemini 3.8 Flash (Medium)', labelEn: 'Gemini 3.8 Flash (Medium)', familyId: 'gemini-3.8-flash' },
  { id: 'gemini-3.8-flash-low', labelAr: 'Gemini 3.8 Flash (Low)', labelEn: 'Gemini 3.8 Flash (Low)', familyId: 'gemini-3.8-flash' },
  { id: 'claude-opus-5-5-high', labelAr: 'Claude Opus 5.5 (High) 🎬', labelEn: 'Claude Opus 5.5 (High) 🎬', familyId: 'claude-opus-5-5' },
  { id: 'claude-opus-5-5-medium', labelAr: 'Claude Opus 5.5 (Medium)', labelEn: 'Claude Opus 5.5 (Medium)', familyId: 'claude-opus-5-5' },
  { id: 'claude-opus-5-5-low', labelAr: 'Claude Opus 5.5 (Low)', labelEn: 'Claude Opus 5.5 (Low)', familyId: 'claude-opus-5-5' },
  { id: 'claude-sonnet-5-5-high', labelAr: 'Claude Sonnet 5.5 (High)', labelEn: 'Claude Sonnet 5.5 (High)', familyId: 'claude-sonnet-5-5' },
  { id: 'claude-sonnet-5-5-medium', labelAr: 'Claude Sonnet 5.5 (Medium)', labelEn: 'Claude Sonnet 5.5 (Medium)', familyId: 'claude-sonnet-5-5' },
  { id: 'claude-sonnet-5-5-low', labelAr: 'Claude Sonnet 5.5 (Low)', labelEn: 'Claude Sonnet 5.5 (Low)', familyId: 'claude-sonnet-5-5' },
  { id: 'gpt-oss-120b-medium', labelAr: 'GPT-OSS 120B (Medium)', labelEn: 'GPT-OSS 120B (Medium)', familyId: 'gpt-oss-120b' },
  { id: 'qwen3.5:4b-q4_K_M', labelAr: 'Local TRON Qwen 3.5 🔒', labelEn: 'Local TRON Qwen 3.5 🔒', familyId: 'local-tron' },
];

export const AGY_EFFORT_CATALOG: Array<{
  id: AgyEffortTier;
  labelAr: string;
  labelEn: string;
  tokens: number;
  passes: number;
}> = [
  { id: 'low', labelAr: 'سريع (1,024t · 1)', labelEn: 'Low (1,024t · 1 Pass)', tokens: 1024, passes: 1 },
  { id: 'medium', labelAr: 'متوازن (4,096t · 2)', labelEn: 'Medium (4,096t · 2 Passes)', tokens: 4096, passes: 2 },
  { id: 'high', labelAr: 'عميق (16,384t · 3)', labelEn: 'High (16,384t · 3 Passes)', tokens: 16384, passes: 3 },
  { id: 'xhigh', labelAr: 'فائق الدقة (24,576t · 4)', labelEn: 'XHigh (24,576t · 4 Passes)', tokens: 24576, passes: 4 },
  { id: 'max', labelAr: 'إتقان كامل ✦ (32,768t · 5)', labelEn: 'Max ✦ (32,768t · 5 Passes)', tokens: 32768, passes: 5 },
];

export const DEFAULT_QUOTA_FAMILIES: QuotaFamilyPill[] = [
  { familyId: 'gemini-4-argon', labelAr: 'Gemini 4 Argon', labelEn: 'Gemini 4 Argon', remainingPct: 100 },
  { familyId: 'gemini-3.8-flash', labelAr: 'Gemini 3.8 Flash', labelEn: 'Gemini 3.8 Flash', remainingPct: 100 },
  { familyId: 'claude-opus-5-5', labelAr: 'Claude Opus 5.5', labelEn: 'Claude Opus 5.5', remainingPct: 100 },
  { familyId: 'claude-sonnet-5-5', labelAr: 'Claude Sonnet 5.5', labelEn: 'Claude Sonnet 5.5', remainingPct: 100 },
  { familyId: 'gpt-oss-120b', labelAr: 'GPT-OSS 120B', labelEn: 'GPT-OSS 120B', remainingPct: 100 },
  { familyId: 'local-tron', labelAr: 'Local TRON ∞', labelEn: 'Local TRON ∞', remainingPct: 100 },
];

export const APP_SKILLS_AND_WORKFLOWS: Record<
  TronCsAppId,
  {
    skills: Array<{ id: string; ar: string; en: string }>;
    workflows: Array<{ id: string; ar: string; en: string }>;
  }
> = {
  phototron: {
    skills: [
      { id: 'skill.phototron.arabic_key_art', ar: 'تصميم البوسترات والخطوط العربية (٤ مقاسات)', en: 'Arabic RTL Key Art & 4-Ratio Poster' },
      { id: 'skill.phototron.product_retouch', ar: 'معالجة وعزل صور المنتجات غير المدمرة', en: 'Non-Destructive Product Retouch & Mask' },
      { id: 'skill.phototron.infographic_linkbait', ar: 'تصميم إنفوجرافيك السيو وبطاقات المشاركة', en: 'High-DR SEO Infographic Designer' },
      { id: 'skill.phototron.gbp_local_offer_card', ar: 'بطاقات عروض خرائط جوجل (GBP)', en: 'Google Business Profile Offer Card' },
    ],
    workflows: [
      { id: 'wf.phototron.4ratio_ad_pack', ar: 'حزمة إعلانات ٤ مقاسات (ترويج)', en: '4-Ratio Ad Key Art Pack' },
      { id: 'wf.phototron.seo_infographic_card', ar: 'إنفوجرافيك مرجعي لبناء الباك لينك', en: 'Linkable E-E-A-T Infographic' },
      { id: 'wf.phototron.gbp_and_social_bundle', ar: 'حزمة صور خرائط جوجل والمشاركة', en: 'Local SEO GBP + OpenGraph Bundle' },
    ],
  },
  aftertron: {
    skills: [
      { id: 'skill.aftertron.kinetic_arabic_typography', ar: 'تحريك النصوص السينمائية', en: 'Kinetic Arabic & English Typography' },
      { id: 'skill.aftertron.vfx_optical_glow', ar: 'تتبع الكاميرا 3D والتوهج البصري', en: '3D Camera Callouts & Optical Glow' },
      { id: 'skill.aftertron.animated_data_charts', ar: 'تحريك الرسوم البيانية وإحصائيات النمو', en: 'Animated ROI & SEO Data Charts' },
      { id: 'skill.aftertron.logo_sonic_stinger', ar: 'تحريك الشعار وبطاقة النهاية', en: 'Brand Logo Reveal & End-Card Stinger' },
    ],
    workflows: [
      { id: 'wf.aftertron.hero_product_reveal', ar: 'مقدمة خطاف بصري ٣ ثوانٍ لريلز وتيك توك', en: '3-Second Hook & Product VFX Reveal' },
      { id: 'wf.aftertron.animated_case_study_reel', ar: 'فيديو دراسة حالة متحرك بالبيانات', en: 'Animated Case Study & Data Proof Reel' },
    ],
  },
  filmtron: {
    skills: [
      { id: 'skill.filmtron.3act_commercial_cut', ar: 'مونتاج الإعلانات ثلاثية الفصول', en: '3-Act Direct-Response Ad Editor' },
      { id: 'skill.filmtron.lumetri_fairlight_master', ar: 'تلوين Lumetri ومكساج Fairlight (-14 LUFS)', en: 'Lumetri Grade & -14 LUFS Mix' },
      { id: 'skill.filmtron.youtube_seo_chapter_editor', ar: 'مونتاج يوتيوب المتوافق مع السيو', en: 'YouTube SEO & Chapter Producer' },
      { id: 'skill.filmtron.multi_ratio_reframe', ar: 'إعادة تأطير 9:16 و16:9 و1:1', en: 'Multi-Platform Video Reframer' },
    ],
    workflows: [
      { id: 'wf.filmtron.tiktok_reels_shorts_master', ar: 'ماستر فيديو إعلاني لـ TikTok وReels', en: 'Vertical Video Ad Master' },
      { id: 'wf.filmtron.explainer_video_backlink', ar: 'فيديو شرح مرجعي ٦٠ ثانية', en: '60s Authority Explainer Video' },
      { id: 'wf.filmtron.b2b_linkedin_spotlight', ar: 'فيديو إعلاني احترافي للشركات', en: 'B2B Executive Video Ad' },
    ],
  },
  gemimotion: {
    skills: [
      { id: 'skill.gemimotion.pbr_3d_shader_director', ar: 'إخراج مشاهد 3D PBR وشيدر WGSL', en: '3D PBR Scene & WGSL Shader Director' },
      { id: 'skill.gemimotion.vibe_audio_sfx', ar: 'تأليف الموسيقى التصويرية والمؤثرات 48kHz', en: '48kHz Vibe Soundtrack & SFX Composer' },
      { id: 'skill.gemimotion.karaoke_rtl_captions', ar: 'مزامنة الكابشن العربي التفاعلي', en: 'Beat-Synced Arabic RTL Karaoke Captions' },
      { id: 'skill.gemimotion.interactive_webgl_embed', ar: 'مشهد 3D تفاعلي لصفحات الهبوط', en: 'Interactive 3D Hero Loop' },
    ],
    workflows: [
      { id: 'wf.gemimotion.luxury_arabic_commercial', ar: 'إعلان 3D عربي فاخر بموسيقى Vibe', en: 'Luxury Arabic 3D Commercial' },
      { id: 'wf.gemimotion.social_reel_loop', ar: 'فيديو 3D حلقي متكرر (Seamless Loop)', en: 'Seamless 9:16 Viral 3D Loop' },
      { id: 'wf.gemimotion.dwell_time_hero_motion', ar: 'مشهد تفاعلي لرفع مدة بقاء الزائر', en: 'Landing Page Dwell-Time Booster' },
    ],
  },
  figtron: {
    skills: [
      { id: 'skill.figtron.conversion_landing_ui', ar: 'تصميم صفحات الهبوط عالية التحويل', en: 'High-Converting Landing Page UI' },
      { id: 'skill.figtron.seo_data_study_chart', ar: 'جداول المقارنة التفاعلية للسيو', en: 'Interactive Data Study Matrix' },
      { id: 'skill.figtron.clarity_ux_remediator', ar: 'معالج احتكاك تجربة المستخدم (Clarity)', en: 'Clarity Rage-Click UX Healer' },
      { id: 'skill.figtron.cls_cwv_layout_guard', ar: 'ضابط استقرار التخطيط (Zero CLS)', en: 'Core Web Vitals CLS Stabilizer' },
    ],
    workflows: [
      { id: 'wf.figtron.ad_landing_funnel', ar: 'صفحة هبوط لحملات ترويج الإعلانية', en: 'Ad-to-Landing Conversion Funnel' },
      { id: 'wf.figtron.clarity_crux_ux_overhaul', ar: 'إعادة هندسة الواجهة ببيانات Clarity وCrUX', en: 'Clarity + CrUX UX Overhaul' },
    ],
  },
  lighttron: {
    skills: [
      { id: 'skill.lighttron.raw_catalog_develop', ar: 'تحميض الصور الخام ومعايرة الألوان', en: 'RAW Product Develop & Filmic Tone' },
      { id: 'skill.lighttron.radial_mask_batch_sync', ar: 'الأقنعة الشعاعية ومزامنة الكتالوج', en: 'Radial Masking & Multi-Shoot Sync' },
      { id: 'skill.lighttron.google_images_exif_seo', ar: 'تحسين بيانات EXIF/IPTC للسيو', en: 'Google Images EXIF/IPTC Enricher' },
      { id: 'skill.lighttron.skin_tone_portrait_grade', ar: 'معايرة ألوان البشرة والبورتريه', en: 'Natural Skin-Tone Portrait Colorist' },
    ],
    workflows: [
      { id: 'wf.lighttron.ecommerce_catalog_grade', ar: 'توحيد ألوان كتالوج المتجر', en: 'Batch E-Commerce Catalog Color Sync' },
      { id: 'wf.lighttron.local_seo_photo_pack', ar: 'حزمة صور خرائط جوجل وبحث الصور', en: 'GBP & Image Search Authority Pack' },
    ],
  },
  scaletron: {
    skills: [
      { id: 'skill.scaletron.zero_halo_upscale', ar: 'تكبير ٤-٨ أضعاف بدون هالات + WebP', en: '4x/8x Zero-Halo Super-Resolution' },
      { id: 'skill.scaletron.xbr_pixel_vector_restore', ar: 'استعادة حواف الشعارات (xBR)', en: 'xBR Logo & Icon Edge Restoration' },
      { id: 'skill.scaletron.cwv_lcp_image_surgeon', ar: 'مسرّع مؤشر LCP عبر ضغط الصور', en: 'Core Web Vitals LCP Image Compressor' },
      { id: 'skill.scaletron.ugc_ad_frame_enhancer', ar: 'تحسين صور ومصغرات الإعلانات', en: 'Low-Light UGC Thumbnail Restorer' },
    ],
    workflows: [
      { id: 'wf.scaletron.ad_and_seo_asset_master', ar: 'ماستر تكبير صور الإعلانات والسيو', en: 'Ultra-Sharp Asset Upscale' },
      { id: 'wf.scaletron.pagespeed_lcp_auto_remediation', ar: 'معالجة بطء الصور في PageSpeed', en: 'PageSpeed LCP Auto-Remediation' },
    ],
  },
};

export const DEFAULT_FLEET_DEVICE_ADDRESSES: Record<AgyFleetDeviceId, string> = {
  'win-local': '192.168.1.10:18220',
  'mac-local': '192.168.1.20:18220',
  'vps-01': 'https://mcp.gemitron.net',
  'vps-02': '185.220.101.42:18220',
};

const FLEET_DEVICES: Array<{
  id: AgyFleetDeviceId;
  ar: string;
  en: string;
  roleAr: string;
  roleEn: string;
  defaultAddress: string;
  baseLatencyMs: number;
}> = [
  {
    id: 'win-local',
    ar: '💻 جهاز Windows المحلي',
    en: '💻 Windows PC (Local LAN)',
    roleAr: 'الشبكة المحلية (LAN) · اتصال مباشر',
    roleEn: 'Local LAN Workstation · Direct Link',
    defaultAddress: DEFAULT_FLEET_DEVICE_ADDRESSES['win-local'],
    baseLatencyMs: 4,
  },
  {
    id: 'mac-local',
    ar: '🍎 جهاز Mac Studio المحلي',
    en: '🍎 Mac Studio (Local LAN)',
    roleAr: 'الشبكة المحلية (LAN) · Apple Silicon',
    roleEn: 'Local LAN Apple Silicon Workstation',
    defaultAddress: DEFAULT_FLEET_DEVICE_ADDRESSES['mac-local'],
    baseLatencyMs: 6,
  },
  {
    id: 'vps-01',
    ar: '☁️ خادم VPS 01 (الرئيسي)',
    en: '☁️ Linux VPS 01 (Main Hub)',
    roleAr: 'السيرفر المستضيف لـ gemitron.net',
    roleEn: 'Primary Server hosting gemitron.net',
    defaultAddress: DEFAULT_FLEET_DEVICE_ADDRESSES['vps-01'],
    baseLatencyMs: 36,
  },
  {
    id: 'vps-02',
    ar: '🚀 خادم VPS 02 (المنفصل)',
    en: '🚀 Linux VPS 02 (Standalone)',
    roleAr: 'سيرفر Linux المنفصل للمشاريع الثقيلة',
    roleEn: 'Standalone Linux Server for Heavy Render',
    defaultAddress: DEFAULT_FLEET_DEVICE_ADDRESSES['vps-02'],
    baseLatencyMs: 42,
  },
];

const APP_CATALOG: Array<{
  id: TronCsAppId;
  name: string;
  ar: string;
}> = [
  { id: 'phototron', name: 'PhotoTron', ar: 'فوتو ترون' },
  { id: 'aftertron', name: 'AfterTron', ar: 'أفتر ترون' },
  { id: 'filmtron', name: 'FilmTron', ar: 'فيلم ترون' },
  { id: 'gemimotion', name: 'GemiMotion', ar: 'جيمي موشن' },
  { id: 'figtron', name: 'FigTron', ar: 'فيج ترون' },
  { id: 'lighttron', name: 'LightTron', ar: 'لايت ترون' },
  { id: 'scaletron', name: 'ScaleTron', ar: 'سكيل ترون' },
];

export function normalizeNodeEndpoint(rawAddress = '', defaultPort = 18220): string {
  const trimmed = String(rawAddress || '')
    .trim()
    .replace(/\/+$/, '');
  if (!trimmed) return `http://127.0.0.1:${defaultPort}`;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const hasPort = /:\d+$/.test(trimmed);
  return `http://${trimmed}${hasPort ? '' : `:${defaultPort}`}`;
}

function readStoredFleetAddresses(): Record<AgyFleetDeviceId, string> {
  const base: Record<AgyFleetDeviceId, string> = { ...DEFAULT_FLEET_DEVICE_ADDRESSES };
  if (typeof window === 'undefined' || !window.localStorage) {
    return base;
  }
  try {
    const raw = window.localStorage.getItem(FLEET_ADDRESSES_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Record<AgyFleetDeviceId, string>>;
    for (const id of ['win-local', 'mac-local', 'vps-01', 'vps-02'] as const) {
      if (typeof parsed?.[id] === 'string' && parsed[id]!.trim().length > 0) {
        base[id] = parsed[id]!.trim();
      }
    }
    return base;
  } catch {
    return base;
  }
}

function readStoredActiveDevice(): AgyFleetDeviceId {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'win-local';
  }
  try {
    const raw = window.localStorage.getItem(FLEET_ACTIVE_NODE_STORAGE_KEY);
    if (
      raw === 'win-local' ||
      raw === 'mac-local' ||
      raw === 'vps-01' ||
      raw === 'vps-02'
    ) {
      return raw;
    }
    return 'win-local';
  } catch {
    return 'win-local';
  }
}

function readStoredExecutionScope(): AgyExecutionScope {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'device-fleet';
  }
  try {
    const raw = window.localStorage.getItem(FLEET_EXECUTION_SCOPE_STORAGE_KEY);
    if (raw === 'device-fleet' || raw === 'account-remote-agent') {
      return raw;
    }
    return 'device-fleet';
  } catch {
    return 'device-fleet';
  }
}

export function TronAgyControlCenter({
  locale = 'ar-EG',
  defaultApp = 'gemimotion',
  fetchImpl,
  onExecutePlan,
}: TronAgyControlCenterProps) {
  const isArabic = locale.startsWith('ar');
  const [selectedApps, setSelectedApps] = useState<TronCsAppId[]>([defaultApp]);
  const [executionScope, setExecutionScope] = useState<AgyExecutionScope>(() =>
    readStoredExecutionScope(),
  );
  const [activeDevice, setActiveDevice] = useState<AgyFleetDeviceId>(() =>
    readStoredActiveDevice(),
  );
  const [fleetModalOpen, setFleetModalOpen] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Record<AgyFleetDeviceId, string>>(() =>
    readStoredFleetAddresses(),
  );
  const [liveStatus, setLiveStatus] = useState<Record<AgyFleetDeviceId, FleetDeviceLiveStatus>>({
    'win-local': { state: 'online', online: true, checking: false, latencyMs: 4 },
    'mac-local': { state: 'online', online: true, checking: false, latencyMs: 6 },
    'vps-01': { state: 'online', online: true, checking: false, latencyMs: 36 },
    'vps-02': { state: 'online', online: true, checking: false, latencyMs: 42 },
  });
  const [model, setModel] = useState<AgyModelId>('gemini-4-argon-high');
  const [effort, setEffort] = useState<AgyEffortTier>('xhigh');
  const primaryApp: TronCsAppId = selectedApps[0] ?? defaultApp;
  const appSw = APP_SKILLS_AND_WORKFLOWS[primaryApp] ?? APP_SKILLS_AND_WORKFLOWS.gemimotion;
  const [skillId, setSkillId] = useState<string>(appSw.skills[0]?.id ?? '');
  const [workflowId, setWorkflowId] = useState<string>(appSw.workflows[0]?.id ?? '');
  const [quotaFamilies] = useState<QuotaFamilyPill[]>(DEFAULT_QUOTA_FAMILIES);
  const [prompt, setPrompt] = useState<string>(
    'أورورا كرونوغراف X1 — فخامة التيتانيوم السويسري | حملة متكاملة عبر جناح TronCS الإبداعي',
  );

  useEffect(() => {
    const nextSw = APP_SKILLS_AND_WORKFLOWS[primaryApp];
    if (!nextSw) return;
    if (!nextSw.skills.some((s) => s.id === skillId)) {
      setSkillId(nextSw.skills[0]?.id ?? '');
    }
    if (!nextSw.workflows.some((w) => w.id === workflowId)) {
      setWorkflowId(nextSw.workflows[0]?.id ?? '');
    }
  }, [primaryApp, skillId, workflowId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(FLEET_ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // Ignore storage quota errors
    }
  }, [addresses]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(FLEET_ACTIVE_NODE_STORAGE_KEY, activeDevice);
    } catch {
      // Ignore storage quota errors
    }
  }, [activeDevice]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(FLEET_EXECUTION_SCOPE_STORAGE_KEY, executionScope);
    } catch {
      // Ignore storage quota errors
    }
  }, [executionScope]);

  const activeDeviceMeta = useMemo(
    () => FLEET_DEVICES.find((d) => d.id === activeDevice) ?? FLEET_DEVICES[0],
    [activeDevice],
  );

  const probeSingleDevice = async (
    id: AgyFleetDeviceId,
    connectNow = false,
  ): Promise<FleetDeviceLiveStatus> => {
    if (connectNow) {
      setActiveDevice(id);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(FLEET_ACTIVE_NODE_STORAGE_KEY, id);
        } catch {
          // Ignore storage error
        }
      }
    }

    const endpointBase = normalizeNodeEndpoint(
      addresses[id] || DEFAULT_FLEET_DEVICE_ADDRESSES[id],
    );
    const primaryUrl = `${endpointBase}/v1/agy/health`;
    const fallbackUrl = `${endpointBase}/health`;
    const effectiveFetch = fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);

    setLiveStatus((prev) => ({
      ...prev,
      [id]: {
        state: 'checking',
        online: prev[id].online,
        checking: true,
        latencyMs: prev[id].latencyMs,
      },
    }));

    const startMs =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

    if (!effectiveFetch) {
      const offlineStatus: FleetDeviceLiveStatus = {
        state: 'offline',
        online: false,
        checking: false,
        latencyMs: 0,
      };
      setLiveStatus((prev) => ({ ...prev, [id]: offlineStatus }));
      return offlineStatus;
    }

    try {
      let res: Response | null = null;
      let primaryError: unknown = null;
      try {
        res = await effectiveFetch(primaryUrl, { method: 'GET' });
      } catch (err) {
        primaryError = err;
      }

      if ((!res || !res.ok) && (endpointBase.includes('mcp.gemitron.net') || !primaryError)) {
        try {
          const fbRes = await effectiveFetch(fallbackUrl, { method: 'GET' });
          if (fbRes && fbRes.ok) {
            res = fbRes;
          }
        } catch {
          // Preserve primary result
        }
      }

      if (!res && primaryError) {
        throw primaryError;
      }

      const nowMs =
        typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now();
      const latencyMs = Math.max(1, Math.round(nowMs - startMs));

      if (res && res.ok) {
        const nextStatus: FleetDeviceLiveStatus = {
          state: 'online',
          online: true,
          checking: false,
          latencyMs,
        };
        setLiveStatus((prev) => ({ ...prev, [id]: nextStatus }));
        return nextStatus;
      }

      const unreadyStatus: FleetDeviceLiveStatus = {
        state: 'offline',
        online: false,
        checking: false,
        latencyMs,
      };
      setLiveStatus((prev) => ({ ...prev, [id]: unreadyStatus }));
      return unreadyStatus;
    } catch {
      const failedStatus: FleetDeviceLiveStatus = {
        state: 'offline',
        online: false,
        checking: false,
        latencyMs: 0,
      };
      setLiveStatus((prev) => ({ ...prev, [id]: failedStatus }));
      return failedStatus;
    }
  };

  const testAllDevices = async () => {
    await Promise.all(
      FLEET_DEVICES.map((dev) => probeSingleDevice(dev.id, false)),
    );
  };

  const toggleApp = (appId: TronCsAppId) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.length > 1
          ? prev.filter((a) => a !== appId)
          : prev
        : [...prev, appId],
    );
  };

  return (
    <section
      dir={isArabic ? 'rtl' : 'ltr'}
      data-testid="tron-agy-control-center"
      className="tron-agy-control-center"
    >
      <header className="tron-agy-header">
        <div>
          <h3>{isArabic ? '✦ المخرج الذكي المباشر (AGY AI Chat)' : '✦ AGY Live Creative Director'}</h3>
          <p data-testid="tron-agy-connected-summary">
            {executionScope === 'account-remote-agent'
              ? isArabic
                ? `متصل بالحساب: 🌐 الوكيل السحابي عن بُعد (${REMOTE_AGENT_RELAY_URL} · بدون إعداد IP ●)`
                : `Account-Bound: 🌐 Remote Agent (${REMOTE_AGENT_RELAY_URL} · Zero IP Config ●)`
              : isArabic
                ? `متصل: ${activeDeviceMeta.ar} (${addresses[activeDevice]} · ${liveStatus[activeDevice].latencyMs}ms ●)`
                : `Connected: ${activeDeviceMeta.en} (${addresses[activeDevice]} · ${liveStatus[activeDevice].latencyMs}ms ●)`}
          </p>
        </div>
        <div className="tron-agy-scope-toggle" data-testid="tron-agy-execution-scope-switcher">
          <button
            type="button"
            data-testid="tron-agy-scope-device-fleet"
            aria-pressed={executionScope === 'device-fleet'}
            onClick={() => setExecutionScope('device-fleet')}
          >
            {isArabic ? '🖥️ وكيل الأجهزة (Fleet IPs)' : '🖥️ Device Agent (Fleet IPs)'}
          </button>
          <button
            type="button"
            data-testid="tron-agy-scope-account-remote-agent"
            aria-pressed={executionScope === 'account-remote-agent'}
            onClick={() => setExecutionScope('account-remote-agent')}
          >
            {isArabic ? '🌐 الوكيل السحابي (مرتبط بالحساب)' : '🌐 Remote Agent (Account-Bound)'}
          </button>
        </div>
        <button
          type="button"
          data-testid="tron-agy-open-fleet-modal-btn"
          onClick={() => setFleetModalOpen((v) => !v)}
        >
          {isArabic
            ? '⚙️ ضبط عناوين IP وحالة الاتصال (4 أجهزة)'
            : '⚙️ Configure 4-Device IPs & Live Status'}
        </button>
      </header>

      {/* Account-Bound Remote Agent Banner (when Remote Agent is active) */}
      {executionScope === 'account-remote-agent' ? (
        <div className="tron-agy-section" data-testid="tron-agy-remote-agent-banner">
          <strong>
            {isArabic
              ? '🌐 الوكيل السحابي عن بُعد (Antigravity Remote Agent · مرتبط بحسابك)'
              : '🌐 Antigravity Remote Agent (Tied to your Account · Zero IP Config)'}
          </strong>
          <p>
            {isArabic
              ? `يعمل عبر جلسة حسابك الموحدة (GemiAccess -> ${REMOTE_AGENT_RELAY_URL}) دون الحاجة لتشغيل جهاز محلي أو إدخال عنوان IP.`
              : `Routes through your signed-in GemiAccess account session (${REMOTE_AGENT_RELAY_URL}) without needing a local PC open or device IP.`}
          </p>
        </div>
      ) : null}

      {/* Quick 4-Device Switcher Row */}
      <div className="tron-agy-section" data-testid="tron-agy-device-switcher">

        <div className="tron-agy-pill-row">
          {FLEET_DEVICES.map((dev) => (
            <button
              key={dev.id}
              type="button"
              data-testid={`tron-agy-device-pill-${dev.id}`}
              aria-pressed={activeDevice === dev.id}
              onClick={() => setActiveDevice(dev.id)}
            >
              {isArabic
                ? `${dev.ar} (${liveStatus[dev.id].latencyMs}ms ●)`
                : `${dev.en} (${liveStatus[dev.id].latencyMs}ms ●)`}
            </button>
          ))}
        </div>
      </div>

      {/* Configurable 4-Device IP & Live Status Modal */}
      {fleetModalOpen ? (
        <div
          role="dialog"
          aria-label="Configure 4-Device IPs and Live Status"
          data-testid="tron-agy-fleet-modal"
          className="tron-agy-fleet-modal"
        >
          <div className="tron-agy-fleet-modal-header">
            <h4>
              {isArabic
                ? '⚙️ إعداد عناوين IP للأجهزة الأربعة وحالة الاتصال المباشر'
                : '⚙️ Configure 4-Device IPs & Live Connection Status'}
            </h4>
            <button
              type="button"
              data-testid="tron-agy-ping-all-btn"
              onClick={() => void testAllDevices()}
            >
              {isArabic ? '📡 فحص جميع الأجهزة الأربعة ✦' : '📡 Test All 4 Devices ✦'}
            </button>
            <a
              href="https://studio.gemitron.net/control-hub#agy-fleet"
              target="_blank"
              rel="noreferrer"
              data-testid="tron-agy-studio-owner-link"
            >
              {isArabic
                ? '☁️ إدارة الخوادم السحابية من لوحة المالك (Studio Control Hub)'
                : '☁️ Manage Cloud Fleet in Studio Owner Panel'}
            </a>
          </div>

          <div className="tron-agy-fleet-grid">
            {FLEET_DEVICES.map((dev) => {
              const st = liveStatus[dev.id];
              const isSelected = activeDevice === dev.id;
              return (
                <div
                  key={dev.id}
                  data-testid={`tron-agy-fleet-card-${dev.id}`}
                  className="tron-agy-fleet-card"
                >
                  <div>
                    <strong>{isArabic ? dev.ar : dev.en}</strong>
                    <span data-testid={`tron-agy-fleet-status-${dev.id}`}>
                      {st.checking
                        ? isArabic
                          ? 'جاري الفحص...'
                          : 'Checking...'
                        : st.online
                          ? isArabic
                            ? `متصل مباشر · ${st.latencyMs}ms ●`
                            : `Live Online · ${st.latencyMs}ms ●`
                          : isArabic
                            ? 'غير متصل'
                            : 'Offline'}
                    </span>
                  </div>
                  <p>{isArabic ? dev.roleAr : dev.roleEn}</p>
                  <input
                    type="text"
                    dir="ltr"
                    data-testid={`tron-agy-fleet-ip-input-${dev.id}`}
                    value={addresses[dev.id]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddresses((prev) => {
                        const next = { ...prev, [dev.id]: val };
                        if (typeof window !== 'undefined' && window.localStorage) {
                          try {
                            window.localStorage.setItem(
                              FLEET_ADDRESSES_STORAGE_KEY,
                              JSON.stringify(next),
                            );
                          } catch {
                            // Ignore storage error
                          }
                        }
                        return next;
                      });
                    }}
                  />
                  <div>
                    <button
                      type="button"
                      data-testid={`tron-agy-fleet-ping-btn-${dev.id}`}
                      onClick={() => void probeSingleDevice(dev.id, false)}
                    >
                      {isArabic ? '📡 فحص الاتصال' : '📡 Test Ping'}
                    </button>
                    <button
                      type="button"
                      data-testid={`tron-agy-fleet-connect-btn-${dev.id}`}
                      onClick={() => void probeSingleDevice(dev.id, true)}
                    >
                      {isSelected
                        ? isArabic
                          ? 'متصل حالياً ✓'
                          : 'Connected ✓'
                        : isArabic
                          ? 'اتصال بهذا الجهاز ✦'
                          : 'Connect ✦'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="tron-agy-section">
        <label>{isArabic ? 'تطبيقات جناح TronCS' : 'TronCS Suite Apps'}</label>
        <div className="tron-agy-pill-row">
          {APP_CATALOG.map((app) => (
            <button
              key={app.id}
              type="button"
              data-testid={`tron-agy-app-${app.id}`}
              aria-pressed={selectedApps.includes(app.id)}
              onClick={() => toggleApp(app.id)}
            >
              {isArabic ? app.ar : app.name}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section" data-testid="tron-agy-model-effort-panel">
        <label>{isArabic ? 'النموذج الذكي (١٤ نموذجاً) وعمق التفكير (٥ مستويات)' : 'AGY Model (14 Models) & Reasoning Effort (5 Tiers)'}</label>
        <select
          data-testid="tron-agy-model-select"
          value={model}
          onChange={(e) => setModel(e.target.value as AgyModelId)}
        >
          {AGY_MODEL_CATALOG.map((m) => (
            <option key={m.id} value={m.id}>
              {isArabic ? m.labelAr : m.labelEn}
            </option>
          ))}
        </select>
        <div className="tron-agy-pill-row" data-testid="tron-agy-effort-pills">
          {AGY_EFFORT_CATALOG.map((tier) => (
            <button
              key={tier.id}
              type="button"
              data-testid={`tron-agy-effort-${tier.id}`}
              aria-pressed={effort === tier.id}
              onClick={() => setEffort(tier.id)}
            >
              {isArabic ? tier.labelAr : tier.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section" data-testid="tron-agy-skills-workflows-panel">
        <label>
          {isArabic
            ? 'المهارة الإبداعية ومسار العمل المتكامل (Skills & Workflows)'
            : 'Specialized Skill & Multi-Step Workflow'}
        </label>
        <div className="tron-agy-pill-row">
          <select
            data-testid="tron-agy-skill-select"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            {appSw.skills.map((sk) => (
              <option key={sk.id} value={sk.id}>
                {isArabic ? sk.ar : sk.en}
              </option>
            ))}
          </select>
          <select
            data-testid="tron-agy-workflow-select"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
          >
            {appSw.workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {isArabic ? wf.ar : wf.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tron-agy-section" data-testid="tron-agy-quota-ledger">
        <label>
          {isArabic
            ? '🛡️ سجل الحصص الآمن لعائلات النماذج الست (100% Google-ToS-Safe Quota Ledger)'
            : '🛡️ 6-Family Google-ToS-Safe Model Quota Ledger'}
        </label>
        <div className="tron-agy-pill-row">
          {quotaFamilies.map((fam) => (
            <span
              key={fam.familyId}
              data-testid={`tron-agy-quota-family-${fam.familyId}`}
            >
              {isArabic
                ? `${fam.labelAr}: ${fam.remainingPct}%`
                : `${fam.labelEn}: ${fam.remainingPct}%`}
            </span>
          ))}
        </div>
      </div>

      <div className="tron-agy-section">
        <label>{isArabic ? 'اكتب فكرتك للمخرج الذكي' : 'Chat with your AI Director'}</label>
        <textarea
          rows={3}
          value={prompt}
          data-testid="tron-agy-prompt-input"
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <footer className="tron-agy-footer">
        <button
          type="button"
          data-testid="tron-agy-execute-btn"
          onClick={() =>
            onExecutePlan?.({
              prompt,
              apps: selectedApps,
              skillId,
              workflowId,
              executionScope,
              deviceId: activeDevice,
              deviceAddress:
                executionScope === 'account-remote-agent'
                  ? REMOTE_AGENT_RELAY_URL
                  : addresses[activeDevice],
              remoteAgentRelayUrl:
                executionScope === 'account-remote-agent' ? REMOTE_AGENT_RELAY_URL : null,
              model,
              effort,
              locale,
            })
          }
        >
          {isArabic ? 'إرسال وتنفيذ الفكرة مباشرة ✦' : 'Send & Direct Live ✦'}
        </button>
      </footer>
    </section>
  );
}

