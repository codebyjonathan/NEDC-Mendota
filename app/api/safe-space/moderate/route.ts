import { NextRequest, NextResponse } from "next/server"
import { moderateContent } from "@/lib/safe-space/moderation"

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
    const body = await request.json()
    const { content, communityId, userId } = body

    if (!content || !communityId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: content, communityId, userId" },
        { status: 400 },
      )
    }

    // Run moderation
    const moderationResult = await moderateContent(content, communityId, userId)

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
    const searchParams = request.nextUrl.searchParams
    const content = searchParams.get("content")
    const communityId = searchParams.get("communityId")
    const userId = searchParams.get("userId")

    if (!content || !communityId || !userId) {
      return NextResponse.json(
        { error: "Missing required query parameters: content, communityId, userId" },
        { status: 400 },
      )
    }

    // Run moderation
    const moderationResult = await moderateContent(content, communityId, userId)

    return NextResponse.json(moderationResult, { status: 200 })
  } catch (error) {
    console.error("Moderation error:", error)
    return NextResponse.json(
      { error: "Internal server error during moderation" },
      { status: 500 },
    )
  }
}
