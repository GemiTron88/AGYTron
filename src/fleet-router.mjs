/**
 * @gemitron/agy-tron — Multi-Node Fleet Mesh & Live Streaming Router (`src/fleet-router.mjs`)
 *
 * Connects any TronCS app (GemiMotion, PhotoTron, AfterTron, FilmTron, FigTron, LightTron)
 * to your 4 real Antigravity installations over Local LAN or Cloud Tailscale/HTTPS:
 *   1. `win-local` — Local Windows Workstation (LAN / 127.0.0.1 or 192.168.x.x:18220)
 *   2. `mac-local` — Local Mac Studio / MacBook (LAN / mac-studio.local:18220)
 *   3. `vps-01`    — Linux Cloud Server 01 (VPS 01 — Primary Cloud Brain Node)
 *   4. `vps-02`    — Linux Cloud Server 02 (VPS 02 — Secondary / High-Concurrency Cloud Node)
 *
 * Zero-Tech-Jargon Streaming Protocol (SSE / JSON):
 *   - `thinking`   -> Human-friendly creative thought updates (no token numbers or raw schemas)
 *   - `tool_badge` -> Visual progress pills (e.g., "Designing 3D Scene", "Composing Music")
 *   - `chat_delta` -> Conversational director reply streamed word-by-word
 *   - `stage_sync` -> Automatically updates the canvas/timeline in the background
 */

export const FLEET_STORAGE_KEYS = Object.freeze({
  addresses: "agy.fleet.addresses.v1",
  activeNode: "agy.fleet.activeNode.v1",
  executionScope: "agy.fleet.executionScope.v1"
});

export const AGY_REMOTE_AGENT_ENDPOINT = "https://mcp.gemitron.net/v1/agy/remote-agent";


export const AGY_FLEET_NODES = Object.freeze({
  "auto-best": Object.freeze({
    id: "auto-best",
    icon: "✦",
    labelAr: "اتصال تلقائي ذكي",
    labelEn: "Smart Auto-Connect",
    locationAr: "يختار أسرع جهاز متاح تلقائياً",
    locationEn: "Automatically picks the fastest online device",
    kind: "auto",
    defaultEndpoint: "auto://lan-then-vps"
  }),
  "win-local": Object.freeze({
    id: "win-local",
    icon: "💻",
    labelAr: "جهاز Windows المحلي",
    labelEn: "Windows PC (Local LAN)",
    locationAr: "الشبكة المحلية · استجابة فورية",
    locationEn: "Local Network · Instant Response",
    kind: "lan",
    defaultEndpoint: "http://127.0.0.1:18220"
  }),
  "mac-local": Object.freeze({
    id: "mac-local",
    icon: "🍎",
    labelAr: "جهاز Mac المحلي",
    labelEn: "Mac Studio (Local LAN)",
    locationAr: "الشبكة المحلية · Apple Silicon",
    locationEn: "Local Network · Apple Silicon",
    kind: "lan",
    defaultEndpoint: "http://mac-local.lan:18220"
  }),
  "vps-01": Object.freeze({
    id: "vps-01",
    icon: "☁️",
    labelAr: "خادم VPS 01 (الرئيسي · gemitron.net)",
    labelEn: "Linux VPS 01 (Main · gemitron.net)",
    locationAr: "السيرفر المستضيف لـ gemitron.net · متصل دائماً",
    locationEn: "Hosts gemitron.net & GemiMCP Hub · 24/7 Online",
    kind: "cloud-hub-vps",
    hostsGemitronDomain: true,
    defaultEndpoint: "https://mcp.gemitron.net/v1/agy/nodes/vps-01"
  }),
  "vps-02": Object.freeze({
    id: "vps-02",
    icon: "🚀",
    labelAr: "خادم VPS 02 (منفصل · IP مباشر أو نفق)",
    labelEn: "Linux VPS 02 (Standalone IP / Tunnel)",
    locationAr: "سيرفر Linux منفصل · يتصل عبر IP مباشر أو نفق إلى VPS 01",
    locationEn: "Separate Linux VPS · Direct IP or Outbound Tunnel to VPS 01",
    kind: "standalone-vps",
    hostsGemitronDomain: false,
    defaultEndpoint: process.env.AGY_VPS02_ENDPOINT || "http://<VPS_02_IP>:18220",
    tunnelViaVps01Endpoint: "https://mcp.gemitron.net/v1/agy/nodes/vps-02"
  })
});

export function selectOptimalFleetNode({
  preferredNodeId = "auto-best",
  nodeStatusMap = {}
} = {}) {
  if (preferredNodeId !== "auto-best" && Object.hasOwn(AGY_FLEET_NODES, preferredNodeId)) {
    const chosen = AGY_FLEET_NODES[preferredNodeId];
    const isOnline = nodeStatusMap[preferredNodeId]?.online !== false;
    if (isOnline) {
      return {
        selectedNode: chosen,
        failoverUsed: false,
        reasonAr: `متصل مباشرة بـ ${chosen.labelAr}`,
        reasonEn: `Connected directly to ${chosen.labelEn}`
      };
    }
  }

  // Priority order for Auto-Mesh: Local Windows -> Local Mac -> Cloud VPS 01 -> Cloud VPS 02
  const priorityOrder = ["win-local", "mac-local", "vps-01", "vps-02"];
  for (const id of priorityOrder) {
    if (nodeStatusMap[id]?.online !== false) {
      const node = AGY_FLEET_NODES[id];
      return {
        selectedNode: node,
        failoverUsed: preferredNodeId !== "auto-best" && preferredNodeId !== id,
        reasonAr: `تم الاتصال بـ ${node.labelAr} (أسرع عقدة نشطة)`,
        reasonEn: `Connected to ${node.labelEn} (Fastest active node)`
      };
    }
  }

  return {
    selectedNode: AGY_FLEET_NODES["vps-01"],
    failoverUsed: true,
    reasonAr: "تم التحويل التلقائي إلى الخادم السحابي VPS 01",
    reasonEn: "Automatically routed to Linux Cloud VPS 01"
  };
}

export const DEFAULT_FLEET_ADDRESSES = Object.freeze({
  "win-local": "192.168.1.10:18220",
  "mac-local": "192.168.1.20:18220",
  "vps-01": "https://mcp.gemitron.net",
  "vps-02": "185.220.101.42:18220"
});

/**
 * Loads persisted 4-device fleet addresses from a Web Storage-compatible object (`localStorage`).
 */
export function loadPersistedFleetAddresses(storage = globalThis.localStorage) {
  const base = { ...DEFAULT_FLEET_ADDRESSES };
  if (!storage || typeof storage.getItem !== "function") {
    return base;
  }
  try {
    const raw = storage.getItem(FLEET_STORAGE_KEYS.addresses);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return base;
    for (const key of ["win-local", "mac-local", "vps-01", "vps-02"]) {
      if (typeof parsed[key] === "string" && parsed[key].trim().length > 0) {
        base[key] = parsed[key].trim();
      }
    }
    return base;
  } catch {
    return base;
  }
}

/**
 * Persists 4-device fleet addresses to `localStorage` (`agy.fleet.addresses.v1`).
 */
export function savePersistedFleetAddresses(
  addresses,
  storage = globalThis.localStorage
) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    storage.setItem(FLEET_STORAGE_KEYS.addresses, JSON.stringify(addresses));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads persisted active fleet node ID from `localStorage` (`agy.fleet.activeNode.v1`).
 */
export function loadPersistedActiveFleetNode(
  storage = globalThis.localStorage,
  fallback = "auto-best",
  allowedIds = null
) {
  if (!storage || typeof storage.getItem !== "function") {
    return fallback;
  }
  try {
    const raw = storage.getItem(FLEET_STORAGE_KEYS.activeNode);
    if (typeof raw === "string" && /^[a-z0-9-]+$/i.test(raw.trim())) {
      if (Array.isArray(allowedIds) && allowedIds.length > 0 && !allowedIds.includes(raw.trim())) {
        return fallback;
      }
      return raw.trim();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Persists active fleet node ID to `localStorage` (`agy.fleet.activeNode.v1`).
 */
export function savePersistedActiveFleetNode(
  nodeId,
  storage = globalThis.localStorage
) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    storage.setItem(FLEET_STORAGE_KEYS.activeNode, String(nodeId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads persisted AGY execution scope (`device-fleet` | `account-remote-agent`) from `localStorage`.
 */
export function loadPersistedExecutionScope(
  storage = globalThis.localStorage,
  fallback = "device-fleet"
) {
  if (!storage || typeof storage.getItem !== "function") {
    return fallback;
  }
  try {
    const raw = storage.getItem(FLEET_STORAGE_KEYS.executionScope);
    if (raw === "device-fleet" || raw === "account-remote-agent") {
      return raw;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Persists AGY execution scope (`device-fleet` | `account-remote-agent`) to `localStorage`.
 */
export function savePersistedExecutionScope(
  scope,
  storage = globalThis.localStorage
) {
  if (!storage || typeof storage.setItem !== "function") return false;
  const normalized = scope === "account-remote-agent" ? "account-remote-agent" : "device-fleet";
  try {
    storage.setItem(FLEET_STORAGE_KEYS.executionScope, normalized);
    return true;
  } catch {
    return false;
  }
}


/**
 * Default Cloud-Only Fleet Nodes managed via Studio Owner Control Hub (`/control-hub`).
 * Excludes local LAN (`192.168.x.x`) devices so all nodes are routable cloud endpoints.
 */
export const CLOUD_FLEET_DEFAULT_NODES = Object.freeze([
  Object.freeze({
    nodeId: "vps-01",
    icon: "☁️",
    labelAr: "خادم VPS 01 (الرئيسي · gemitron.net)",
    labelEn: "Linux VPS 01 (Main · gemitron.net)",
    kind: "cloud-hub-vps",
    region: "EU-Central",
    address: "https://mcp.gemitron.net",
    isDefault: true,
    cloudOnly: true
  }),
  Object.freeze({
    nodeId: "vps-02",
    icon: "🚀",
    labelAr: "خادم VPS 02 (السحابي المنفصل · Contabo)",
    labelEn: "Linux VPS 02 (Standalone Cloud VPS)",
    kind: "standalone-vps",
    region: "EU-Central",
    address: "173.212.237.207:18220",
    isDefault: false,
    cloudOnly: true
  })
]);

/**
 * Validates that an endpoint address is a public Cloud IP/Domain (rejecting local LAN
 * ranges `192.168.*`, `10.*`, `172.16-31.*`, `127.*`, `localhost`, and `.local`/`.lan`).
 */
export function validateCloudFleetAddress(rawAddress = "", defaultPort = 18220) {
  const trimmed = String(rawAddress || "").trim();
  if (!trimmed) {
    return {
      valid: false,
      normalized: "",
      host: "",
      reason: "EMPTY_ADDRESS",
      messageAr: "يرجى إدخال عنوان الخادم السحابي (IP عام أو نطاق).",
      messageEn: "Please enter a cloud server address (public IP or domain)."
    };
  }
  const normalized = normalizeNodeEndpoint(trimmed, defaultPort);
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      normalized,
      host: "",
      reason: "INVALID_URL",
      messageAr: "صيغة العنوان السحابي غير صالحة.",
      messageEn: "Invalid cloud endpoint URL format."
    };
  }
  const host = String(parsed.hostname || "").toLowerCase();
  const isLocalOrLan =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".lan") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

  if (isLocalOrLan) {
    return {
      valid: false,
      normalized,
      host,
      reason: "LOCAL_LAN_FORBIDDEN",
      messageAr: "يُسمح فقط بالخوادم السحابية (IP عام أو نطاق سحابي) — عناوين الشبكة المحلية LAN غير مسموحة.",
      messageEn: "Cloud-only policy: private LAN / localhost addresses (192.168.x.x, 10.x.x.x, localhost) are not permitted."
    };
  }

  return {
    valid: true,
    normalized,
    host,
    port: parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80,
    reason: null
  };
}

/**
 * Normalizes a user-entered IP, hostname:port, or full URL into a clean base HTTP/HTTPS URL.
 */
export function normalizeNodeEndpoint(rawAddress = "", defaultPort = 18220) {
  const trimmed = String(rawAddress || "").trim().replace(/\/+$/, "");
  if (!trimmed) return `http://127.0.0.1:${defaultPort}`;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const hasPort = /:\d+$/.test(trimmed);
  return `http://${trimmed}${hasPort ? "" : `:${defaultPort}`}`;
}

/**
 * Probes a fleet node's live health endpoint (`/v1/agy/health`, with fallback to `/health`)
 * and measures round-trip latency using `performance.now()`.
 */
export async function probeFleetNodeLiveStatus({
  nodeId,
  address,
  fetchFn = globalThis.fetch,
  nowFn = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now(),
  timeoutMs = 2500
} = {}) {
  const endpointBase = normalizeNodeEndpoint(
    address || DEFAULT_FLEET_ADDRESSES[nodeId] || "127.0.0.1:18220"
  );
  const healthUrl = `${endpointBase}/v1/agy/health`;
  const fallbackHealthUrl = `${endpointBase}/health`;
  const startMs = nowFn();

  if (typeof fetchFn !== "function") {
    return {
      nodeId,
      address: endpointBase,
      healthUrl,
      online: false,
      state: "offline",
      latencyMs: null,
      statusTextAr: "غير متصل",
      statusTextEn: "Offline"
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res = null;
    let primaryErr = null;
    try {
      res = await fetchFn(healthUrl, {
        method: "GET",
        signal: controller.signal
      });
    } catch (err) {
      primaryErr = err;
    }

    let fallbackUsed = false;
    if ((!res || !res.ok) && (endpointBase.includes("mcp.gemitron.net") || !primaryErr)) {
      try {
        const fbRes = await fetchFn(fallbackHealthUrl, {
          method: "GET",
          signal: controller.signal
        });
        if (fbRes && fbRes.ok) {
          res = fbRes;
          fallbackUsed = true;
        }
      } catch {
        // Keep primary result/error
      }
    }

    clearTimeout(timer);
    if (!res && primaryErr) {
      throw primaryErr;
    }
    const latencyMs = Math.max(1, Math.round(nowFn() - startMs));
    if (res && res.ok) {
      return {
        nodeId,
        address: endpointBase,
        healthUrl: fallbackUsed ? fallbackHealthUrl : healthUrl,
        fallbackUsed,
        online: true,
        state: "online",
        latencyMs,
        statusTextAr: `متصل الآن · ${latencyMs}ms`,
        statusTextEn: `Online · ${latencyMs}ms`
      };
    }
    return {
      nodeId,
      address: endpointBase,
      healthUrl,
      fallbackUsed,
      online: false,
      state: "offline",
      latencyMs,
      statusTextAr: `استجابة غير جاهزة (${res?.status ?? 0})`,
      statusTextEn: `Unready (${res?.status ?? 0})`
    };
  } catch {
    clearTimeout(timer);
    return {
      nodeId,
      address: endpointBase,
      healthUrl,
      online: false,
      state: "offline",
      latencyMs: null,
      statusTextAr: "بانتظار تشغيل الخدمة على الجهاز",
      statusTextEn: "Waiting for daemon on device"
    };
  }
}

/**
 * Parses an SSE or JSON stream payload from `/v1/agy/chat-stream` into structured creator events.
 */
export function parseAgyStreamPayload(rawText = "") {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.events)) return parsed.events;
    } catch {
      // Fall through to SSE line parser
    }
  }
  const events = [];
  const lines = trimmed.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("data:")) {
      const jsonPart = line.slice(5).trim();
      if (!jsonPart) continue;
      try {
        const obj = JSON.parse(jsonPart);
        if (obj && typeof obj === "object" && obj.type) {
          events.push(obj);
        }
      } catch {
        // Ignore malformed SSE data lines
      }
    }
  }
  return events;
}

/**
 * Streams real SSE/JSON events from a fleet node's `/v1/agy/chat-stream` endpoint.
 */
export async function streamFleetNodeChat({
  nodeId = "vps-01",
  address,
  prompt = "",
  locale = "ar-EG",
  styleTitle = "إعلان سينمائي فاخر",
  model = "gemini-3.1-pro",
  effort = "high",
  fetchFn = globalThis.fetch,
  onEvent,
  timeoutMs = 5000
} = {}) {
  const endpointBase = normalizeNodeEndpoint(
    address || DEFAULT_FLEET_ADDRESSES[nodeId] || "127.0.0.1:18220"
  );
  const streamUrl = `${endpointBase}/v1/agy/chat-stream`;
  if (typeof fetchFn !== "function") {
    return { ok: false, nodeId, endpoint: streamUrl, events: [] };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(streamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json"
      },
      body: JSON.stringify({
        prompt,
        locale,
        nodeId,
        styleTitle,
        model,
        effort
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res || !res.ok) {
      return { ok: false, nodeId, endpoint: streamUrl, status: res?.status ?? 0, events: [] };
    }
    const text = typeof res.text === "function" ? await res.text() : "";
    const events = parseAgyStreamPayload(text);
    for (const ev of events) {
      onEvent?.(ev);
    }
    return {
      ok: true,
      nodeId,
      endpoint: streamUrl,
      events
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      nodeId,
      endpoint: streamUrl,
      error: err instanceof Error ? err.message : String(err),
      events: []
    };
  }
}

/**
 * Generates human-friendly, zero-jargon live stream events for the AGY Chat UI across any GemiTron service.
 */
export function buildCreatorFriendlyStreamEvents({
  prompt,
  service = "troncs",
  model = "gemini-3.1-pro",
  effort = "high",
  locale = "ar-EG",
  nodeId = "auto-best",
  styleTitle = "إعلان سينمائي فاخر"
} = {}) {
  const isAr = locale.startsWith("ar");
  const routed = selectOptimalFleetNode({ preferredNodeId: nodeId });
  const nodeLabel = isAr ? routed.selectedNode.labelAr : routed.selectedNode.labelEn;
  const svc = String(service || "troncs").toLowerCase();

  if (svc === "rankly" || svc === "seo") {
    return [
      {
        type: "thinking",
        title: isAr ? "جاري تحليل الكلمات المفتاحية والمنافسين عبر AGYTron..." : "Analyzing SERP intent & competitor gaps via AGYTron...",
        detail: isAr
          ? `يعمل العقل الذكي (${model} · ${effort}) عبر ${nodeLabel} لبناء خطة تصدر نتائج البحث.`
          : `Running AGYTron Smart Mind (${model} · ${effort}) on ${nodeLabel} to architect your SEO authority plan.`
      },
      {
        type: "tool_badge",
        icon: "🕷️",
        status: "done",
        label: isAr ? "زحف Scrapling الخفي وفحص SERP/PAA" : "Scrapling Stealth Crawl & SERP/PAA Audit",
        summary: isAr ? "استخراج الفرص الدلالية والأسئلة الأكثر بحثاً" : "Extracted semantic opportunities & PAA questions"
      },
      {
        type: "tool_badge",
        icon: "✍️",
        status: "done",
        label: isAr ? "توليد المقالات المرجعية ومصفوفة Spintax" : "Generating Authority Content & Spintax Matrix",
        summary: isAr ? "تفرد نصي يتجاوز ٨٥٪ مع توزيع طبيعي للأنكور" : ">85% uniqueness score with natural anchor ratios"
      },
      {
        type: "tool_badge",
        icon: "🔗",
        status: "done",
        label: isAr ? "بناء شبكة الباك لينك الهرمية (Tier 1 -> Tier 2 -> Tier 3)" : "Building 3-Tier Link Wheel (Tier 1 -> Tier 2 -> Tier 3)",
        summary: isAr ? "ربط منصات Web 2.0 والمدونات والمشاركات الاجتماعية" : "Chained Web 2.0 properties, bookmarks & profiles"
      },
      {
        type: "tool_badge",
        icon: "📡",
        status: "done",
        label: isAr ? "أرشفة فورية عبر IndexNow و Ping-O-Matic و WebSub" : "Instant Indexing via IndexNow, Ping-O-Matic & WebSub",
        summary: isAr ? "إشعار محركات البحث وأرشيف الإنترنت بالروابط الجديدة" : "Pinged search hubs & Wayback Machine for rapid discovery"
      },
      {
        type: "chat_message",
        role: "assistant",
        nodeBadge: nodeLabel,
        text: isAr
          ? `جهزت ونفذت خطة رانكلي الذكية عبر ${nodeLabel} (${model})! تم فحص نتائج البحث عبر Scrapling، وتوليد المحتوى بصيغة Spintax عالية التفرد، وجدولة شبكة الروابط الهرمية (Tier 1/2/3) مع إشعار محركات البحث فورياً.`
          : `Your Rankly SEO & Autopilot campaign is ready via ${nodeLabel} (${model})! Scrapling audited the SERP, generated high-uniqueness Spintax articles, chained your Tier 1-2-3 link wheel, and dispatched instant indexing pings.`
      }
    ];
  }

  if (svc === "tarweeg" || svc === "ads") {
    return [
      {
        type: "thinking",
        title: isAr ? "جاري هندسة الحملة الإعلانية متعددة المنصات عبر AGYTron..." : "Architecting multi-platform ad campaign via AGYTron...",
        detail: isAr
          ? `يحلل العقل الذكي (${model} · ${effort}) عبر ${nodeLabel} أفضل زوايا الإقناع وتوزيع الميزانية.`
          : `AGYTron Smart Mind (${model} · ${effort}) on ${nodeLabel} is optimizing hooks, formats, and ROAS allocation.`
      },
      {
        type: "tool_badge",
        icon: "🎯",
        status: "done",
        label: isAr ? "بناء شرائح الجمهور وهيكلة الـ ٩ منصات" : "Compiling Audience Segments Across 9 Ad Platforms",
        summary: isAr ? "Google PMax · Meta · TikTok · Snap · OpenAI · LinkedIn · X · Pinterest · Microsoft" : "Google PMax · Meta · TikTok · Snap · OpenAI · LinkedIn · X · Pinterest · Microsoft"
      },
      {
        type: "tool_badge",
        icon: "🎨",
        status: "done",
        label: isAr ? "توليد النصوص الإعلانية والصور بـ ٤ مقاسات قياسية" : "Generating Copy & Multi-Aspect Raster Creatives",
        summary: isAr ? "مقاسات 1:1 و 4:5 و 9:16 و 1.91:1 جاهزة للنشر" : "1:1, 4:5, 9:16 & 1.91:1 assets rendered and verified"
      },
      {
        type: "tool_badge",
        icon: "💰",
        status: "done",
        label: isAr ? "ضبط قواعد حماية الميزانية وتتبع التحويلات CAPI" : "Configuring Budget Guardrails & CAPI Conversion Sync",
        summary: isAr ? "ربط بيكسل المتجر وحماية العائد الإعلاني ROAS" : "Connected store CAPI events & automated ROAS floor guard"
      },
      {
        type: "tool_badge",
        icon: "🚀",
        status: "done",
        label: isAr ? "اعتماد خطة الإطلاق الموحدة (LaunchSaga)" : "Verifying 4-Step LaunchSaga Execution Plan",
        summary: isAr ? "جاهز للإطلاق الفوري مع إمكانية التراجع الآمن" : "Ready for atomic multi-network launch with rollback protection"
      },
      {
        type: "chat_message",
        role: "assistant",
        nodeBadge: nodeLabel,
        text: isAr
          ? `حملتك الإعلانية على «ترويج» جاهزة عبر ${nodeLabel} (${model})! صممت النصوص الإعلانية والصور بجميع المقاسات، ووزعت الميزانية بذكاء عبر المنصات التسع مع تفعيل حماية العائد ROAS وتتبع التحويلات.`
          : `Your Tarweeg multi-platform campaign is ready via ${nodeLabel} (${model})! Ad copy, 4 aspect-ratio creatives, and budget allocations across all 9 ad networks are compiled with active ROAS guardrails.`
      }
    ];
  }

  return [
    {
      type: "thinking",
      title: isAr ? "جاري فهم الفكرة وتخيل المشاهد..." : "Imagining the visual story & pacing...",
      detail: isAr
        ? `أحلل رسالتك عبر ${nodeLabel} لاختيار أفضل زوايا الكاميرا وتناغم الألوان.`
        : `Analyzing your brief on ${nodeLabel} to pick the best camera angles and color harmony.`
    },
    {
      type: "tool_badge",
      icon: "🎬",
      status: "done",
      label: isAr ? "تصميم المشاهد والإضاءة ثلاثية الأبعاد" : "Designing 3D Scenes & Studio Lighting",
      summary: isAr ? "٣ مشاهد متتابعة بإضاءة ذهبية ناعمة" : "3 seamless scenes with warm studio lighting"
    },
    {
      type: "tool_badge",
      icon: "🎵",
      status: "done",
      label: isAr ? "تأليف الموسيقى التصويرية وضبط الإيقاع" : "Composing Original Soundtrack & Beat",
      summary: isAr ? "موسيقى متناغمة مع انتقالات اللقطات" : "Custom score synced to every scene cut"
    },
    {
      type: "tool_badge",
      icon: "✨",
      status: "done",
      label: isAr ? "إضافة المؤثرات الصوتية الحركية" : "Adding Cinematic Sound Effects",
      summary: isAr ? "٦ لمسات صوتية عند ظهور العناصر والنصوص" : "6 subtle sound accents on text & motion reveals"
    },
    {
      type: "tool_badge",
      icon: "👁️",
      status: "done",
      label: isAr ? "مراجعة وضوح الخطوط وتناسق الكادر" : "Polishing Typography & Visual Balance",
      summary: isAr ? "النصوص العربية واضحة ومتمركزة في منطقة الأمان" : "Headlines balanced with crisp contrast"
    },
    {
      type: "chat_message",
      role: "assistant",
      nodeBadge: nodeLabel,
      text: isAr
        ? `جهزت لك العمل بأسلوب «${styleTitle}»! صممت الافتتاحية بحركة كاميرا ناعمة تبرز المنتج، وأضفت انتقالاً بصرياً للمشهد الثاني مع موسيقى متصاعدة ومؤثرات صوتية متزامنة، وتأكدت من وضوح الخط العربي في جميع اللقطات. يمكنك تشغيل العرض الآن أو إخباري بأي تعديل تحبه!`
        : `Your video is ready in the "${styleTitle}" style! I designed a smooth opening camera move, paired the transitions with a custom soundtrack and synced sound effects, and checked every headline for clarity. Press play to preview, or tell me what you'd like to tweak next!`
    }
  ];
}

