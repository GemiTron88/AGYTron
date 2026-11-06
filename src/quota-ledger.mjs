/**
 * @gemitron/agy-tron — 100% Google-ToS-Safe Model Family Quota Ledger (`src/quota-ledger.mjs`)
 *
 * SAFETY & COMPLIANCE INVARIANT:
 * - NEVER reads, scrapes, or decrypts `~/.gemini/oauth_creds.json` or internal Antigravity auth files.
 * - NEVER calls undocumented internal Google Cloud / CloudAICompanion quota endpoints.
 * - Tracks usage 100% locally via self-metered request & token counters per Model Family across
 *   rolling 5-hour windows and 24-hour daily windows, plus standard HTTP 429 / CLI exit cooldowns.
 * - Automatically cascades to the next optimal model family when a family reaches its soft/hard threshold.
 */

import fs from "node:fs";
import path from "node:path";

export const QUOTA_LEDGER_SCHEMA = "tronagy.quota_ledger.tos_safe.v1";

export const AGY_MODEL_FAMILIES = Object.freeze({
  "gemini-4-argon": Object.freeze({
    familyId: "gemini-4-argon",
    labelEn: "Gemini 4 Argon Family",
    labelAr: "عائلة Gemini 4 Argon",
    provider: "google-antigravity",
    models: ["gemini-4-argon-high", "gemini-4-argon-medium", "gemini-4-argon-low"],
    window5hRequestLimit: 150,
    dailyRequestLimit: 600,
    dailyTokenLimit: 2_500_000,
    softWarningRatio: 0.8,
    fallbackChain: ["claude-sonnet-5-5-high", "gemini-3.8-flash-high", "gpt-oss-120b-medium", "qwen3.5:4b-q4_K_M"]
  }),
  "gemini-3.8-flash": Object.freeze({
    familyId: "gemini-3.8-flash",
    labelEn: "Gemini 3.8 Flash Family",
    labelAr: "عائلة Gemini 3.8 Flash",
    provider: "google-antigravity",
    models: ["gemini-3.8-flash-high", "gemini-3.8-flash-medium", "gemini-3.8-flash-low"],
    window5hRequestLimit: 500,
    dailyRequestLimit: 2000,
    dailyTokenLimit: 6_000_000,
    softWarningRatio: 0.85,
    fallbackChain: ["gpt-oss-120b-medium", "qwen3.5:4b-q4_K_M"]
  }),
  "claude-opus-5-5": Object.freeze({
    familyId: "claude-opus-5-5",
    labelEn: "Claude Opus 5.5 Family",
    labelAr: "عائلة Claude Opus 5.5",
    provider: "anthropic-antigravity",
    models: ["claude-opus-5-5-high", "claude-opus-5-5-medium", "claude-opus-5-5-low"],
    window5hRequestLimit: 80,
    dailyRequestLimit: 300,
    dailyTokenLimit: 1_500_000,
    softWarningRatio: 0.8,
    fallbackChain: ["gemini-4-argon-high", "claude-sonnet-5-5-high", "gpt-oss-120b-medium"]
  }),
  "claude-sonnet-5-5": Object.freeze({
    familyId: "claude-sonnet-5-5",
    labelEn: "Claude Sonnet 5.5 Family",
    labelAr: "عائلة Claude Sonnet 5.5",
    provider: "anthropic-antigravity",
    models: ["claude-sonnet-5-5-high", "claude-sonnet-5-5-medium", "claude-sonnet-5-5-low"],
    window5hRequestLimit: 240,
    dailyRequestLimit: 1000,
    dailyTokenLimit: 3_500_000,
    softWarningRatio: 0.85,
    fallbackChain: ["gemini-4-argon-medium", "gemini-3.8-flash-high", "gpt-oss-120b-medium"]
  }),
  "gpt-oss-120b": Object.freeze({
    familyId: "gpt-oss-120b",
    labelEn: "GPT-OSS 120B Family",
    labelAr: "عائلة GPT-OSS 120B",
    provider: "oss-antigravity",
    models: ["gpt-oss-120b-medium"],
    window5hRequestLimit: 400,
    dailyRequestLimit: 1600,
    dailyTokenLimit: 5_000_000,
    softWarningRatio: 0.85,
    fallbackChain: ["gemini-3.8-flash-medium", "qwen3.5:4b-q4_K_M"]
  }),
  "local-tron": Object.freeze({
    familyId: "local-tron",
    labelEn: "Local TRON Loopback (Unlimited)",
    labelAr: "حلقة TRON المحلية (غير محدود)",
    provider: "local-workstation",
    models: ["qwen3.5:4b-q4_K_M"],
    window5hRequestLimit: 999_999,
    dailyRequestLimit: 999_999,
    dailyTokenLimit: 999_999_999,
    softWarningRatio: 0.99,
    fallbackChain: []
  })
});

export function resolveModelFamilyId(modelId = "gemini-4-argon-high") {
  const clean = String(modelId || "").trim().toLowerCase();
  if (clean.startsWith("gemini-4-argon") || clean === "gemini-3.1-pro") return "gemini-4-argon";
  if (clean.startsWith("gemini-3.8-flash") || clean === "gemini-3-flash") return "gemini-3.8-flash";
  if (clean.startsWith("claude-opus")) return "claude-opus-5-5";
  if (clean.startsWith("claude-sonnet")) return "claude-sonnet-5-5";
  if (clean.startsWith("gpt-oss")) return "gpt-oss-120b";
  if (clean.startsWith("qwen")) return "local-tron";
  return "gemini-4-argon";
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function createAgyQuotaLedger({ storagePath = "" } = {}) {
  const state = new Map();

  function initBuckets(now = Date.now()) {
    for (const family of Object.values(AGY_MODEL_FAMILIES)) {
      if (!state.has(family.familyId)) {
        state.set(family.familyId, {
          familyId: family.familyId,
          window5hStartedAt: now,
          dayStartedAt: now,
          window5hRequests: 0,
          dailyRequests: 0,
          dailyTokens: 0,
          rateLimitHits: 0,
          cooldownUntil: null,
          lastUsedAt: null,
          lastModelId: null,
          byService: {}
        });
      }
    }
  }

  initBuckets();

  if (storagePath && fs.existsSync(storagePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(storagePath, "utf8"));
      if (raw && typeof raw.families === "object") {
        for (const [fid, saved] of Object.entries(raw.families)) {
          if (state.has(fid) && saved && typeof saved === "object") {
            state.set(fid, { ...state.get(fid), ...saved });
          }
        }
      }
    } catch {
      // Ignore corrupt state file in sandbox
    }
  }

  function persist() {
    if (!storagePath) return;
    try {
      fs.mkdirSync(path.dirname(storagePath), { recursive: true });
      const familiesObj = {};
      for (const [k, v] of state.entries()) {
        familiesObj[k] = v;
      }
      fs.writeFileSync(
        storagePath,
        JSON.stringify(
          {
            schema: QUOTA_LEDGER_SCHEMA,
            tosSafe: true,
            updatedAt: new Date().toISOString(),
            families: familiesObj
          },
          null,
          2
        ),
        "utf8"
      );
    } catch {
      // Non-fatal in read-only test environments
    }
  }

  function rotateWindowsIfNeeded(bucket, now = Date.now()) {
    if (now - bucket.window5hStartedAt >= FIVE_HOURS_MS) {
      bucket.window5hStartedAt = now;
      bucket.window5hRequests = 0;
    }
    if (now - bucket.dayStartedAt >= ONE_DAY_MS) {
      bucket.dayStartedAt = now;
      bucket.dailyRequests = 0;
      bucket.dailyTokens = 0;
    }
    if (bucket.cooldownUntil && now >= bucket.cooldownUntil) {
      bucket.cooldownUntil = null;
    }
  }

  function evaluateFamilyStatus(familyId, now = Date.now()) {
    const family = AGY_MODEL_FAMILIES[familyId] || AGY_MODEL_FAMILIES["gemini-4-argon"];
    const bucket = state.get(family.familyId);
    rotateWindowsIfNeeded(bucket, now);

    const winRatio = bucket.window5hRequests / family.window5hRequestLimit;
    const dayReqRatio = bucket.dailyRequests / family.dailyRequestLimit;
    const dayTokRatio = bucket.dailyTokens / family.dailyTokenLimit;
    const maxRatio = Math.min(1, Math.max(winRatio, dayReqRatio, dayTokRatio));
    const remainingPct = Math.max(0, Math.round((1 - maxRatio) * 100));
    const inCooldown = Boolean(bucket.cooldownUntil && bucket.cooldownUntil > now);
    const exhausted =
      inCooldown ||
      bucket.window5hRequests >= family.window5hRequestLimit ||
      bucket.dailyRequests >= family.dailyRequestLimit ||
      bucket.dailyTokens >= family.dailyTokenLimit;

    let health = "HEALTHY";
    if (exhausted) {
      health = "EXHAUSTED_COOLDOWN";
    } else if (maxRatio >= family.softWarningRatio) {
      health = "WARNING_HIGH_USAGE";
    }

    return {
      familyId: family.familyId,
      labelEn: family.labelEn,
      labelAr: family.labelAr,
      provider: family.provider,
      models: family.models,
      health,
      exhausted,
      inCooldown,
      cooldownUntilIso: bucket.cooldownUntil ? new Date(bucket.cooldownUntil).toISOString() : null,
      remainingPct,
      usedPct: 100 - remainingPct,
      window5h: {
        usedRequests: bucket.window5hRequests,
        limitRequests: family.window5hRequestLimit,
        resetsAtIso: new Date(bucket.window5hStartedAt + FIVE_HOURS_MS).toISOString()
      },
      daily: {
        usedRequests: bucket.dailyRequests,
        limitRequests: family.dailyRequestLimit,
        usedTokens: bucket.dailyTokens,
        limitTokens: family.dailyTokenLimit,
        resetsAtIso: new Date(bucket.dayStartedAt + ONE_DAY_MS).toISOString()
      },
      rateLimitHits: bucket.rateLimitHits,
      lastUsedAt: bucket.lastUsedAt,
      lastModelId: bucket.lastModelId,
      byService: bucket.byService,
      fallbackChain: family.fallbackChain
    };
  }

  return {
    getSnapshot(now = Date.now()) {
      const families = Object.keys(AGY_MODEL_FAMILIES).map((fid) =>
        evaluateFamilyStatus(fid, now)
      );
      const totalRequests24h = families.reduce((acc, f) => acc + (f.daily?.usedRequests || 0), 0);
      const totalTokens24h = families.reduce((acc, f) => acc + (f.daily?.usedTokens || 0), 0);
      return {
        ok: true,
        schema: QUOTA_LEDGER_SCHEMA,
        tosSafe: true,
        totalRequests24h,
        totalTokens24h,
        tosCompliance: {
          tosSafe: true,
          method: "local-self-metered-ledger",
          zeroOauthScraping: true,
          zeroInternalGoogleEndpoints: true
        },
        timestamp: new Date(now).toISOString(),
        families
      };
    },

    recordUsage({
      modelId = "gemini-4-argon-high",
      serviceId = "gemiai",
      service = null,
      promptTokens = 0,
      thinkingTokens = 0,
      completionTokens = 0,
      rateLimited = false,
      cooldownSeconds = 300,
      now = Date.now()
    } = {}) {
      const effectiveService = service || serviceId || "gemiai";
      const familyId = resolveModelFamilyId(modelId);
      const bucket = state.get(familyId);
      rotateWindowsIfNeeded(bucket, now);

      const totalTokens =
        Math.max(0, Number(promptTokens) || 0) +
        Math.max(0, Number(thinkingTokens) || 0) +
        Math.max(0, Number(completionTokens) || 0);

      bucket.window5hRequests += 1;
      bucket.dailyRequests += 1;
      bucket.dailyTokens += totalTokens;
      bucket.lastUsedAt = new Date(now).toISOString();
      bucket.lastModelId = modelId;
      bucket.byService[effectiveService] = (bucket.byService[effectiveService] || 0) + 1;

      if (rateLimited) {
        bucket.rateLimitHits += 1;
        bucket.cooldownUntil = now + Math.max(10, cooldownSeconds) * 1000;
      }

      persist();
      return evaluateFamilyStatus(familyId, now);
    },

    selectQuotaSafeModel(requestedModelId = "gemini-4-argon-high", now = Date.now()) {
      const primaryFamilyId = resolveModelFamilyId(requestedModelId);
      const primaryStatus = evaluateFamilyStatus(primaryFamilyId, now);
      if (!primaryStatus.exhausted) {
        return {
          selectedModelId: requestedModelId,
          selectedModel: requestedModelId,
          familyId: primaryFamilyId,
          selectedFamilyId: primaryFamilyId,
          requestedFamilyId: primaryFamilyId,
          downgraded: false,
          failoverTriggered: false,
          remainingPct: primaryStatus.remainingPct,
          reasonEn: `${primaryStatus.labelEn} has ${primaryStatus.remainingPct}% quota remaining`,
          reasonAr: `${primaryStatus.labelAr} متاح بنسبة ${primaryStatus.remainingPct}% من الحصة`
        };
      }

      for (const candidateModel of primaryStatus.fallbackChain) {
        const candidateFamilyId = resolveModelFamilyId(candidateModel);
        const candidateStatus = evaluateFamilyStatus(candidateFamilyId, now);
        if (!candidateStatus.exhausted) {
          return {
            selectedModelId: candidateModel,
            selectedModel: candidateModel,
            familyId: candidateFamilyId,
            selectedFamilyId: candidateFamilyId,
            requestedFamilyId: primaryFamilyId,
            downgraded: true,
            failoverTriggered: true,
            originalModelId: requestedModelId,
            remainingPct: candidateStatus.remainingPct,
            reasonEn: `${primaryStatus.labelEn} reached quota limit; auto-switched to ${candidateModel} (${candidateStatus.remainingPct}% remaining)`,
            reasonAr: `امتلأت حصة ${primaryStatus.labelAr} مؤقتاً؛ تم التحويل الذكي إلى ${candidateModel} (متبقٍ ${candidateStatus.remainingPct}%)`
          };
        }
      }

      return {
        selectedModelId: "qwen3.5:4b-q4_K_M",
        selectedModel: "qwen3.5:4b-q4_K_M",
        familyId: "local-tron",
        selectedFamilyId: "local-tron",
        requestedFamilyId: primaryFamilyId,
        downgraded: true,
        failoverTriggered: true,
        originalModelId: requestedModelId,
        remainingPct: 100,
        reasonEn: "All cloud model families in cooldown; routed to unlimited Local TRON Loopback",
        reasonAr: "تم التحويل التلقائي إلى نموذج TRON المحلي غير المحدود"
      };
    },

    resetFamily(familyId = "all", now = Date.now()) {
      const targets =
        familyId === "all" ? Object.keys(AGY_MODEL_FAMILIES) : [familyId];
      for (const fid of targets) {
        if (state.has(fid)) {
          state.set(fid, {
            familyId: fid,
            window5hStartedAt: now,
            dayStartedAt: now,
            window5hRequests: 0,
            dailyRequests: 0,
            dailyTokens: 0,
            rateLimitHits: 0,
            cooldownUntil: null,
            lastUsedAt: null,
            lastModelId: null,
            byService: {}
          });
        }
      }
      persist();
      return this.getSnapshot(now);
    }
  };
}

export const defaultAgyQuotaLedger = createAgyQuotaLedger();
