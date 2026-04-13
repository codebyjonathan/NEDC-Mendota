/**
 * Notification Service
 * Handles browser notifications, scheduling, and persistence
 * Supports both web and native app notification flows
 */

export interface ScheduledNotification {
  id: string
  title: string
  timestamp: number // When the notification was scheduled
  scheduledFor: number // When the notification should trigger
  interval: number // milliseconds
  read: boolean
  type: "check-in" | "reminder"
  actionUrl?: string
}

export interface NotificationState {
  notifications: ScheduledNotification[]
  unreadCount: number
  permission: NotificationPermission
}

const NOTIFICATIONS_STORAGE_KEY = "app_notifications"
const NOTIFICATION_PERMISSION_KEY = "notification_permission_checked"

/**
 * Request notification permission from user
 * Returns the permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission
  }

  try {
    const permission = await Notification.requestPermission()
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true")
    return permission
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return "denied"
  }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }
  return Notification.permission
}

/**
 * Check if notifications are supported by the browser
 */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false
  return "Notification" in window
}

/**
 * Schedule a notification for the future
 * @param interval - Milliseconds until notification should display
 * @param title - Notification title
 * @param options - Additional notification options
 * @returns Notification ID
 */
export function scheduleNotification(
  interval: number,
  title: string = "Time to check in!",
  options?: NotificationOptions & { actionUrl?: string }
): string {
  if (typeof window === "undefined") return ""
  
  const notificationId = `notif_${Date.now()}_${Math.random()}`
  const scheduledFor = Date.now() + interval
  
  // Store notification info
  const notification: ScheduledNotification = {
    id: notificationId,
    title,
    timestamp: Date.now(),
    scheduledFor,
    interval,
    read: false,
    type: "check-in",
    actionUrl: options?.actionUrl || "/grounding",
  }

  // Save to storage
  const notifications = getStoredNotifications()
  notifications.push(notification)
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

  // Schedule with service worker if available
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      notification,
    })
  }

  // Fallback: Schedule with setTimeout if window is open
  const timeoutId = setTimeout(() => {
    showNotification(title, {
      ...options,
      tag: notificationId,
      badge: "/logo.png",
      icon: "/logo.png",
    })
  }, interval)

  // Store timeout ID in sessionStorage for cleanup
  const timeoutIds = JSON.parse(sessionStorage.getItem("notification_timeouts") || "{}")
  timeoutIds[notificationId] = timeoutId
  sessionStorage.setItem("notification_timeouts", JSON.stringify(timeoutIds))

  return notificationId
}

/**
 * Show a notification immediately
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions & { actionUrl?: string }
): Promise<Notification | void> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported")
    return
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted")
    return
  }

  const { actionUrl, ...notificationOptions } = options || {}

  try {
    const notification = new Notification(title, {
      badge: "/logo.png",
      icon: "/logo.png",
      ...notificationOptions,
    })

    if (actionUrl) {
      notification.onclick = () => {
        window.focus()
        window.location.href = actionUrl
        notification.close()
      }
    }

    return notification
  } catch (error) {
    console.error("Error showing notification:", error)
  }
}

/**
 * Get stored notifications from localStorage
 */
export function getStoredNotifications(): ScheduledNotification[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === "undefined") return
  const notifications = getStoredNotifications()
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  }
}

/**
 * Clear a specific notification
 */
export function clearNotification(notificationId: string): void {
  if (typeof window === "undefined") return
  let notifications = getStoredNotifications()
  notifications = notifications.filter((n) => n.id !== notificationId)
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

  // Clear timeout if exists
  const timeoutIds = JSON.parse(sessionStorage.getItem("notification_timeouts") || "{}")
  if (timeoutIds[notificationId]) {
    clearTimeout(timeoutIds[notificationId])
    delete timeoutIds[notificationId]
    sessionStorage.setItem("notification_timeouts", JSON.stringify(timeoutIds))
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
  sessionStorage.removeItem("notification_timeouts")
}

/**
 * Get unread notification count
 */
export function getUnreadNotificationCount(): number {
  const notifications = getStoredNotifications()
  return notifications.filter((n) => !n.read).length
}

/**
 * Get notification state
 */
export function getNotificationState(): NotificationState {
  return {
    notifications: getStoredNotifications(),
    unreadCount: getUnreadNotificationCount(),
    permission: getNotificationPermission(),
  }
}

/**
 * Provider notification to different platforms
 * For native apps: send to native bridge
 * For web: use standard notification API
 */
export async function sendCrossPlatformNotification(
  interval: number,
  options?: {
    title?: string
    body?: string
    actionUrl?: string
  }
): Promise<string> {
  if (typeof window === "undefined") return ""

  const title = options?.title || "Time to check in!"

  // Check if running in native app context
  const isNativeApp = (window as any).__native_bridge !== undefined

  if (isNativeApp) {
    // Send to native bridge
    const notificationId = `notif_${Date.now()}_${Math.random()}`
    ;(window as any).__native_bridge?.scheduleNotification({
      id: notificationId,
      title,
      body: options?.body || "Open the app to check in with yourself",
      delay: interval,
      actionUrl: options?.actionUrl || "/grounding",
    })

    // Still track in storage for history
    const notification: ScheduledNotification = {
      id: notificationId,
      title,
      timestamp: Date.now(),
      scheduledFor: Date.now() + interval,
      interval,
      read: false,
      type: "check-in",
      actionUrl: options?.actionUrl,
    }

    const notifications = getStoredNotifications()
    notifications.push(notification)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

    return notificationId
  } else {
    // Use web notifications
    const permission = await requestNotificationPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }

    return scheduleNotification(interval, title, {
      body: options?.body || "Open the app to check in with yourself",
      actionUrl: options?.actionUrl || "/grounding",
    })
  }
}

/**
 * Parse interval string to milliseconds
 */
export function parseInterval(intervalStr: string): number {
  const intervals: { [key: string]: number } = {
    "5": 5 * 60 * 1000, // 5 minutes
    "10": 10 * 60 * 1000, // 10 minutes
    "30": 30 * 60 * 1000, // 30 minutes
    "60": 60 * 60 * 1000, // 1 hour
    "5m": 5 * 60 * 1000,
    "10m": 10 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
  }
  return intervals[intervalStr] || 5 * 60 * 1000
}

/**
 * Format milliseconds to readable time
 */
export function formatTimeUntil(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}
