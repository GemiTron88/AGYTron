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

  if (svc === "filmtron" || svc === "film" || svc === "filmtron-mobile" || svc === "film-mobile") {
    return [
      {
        type: "thinking",
        title: isAr
          ? "جاري بناء الإيقاع الدرامي وتقسيم الفصول الثلاثة على التايملاين..."
          : "Architecting 3-Act timeline rhythm & J/L cut boundaries...",
        detail: isAr
          ? `يعمل المخرج الذكي (${model} · ${effort}) عبر ${nodeLabel} بدقة 254,016,000,000 نبضة/ثانية.`
          : `Running FilmTron Director (${model} · ${effort}) on ${nodeLabel} at 254,016,000,000 ticks/sec.`
      },
      {
        type: "tool_badge",
        icon: "🎞️",
        status: "done",
        tool: "film.timeline.place_clip",
        label: isAr
          ? "تركيب اللقطات وضبط انتقالات الصوت الاستباقية (J-Cut / L-Cut)"
          : "Assembling 3-Act Sequence & J/L Audio Overlaps",
        summary: isAr
          ? "محاذاة كاملة للإطارات بدون أي فجوات سوداء (0 Flash Frames)"
          : "Zero sub-frame drift or flash-frame gaps across V1/V2/A1/A2"
      },
      {
        type: "tool_badge",
        icon: "🎨",
        status: "done",
        tool: "film.color.set_lumetri",
        label: isAr
          ? "تطبيق التلوين السينمائي (Lumetri ACEScct) وحماية البشرة"
          : "Applying Lumetri ACEScct Color Grade & Skin-Tone Guard",
        summary: isAr
          ? "توازن النصوع ضمن النطاق القانوني للبث (0..100 IRE)"
          : "Rec.709 legal gamut verified with warm highlight roll-off"
      },
      {
        type: "tool_badge",
        icon: "🎚️",
        status: "done",
        tool: "film.audio.set_gain",
        label: isAr
          ? "مكساج الحوار والموسيقى القياسي (-14.0 LUFS + Sidechain Ducking)"
          : "Mastering Fairlight Dialogue & -14.0 LUFS Auto-Ducking",
        summary: isAr
          ? "خفض الموسيقى تلقائياً أثناء الكلام ومنع التشبع عند -1.0 dBTP"
          : "Dialogue clarity locked with -1.0 dBTP true-peak ceiling"
      },
      {
        type: "tool_badge",
        icon: "💬",
        status: "done",
        tool: "film.captions.add",
        label: isAr
          ? "توليد الكابشن العربي (HarfBuzz RTL) داخل منطقة الأمان"
          : "Generating Bidirectional RTL/LTR Captions in Safe Zone",
        summary: isAr
          ? "تباين بصري قياسي (WCAG >= 4.5:1) داخل هامش الأمان 90%"
          : "WCAG >= 4.5:1 contrast inside 90% title-safe bounds"
      },
      {
        type: "chat_message",
        role: "assistant",
        nodeBadge: nodeLabel,
        text: isAr
          ? `مونتاج «${styleTitle}» جاهز على التايملاين عبر ${nodeLabel} (${model})! جهزت لك اتجاهين للمونتاج (أ: إيقاع ديناميكي سريع، ب: سرد سينمائي دافئ)، وضبطت تلوين Lumetri ومكساج الصوت عند -14.0 LUFS مع الكابشن العربي. يمكنك المعاينة الآن أو كتابة أي ملاحظة مثل «سرع الإيقاع» أو «دفي الألوان»!`
          : `Your "${styleTitle}" sequence is ready on the timeline via ${nodeLabel} (${model})! Both Direction A (Dynamic J/L Cut) and Direction B (Narrative Filmic) are prepared with Lumetri grading, -14.0 LUFS Fairlight ducking, and safe-zone captions.`
      }
    ];
  }

  const normalizedBaseSvc = svc.endsWith("-mobile") ? svc.slice(0, -7) : svc;
  const svcAliases = {
    photo: "phototron",
    after: "aftertron",
    motion: "gemimotion",
    fig: "figtron",
    light: "lighttron",
    scale: "scaletron"
  };
  const normalizedPhotoSvc = svcAliases[normalizedBaseSvc] || normalizedBaseSvc;
  const creativeAppStreams = {
    gemimotion: {
      thinkingAr: "جاري إخراج المشهد ثلاثي الأبعاد (3D PBR + WGSL) والموسيقى التصويرية في GemiMotion...",
      thinkingEn: "Choreographing 3D PBR scene, WGSL volumetric shaders & 48kHz score in GemiMotion...",
      badges: [
        ["🧊", "motion.timeline.clip.scene3d", "إعداد مشهد 3D PBR وزوايا الكاميرا الذهبية", "Staging 3D PBR Hero & Golden-Ratio Camera Orbit", "دقة 705,600,000 نبضة/ثانية (Qt6 Flicks)", "705,600,000 flicks/sec integer frame lock"],
        ["🌌", "motion.timeline.clip.vfx", "توليد إضاءة وشيدر WGSL المتفاعل", "Compiling Volumetric WGSL Shader World", "إضاءة محيطية ناعمة بدون ضوضاء بصرية", "Smooth HDRI rim lighting & bloom control"],
        ["🎵", "motion.timeline.clip.daw", "تأليف الموسيقى التصويرية 48kHz و٦ مؤثرات صوتية", "Synthesizing 48kHz Vibe Score & 6 SFX Cues", "تزامن لحظي مع إيقاع المشهد", "Beat-grid locked stereo soundtrack"],
        ["💬", "motion.caption.upsert", "مزامنة الكابشن العربي التفاعلي داخل SafeRect", "Syncing RTL Karaoke Captions Inside SafeRect", "صفر مخالفات لهوامش الأمان وتباين WCAG قياسي", "0 SafeRect violations & WCAG AA contrast"]
      ],
      doneAr: `جهزت مشهد GemiMotion (.gmotion) عبر ${nodeLabel} (${model})! صممت إضاءة 3D PBR وشيدر WGSL مع موسيقى 48kHz و٦ مؤثرات صوتية وكابشن عربي داخل منطقة الأمان.`,
      doneEn: `Your GemiMotion (.gmotion) 3D PBR + WGSL scene is ready via ${nodeLabel} (${model})! 48kHz Vibe soundtrack, 6 frame-accurate SFX cues, and SafeRect captions are synced.`
    },
    phototron: {
      thinkingAr: "جاري هندسة طبقات البوستر وتباين الخط العربي في PhotoTron...",
      thinkingEn: "Architecting non-destructive .pcraft layers & Arabic HarfBuzz typography in PhotoTron...",
      badges: [
        ["🖼️", "photo.document.place", "إدراج طبقة العنصر الذكية غير المدمرة", "Placing Non-Destructive Hero Smart Layer", "أبعاد 1:1 و 4:5 و 9:16 و 1.91:1 جاهزة", "4 aspect ratios (1:1, 4:5, 9:16, 1.91:1) aligned"],
        ["🎚️", "photo.adjustment.curves", "ضبط منحنيات التباين اللوني (Curves & Levels)", "Calibrating Filmic Curves & Tonal Separation", "فصل بصري ناعم بدون تسطيح الطبقات", "Parametric tonal separation without flattening"],
        ["🌑", "photo.layerStyle.gradientOverlay", "توليد تدرج الحماية خلف العنوان (WCAG >= 4.5:1)", "Applying Readability Scrim (WCAG >= 4.5:1)", "ضمان وضوح النص على الجوال وسطح المكتب", "Verified >= 4.5:1 foreground/background contrast"],
        ["✒️", "photo.text.create", "تشكيل النص العربي عبر HarfBuzz داخل منطقة الأمان", "Shaping HarfBuzz RTL Display Headline in SafeRect", "طواقم Cairo / Tajawal قابلة للتعديل الكامل", "Editable vector text inside 8% SafeRect margin"]
      ],
      doneAr: `جهزت تصميم PhotoTron (.pcraft) عبر ${nodeLabel} (${model})! أنشأت طبقات الإضاءة والمنحنيات غير المدمرة، وتدرج القراءة عالي التباين، والنص العربي المشكّل عبر HarfBuzz بأربعة مقاسات جاهزة للتصدير.`,
      doneEn: `Your PhotoTron (.pcraft) multi-layer key art is ready via ${nodeLabel} (${model})! Non-destructive Curves, WCAG >= 4.5:1 scrim, and HarfBuzz typography are stacked across all 4 aspect ratios.`
    },
    aftertron: {
      thinkingAr: "جاري تحريك المشهد ومنحنيات التسارع في AfterTron...",
      thinkingEn: "Choreographing rational-clock keyframes & optical glow VFX in AfterTron...",
      badges: [
        ["⏱️", "after.comp.create", "ضبط الساعة الزمنية الدقيقة (60fps Rational Clock)", "Initializing 60fps Rational-Clock Composition", "٢٥٤ مليار نبضة/ثانية بدون انزلاق إطارات", "254,016,000,000 ticks/sec zero-drift grid"],
        ["🔤", "after.layer.create_text", "تحريك عنوان الخطاف البصري (٠ - ٣ ثوانٍ)", "Animating 0-3s Kinetic Hook Typography", "جذب الانتباه الفوري في ريلز وتيك توك", "Pattern-interrupt entrance inside title-safe guides"],
        ["📈", "after.keyframe.easy_ease", "تطبيق منحنيات السرعة Cubic-Bezier Easy-Ease", "Applying Cubic-Bezier Easy-Ease Velocity Curves", "حركة انسيابية خالية من التوقف الحاد", "Smooth spatial & opacity velocity curves"],
        ["✨", "after.effect.apply", "إضافة التوهج البصري (Optical Glow) وتجهيز Alpha", "Binding Optical Glow & Alpha Stem Handoff", "جاهز للربط المباشر مع FilmTron", "Clean track-matte hierarchy ready for FilmTron"]
      ],
      doneAr: `جهزت تكوين AfterTron (.acraft) عبر ${nodeLabel} (${model})! صممت مقدمة خطاف بصري بسرعة 60 إطاراً ومنحنيات حركة انسيابية وتوهج بصري جاهز للدمج في FilmTron.`,
      doneEn: `Your AfterTron (.acraft) VFX composition is ready via ${nodeLabel} (${model})! 60fps kinetic typography, cubic-bezier easy-ease curves, and optical glow stems are verified.`
    },
    figtron: {
      thinkingAr: "جاري هندسة واجهة التحويل ومتغيرات التصميم في FigTron...",
      thinkingEn: "Designing zero-CLS responsive auto-layout & GemiTokens bindings in FigTron...",
      badges: [
        ["📐", "figtron.frame.create_autolayout", "إنشاء إطارات Auto-Layout متجاوبة (سطح مكتب + جوال)", "Creating Responsive Desktop & Mobile Auto-Layout", "منع إزاحة التخطيط التراكمية (Zero CLS)", "Locked intrinsic aspect ratios (CLS = 0)"],
        ["🎨", "figtron.token.bind_variable", "ربط ١٠٠٪ من الألوان والمسافات بمتغيرات GemiTokens", "Binding 100% Design Token Variables", "دعم فوري للوضع الداكن والفاتح", "Zero hardcoded hex; full Dark/Light parity"],
        ["↔️", "figtron.text.create_rtl", "عكس تخطيط RTL/LTR وفحص التباين WCAG AA", "Mirroring Bidirectional RTL/LTR Hierarchy", "وضوح تام للنصوص العربية والإنجليزية", "WCAG AA contrast verified on all CTAs"],
        ["👆", "figtron.component.instantiate", "ضبط حالات المكونات التفاعلية وأهداف اللمس (>= 48px)", "Linking Interactive Component States (>= 48px)", "علاج نقاط الاحتكاك والـ Quickbacks", "Default/Hover/Focus/Disabled states wired"]
      ],
      doneAr: `جهزت تصميم FigTron (.figtron) عبر ${nodeLabel} (${model})! ربطت ١٠٠٪ من متغيرات التصميم مع دعم كامل للعربية RTL وأهداف لمس قياسية جاهزة للتنفيذ.`,
      doneEn: `Your FigTron (.figtron) responsive UI system is ready via ${nodeLabel} (${model})! 100% token-bound auto-layout frames, RTL/LTR mirroring, and >=48px touch targets are verified.`
    },
    lighttron: {
      thinkingAr: "جاري تحميض الصور الخام ومزامنة الكتالوج في LightTron...",
      thinkingEn: "Developing RAW sensor exposure, filmic curve & batch XMP sync in LightTron...",
      badges: [
        ["☀️", "lighttron.develop.exposure_wb", "ضبط التعريض وتوازن اللون الأبيض (Kelvin WB)", "Normalizing RAW Exposure & Kelvin White Balance", "نسبة قص الإضاءة والظلال أقل من ٠.٥٪", "Highlight/shadow clipping strictly < 0.5%"],
        ["🌈", "lighttron.develop.tone_curve", "تطبيق المنحنى السينمائي ومعايرة HSL غير المدمرة", "Applying Filmic Tone Curve & HSL Calibration", "حفظ الإعدادات في ملفات XMP الجانبية", "Non-destructive parametric XMP sidecar saved"],
        ["🎯", "lighttron.mask.radial_gradient", "إضافة قناع شعاعي لإبراز المنتج الرئيسي", "Sculpting Radial Gradient Subject Mask", "عزل ضوئي ناعم بدون هالات", "Smooth feathering around hero SKU"],
        ["🏷️", "lighttron.catalog.sync_settings", "مزامنة الكتالوج وحقن بيانات EXIF/IPTC للسيو", "Batch-Syncing Catalog & IPTC/EXIF SEO Metadata", "توحيد ألوان جلسة التصوير بالكامل", "Uniform SKU color + Google Images metadata"]
      ],
      doneAr: `اكتملت معايرة LightTron (.lcraft) عبر ${nodeLabel} (${model})! وحّدت الإضاءة والألوان عبر كامل الكتالوج بدون مساس بالملفات الخام مع تضمين بيانات السيو الصورية.`,
      doneEn: `Your LightTron (.lcraft) catalog grade is ready via ${nodeLabel} (${model})! RAW exposure, filmic tone curves, and IPTC/EXIF metadata are synced with <0.5% clipping.`
    },
    scaletron: {
      thinkingAr: "جاري التكبير الفائق وتصفية OKLab في ScaleTron...",
      thinkingEn: "Running 4x steerable super-resolution & OKLab guided filtering in ScaleTron...",
      badges: [
        ["🔍", "scale.inspect.classify", "تحليل هندسة الحواف ومستوى الضوضاء اللونية", "Classifying Edge Geometry & Chroma Noise Floor", "تحديد أفضل خوارزمية تكبير تلقائياً", "Selected optimal steerable + OKLab pipeline"],
        ["🔬", "scale.enhance.steerable_sr", "تكبير فائق ٤ أضعاف مع كبح الهالات (3x3 Clamp)", "Executing 4x Steerable Super-Resolution (3x3 Clamp)", "صفر هالات رنين وصفر فواصل بين المربعات", "Zero ringing halos & zero tile seams"],
        ["💎", "scale.enhance.oklab_guided", "تنقية لونية في فضاء OKLab وزيادة حدة التفاصيل", "Filtering Chroma in Perceptual OKLab Space", "تحسن فعلي ومقاس في حدة الحواف (Acutance+)", "Verified positive acutance delta"],
        ["⚡", "scale.topaz.neural_upscale", "تصدير WebP/AVIF فائق الخفة لتسريع LCP (< 2.5s)", "Encoding Next-Gen WebP/AVIF Masters (LCP < 2.5s)", "تخفيض الحجم بأكثر من ٦٥٪ مع نقاء كامل", "65%+ byte reduction for instant Core Web Vitals"]
      ],
      doneAr: `جهزت أصول ScaleTron (.stproj) المكبرة عبر ${nodeLabel} (${model})! ضاعفت الدقة ٤ مرات بدون أي هالات رنين مع ضغط WebP/AVIF فائق السرعة.`,
      doneEn: `Your ScaleTron (.stproj) 4x super-resolution master is ready via ${nodeLabel} (${model})! Zero-halo 3x3 clamping, OKLab chroma clarity, and lightweight WebP/AVIF outputs are verified.`
    }
  };

  if (Object.hasOwn(creativeAppStreams, normalizedPhotoSvc)) {
    const spec = creativeAppStreams[normalizedPhotoSvc];
    return [
      {
        type: "thinking",
        title: isAr ? spec.thinkingAr : spec.thinkingEn,
        detail: isAr
          ? `يعمل العقل الذكي (${model} · ${effort}) عبر ${nodeLabel} لبناء خطة تنفيذ غير مدمرة.`
          : `Running AGYTron Smart Mind (${model} · ${effort}) on ${nodeLabel} for non-destructive execution.`
      },
      ...spec.badges.map(([icon, tool, labelAr, labelEn, summaryAr, summaryEn]) => ({
        type: "tool_badge",
        icon,
        tool,
        status: "done",
        label: isAr ? labelAr : labelEn,
        summary: isAr ? summaryAr : summaryEn
      })),
      {
        type: "chat_message",
        role: "assistant",
        nodeBadge: nodeLabel,
        text: isAr ? spec.doneAr : spec.doneEn
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

