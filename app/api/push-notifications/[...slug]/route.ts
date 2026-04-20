import { NextRequest, NextResponse } from "next/server"
import { PushSubscription } from "web-push"
import {
  cancelScheduledPush,
  getPushStatus,
  getOrCreateDeviceId,
  isPushConfigured,
  listDeviceSubscriptions,
  removeSubscription,
  saveSubscription,
  schedulePushForDevice,
  sendPushToDevice,
} from "@/lib/server/push-notification-store"

function withDeviceCookie(response: NextResponse, deviceId: string) {
  response.cookies.set("device_id", deviceId, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  })

  return response
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params
  const action = slug[0]
  const deviceId = getOrCreateDeviceId(request)
  const body = await request.json().catch(() => ({}))

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push notifications are not configured on the server" },
      { status: 503 }
    )
  }

  try {
    if (action === "subscribe") {
      const subscription = body.subscription as PushSubscription | undefined
      if (!subscription?.endpoint) {
        return NextResponse.json({ error: "Push subscription is required" }, { status: 400 })
      }

      saveSubscription(deviceId, subscription)
      return withDeviceCookie(NextResponse.json({ success: true }), deviceId)
    }

    if (action === "send-test") {
      const title = typeof body.title === "string" ? body.title : "Safe Space test notification"
      const message =
        typeof body.body === "string" ? body.body : "Push notifications are enabled on this device."
      const actionUrl = typeof body.actionUrl === "string" ? body.actionUrl : "/main"
      const tag = typeof body.tag === "string" ? body.tag : "safe-space-test"

      await sendPushToDevice(deviceId, {
        title,
        body: message,
        actionUrl,
        notificationId: `test_${Date.now()}`,
        tag,
      })

      return NextResponse.json({ success: true })
    }

    if (action === "schedule") {
      const title = typeof body.title === "string" ? body.title : "Safe Space reminder"
      const scheduleId = schedulePushForDevice({
        deviceId,
        notificationId:
          typeof body.notificationId === "string" ? body.notificationId : `push_${Date.now()}`,
        title,
        body:
          typeof body.body === "string"
            ? body.body
            : "Open Safe Space to continue your check-in.",
        actionUrl: typeof body.actionUrl === "string" ? body.actionUrl : "/grounding",
        scheduledFor: typeof body.scheduledFor === "number" ? body.scheduledFor : Date.now(),
        recurrence: body.recurrence === "daily" ? "daily" : undefined,
      })

      return NextResponse.json({ success: true, scheduleId })
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status =
      message === "No active push subscription found for this device" ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params
  const action = slug[0]
  const id = slug[1]
  const body = await request.json().catch(() => ({}))

  try {
    if (action === "subscribe") {
      const deviceId = getOrCreateDeviceId(request)
      const endpoint =
        typeof body.endpoint === "string"
          ? body.endpoint
          : listDeviceSubscriptions(deviceId)[0]?.endpoint

      if (endpoint) {
        removeSubscription(endpoint)
      }

      return NextResponse.json({ success: true })
    }

    if (action === "schedule" && id) {
      cancelScheduledPush(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params
  const action = slug[0]
  const deviceId = getOrCreateDeviceId(request)

  if (!action || action === "status") {
    return withDeviceCookie(NextResponse.json(getPushStatus(deviceId)), deviceId)
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
