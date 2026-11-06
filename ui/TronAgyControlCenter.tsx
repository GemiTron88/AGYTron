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
  | 'gemini-3.1-pro'
  | 'gemini-3-flash'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'qwen3.5:4b-q4_K_M';

export type AgyEffortTier = 'low' | 'medium' | 'high' | 'max';

export interface FleetDeviceLiveStatus {
  state: 'online' | 'checking' | 'offline';
  online: boolean;
  checking: boolean;
  latencyMs: number;
}

export interface TronAgyPlanRequest {
  prompt: string;
  apps: TronCsAppId[];
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
  const [model] = useState<AgyModelId>('gemini-3.1-pro');
  const [effort] = useState<AgyEffortTier>('max');
  const [prompt, setPrompt] = useState<string>(
    'أورورا كرونوغراف X1 — فخامة التيتانيوم السويسري | حملة متكاملة عبر جناح TronCS الإبداعي',
  );

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

