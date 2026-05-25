import { NextRequest, NextResponse } from "next/server"
import { getWarningLevel, calculateCurrentStrikes, shouldBanUser, getBanDurationHours } from "@/lib/safe-space/strikes-and-bans"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

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
    const limited = enforceRateLimit(request, { key: "safe-space-strikes:post", maxRequests: 30, windowMs: 60_000 })
    if (limited) return limited
    const body = await readJsonObject(request)
    const { userId, violations } = body

    const validatedUserId = sanitizeTextInput(userId, { maxLen: 120 })
    const validViolations = Array.isArray(violations)
      ? violations.filter((v) => ["low", "medium", "high", "critical"].includes((v as { severity?: string })?.severity || ""))
      : []

    if (!validatedUserId.ok || validViolations.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: userId, violations" },
        { status: 400 },
      )
    }

    const currentStrikes = calculateCurrentStrikes(validViolations)
    const warningLevel = getWarningLevel(currentStrikes)
    const shouldBan = shouldBanUser(currentStrikes)
    const banDuration = shouldBan ? getBanDurationHours(currentStrikes) : 0

    return NextResponse.json(
      {
        userId: validatedUserId.value,
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
 * GET /api/safe-space/strikes?userId=...
 * Get current strike/warning status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, { key: "safe-space-strikes:get", maxRequests: 60, windowMs: 60_000 })
    if (limited) return limited
    const userId = sanitizeTextInput(request.nextUrl.searchParams.get("userId"), { maxLen: 120 })

    if (!userId.ok) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      )
    }

    // In production, this would query the database for user violations
    // For now, return default state
    return NextResponse.json(
      {
        userId: userId.value,
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
