export const COMMUNITY_BAN_KEY = "safe_space_community_ban_v1"
export const COMMUNITY_STRIKE_KEY = "safe_space_community_strikes_v1"
export const COMMUNITY_BAN_COUNT_KEY = "safe_space_community_ban_count_v1"
export const COMMUNITY_BAN_DURATION_MS = 60 * 1000 // 1st ban: 1 minute for testing

export type CommunityBanState = {
  strikes: number
  bannedUntil: string | null
  banCount: number
}

export function getCommunityBanState(): CommunityBanState {
  if (typeof window === "undefined") {
    return { strikes: 0, bannedUntil: null, banCount: 0 }
  }

  const strikeRaw = window.localStorage.getItem(COMMUNITY_STRIKE_KEY)
  const banRaw = window.localStorage.getItem(COMMUNITY_BAN_KEY)
  const banCountRaw = window.localStorage.getItem(COMMUNITY_BAN_COUNT_KEY)
  const strikes = strikeRaw ? Number(strikeRaw) : 0
  const bannedUntil = banRaw || null
  const banCount = banCountRaw ? Number(banCountRaw) : 0
  return {
    strikes: Number.isFinite(strikes) ? strikes : 0,
    bannedUntil,
    banCount: Number.isFinite(banCount) ? banCount : 0,
  }
}

export function isCommunityBanActive(bannedUntil: string | null): boolean {
  if (!bannedUntil) return false
  return new Date(bannedUntil).getTime() > Date.now()
}

export function getCommunityBanRemainingMs(bannedUntil: string | null): number {
  if (!bannedUntil) return 0
  return Math.max(0, new Date(bannedUntil).getTime() - Date.now())
}

export function setCommunityStrikes(next: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(COMMUNITY_STRIKE_KEY, String(next))
}

export function setCommunityBanCount(next: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(COMMUNITY_BAN_COUNT_KEY, String(next))
}

export function setCommunityBanUntil(bannedUntil: string | null) {
  if (typeof window === "undefined") return
  if (!bannedUntil) {
    window.localStorage.removeItem(COMMUNITY_BAN_KEY)
    return
  }
  window.localStorage.setItem(COMMUNITY_BAN_KEY, bannedUntil)
}

export function getCommunityBanDurationMsForBanNumber(banNumber: number): number {
  if (banNumber <= 1) return 1 * 60 * 1000
  if (banNumber === 2) return 5 * 60 * 1000
  if (banNumber === 3) return 15 * 60 * 1000
  if (banNumber === 4) return 30 * 60 * 1000
  return 45 * 60 * 1000
}
