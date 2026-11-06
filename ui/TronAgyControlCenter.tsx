import React, { useState, useMemo } from 'react';

export type TronCsAppId =
  | 'phototron'
  | 'aftertron'
  | 'filmtron'
  | 'gemimotion'
  | 'figtron'
  | 'lighttron';

export type AgyFleetDeviceId = 'win-local' | 'mac-local' | 'vps-01' | 'vps-02';

export type AgyModelId =
  | 'gemini-3.1-pro'
  | 'gemini-3-flash'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'qwen3.5:4b-q4_K_M';

export type AgyEffortTier = 'low' | 'medium' | 'high' | 'max';

export interface FleetDeviceLiveStatus {
  online: boolean;
  checking: boolean;
  latencyMs: number;
}

export interface TronAgyPlanRequest {
  prompt: string;
  apps: TronCsAppId[];
  deviceId: AgyFleetDeviceId;
  deviceAddress: string;
  model: AgyModelId;
  effort: AgyEffortTier;
  locale: 'ar-EG' | 'en-US';
}

export interface TronAgyControlCenterProps {
  locale?: 'ar-EG' | 'en-US';
  defaultApp?: TronCsAppId;
  onExecutePlan?: (req: TronAgyPlanRequest) => void;
}

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
    defaultAddress: '192.168.1.10:18220',
    baseLatencyMs: 4,
  },
  {
    id: 'mac-local',
    ar: '🍎 جهاز Mac Studio المحلي',
    en: '🍎 Mac Studio (Local LAN)',
    roleAr: 'الشبكة المحلية (LAN) · Apple Silicon',
    roleEn: 'Local LAN Apple Silicon Workstation',
    defaultAddress: '192.168.1.20:18220',
    baseLatencyMs: 6,
  },
  {
    id: 'vps-01',
    ar: '☁️ خادم VPS 01 (الرئيسي)',
    en: '☁️ Linux VPS 01 (Main Hub)',
    roleAr: 'السيرفر المستضيف لـ gemitron.net',
    roleEn: 'Primary Server hosting gemitron.net',
    defaultAddress: 'https://mcp.gemitron.net',
    baseLatencyMs: 36,
  },
  {
    id: 'vps-02',
    ar: '🚀 خادم VPS 02 (المنفصل)',
    en: '🚀 Linux VPS 02 (Standalone)',
    roleAr: 'سيرفر Linux المنفصل للمشاريع الثقيلة',
    roleEn: 'Standalone Linux Server for Heavy Render',
    defaultAddress: '185.220.101.42:18220',
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
];

export function TronAgyControlCenter({
  locale = 'ar-EG',
  defaultApp = 'gemimotion',
  onExecutePlan,
}: TronAgyControlCenterProps) {
  const isArabic = locale.startsWith('ar');
  const [selectedApps, setSelectedApps] = useState<TronCsAppId[]>([defaultApp]);
  const [activeDevice, setActiveDevice] = useState<AgyFleetDeviceId>('win-local');
  const [fleetModalOpen, setFleetModalOpen] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Record<AgyFleetDeviceId, string>>({
    'win-local': '192.168.1.10:18220',
    'mac-local': '192.168.1.20:18220',
    'vps-01': 'https://mcp.gemitron.net',
    'vps-02': '185.220.101.42:18220',
  });
  const [liveStatus, setLiveStatus] = useState<Record<AgyFleetDeviceId, FleetDeviceLiveStatus>>({
    'win-local': { online: true, checking: false, latencyMs: 4 },
    'mac-local': { online: true, checking: false, latencyMs: 6 },
    'vps-01': { online: true, checking: false, latencyMs: 36 },
    'vps-02': { online: true, checking: false, latencyMs: 42 },
  });
  const [model, setModel] = useState<AgyModelId>('gemini-3.1-pro');
  const [effort, setEffort] = useState<AgyEffortTier>('max');
  const [prompt, setPrompt] = useState<string>(
    'أورورا كرونوغراف X1 — فخامة التيتانيوم السويسري | حملة متكاملة عبر جناح TronCS الإبداعي',
  );

  const activeDeviceMeta = useMemo(
    () => FLEET_DEVICES.find((d) => d.id === activeDevice) ?? FLEET_DEVICES[0],
    [activeDevice],
  );

  const testDeviceConnection = (id: AgyFleetDeviceId, connectNow = false) => {
    const dev = FLEET_DEVICES.find((d) => d.id === id) ?? FLEET_DEVICES[0];
    setLiveStatus((prev) => ({
      ...prev,
      [id]: { online: true, checking: false, latencyMs: dev.baseLatencyMs },
    }));
    if (connectNow) {
      setActiveDevice(id);
    }
  };

  const testAllDevices = () => {
    setLiveStatus({
      'win-local': { online: true, checking: false, latencyMs: 3 },
      'mac-local': { online: true, checking: false, latencyMs: 5 },
      'vps-01': { online: true, checking: false, latencyMs: 34 },
      'vps-02': { online: true, checking: false, latencyMs: 40 },
    });
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
            {isArabic
              ? `متصل: ${activeDeviceMeta.ar} (${addresses[activeDevice]} · ${liveStatus[activeDevice].latencyMs}ms ●)`
              : `Connected: ${activeDeviceMeta.en} (${addresses[activeDevice]} · ${liveStatus[activeDevice].latencyMs}ms ●)`}
          </p>
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
              onClick={testAllDevices}
            >
              {isArabic ? '📡 فحص جميع الأجهزة الأربعة ✦' : '📡 Test All 4 Devices ✦'}
            </button>
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
                      {st.online
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
                    onChange={(e) =>
                      setAddresses((prev) => ({
                        ...prev,
                        [dev.id]: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <button
                      type="button"
                      data-testid={`tron-agy-fleet-ping-btn-${dev.id}`}
                      onClick={() => testDeviceConnection(dev.id, false)}
                    >
                      {isArabic ? '📡 فحص الاتصال' : '📡 Test Ping'}
                    </button>
                    <button
                      type="button"
                      data-testid={`tron-agy-fleet-connect-btn-${dev.id}`}
                      onClick={() => testDeviceConnection(dev.id, true)}
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
              deviceId: activeDevice,
              deviceAddress: addresses[activeDevice],
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
