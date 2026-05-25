import { NextRequest, NextResponse } from "next/server"
import { moderateContent } from "@/lib/safe-space/moderation"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

/**
 * POST /api/safe-space/moderate
 * Moderates content before posting to communities
 *
 * Request body:
 * {
 *   content: string
 *   communityId: string
 *   userId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, { key: "safe-space-moderate:post", maxRequests: 24, windowMs: 60_000 })
    if (limited) return limited
    const body = await readJsonObject(request)
    const content = sanitizeTextInput(body.content, { maxLen: 3000, strict: true })
    const communityId = sanitizeTextInput(body.communityId, { maxLen: 120 })
    const userId = sanitizeTextInput(body.userId, { maxLen: 120 })

    if (!content.ok || !communityId.ok || !userId.ok) {
      return NextResponse.json(
        { error: "Missing required fields: content, communityId, userId" },
        { status: 400 },
      )
    }

    // Run moderation
    const moderationResult = await moderateContent(content.value, communityId.value, userId.value)

    return NextResponse.json(moderationResult, { status: 200 })
  } catch (error) {
    console.error("Moderation error:", error)
    return NextResponse.json(
      { error: "Internal server error during moderation" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/safe-space/moderate?content=...&communityId=...&userId=...
 * Query-based moderation for quick checks
 */
export async function GET(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, { key: "safe-space-moderate:get", maxRequests: 40, windowMs: 60_000 })
    if (limited) return limited

    const searchParams = request.nextUrl.searchParams
    const content = sanitizeTextInput(searchParams.get("content"), { maxLen: 3000, strict: true })
    const communityId = sanitizeTextInput(searchParams.get("communityId"), { maxLen: 120 })
    const userId = sanitizeTextInput(searchParams.get("userId"), { maxLen: 120 })

    if (!content.ok || !communityId.ok || !userId.ok) {
      return NextResponse.json(
        { error: "Missing required query parameters: content, communityId, userId" },
        { status: 400 },
      )
    }

    // Run moderation
    const moderationResult = await moderateContent(content.value, communityId.value, userId.value)

    return NextResponse.json(moderationResult, { status: 200 })
  } catch (error) {
    console.error("Moderation error:", error)
    return NextResponse.json(
      { error: "Internal server error during moderation" },
      { status: 500 },
    )
  }
}
