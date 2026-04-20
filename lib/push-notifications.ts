const API_BASE = "/api/push-notifications"
const WORKER_PATH = "/notification-service-worker.js"

export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false

  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    window.isSecureContext
  )
}

function base64UrlToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0))
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser")
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration("/")
  if (existingRegistration) {
    return existingRegistration
  }

  return navigator.serviceWorker.register(WORKER_PATH, { scope: "/" })
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser")
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    throw new Error("Push notifications are not configured yet")
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission

  if (permission !== "granted") {
    throw new Error("Notification permission was denied")
  }

  const registration = await getServiceWorkerRegistration()
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription =
    existingSubscription ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
    }))

  const response = await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || "Failed to subscribe to push notifications")
  }

  return true
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false
  }

  const registration = await getServiceWorkerRegistration()
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    return true
  }

  await fetch(`${API_BASE}/subscribe`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  })

  await subscription.unsubscribe()
  return true
}

export async function isPushNotificationSubscribed(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false
  }

  const registration = await getServiceWorkerRegistration()
  const subscription = await registration.pushManager.getSubscription()
  return Boolean(subscription)
}

export async function sendTestPushNotification(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/send-test`, { method: "POST" })
  return response.ok
}

export async function sendCustomTestPushNotification(options: {
  title: string
  body: string
  actionUrl?: string
  tag?: string
}): Promise<boolean> {
  const response = await fetch(`${API_BASE}/send-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: options.title,
      body: options.body,
      actionUrl: options.actionUrl,
      tag: options.tag,
    }),
  })
  return response.ok
}

export async function schedulePushNotification(
  intervalMs: number,
  title: string,
  options?: { body?: string; actionUrl?: string }
): Promise<string | null> {
  const response = await fetch(`${API_BASE}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notificationId: `push_${Date.now()}`,
      title,
      body: options?.body,
      actionUrl: options?.actionUrl || "/grounding",
      scheduledFor: Date.now() + intervalMs,
    }),
  })

  if (!response.ok) {
    return null
  }

  const payload = await response.json()
  return payload.scheduleId || null
}

export async function syncPushSubscriptionWithServer(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false
  }

  const registration = await getServiceWorkerRegistration()
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    return false
  }

  const response = await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  })

  return response.ok
}
