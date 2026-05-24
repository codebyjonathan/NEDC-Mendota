// Anonymous User Identity
export type AnonymousIdentity = {
  id: string // unique user identifier
  username: string // e.g., "CalmRiver42", "BrightLeaf88"
  avatar_seed: string // for consistent avatar generation
  created_at: string
}

// Community Types
export type Community = {
  id: string
  name: string // e.g., "Stress & Anxiety", "School Pressure", "Sleep Struggles"
  slug: string
  description: string
  icon: string // emoji or icon name
  color: string // tailwind color class
  moderation_level: "high" | "moderate" | "community"
  created_at: string
  member_count: number
  post_count: number
}

// Post/Reply Types
export type Post = {
  id: string
  community_id: string
  author_id: string // anonymous user id
  author_username: string
  content: string
  original_content?: string // before AI rewrite
  moderation_status: "pending" | "approved" | "rewritten" | "blocked"
  moderation_reason?: string
  ai_rewrite_suggestion?: string // safer version of harmful content
  reflection_timer_active: boolean // if posting is delayed for reflection
  reflection_time_remaining?: number // seconds
  created_at: string
  updated_at: string
  reply_count: number
  reaction_summary: ReactionSummary
  crisis_indicators?: string[] // detected crisis keywords
}

export type Reply = {
  id: string
  post_id: string
  community_id: string
  author_id: string
  author_username: string
  content: string
  original_content?: string
  moderation_status: "pending" | "approved" | "rewritten" | "blocked"
  moderation_reason?: string
  ai_rewrite_suggestion?: string
  reflection_timer_active: boolean
  reflection_time_remaining?: number
  created_at: string
  updated_at: string
  reaction_summary: ReactionSummary
  crisis_indicators?: string[]
}

// Emotional Reactions (not likes!)
export type ReactionType = "heard" | "strong" | "relate" | "support" | "hope"

export type Reaction = {
  id: string
  post_id?: string
  reply_id?: string
  author_id: string
  reaction_type: ReactionType
  created_at: string
}

export type ReactionSummary = {
  heard: number
  strong: number
  relate: number
  support: number
  hope: number
  user_reaction?: ReactionType
}

// Strike & Ban System
export type UserViolation = {
  id: string
  user_id: string
  community_id: string
  violation_type:
    | "bullying"
    | "hate_speech"
    | "threats"
    | "harassment"
    | "self_harm_intent"
    | "suicidal_ideation"
    | "personal_info_leak"
    | "grooming"
    | "spam"
    | "other"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  flagged_content_id?: string // post or reply id
  strike_count: number // cumulative strikes
  created_at: string
  resolved: boolean
}

export type UserBan = {
  id: string
  user_id: string
  community_id?: string // null = app-wide ban
  ban_type: "temporary" | "permanent"
  ban_duration_hours?: number // for temporary bans
  reason: string
  strike_count_at_ban: number
  created_at: string
  expires_at?: string
  lifted_at?: string
}

// Moderation System
export type ModerationFlag = {
  id: string
  content_id: string // post or reply id
  content_type: "post" | "reply"
  community_id: string
  reported_by_id: string
  report_reason: string
  severity: "low" | "medium" | "high" | "critical"
  ai_confidence: number // 0-1
  ai_detected_issues: string[]
  status: "pending" | "reviewed" | "dismissed" | "actioned"
  human_reviewer_id?: string
  human_review_notes?: string
  action_taken?: string
  created_at: string
}

// Crisis Intervention
export type CrisisAlert = {
  id: string
  user_id: string
  community_id: string
  content_id: string
  alert_type: "self_harm" | "suicidal_ideation" | "acute_panic" | "escalation_pattern"
  confidence: number
  keywords_detected: string[]
  intervention_offered: boolean
  intervention_response?: "accepted" | "declined"
  counselor_notified: boolean
  created_at: string
}

// Wellness Check Pattern Detection
export type UserWellnessPattern = {
  id: string
  user_id: string
  last_activity: string
  post_frequency_24h: number
  crisis_keyword_frequency: number
  emotional_escalation_score: number // 0-100
  hopelessness_pattern_detected: boolean
  last_intervention: string
  intervention_count_7d: number
  needs_wellness_check: boolean
}

// Auto-delete Post
export type AutoDeletePost = {
  id: string
  post_id: string
  community_id: string
  author_id: string
  delete_after_hours: number
  created_at: string
  deleted_at?: string
}

// User Preferences
export type UserPreferences = {
  id: string
  user_id: string
  receive_crisis_interventions: boolean
  receive_wellness_checks: boolean
  visible_to_mods: boolean
  opted_into_emotional_analysis: boolean
  preferred_coping_tools: string[]
  created_at: string
  updated_at: string
}

// Moderation Tier
export type ModeratorTier = "ai" | "trained_staff" | "counselor" | "student_leader" | "admin"

export type Moderator = {
  id: string
  user_id: string
  tier: ModeratorTier
  communities: string[] // community ids they moderate
  verified_at: string
  training_status: "pending" | "in_progress" | "completed"
  actions_count: number
  created_at: string
}
