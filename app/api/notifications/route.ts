import { NextRequest, NextResponse } from "next/server"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

/**
 * Notifications API Route
 * Handles server-side notification management
 * 
 * Since we can't persist across origins with localStorage alone,
 * we store notifications on the server using cookies + in-memory storage
 * (Note: For production, replace with a real database like MongoDB/PostgreSQL)
 */

// In-memory storage for demonstrations
// TODO: Replace with real database for production
interface StoredNotification {
  id: string
  title: string
  timestamp: number
  scheduledFor: number
  interval: number
  read: boolean
  type: "check-in" | "reminder"
  actionUrl?: string
}

// Store notifications per device/session
const notificationStore = new Map<string, StoredNotification[]>()

/**
 * GET /api/notifications
 * Retrieve all notifications for a device
 */
function handleGet(req: NextRequest) {
  const deviceId = getDeviceId(req)
  const notifications = notificationStore.get(deviceId) || []
  const unreadCount = notifications.filter((n) => !n.read).length

  return NextResponse.json({
    notifications,
    unreadCount,
  })
}

/**
 * POST /api/notifications
 * Store a new notification
 */
function handlePost(req: NextRequest, body: StoredNotification) {
  const deviceId = getDeviceId(req)
  const notifications = notificationStore.get(deviceId) || []

  notifications.push(body)
  notificationStore.set(deviceId, notifications)

  const response = NextResponse.json(
    { id: body.id, success: true },
    { status: 201 }
  )

  // Set a persistent cookie to identify this device
  response.cookies.set("device_id", deviceId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    path: "/",
  })

  return response
}

/**
 * PATCH /api/notifications/:id
 * Update a notification (mark as read, etc)
 */
function handlePatch(req: NextRequest, body: Partial<StoredNotification>, notificationId: string) {
  const deviceId = getDeviceId(req)
  const notifications = notificationStore.get(deviceId) || []

  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index === -1) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  notifications[index] = { ...notifications[index], ...body }
  notificationStore.set(deviceId, notifications)

  return NextResponse.json(notifications[index])
}

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
function handleDelete(req: NextRequest, notificationId: string) {
  const deviceId = getDeviceId(req)
  let notifications = notificationStore.get(deviceId) || []

  notifications = notifications.filter((n) => n.id !== notificationId)
  notificationStore.set(deviceId, notifications)

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/notifications?clearAll=true
 * Clear all notifications
 */
function handleDeleteAll(req: NextRequest) {
  const deviceId = getDeviceId(req)
  notificationStore.delete(deviceId)

  return NextResponse.json({ success: true })
}

/**
 * Get or create a device ID
 */
function getDeviceId(req: NextRequest): string {
  // Try to get from cookie first
  const existingId = req.cookies.get("device_id")?.value

  if (existingId) {
    return existingId
  }

  // Generate new device ID
  return `device_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Parse the request path to get notification ID
 */
function getNotificationIdFromPath(pathname: string): string | null {
  const parts = pathname.split("/")
  const id = parts[parts.length - 1]
  return id && id !== "notifications" ? id : null
}

export async function GET(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "notifications:get", maxRequests: 120, windowMs: 60_000 })
    if (limited) return limited

    return handleGet(req)
  } catch (error) {
    console.error("GET /api/notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "notifications:post", maxRequests: 40, windowMs: 60_000 })
    if (limited) return limited

    const body = (await readJsonObject(req)) as Partial<StoredNotification>
    const titleCheck = sanitizeTextInput(body.title, { maxLen: 120, strict: true })
    if (!titleCheck.ok || typeof body.id !== "string" || typeof body.timestamp !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    const payload: StoredNotification = {
      id: body.id.slice(0, 120),
      title: titleCheck.value,
      timestamp: body.timestamp,
      scheduledFor: typeof body.scheduledFor === "number" ? body.scheduledFor : body.timestamp,
      interval: typeof body.interval === "number" ? body.interval : 0,
      read: Boolean(body.read),
      type: body.type === "check-in" ? "check-in" : "reminder",
      actionUrl: typeof body.actionUrl === "string" ? body.actionUrl.slice(0, 300) : undefined,
    }
    return handlePost(req, payload)
  } catch (error) {
    console.error("POST /api/notifications error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "notifications:patch", maxRequests: 60, windowMs: 60_000 })
    if (limited) return limited

    const notificationId = getNotificationIdFromPath(req.nextUrl.pathname)
    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const body = (await readJsonObject(req)) as Partial<StoredNotification>
    return handlePatch(req, body, notificationId)
  } catch (error) {
    console.error("PATCH /api/notifications error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "notifications:delete", maxRequests: 40, windowMs: 60_000 })
    if (limited) return limited

    const clearAll = req.nextUrl.searchParams.get("clearAll") === "true"

    if (clearAll) {
      return handleDeleteAll(req)
    }

    const notificationId = getNotificationIdFromPath(req.nextUrl.pathname)
    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    return handleDelete(req, notificationId)
  } catch (error) {
    console.error("DELETE /api/notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
