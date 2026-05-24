import { NextRequest, NextResponse } from "next/server"

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
    const body = (await request.json()) as Partial<IncomingReport>
    const postId = body.postId?.trim()
    const communityId = body.communityId?.trim()
    const reason = body.reason?.trim()
    const reportedBy = body.reportedBy?.trim() || "Unknown"

    if (!postId || !communityId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const report: IncomingReport = {
      postId,
      communityId,
      reason,
      reportedBy,
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

export async function GET() {
  return NextResponse.json({ count: reports.length, reports })
}
