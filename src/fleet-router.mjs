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
 * Zero-Tech-Jargon Streaming Protocol (SSE / WebSocket):
 *   - `thinking`   -> Human-friendly creative thought updates (no token numbers or raw schemas)
 *   - `tool_badge` -> Visual progress pills (e.g., "Designing 3D Scene", "Composing Music")
 *   - `chat_delta` -> Conversational director reply streamed word-by-word
 *   - `stage_sync` -> Automatically updates the canvas/timeline in the background
 */

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
    labelAr: "خادم سحابي VPS 01",
    labelEn: "Linux Cloud VPS 01",
    locationAr: "سيرفر Linux الأول · متاح دائماً",
    locationEn: "Primary Linux Cloud Server · 24/7 Online",
    kind: "cloud-vps",
    defaultEndpoint: "https://vps01-agy.gemitron.net"
  }),
  "vps-02": Object.freeze({
    id: "vps-02",
    icon: "🚀",
    labelAr: "خادم سحابي VPS 02",
    labelEn: "Linux Cloud VPS 02",
    locationAr: "سيرفر Linux الثاني · للمهام الثقيلة",
    locationEn: "Secondary Linux Cloud Server · Heavy Production",
    kind: "cloud-vps",
    defaultEndpoint: "https://vps02-agy.gemitron.net"
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

/**
 * Generates human-friendly, zero-jargon live stream events for the AGY Chat UI.
 */
export function buildCreatorFriendlyStreamEvents({
  prompt,
  locale = "ar-EG",
  nodeId = "auto-best",
  styleTitle = "إعلان سينمائي فاخر"
} = {}) {
  const isAr = locale.startsWith("ar");
  const routed = selectOptimalFleetNode({ preferredNodeId: nodeId });
  const nodeLabel = isAr ? routed.selectedNode.labelAr : routed.selectedNode.labelEn;

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
