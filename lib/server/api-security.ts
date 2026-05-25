import { NextRequest, NextResponse } from "next/server"
import { isLikelyOffensiveText } from "@/lib/chat-safety"

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = request.headers.get("x-real-ip")?.trim()
  const cookieId = request.cookies.get("device_id")?.value?.trim()
  return forwarded || realIp || cookieId || "unknown-client"
}

export function enforceRateLimit(
  request: NextRequest,
  options?: { key?: string; maxRequests?: number; windowMs?: number },
) {
  const maxRequests = options?.maxRequests ?? 60
  const windowMs = options?.windowMs ?? 60_000
  const scope = options?.key ?? request.nextUrl.pathname
  const clientId = getClientIdentifier(request)
  const mapKey = `${scope}:${clientId}`
  const now = Date.now()
  const current = rateLimitStore.get(mapKey)

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(mapKey, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait and try again.",
        retryAfterMs: Math.max(0, current.resetAt - now),
      },
      { status: 429 },
    )
  }

  current.count += 1
  rateLimitStore.set(mapKey, current)
  return null
}

export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown>> {
  const parsed = await request.json().catch(() => ({}))
  return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {}
}

export function sanitizeTextInput(
  value: unknown,
  options?: { maxLen?: number; trim?: boolean; strict?: boolean; allowEmpty?: boolean },
) {
  const maxLen = options?.maxLen ?? 500
  const trim = options?.trim ?? true
  const strict = options?.strict ?? false
  const allowEmpty = options?.allowEmpty ?? false
  const asString = typeof value === "string" ? value : ""
  const normalized = asString.normalize("NFKC").replace(/[\u0000-\u001F\u007F]/g, " ")
  const limited = normalized.slice(0, maxLen)
  const result = trim ? limited.trim() : limited

  if (!allowEmpty && !result) {
    return { ok: false as const, value: "", reason: "Missing or empty text input." }
  }

  if (strict && isLikelyOffensiveText(result)) {
    return { ok: false as const, value: "", reason: "Input contains restricted language." }
  }

  return { ok: true as const, value: result }
}

