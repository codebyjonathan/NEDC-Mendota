import type { ModerationFlag, CrisisAlert, UserWellnessPattern } from "./types"

// Keywords and patterns for detection
const SELF_HARM_KEYWORDS = [
  "cut",
  "hurt myself",
  "harm",
  "blade",
  "wrist",
  "overdose",
  "poison",
  "suffocate",
  "choke",
  "bang my head",
]
const SUICIDAL_KEYWORDS = [
  "kill myself",
  "end it",
  "not worth living",
  "should be dead",
  "better off dead",
  "want to die",
  "ending it",
  "goodbye",
  "final message",
]
const BULLYING_KEYWORDS = ["stupid", "idiot", "loser", "pathetic", "worthless", "kill yourself"]
const HATE_SPEECH_PATTERNS: RegExp[] = [
  /\bn[\W_]*i[\W_]*g[\W_]*g[\W_]*e[\W_]*r\b/i,
  /\bn[\W_]*i[\W_]*g[\W_]*g[\W_]*a\b/i,
  /\bf[\W_]*a[\W_]*g[\W_]*g[\W_]*o[\W_]*t\b/i,
  /\bk[\W_]*i[\W_]*k[\W_]*e\b/i,
  /\bc[\W_]*h[\W_]*i[\W_]*n[\W_]*k\b/i,
  /\bs[\W_]*p[\W_]*i[\W_]*c\b/i,
  /\bsand[\W_]*n[\W_]*i[\W_]*g[\W_]*g[\W_]*e[\W_]*r\b/i,
  /\brag[\W_]*head\b/i,
]
const HARASSMENT_KEYWORDS = ["harass", "target", "stalk", "threaten"]
const INAPPROPRIATE_CONTENT_KEYWORDS = [
  "nude",
  "nudes",
  "naked",
  "sex",
  "sexual",
  "porn",
  "pornography",
  "nsfw",
  "hook up",
  "explicit",
]
const SEVERE_PROFANITY_KEYWORDS = [
  "fuck",
  "fucking",
  "f word",
  "f-word",
  "fck",
  "fk",
  "bitch",
  "asshole",
  "motherfucker",
  "slut",
  "whore",
]
const PERSONAL_INFO_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{5}(?:-\d{4})?\b/, // Zip code
  /\b[A-Z]{2}\b/, // State abbreviation in context
]

export type ModerationResult = {
  safe: boolean
  confidence: number
  issues: string[]
  suggestions?: string
  crisis_alert?: CrisisAlert | null
  recommended_action: "approve" | "rewrite" | "block" | "escalate"
}

export type CrisisIndicators = {
  severity: "low" | "medium" | "high" | "critical"
  keywords: string[]
  pattern: string
}

/**
 * Main content moderation function
 * Scans for bullying, hate speech, threats, self-harm, suicidal ideation, etc.
 */
export async function moderateContent(
  content: string,
  community_id: string,
  user_id: string,
): Promise<ModerationResult> {
  const issues: string[] = []
  let crisisIndicator: CrisisIndicators | null = null

  const lowerContent = content.toLowerCase()
  const normalizedContent = normalizeForModeration(content)

  // Check for self-harm indicators
  if (checkForKeywords(lowerContent, SELF_HARM_KEYWORDS) || checkForKeywords(normalizedContent, SELF_HARM_KEYWORDS)) {
    issues.push("Self-harm indicators detected")
    crisisIndicator = {
      severity: "critical",
      keywords: extractKeywords(lowerContent, SELF_HARM_KEYWORDS),
      pattern: "self_harm",
    }
  }

  // Check for suicidal ideation
  if (checkForKeywords(lowerContent, SUICIDAL_KEYWORDS) || checkForKeywords(normalizedContent, SUICIDAL_KEYWORDS)) {
    issues.push("Suicidal ideation indicators detected")
    if (!crisisIndicator) {
      crisisIndicator = {
        severity: "critical",
        keywords: extractKeywords(lowerContent, SUICIDAL_KEYWORDS),
        pattern: "suicidal_ideation",
      }
    }
  }

  // Check for bullying
  if (checkForKeywords(lowerContent, BULLYING_KEYWORDS) || checkForKeywords(normalizedContent, BULLYING_KEYWORDS)) {
    issues.push("Bullying language detected")
  }

  // Check for harassment
  if (checkForKeywords(lowerContent, HARASSMENT_KEYWORDS) || checkForKeywords(normalizedContent, HARASSMENT_KEYWORDS)) {
    issues.push("Harassment language detected")
  }

  // Check for hate speech and racial slurs
  if (checkForHateSpeech(content) || checkForHateSpeech(normalizedContent)) {
    issues.push("Hate speech or racial slur detected")
  }

  // Check for sexual/inappropriate content that does not belong in support communities
  if (
    checkForKeywords(lowerContent, INAPPROPRIATE_CONTENT_KEYWORDS) ||
    checkForKeywords(normalizedContent, INAPPROPRIATE_CONTENT_KEYWORDS)
  ) {
    issues.push("Inappropriate sexual content detected")
  }

  // Check for severe profanity (stronger than general profanity)
  if (checkForKeywords(lowerContent, SEVERE_PROFANITY_KEYWORDS) || checkForKeywords(normalizedContent, SEVERE_PROFANITY_KEYWORDS)) {
    issues.push("Severe profanity detected")
  }

  // Check for personal information leaks
  const personalInfoFound = checkForPersonalInfo(content)
  if (personalInfoFound.length > 0) {
    issues.push(`Personal information detected: ${personalInfoFound.join(", ")}`)
  }

  // Check for excessive profanity
  if (checkProfanity(lowerContent)) {
    issues.push("Excessive profanity detected")
  }

  // Determine action
  let recommendedAction: ModerationResult["recommended_action"] = "approve"
  let confidence = 0.95

  if (crisisIndicator && crisisIndicator.severity === "critical") {
    recommendedAction = "escalate"
    confidence = 0.99
  } else if (issues.some((issue) => issue.includes("Hate speech or racial slur"))) {
    recommendedAction = "block"
    confidence = 0.99
  } else if (issues.some((issue) => issue.includes("Inappropriate sexual content"))) {
    recommendedAction = "block"
    confidence = 0.92
  } else if (issues.some((issue) => issue.includes("Severe profanity"))) {
    recommendedAction = "block"
    confidence = 0.9
  } else if (issues.length > 2) {
    recommendedAction = "block"
    confidence = 0.85
  } else if (issues.length === 1) {
    const issue = issues[0]
    if (issue.includes("Bullying") || issue.includes("Harassment")) {
      recommendedAction = "rewrite"
      confidence = 0.8
    } else if (issue.includes("profanity")) {
      recommendedAction = "rewrite"
      confidence = 0.7
    }
  }

  return {
    safe: issues.length === 0,
    confidence,
    issues,
    suggestions: generateSafeRewrite(content),
    crisis_alert: crisisIndicator
      ? {
          id: `alert_${Date.now()}`,
          user_id,
          community_id,
          content_id: "", // Will be set after post creation
          alert_type: crisisIndicator.pattern as "self_harm" | "suicidal_ideation" | "acute_panic" | "escalation_pattern",
          confidence,
          keywords_detected: crisisIndicator.keywords,
          intervention_offered: false,
          counselor_notified: false,
          created_at: new Date().toISOString(),
        }
      : null,
    recommended_action: recommendedAction,
  }
}

function checkForKeywords(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => {
    const pattern = new RegExp(`\\b${keyword}\\b`, "gi")
    return pattern.test(text)
  })
}

function extractKeywords(text: string, keywords: string[]): string[] {
  const found: string[] = []
  keywords.forEach((keyword) => {
    const pattern = new RegExp(`\\b${keyword}\\b`, "gi")
    if (pattern.test(text)) {
      found.push(keyword)
    }
  })
  return found
}

function checkForPersonalInfo(text: string): string[] {
  const found: string[] = []

  // Check patterns
  PERSONAL_INFO_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(text)) {
      const types = ["SSN", "Phone", "Email", "Zip Code", "State"]
      found.push(types[index] || "Personal Info")
    }
  })

  return [...new Set(found)] // Remove duplicates
}

function checkProfanity(text: string): boolean {
  const profanityList = [
    "damn",
    "hell",
    "crap",
    // Add more as needed - keep it limited for mental health context
  ]
  return profanityList.some((word) => new RegExp(`\\b${word}\\b`, "gi").test(text))
}

function checkForHateSpeech(text: string): boolean {
  return HATE_SPEECH_PATTERNS.some((pattern) => pattern.test(text))
}

function normalizeForModeration(input: string): string {
  return input
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[@]/g, "a")
    .replace(/[$]/g, "s")
    // Convert punctuation separators into spaces so "f-word" => "f word"
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Generate a safer version of harmful content
 */
export function generateSafeRewrite(content: string): string {
  let rewritten = content

  // Replace self-harm references
  SELF_HARM_KEYWORDS.forEach((keyword) => {
    rewritten = rewritten.replace(
      new RegExp(`\\b${keyword}\\b`, "gi"),
      "hurting myself" === keyword ? "thinking of self-harm" : keyword,
    )
  })

  // Replace suicidal references with more supportive language
  rewritten = rewritten.replace(/i (?:want to|should|might) die/gi, "I'm struggling and need support")
  rewritten = rewritten.replace(/end it/gi, "get relief from this pain")

  return rewritten
}

/**
 * Detect patterns of hopelessness, panic, or emotional escalation
 */
export function analyzeUserPattern(posts: Array<{ content: string; created_at: string }>): UserWellnessPattern {
  const crisisKeywords = [...SELF_HARM_KEYWORDS, ...SUICIDAL_KEYWORDS]
  let crisisCount = 0
  let hopelessnessCount = 0

  const hopelessnessPatterns = [
    "nothing matters",
    "pointless",
    "hopeless",
    "can't get better",
    "always like this",
    "never change",
  ]

  posts.forEach((post) => {
    const lower = post.content.toLowerCase()
    if (checkForKeywords(lower, crisisKeywords)) {
      crisisCount++
    }
    if (checkForKeywords(lower, hopelessnessPatterns)) {
      hopelessnessCount++
    }
  })

  const escalationScore = (crisisCount / Math.max(posts.length, 1)) * 100
  const hopelessnessDetected = hopelessnessCount > posts.length * 0.3

  return {
    id: `pattern_${Date.now()}`,
    user_id: "", // Will be set by caller
    last_activity: new Date().toISOString(),
    post_frequency_24h: posts.length,
    crisis_keyword_frequency: crisisCount,
    emotional_escalation_score: escalationScore,
    hopelessness_pattern_detected: hopelessnessDetected,
    last_intervention: new Date().toISOString(),
    intervention_count_7d: 0,
    needs_wellness_check: escalationScore > 50 || hopelessnessDetected,
  }
}

/**
 * Generate wellness intervention message
 */
export function generateWellnessIntervention(pattern: UserWellnessPattern): string {
  if (pattern.hopelessness_pattern_detected) {
    return "We notice you might be having some difficult thoughts. Would you like to try a calming activity or talk to a counselor?"
  }

  if (pattern.emotional_escalation_score > 70) {
    return "You seem to be going through a tough time. Here are some tools that might help: breathing exercises, grounding techniques, or connecting with a counselor."
  }

  if (pattern.emotional_escalation_score > 50) {
    return "We're here for you. Would you like to explore some wellness activities or crisis resources?"
  }

  return "Remember to take care of yourself. Check out our wellness tools anytime."
}

/**
 * Strike system: track violations and implement 3-strike bans
 */
export function calculateStrikeCount(violations: number, severity: "low" | "medium" | "high" | "critical"): number {
  const severityWeights = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    critical: 2,
  }

  return Math.min(violations * severityWeights[severity], 3)
}

export function shouldBanUser(strikeCount: number): boolean {
  return strikeCount >= 3
}

export function getBanDuration(strikeCount: number): number {
  // Returns hours
  if (strikeCount >= 5) return 24 * 30 // 30 days permanent review
  if (strikeCount >= 4) return 24 * 7 // 7 days
  if (strikeCount >= 3) return 24 * 3 // 3 days
  return 0
}
