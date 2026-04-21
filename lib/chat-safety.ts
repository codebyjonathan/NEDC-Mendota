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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

