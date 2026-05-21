const BLOCKED_PATTERNS: RegExp[] = [
  // Common abusive/profane language
  /\b(fuck|fucking|shit|bitch|asshole|motherfucker|cunt|slut)\b/i,
  // Hate/extremist indicators
  /\b(kkk|white\s+power|heil\s+hitler|nazi)\b/i,
  // Direct harassment prompts
  /\b(kys|kill\s+yourself|go\s+die)\b/i,
  // Attempts to force slur output
  /\b(say|write|repeat).{0,20}\b(slur|racial\s+slur)\b/i,
]

export function isLikelyOffensiveText(value: string): boolean {
  const text = normalizeText(value)
  if (!text) return false
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text))
}

const NICKNAME_BLOCKLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "motherfucker",
  "cunt",
  "slut",
  "whore",
  "nigger",
  "nigga",
  "faggot",
  "kike",
  "chink",
  "spic",
  "retard",
  "rape",
  "rapist",
  "kys",
  "killyourself",
  "heilhitler",
  "naz1",
  "nazi",
]

export function validateNickname(rawValue: string): { ok: boolean; reason?: string } {
  const value = rawValue.trim()

  if (value.length < 3 || value.length > 18) {
    return { ok: false, reason: "Nickname must be 3-18 characters." }
  }

  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    return { ok: false, reason: "Use only letters, numbers, dot, underscore, or hyphen." }
  }

  if (/^[._-]|[._-]$/.test(value)) {
    return { ok: false, reason: "Nickname cannot start or end with symbols." }
  }

  if (/(.)\1\1\1/i.test(value)) {
    return { ok: false, reason: "Nickname has too many repeated characters." }
  }

  const canonical = normalizeForNicknameChecks(value)
  if (NICKNAME_BLOCKLIST.some((term) => canonical.includes(term))) {
    return { ok: false, reason: "Nickname contains restricted language." }
  }

  if (isLikelyOffensiveText(value)) {
    return { ok: false, reason: "Nickname contains restricted language." }
  }

  return { ok: true }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeForNicknameChecks(value: string): string {
  const lowered = value.toLowerCase()
  const leetMapped = lowered
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
  return leetMapped.replace(/[^a-z]/g, "")
}
