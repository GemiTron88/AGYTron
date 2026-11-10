# AGYTron (`GemiTron88/AGYTron` · `@gemitron/agy-tron`)

**Global AGY AI Creative Director, ToS-Safe Host-Inversion SDK, Dual Cloud/Local GemiMCP Bridge, and Premium Control Studio** for all 6 **TronCS Creative Suite** applications:

1. **PhotoTron** (`.pcraft` / `.psd`) — Key art compositing, hero retouching, Arabic display typography
2. **AfterTron** (`.acraft` / `.aep`) — Node/layer VFX, 3D camera tracking, easy-ease keyframe choreography
3. **FilmTron** (`.fcraft` / `.prproj`) — 3-act NLE editorial, Lumetri cinema grading, Fairlight `-14.0 LUFS` audio
4. **GemiMotion** (`.gmotion` / `gemimotion-recipe/v3`) — Procedural 3D PBR + WGSL shaders, 48kHz stereo Vibe Score, Auto-SFX
5. **FigTron** (`.figtron` / `.fig`) — Design system tokens, bidirectional RTL/LTR auto-layout, UX prototypes
6. **LightTron** (`.lcraft`) — Non-destructive RAW demosaic develop, filmic tone curves, batch shoot calibration

7. **ScaleTron** (`.stproj`) — 2x/4x/8x/16x edge-directed steerable super-resolution, OKLab guided chroma filtering, next-gen WebP/AVIF encoding

Plus global Smart Mind orchestration for **Rankly** (SEO & Webmaster Autopilot) and **Tarweeg** (9-Platform Ad LaunchSaga), spanning **14 models**, **5 reasoning effort tiers** (`low`, `medium`, `high`, `xhigh`, `max`), **60 specialized skills**, **39 multi-step workflows**, and a **6-family Google-ToS-Safe Quota Ledger**.

---

## 1. How GemiMCP Works: Cloud (`mcp.gemitron.net`) + Local Workstation (`127.0.0.1:18210`)

`GemiMCP` is a **hybrid Cloud + Paired Workstation MCP architecture** (`src/mcp-bridge.mjs`):

- **Cloud GemiMCP (`https://mcp.gemitron.net/mcp` & `/products/<app>/mcp`):**
  - Acts as the authoritative cloud OAuth/Zitadel gateway (`https://auth.gemitron.net`), `GemiGuard` hardware lease verifier, durable idempotent job store, and **Outbound-Only Desktop Agent Hub** (`desktop-agent.mjs`).
  - When a cloud agent (or remote session) calls a tool on `https://mcp.gemitron.net`, the Cloud MCP verifies the `OWNER` grant and dispatches the native command over the paired outbound WebSocket/HTTP tunnel to the user's workstation without ever opening an inbound port on the user's computer.
- **Local Workstation Loopback (`http://127.0.0.1:18210/mcp` + `http://127.0.0.1:8090`):**
  - The exact same `GemiMCP` server also runs locally on `127.0.0.1:18210` alongside the local TRON runtime (`127.0.0.1:8090` `llama-server` and `127.0.0.1:30001` `TronCS` broker) for zero-latency local tool execution and 100% offline workflows.

---

## 2. 100% Google-ToS-Safe Auth (`Host-Inversion Architecture`)

Google strictly forbids third-party applications from scraping or reusing internal Antigravity IDE OAuth tokens (`~/.gemini/oauth_creds.json` or internal `cloudaicompanion` endpoints) outside the official Antigravity runtime.

`TronAGY` enforces `AGY_TOS_SAFETY_GUARD` (`forbidExternalGoogleOauthExtraction: true`):
1. **`agy-mcp-host` (Host-Inversion — Default):** Official Antigravity IDE/CLI runs inside Google's official environment as the **MCP Client Host** and connects *into* `GemiMCP` using **your own `GemiGuard` / `gemi_at_*` / Zitadel token**. Zero Google tokens ever leave Antigravity.
2. **`gemi-access-token`:** First-party GemiTron authentication (`https://auth.gemitron.net`).
3. **`api-key-env`:** Standard commercial `GEMINI_API_KEY` (Google AI Studio / Vertex AI) or `ANTHROPIC_API_KEY` when running standalone outside Antigravity.
4. **`local-tron-loopback`:** 100% offline local inference (`127.0.0.1:8090`).

---

## 3. Quick Start & CLI Subcommands

```bash
# Run verification suite
npm test

# Run full architectural, ToS, knowledgebase & quota readiness audit
node ./bin/tron-agy.mjs audit

# Plan or execute a creative recipe for PhotoTron (or any of the 9 core apps)
node ./bin/tron-agy.mjs execute \
  --service phototron \
  --skill skill.phototron.arabic_key_art \
  --workflow wf.phototron.4ratio_ad_pack \
  --model gemini-4-argon-high \
  --effort xhigh \
  --prompt "أورورا كرونوغراف X1 — بوستر إعلاني بـ ٤ مقاسات"

# Multi-app TronCS Creative Suite plan
node ./bin/tron-agy.mjs direct \
  --prompt "أورورا كرونوغراف X1 — حملة إطلاق متكاملة" \
  --apps phototron,aftertron,gemimotion,filmtron,figtron,lighttron,scaletron \
  --model gemini-4-argon-high \
  --effort xhigh \
  --auth-mode agy-mcp-host \
  --transport hybrid-auto

# Inspect skills, workflows, quota ledger, and 4-device fleet
node ./bin/tron-agy.mjs skills --app phototron
node ./bin/tron-agy.mjs workflows --app phototron
node ./bin/tron-agy.mjs quota
node ./bin/tron-agy.mjs fleet --probe
```

