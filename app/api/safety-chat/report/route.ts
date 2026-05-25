import { NextRequest } from "next/server"
import { enforceRateLimit, sanitizeTextInput } from "@/lib/server/api-security"

const reports: Array<{
  createdAt: string
  reason: string
  message: string
}> = []

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "safety-chat-report:post", maxRequests: 12, windowMs: 60_000 })
    if (limited) return limited

    const body = await req.json()
    const reasonCheck = sanitizeTextInput(body?.reason ?? "unspecified", { maxLen: 120, allowEmpty: true })
    const messageCheck = sanitizeTextInput(body?.message, { maxLen: 4000, strict: true })
    const reason = reasonCheck.ok ? reasonCheck.value : "unspecified"
    const message = messageCheck.ok ? messageCheck.value : ""

    if (!messageCheck.ok) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    reports.push({
      createdAt: new Date().toISOString(),
      reason,
      message,
    })

    // Keep memory bounded in case this route is hit repeatedly.
    if (reports.length > 500) {
      reports.shift()
    }

    console.log("[Safety Chat Report]", { reason, messagePreview: message.slice(0, 160) })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
