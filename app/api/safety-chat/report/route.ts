const reports: Array<{
  createdAt: string
  reason: string
  message: string
}> = []

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const reason = String(body?.reason || "unspecified").slice(0, 120)
    const message = String(body?.message || "").slice(0, 4000)

    if (!message.trim()) {
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

