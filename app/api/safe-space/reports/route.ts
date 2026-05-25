import { NextRequest, NextResponse } from "next/server"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

type IncomingReport = {
  postId: string
  communityId: string
  reason: string
  reportedBy: string
  createdAt: string
}

const reports: IncomingReport[] = []

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, { key: "safe-space-reports:post", maxRequests: 20, windowMs: 60_000 })
    if (limited) return limited
    const body = (await readJsonObject(request)) as Partial<IncomingReport>
    const postId = sanitizeTextInput(body.postId, { maxLen: 120 })
    const communityId = sanitizeTextInput(body.communityId, { maxLen: 120 })
    const reason = sanitizeTextInput(body.reason, { maxLen: 500, strict: true })
    const reportedBy = sanitizeTextInput(body.reportedBy, { maxLen: 120, allowEmpty: true })

    if (!postId.ok || !communityId.ok || !reason.ok) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const report: IncomingReport = {
      postId: postId.value,
      communityId: communityId.value,
      reason: reason.value,
      reportedBy: reportedBy.ok && reportedBy.value ? reportedBy.value : "Unknown",
      createdAt: body.createdAt || new Date().toISOString(),
    }

    reports.push(report)
    if (reports.length > 1000) reports.shift()

    console.info(
      `[SAFE_SPACE_REPORT] ${report.createdAt} | community=${report.communityId} | post=${report.postId} | by=${report.reportedBy} | reason=${report.reason}`,
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[SAFE_SPACE_REPORT_ERROR]", error)
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, { key: "safe-space-reports:get", maxRequests: 20, windowMs: 60_000 })
  if (limited) return limited

  // Note: report list endpoint kept for admin/debug workflows in this release.
  return NextResponse.json({ count: reports.length, reports })
}
