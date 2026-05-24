import { NextRequest, NextResponse } from "next/server"
import { getWarningLevel, calculateCurrentStrikes, shouldBanUser, getBanDurationHours } from "@/lib/safe-space/strikes-and-bans"

/**
 * POST /api/safe-space/strikes
 * Calculate strikes for a user based on violations
 *
 * Request body:
 * {
 *   userId: string
 *   violations: Array<{severity: "low" | "medium" | "high" | "critical"}>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, violations } = body

    if (!userId || !violations) {
      return NextResponse.json(
        { error: "Missing required fields: userId, violations" },
        { status: 400 },
      )
    }

    const currentStrikes = calculateCurrentStrikes(violations)
    const warningLevel = getWarningLevel(currentStrikes)
    const shouldBan = shouldBanUser(currentStrikes)
    const banDuration = shouldBan ? getBanDurationHours(currentStrikes) : 0

    return NextResponse.json(
      {
        userId,
        currentStrikes,
        warningLevel,
        shouldBan,
        banDurationHours: banDuration,
        message:
          warningLevel === "none"
            ? "No violations"
            : warningLevel === "warning"
              ? "User has received a warning"
              : warningLevel === "caution"
                ? "User is on caution"
                : "User should be banned",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Strike calculation error:", error)
    return NextResponse.json(
      { error: "Internal server error calculating strikes" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/safe-space/strikes/:userId
 * Get current strike/warning status for a user
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      )
    }

    // In production, this would query the database for user violations
    // For now, return default state
    return NextResponse.json(
      {
        userId,
        currentStrikes: 0,
        warningLevel: "none",
        shouldBan: false,
        banDurationHours: 0,
        message: "No violations on record",
        status: "good_standing",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Strike retrieval error:", error)
    return NextResponse.json(
      { error: "Internal server error retrieving strikes" },
      { status: 500 },
    )
  }
}
