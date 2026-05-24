import type { UserBan, UserViolation } from "./types"

/**
 * Strike calculation based on violation severity
 */
export const STRIKE_WEIGHTS = {
  low: 0.5,
  medium: 1,
  high: 1.5,
  critical: 2,
}

/**
 * Ban duration (hours) based on strike count
 */
export const BAN_DURATIONS = {
  1: 0, // Warning only
  2: 0, // Caution only
  3: 24, // 1 day
  4: 72, // 3 days
  5: 168, // 7 days
  6: 720, // 30 days
}

/**
 * Calculate current strike count from violations
 */
export function calculateCurrentStrikes(violations: UserViolation[]): number {
  return violations.reduce((total, violation) => {
    const weight = STRIKE_WEIGHTS[violation.severity as keyof typeof STRIKE_WEIGHTS] || 1
    return total + weight
  }, 0)
}

/**
 * Determine if user should be banned based on strikes
 */
export function shouldBanUser(strikeCount: number): boolean {
  return strikeCount >= 3
}

/**
 * Get ban duration in hours for current strike count
 */
export function getBanDurationHours(strikeCount: number): number {
  const roundedStrikes = Math.ceil(strikeCount)

  if (roundedStrikes >= 6) return BAN_DURATIONS[6] // 30 days
  if (roundedStrikes >= 5) return BAN_DURATIONS[5] // 7 days
  if (roundedStrikes >= 4) return BAN_DURATIONS[4] // 3 days
  if (roundedStrikes >= 3) return BAN_DURATIONS[3] // 1 day
  return BAN_DURATIONS[2] // 0 hours (caution only)
}

/**
 * Determine warning level for user
 */
export function getWarningLevel(
  strikeCount: number,
): "none" | "warning" | "caution" | "banned" {
  if (strikeCount >= 3) return "banned"
  if (strikeCount >= 2) return "caution"
  if (strikeCount >= 1) return "warning"
  return "none"
}

/**
 * Get warning message for user
 */
export function getWarningMessage(strikeCount: number, lang: "en" | "es" | "ar" = "en"): string {
  const messages = {
    en: {
      none: "",
      warning: `You have received a warning. Please review our community guidelines. You have ${3 - strikeCount} strikes remaining before a temporary ban.`,
      caution: `You are on caution. Another violation may result in a temporary ban. You have ${3 - strikeCount} strikes remaining.`,
      banned: `You have been temporarily banned from this community for violating our guidelines. Your ban will be lifted after the designated period.`,
    },
    es: {
      none: "",
      warning: `Has recibido una advertencia. Por favor, revisa nuestras normas de la comunidad. Te quedan ${3 - strikeCount} advertencias antes de un ban temporal.`,
      caution: `Estás en precaución. Otra violación puede resultar en un ban temporal. Te quedan ${3 - strikeCount} advertencias.`,
      banned: `Has sido baneado temporalmente de esta comunidad por violar nuestras normas. Tu ban será levantado después del período designado.`,
    },
    ar: {
      none: "",
      warning: `لقد تلقيت تحذيراً. يرجى مراجعة إرشادات مجتمعنا. لديك ${3 - strikeCount} تحذيرات متبقية قبل حظر مؤقت.`,
      caution: `أنت تحت المراقبة. قد ينتج عن انتهاك آخر حظر مؤقت. لديك ${3 - strikeCount} تحذيرات متبقية.`,
      banned: `تم حظرك مؤقتاً من هذا المجتمع بسبب انتهاك إرشاداتنا. سيتم رفع الحظر بعد الفترة المحددة.`,
    },
  }

  const level = getWarningLevel(strikeCount)
  return messages[lang][level] || ""
}

/**
 * Calculate when a ban will expire
 */
export function calculateBanExpiration(banCreatedAt: string, banDurationHours: number): string | null {
  if (banDurationHours === 0) return null

  const banDate = new Date(banCreatedAt)
  const expirationDate = new Date(banDate.getTime() + banDurationHours * 60 * 60 * 1000)
  return expirationDate.toISOString()
}

/**
 * Check if a ban is currently active
 */
export function isBanActive(ban: UserBan): boolean {
  if (ban.ban_type === "permanent") return !ban.lifted_at

  if (ban.expires_at) {
    return new Date(ban.expires_at) > new Date()
  }

  return false
}

/**
 * Get remaining ban time in hours
 */
export function getRemainingBanHours(ban: UserBan): number {
  if (ban.ban_type === "permanent") return Infinity

  if (ban.expires_at) {
    const now = new Date()
    const expiration = new Date(ban.expires_at)
    const differenceMs = expiration.getTime() - now.getTime()
    const differenceHours = Math.max(0, Math.ceil(differenceMs / (1000 * 60 * 60)))
    return differenceHours
  }

  return 0
}

/**
 * Strike decay: reduce strikes over time for good behavior
 * 30 days without violations removes 0.5 strikes
 */
export function applyStrikeDecay(violations: UserViolation[], daysWithoutViolation: number): number {
  let currentStrikes = calculateCurrentStrikes(violations)
  const decayPeriodDays = 30
  const decayAmount = 0.5

  const completedDecayPeriods = Math.floor(daysWithoutViolation / decayPeriodDays)
  const decayedStrikes = Math.max(0, currentStrikes - completedDecayPeriods * decayAmount)

  return Math.round(decayedStrikes * 10) / 10 // Round to 1 decimal place
}

/**
 * Generate human-readable ban duration
 */
export function formatBanDuration(durationHours: number, lang: "en" | "es" | "ar" = "en"): string {
  if (durationHours === 0) return "N/A"
  if (durationHours === Infinity) {
    const messages = {
      en: "Permanent",
      es: "Permanente",
      ar: "دائم",
    }
    return messages[lang]
  }

  const days = Math.floor(durationHours / 24)
  const hours = durationHours % 24

  const messages = {
    en: {
      days: "day",
      hours: "hour",
      and: "and",
    },
    es: {
      days: "día",
      hours: "hora",
      and: "y",
    },
    ar: {
      days: "يوم",
      hours: "ساعة",
      and: "و",
    },
  }

  const msg = messages[lang]

  if (days > 0 && hours > 0) {
    return `${days} ${msg.days} ${msg.and} ${hours} ${msg.hours}`
  }
  if (days > 0) return `${days} ${msg.days}`
  return `${hours} ${msg.hours}`
}

/**
 * Generate violation report for moderation
 */
export interface ViolationReport {
  userId: string
  communityId: string
  currentStrikes: number
  warningLevel: "none" | "warning" | "caution" | "banned"
  recentViolations: UserViolation[]
  strikeDecayProgress: number // 0-100, how close to next decay
  recommendedAction: "approve" | "warn" | "temporary_ban" | "permanent_review"
}

export function generateViolationReport(
  userId: string,
  violations: UserViolation[],
  lastGoodBehaviorDate: string,
): ViolationReport {
  const currentStrikes = applyStrikeDecay(
    violations,
    Math.floor((new Date().getTime() - new Date(lastGoodBehaviorDate).getTime()) / (1000 * 60 * 60 * 24)),
  )
  const warningLevel = getWarningLevel(currentStrikes)
  const recentViolations = violations.slice(-5) // Last 5 violations

  // Calculate progress to next strike decay (30 days)
  const daysSinceLastViolation = Math.floor(
    (new Date().getTime() - new Date(violations[violations.length - 1]?.created_at || new Date()).getTime()) /
      (1000 * 60 * 60 * 24),
  )
  const strikeDecayProgress = (daysSinceLastViolation % 30) / 30 * 100

  let recommendedAction: "approve" | "warn" | "temporary_ban" | "permanent_review" = "approve"
  if (currentStrikes >= 6) recommendedAction = "permanent_review"
  else if (currentStrikes >= 3) recommendedAction = "temporary_ban"
  else if (currentStrikes >= 1) recommendedAction = "warn"

  return {
    userId,
    communityId: violations[0]?.community_id || "",
    currentStrikes,
    warningLevel,
    recentViolations,
    strikeDecayProgress,
    recommendedAction,
  }
}
