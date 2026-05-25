import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

/**
 * Push Notifications API
 * Handles subscription, scheduling, and sending push notifications
 * 
 * To enable push notifications:
 * 1. Generate VAPID keys: npx web-push generate-vapid-keys
 * 2. Set environment variables:
 *    - NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *    - VAPID_PRIVATE_KEY
 * 3. Set VAPID subject email: VAPID_SUBJECT
 */

// In-memory storage for subscriptions (replace with database in production)
interface DeviceSubscription {
  endpoint: string
  auth: string
  p256dh: string
  createdAt: number
  deviceId: string
}

interface ScheduledPush {
  id: string
  endpoint: string
  title: string
  body: string
  actionUrl: string
  scheduledFor: number
  deviceId: string
}

const subscriptions = new Map<string, DeviceSubscription>()
const scheduledPushes = new Map<string, ScheduledPush>()
const timers = new Map<string, NodeJS.Timeout>()

/**
 * Get device ID from cookies
 */
function getDeviceId(req: NextRequest): string {
  const deviceId = req.cookies.get("device_id")?.value
  if (deviceId) return deviceId

  const newId = `device_${crypto.randomBytes(8).toString("hex")}`
  return newId
}

/**
 * POST /api/push-notifications/subscribe
 * Subscribe device to push notifications
 */
async function handleSubscribe(req: NextRequest, body: any) {
  try {
    const deviceId = getDeviceId(req)
    const { subscription, endpoint } = body

    if (!subscription || !endpoint) {
      return NextResponse.json(
        { error: "Missing subscription or endpoint" },
        { status: 400 }
      )
    }

    // Store subscription
    const key = endpoint
    subscriptions.set(key, {
      endpoint,
      auth: subscription.keys?.auth || "",
      p256dh: subscription.keys?.p256dh || "",
      createdAt: Date.now(),
      deviceId,
    })

    const response = NextResponse.json({
      success: true,
      message: "Successfully subscribed to push notifications",
    })

    // Set device ID cookie
    response.cookies.set("device_id", deviceId, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    })

    console.log(`[Push] Device ${deviceId} subscribed for push notifications`)
    return response
  } catch (error) {
    console.error("Subscribe error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/push-notifications/unsubscribe
 * Unsubscribe device from push notifications
 */
async function handleUnsubscribe(req: NextRequest, body: any) {
  try {
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })
    }

    subscriptions.delete(endpoint)
    console.log(`[Push] Unsubscribed from push notifications: ${endpoint}`)

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed",
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/push-notifications/send-test
 * Send a test push notification to the current device
 */
async function handleSendTest(req: NextRequest) {
  try {
    const deviceId = getDeviceId(req)

    // Find subscriptions for this device
    let sent = 0
    for (const [endpoint, sub] of subscriptions) {
      if (sub.deviceId === deviceId) {
        await sendPushNotification(endpoint, {
          title: "✓ Safe Space Test Notification",
          body: "Your push notifications are working! This is a test message.",
          icon: "/logo.png",
          badge: "/logo.png",
          tag: "test-notification",
        })
        sent++
      }
    }

    if (sent === 0) {
      return NextResponse.json(
        { error: "No subscriptions found for this device" },
        { status: 404 }
      )
    }

    console.log(`[Push] Sent test notifications to ${sent} subscription(s) for device ${deviceId}`)
    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${sent} device(s)`,
    })
  } catch (error) {
    console.error("Send test error:", error)
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/push-notifications/schedule
 * Schedule a push notification
 */
async function handleSchedule(req: NextRequest, body: any) {
  try {
    const deviceId = getDeviceId(req)
    const {
      intervalMs,
      title,
      body: messageBody,
      actionUrl,
    } = body

    if (!intervalMs || !title) {
      return NextResponse.json(
        { error: "Missing intervalMs or title" },
        { status: 400 }
      )
    }

    // Get first subscription for this device
    let endpoint: string | null = null
    for (const [ep, sub] of subscriptions) {
      if (sub.deviceId === deviceId) {
        endpoint = ep
        break
      }
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: "Device not subscribed to push notifications" },
        { status: 400 }
      )
    }

    const pushId = `push_${Date.now()}_${Math.random()}`
    const scheduledFor = Date.now() + intervalMs

    const scheduledPush: ScheduledPush = {
      id: pushId,
      endpoint,
      title,
      body: messageBody || "Time to check in with yourself",
      actionUrl: actionUrl || "/grounding",
      scheduledFor,
      deviceId,
    }

    scheduledPushes.set(pushId, scheduledPush)

    // Schedule the push
    const timer = setTimeout(async () => {
      try {
        await sendPushNotification(endpoint, {
          title: scheduledPush.title,
          body: scheduledPush.body,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: pushId,
          data: {
            url: scheduledPush.actionUrl,
          },
        })
        console.log(`[Push] Scheduled notification sent: ${pushId}`)
      } catch (error) {
        console.error(`[Push] Failed to send scheduled notification ${pushId}:`, error)
      } finally {
        scheduledPushes.delete(pushId)
        timers.delete(pushId)
      }
    }, intervalMs)

    timers.set(pushId, timer)

    console.log(
      `[Push] Notification scheduled for device ${deviceId} in ${intervalMs}ms`
    )
    return NextResponse.json({
      success: true,
      id: pushId,
      message: `Notification scheduled for ${new Date(scheduledFor).toLocaleString()}`,
    })
  } catch (error) {
    console.error("Schedule error:", error)
    return NextResponse.json(
      { error: "Failed to schedule notification" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/push-notifications/cancel/:id
 * Cancel a scheduled push notification
 */
async function handleCancel(req: NextRequest, pushId: string) {
  try {
    const timer = timers.get(pushId)
    if (timer) {
      clearTimeout(timer)
      timers.delete(pushId)
    }

    scheduledPushes.delete(pushId)

    return NextResponse.json({
      success: true,
      message: "Notification cancelled",
    })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json(
      { error: "Failed to cancel notification" },
      { status: 500 }
    )
  }
}

/**
 * Send a web push notification
 * Uses the Web Push Protocol
 */
async function sendPushNotification(
  endpoint: string,
  payload: any
): Promise<void> {
  try {
    // In production, use web-push library: npm install web-push
    // For now, we'll just log the notification
    console.log("[Push] Would send notification to:", endpoint, payload)

    // Example using web-push (uncomment when installed):
    // import webpush from 'web-push'
    // const subscription = subscriptions.get(endpoint)
    // if (subscription) {
    //   await webpush.sendNotification(
    //     {
    //       endpoint: subscription.endpoint,
    //       keys: {
    //         auth: subscription.auth,
    //         p256dh: subscription.p256dh,
    //       },
    //     },
    //     JSON.stringify(payload)
    //   )
    // }
  } catch (error) {
    console.error("Failed to send web push:", error)
    throw error
  }
}

/**
 * Main route handler
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname

  try {
    const limited = enforceRateLimit(request, { key: "push-notifications:post", maxRequests: 30, windowMs: 60_000 })
    if (limited) return limited
    const body = await readJsonObject(request)
    if (typeof body.endpoint === "string") {
      const endpointCheck = sanitizeTextInput(body.endpoint, { maxLen: 2048, allowEmpty: true })
      body.endpoint = endpointCheck.ok ? endpointCheck.value : ""
    }
    if (typeof body.title === "string") {
      const titleCheck = sanitizeTextInput(body.title, { maxLen: 120, strict: true, allowEmpty: true })
      body.title = titleCheck.ok ? titleCheck.value : ""
    }

    if (pathname.endsWith("/subscribe")) {
      return handleSubscribe(request, body)
    } else if (pathname.endsWith("/unsubscribe")) {
      return handleUnsubscribe(request, body)
    } else if (pathname.endsWith("/send-test")) {
      return handleSendTest(request)
    } else if (pathname.endsWith("/schedule")) {
      return handleSchedule(request, body)
    } else if (pathname.match(/\/cancel\/[\w-]+$/)) {
      const pushId = pathname.split("/").pop()
      return handleCancel(request, pushId || "")
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/push-notifications/status
 * Check push notification status
 */
export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, { key: "push-notifications:get", maxRequests: 60, windowMs: 60_000 })
  if (limited) return limited

  const deviceId = getDeviceId(request)

  // Find subscription for this device
  let subscribed = false
  for (const [, sub] of subscriptions) {
    if (sub.deviceId === deviceId) {
      subscribed = true
      break
    }
  }

  return NextResponse.json({
    configured:
      Boolean(process.env.VAPID_SUBJECT) &&
      Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) &&
      Boolean(process.env.VAPID_PRIVATE_KEY),
    subscribed,
    subscribedCount: subscriptions.size,
    scheduledCount: scheduledPushes.size,
    timestamp: new Date().toISOString(),
  })
}
