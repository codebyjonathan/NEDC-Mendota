import { NextRequest, NextResponse } from "next/server"
import { validateNickname } from "@/lib/chat-safety"
import { enforceRateLimit, readJsonObject } from "@/lib/server/api-security"

type BadgeType = "star" | "moon" | "planet" | "comet"
type HelmetStyle = "classic" | "visor" | "gold" | "midnight"

type GameCenterProfile = {
  nickname: string
  suitColor: string
  helmetStyle: HelmetStyle
  badge: BadgeType
  updatedAt: string
}

const profileStore = new Map<string, GameCenterProfile>()

function getDeviceId(req: NextRequest): string {
  const existingId = req.cookies.get("device_id")?.value
  if (existingId) return existingId
  return `device_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function isAllowedColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value)
}

function isAllowedHelmet(value: unknown): value is HelmetStyle {
  return value === "classic" || value === "visor" || value === "gold" || value === "midnight"
}

function isAllowedBadge(value: unknown): value is BadgeType {
  return value === "star" || value === "moon" || value === "planet" || value === "comet"
}

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, { key: "game-center-profile:get", maxRequests: 90, windowMs: 60_000 })
  if (limited) return limited

  const deviceId = getDeviceId(req)
  const profile = profileStore.get(deviceId) ?? null
  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "game-center-profile:post", maxRequests: 20, windowMs: 60_000 })
    if (limited) return limited

    const body = await readJsonObject(req)
    const nickname = typeof body?.nickname === "string" ? body.nickname : ""
    const suitColor = body?.suitColor
    const helmetStyle = body?.helmetStyle
    const badge = body?.badge

    const nicknameValidation = validateNickname(nickname)
    if (!nicknameValidation.ok) {
      return NextResponse.json({ error: nicknameValidation.reason ?? "Invalid nickname." }, { status: 400 })
    }
    if (!isAllowedColor(suitColor)) {
      return NextResponse.json({ error: "Invalid suit color." }, { status: 400 })
    }
    if (!isAllowedHelmet(helmetStyle)) {
      return NextResponse.json({ error: "Invalid helmet style." }, { status: 400 })
    }
    if (!isAllowedBadge(badge)) {
      return NextResponse.json({ error: "Invalid badge." }, { status: 400 })
    }

    const profile: GameCenterProfile = {
      nickname: nickname.trim(),
      suitColor,
      helmetStyle,
      badge,
      updatedAt: new Date().toISOString(),
    }

    const deviceId = getDeviceId(req)
    profileStore.set(deviceId, profile)

    const response = NextResponse.json({ profile }, { status: 201 })
    response.cookies.set("device_id", deviceId, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
