import React, { useState, useMemo } from 'react';

export type TronCsAppId =
  | 'phototron'
  | 'aftertron'
  | 'filmtron'
  | 'gemimotion'
  | 'figtron'
  | 'lighttron';

export type AgyModelId =
  | 'gemini-3.1-pro'
  | 'gemini-3-flash'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'qwen3.5:4b-q4_K_M';

export type AgyEffortTier = 'low' | 'medium' | 'high' | 'max';

export type AgyAuthMode =
  | 'agy-mcp-host'
  | 'gemi-access-token'
  | 'api-key-env'
  | 'local-tron-loopback';

export type McpTransportMode = 'hybrid-auto' | 'cloud-only' | 'local-only';

export interface TronAgyPlanRequest {
  prompt: string;
  apps: TronCsAppId[];
  model: AgyModelId;
  effort: AgyEffortTier;
  authMode: AgyAuthMode;
  mcpTransport: McpTransportMode;
  locale: 'ar-EG' | 'en-US';
}

export interface TronAgyControlCenterProps {
  locale?: 'ar-EG' | 'en-US';
  defaultApp?: TronCsAppId;
  onExecutePlan?: (req: TronAgyPlanRequest) => void;
}

const APP_CATALOG: Array<{
  id: TronCsAppId;
  name: string;
  ar: string;
  ext: string;
  accent: string;
}> = [
  { id: 'phototron', name: 'PhotoTron', ar: 'فوتو ترون', ext: '.pcraft', accent: '#38bdf8' },
  { id: 'aftertron', name: 'AfterTron', ar: 'أفتر ترون', ext: '.acraft', accent: '#a855f7' },
  { id: 'filmtron', name: 'FilmTron', ar: 'فيلم ترون', ext: '.fcraft', accent: '#f43f5e' },
  { id: 'gemimotion', name: 'GemiMotion', ar: 'جيمي موشن', ext: '.gmotion', accent: '#f59e0b' },
  { id: 'figtron', name: 'FigTron', ar: 'فيج ترون', ext: '.figtron', accent: '#10b981' },
  { id: 'lighttron', name: 'LightTron', ar: 'لايت ترون', ext: '.lcraft', accent: '#6366f1' },
];

const MODEL_CATALOG: Array<{ id: AgyModelId; en: string; ar: string }> = [
  { id: 'gemini-3.1-pro', en: 'Gemini 3.1 Pro (Default ✦)', ar: 'Gemini 3.1 Pro (افتراضي ✦)' },
  { id: 'gemini-3-flash', en: 'Gemini 3 Flash (Fast ⚡)', ar: 'Gemini 3 Flash (سريع ⚡)' },
  { id: 'claude-opus-4-6', en: 'Claude Opus 4.6 (OpenCode)', ar: 'Claude Opus 4.6 (إخراج عميق)' },
  { id: 'claude-sonnet-4-6', en: 'Claude Sonnet 4.6 (Balanced)', ar: 'Claude Sonnet 4.6 (متوازن)' },
  { id: 'qwen3.5:4b-q4_K_M', en: 'Qwen 3.5 4B (Local TRON)', ar: 'Qwen 3.5 4B (محلي TRON)' },
];

const EFFORT_CATALOG: Array<{
  id: AgyEffortTier;
  en: string;
  ar: string;
  tokens: number;
  passes: number;
}> = [
  { id: 'low', en: 'Low (1K · 1p)', ar: 'سريع (1K · 1p)', tokens: 1024, passes: 1 },
  { id: 'medium', en: 'Medium (4K · 2p)', ar: 'متوازن (4K · 2p)', tokens: 4096, passes: 2 },
  { id: 'high', en: 'High (16K · 3p)', ar: 'عميق (16K · 3p)', tokens: 16384, passes: 3 },
  { id: 'max', en: 'Max (32K · 5p)', ar: 'أقصى تفكير (32K · 5p)', tokens: 32768, passes: 5 },
];

const AUTH_CATALOG: Array<{ id: AgyAuthMode; en: string; ar: string }> = [
  {
    id: 'agy-mcp-host',
    en: 'AGY Host Bridge (ToS-Safe MCP/CLI)',
    ar: 'جسر مضيف AGY الآمن (MCP/CLI Host)',
  },
  {
    id: 'gemi-access-token',
    en: 'GemiMCP Access Token (Zitadel / gemi_at_*)',
    ar: 'توكن GemiMCP الرسمي (Zitadel / OWNER)',
  },
  {
    id: 'api-key-env',
    en: 'Official API Key (GEMINI / ANTHROPIC)',
    ar: 'مفتاح رسمي (Google AI Studio / Anthropic)',
  },
  {
    id: 'local-tron-loopback',
    en: 'Local TRON Loopback (127.0.0.1:8090)',
    ar: 'حلقة TRON المحلية (بدون سحابة)',
  },
];

export function TronAgyControlCenter({
  locale = 'ar-EG',
  defaultApp = 'gemimotion',
  onExecutePlan,
}: TronAgyControlCenterProps) {
  const isArabic = locale.startsWith('ar');
  const [selectedApps, setSelectedApps] = useState<TronCsAppId[]>([defaultApp]);
  const [model, setModel] = useState<AgyModelId>('gemini-3.1-pro');
  const [effort, setEffort] = useState<AgyEffortTier>('high');
  const [authMode, setAuthMode] = useState<AgyAuthMode>('agy-mcp-host');
  const [mcpTransport, setMcpTransport] = useState<McpTransportMode>('hybrid-auto');
  const [prompt, setPrompt] = useState<string>(
    'أورورا كرونوغراف X1 — فخامة التيتانيوم السويسري | حملة متكاملة عبر جناح TronCS الإبداعي',
  );

  const activeEffortMeta = useMemo(
    () => EFFORT_CATALOG.find((e) => e.id === effort) ?? EFFORT_CATALOG[2],
    [effort],
  );

  const toggleApp = (appId: TronCsAppId) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.length > 1
          ? prev.filter((a) => a !== appId)
          : prev
        : [...prev, appId],
    );
  };

  const cliPreview = useMemo(
    () =>
      `tron-agy direct --prompt "${prompt.replace(/"/g, '\\"')}" --apps ${selectedApps.join(',')} --model ${model} --effort ${effort} --auth-mode ${authMode} --transport ${mcpTransport}`,
    [prompt, selectedApps, model, effort, authMode, mcpTransport],
  );

  return (
    <section
      dir={isArabic ? 'rtl' : 'ltr'}
      data-testid="tron-agy-control-center"
      className="tron-agy-control-center"
    >
      <header className="tron-agy-header">
        <div>
          <h3>{isArabic ? 'مركز تحكم TronAGY الشامل ✦' : 'TronAGY Global Creative Studio ✦'}</h3>
          <p>
            {isArabic
              ? 'متوافق 100% مع سياسات Google (Host-Inversion MCP · بدون سحب توكنات خارجية)'
              : '100% Google-ToS-Safe Host-Inversion Architecture · Zero External OAuth Scraping'}
          </p>
        </div>
        <span data-testid="tron-agy-budget-pill">
          {`${model} · ${activeEffortMeta.tokens.toLocaleString()}t · ${activeEffortMeta.passes} Passes`}
        </span>
      </header>

      <div className="tron-agy-section">
        <label>{isArabic ? '١. تطبيقات جناح TronCS المستهدفة' : '1. Target TronCS Suite Apps'}</label>
        <div className="tron-agy-pill-row">
          {APP_CATALOG.map((app) => (
            <button
              key={app.id}
              type="button"
              data-testid={`tron-agy-app-${app.id}`}
              aria-pressed={selectedApps.includes(app.id)}
              onClick={() => toggleApp(app.id)}
            >
              {isArabic ? `${app.ar} (${app.ext})` : `${app.name} (${app.ext})`}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section">
        <label>{isArabic ? '٢. اختيار النموذج الذكي (Model)' : '2. AI Director Model'}</label>
        <div className="tron-agy-pill-row">
          {MODEL_CATALOG.map((m) => (
            <button
              key={m.id}
              type="button"
              data-testid={`tron-agy-model-${m.id}`}
              aria-pressed={model === m.id}
              onClick={() => setModel(m.id)}
            >
              {isArabic ? m.ar : m.en}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section">
        <label>
          {isArabic
            ? '٣. عمق التفكير وعدد تمريرات الفحص البصري (Effort)'
            : '3. Reasoning Effort & Critique Passes'}
        </label>
        <div className="tron-agy-pill-row">
          {EFFORT_CATALOG.map((e) => (
            <button
              key={e.id}
              type="button"
              data-testid={`tron-agy-effort-${e.id}`}
              aria-pressed={effort === e.id}
              onClick={() => setEffort(e.id)}
            >
              {isArabic ? e.ar : e.en}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section">
        <label>
          {isArabic
            ? '٤. وضع المصادقة الآمن ومسار GemiMCP (Cloud / Local)'
            : '4. ToS-Safe Auth Mode & GemiMCP Transport'}
        </label>
        <div className="tron-agy-pill-row">
          {AUTH_CATALOG.map((a) => (
            <button
              key={a.id}
              type="button"
              data-testid={`tron-agy-auth-${a.id}`}
              aria-pressed={authMode === a.id}
              onClick={() => setAuthMode(a.id)}
            >
              {isArabic ? a.ar : a.en}
            </button>
          ))}
        </div>
        <div className="tron-agy-pill-row">
          {(['hybrid-auto', 'local-only', 'cloud-only'] as McpTransportMode[]).map((tr) => (
            <button
              key={tr}
              type="button"
              data-testid={`tron-agy-transport-${tr}`}
              aria-pressed={mcpTransport === tr}
              onClick={() => setMcpTransport(tr)}
            >
              {tr === 'hybrid-auto'
                ? isArabic
                  ? 'هجين تلقائي (Local 127.0.0.1 -> Cloud mcp.gemitron.net)'
                  : 'Hybrid Auto (Local 127.0.0.1 -> Cloud mcp.gemitron.net)'
                : tr === 'local-only'
                  ? isArabic
                    ? 'محلي فقط (127.0.0.1:18210)'
                    : 'Local Workstation Only (127.0.0.1:18210)'
                  : isArabic
                    ? 'سحابي فقط (https://mcp.gemitron.net)'
                    : 'Cloud Gateway Only (https://mcp.gemitron.net)'}
            </button>
          ))}
        </div>
      </div>

      <div className="tron-agy-section">
        <label>{isArabic ? '٥. التوجيه الإبداعي' : '5. Creative Brief'}</label>
        <textarea
          rows={3}
          value={prompt}
          data-testid="tron-agy-prompt-input"
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <footer className="tron-agy-footer">
        <code data-testid="tron-agy-cli-preview">{cliPreview}</code>
        <button
          type="button"
          data-testid="tron-agy-execute-btn"
          onClick={() =>
            onExecutePlan?.({
              prompt,
              apps: selectedApps,
              model,
              effort,
              authMode,
              mcpTransport,
              locale,
            })
          }
        >
          {isArabic
            ? 'توليد وتنفيذ الخطة عبر TronAGY ✦'
            : 'Orchestrate Multi-App Production with TronAGY ✦'}
        </button>
      </footer>
    </section>
  );
}
