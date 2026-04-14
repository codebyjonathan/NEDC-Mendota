import crypto from "crypto"
import webpush, { PushSubscription } from "web-push"
import { NextRequest } from "next/server"

interface StoredSubscription {
  endpoint: string
  subscription: PushSubscription
  deviceId: string
}

interface ScheduledPush {
  id: string
  deviceId: string
  notificationId: string
  title: string
  body: string
  actionUrl: string
  scheduledFor: number
}

const subscriptions = new Map<string, StoredSubscription>()
const scheduledPushes = new Map<string, ScheduledPush>()
const timers = new Map<string, NodeJS.Timeout>()

let vapidReady = false

export function getOrCreateDeviceId(request: NextRequest) {
  return request.cookies.get("device_id")?.value || `device_${crypto.randomBytes(8).toString("hex")}`
}

export function isPushConfigured() {
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!subject || !publicKey || !privateKey) {
    return false
  }

  if (!vapidReady) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    vapidReady = true
  }

  return true
}

export function saveSubscription(deviceId: string, subscription: PushSubscription) {
  subscriptions.set(subscription.endpoint, {
    endpoint: subscription.endpoint,
    subscription,
    deviceId,
  })
}

export function listDeviceSubscriptions(deviceId: string) {
  return [...subscriptions.values()].filter((item) => item.deviceId === deviceId)
}

export function removeSubscription(endpoint: string) {
  subscriptions.delete(endpoint)
}

export async function sendPushToDevice(deviceId: string, payload: Record<string, unknown>) {
  if (!isPushConfigured()) {
    throw new Error("Push notifications are not configured on the server")
  }

  const deviceSubscriptions = listDeviceSubscriptions(deviceId)
  if (deviceSubscriptions.length === 0) {
    throw new Error("No active push subscription found for this device")
  }

  await Promise.all(
    deviceSubscriptions.map(({ endpoint, subscription }) =>
      webpush.sendNotification(subscription, JSON.stringify(payload)).catch((error: unknown) => {
        subscriptions.delete(endpoint)
        throw error
      })
    )
  )
}

export function schedulePushForDevice(input: {
  deviceId: string
  notificationId: string
  title: string
  body: string
  actionUrl: string
  scheduledFor: number
}) {
  const scheduleId = `push_${Date.now()}_${Math.random().toString(36).slice(2)}`

  scheduledPushes.set(scheduleId, {
    id: scheduleId,
    deviceId: input.deviceId,
    notificationId: input.notificationId,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl,
    scheduledFor: input.scheduledFor,
  })

  const timer = setTimeout(async () => {
    try {
      await sendPushToDevice(input.deviceId, {
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl,
        notificationId: input.notificationId,
        tag: input.notificationId,
      })
    } finally {
      scheduledPushes.delete(scheduleId)
      timers.delete(scheduleId)
    }
  }, Math.max(0, input.scheduledFor - Date.now()))

  timers.set(scheduleId, timer)
  return scheduleId
}

export function cancelScheduledPush(scheduleId: string) {
  const timer = timers.get(scheduleId)
  if (timer) {
    clearTimeout(timer)
    timers.delete(scheduleId)
  }

  scheduledPushes.delete(scheduleId)
}

export function getPushStatus(deviceId: string) {
  return {
    configured: isPushConfigured(),
    subscribed: listDeviceSubscriptions(deviceId).length > 0,
    subscribedCount: subscriptions.size,
    scheduledCount: [...scheduledPushes.values()].filter((item) => item.deviceId === deviceId).length,
  }
}
