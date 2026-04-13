/**
 * Notification Service
 * Handles browser notifications, scheduling, and persistence
 * Supports both web and native app notification flows
 * 
 * NOW SYNCS WITH SERVER - works across devices and origins!
 * Notifications are stored server-side and synced via API
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
const API_BASE = "/api/notifications"
const SYNC_INTERVAL = 30000 // Sync every 30 seconds

/**
 * Request notification permission from user
 * Returns the permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") {
    console.warn("This browser does not support notifications")
    return "denied"
  }

  // If Notification API not available (some mobile browsers)
  // still consider it "granted" so we can use service workers
  if (!("Notification" in window)) {
    console.info("Standard Notification API not available, using service worker fallback")
    return "granted"
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
    // On error, still return granted - mobile might use service worker
    return "granted"
  }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined") {
    return "denied"
  }
  // If Notification API not available, assume we'll use service workers
  if (!("Notification" in window)) {
    return "granted"
  }
  return Notification.permission
}

/**
 * Check if notifications are supported by the browser
 */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false
  // Show bell on all client-side environments
  // Service workers can handle notifications even if Notification API isn't available
  return true
}

/**
 * Schedule a notification for the future (async - syncs with server)
 * @param interval - Milliseconds until notification should display
 * @param title - Notification title
 * @param options - Additional notification options
 * @returns Notification ID
 */
export async function scheduleNotification(
  interval: number,
  title: string = "Time to check in!",
  options?: NotificationOptions & { actionUrl?: string }
): Promise<string> {
  if (typeof window === "undefined") return ""
  
  const notificationId = `notif_${Date.now()}_${Math.random()}`
  const scheduledFor = Date.now() + interval
  
  // Create notification object
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

  try {
    // Save to server first
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      throw new Error("Failed to save notification to server")
    }

    // Also save to localStorage as fallback
    const notifications = getStoredNotificationsSync()
    notifications.push(notification)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

  } catch (error) {
    console.error("Error saving notification to server:", error)
    // Fallback to localStorage only
    const notifications = getStoredNotificationsSync()
    notifications.push(notification)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  }

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
 * Get stored notifications from localStorage (synchronous, for fallback)
 */
export function getStoredNotificationsSync(): ScheduledNotification[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get stored notifications from server (async, primary source)
 */
export async function getStoredNotifications(): Promise<ScheduledNotification[]> {
  if (typeof window === "undefined") return []
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      console.warn("Failed to fetch notifications from server, falling back to localStorage")
      return getStoredNotificationsSync()
    }
    const data = await response.json()
    return data.notifications || []
  } catch (error) {
    console.error("Error fetching notifications from server:", error)
    return getStoredNotificationsSync()
  }
}

/**
 * Mark notification as read (both server and local)
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  if (typeof window === "undefined") return
  
  try {
    // Update on server
    const response = await fetch(`${API_BASE}/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    })

    if (response.ok) {
      // Also update localStorage
      const notifications = getStoredNotificationsSync()
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.read = true
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
      }
      return
    }
  } catch (error) {
    console.error("Error marking notification as read on server:", error)
  }

  // Fallback: localStorage only
  const notifications = getStoredNotificationsSync()
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  }
}

/**
 * Clear a specific notification (both server and local)
 */
export async function clearNotification(notificationId: string): Promise<void> {
  if (typeof window === "undefined") return
  
  try {
    // Delete from server
    const response = await fetch(`${API_BASE}/${notificationId}`, {
      method: "DELETE",
    })

    if (response.ok) {
      // Also update localStorage
      let notifications = getStoredNotificationsSync()
      notifications = notifications.filter((n) => n.id !== notificationId)
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
      
      // Clear timeout if exists
      const timeoutIds = JSON.parse(sessionStorage.getItem("notification_timeouts") || "{}")
      if (timeoutIds[notificationId]) {
        clearTimeout(timeoutIds[notificationId])
        delete timeoutIds[notificationId]
        sessionStorage.setItem("notification_timeouts", JSON.stringify(timeoutIds))
      }
      return
    }
  } catch (error) {
    console.error("Error clearing notification on server:", error)
  }

  // Fallback: localStorage only
  let notifications = getStoredNotificationsSync()
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
 * Clear all notifications (both server and local)
 */
export async function clearAllNotifications(): Promise<void> {
  if (typeof window === "undefined") return
  
  try {
    // Delete all from server
    const response = await fetch(`${API_BASE}?clearAll=true`, {
      method: "DELETE",
    })

    if (response.ok) {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
      sessionStorage.removeItem("notification_timeouts")
      return
    }
  } catch (error) {
    console.error("Error clearing all notifications on server:", error)
  }

  // Fallback: localStorage only
  localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
  sessionStorage.removeItem("notification_timeouts")
}

/**
 * Get unread notification count (async)
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getStoredNotifications()
  return notifications.filter((n) => !n.read).length
}

/**
 * Get unread notification count (synchronous, for contexts that don't support async)
 */
export function getUnreadNotificationCountSync(): number {
  const notifications = getStoredNotificationsSync()
  return notifications.filter((n) => !n.read).length
}

/**
 * Get notification state (async)
 */
export async function getNotificationState(): Promise<NotificationState> {
  return {
    notifications: await getStoredNotifications(),
    unreadCount: await getUnreadNotificationCount(),
    permission: getNotificationPermission(),
  }
}

/**
 * Get notification state (synchronous, for contexts that don't support async)
 */
export function getNotificationStateSync(): NotificationState {
  return {
    notifications: getStoredNotificationsSync(),
    unreadCount: getUnreadNotificationCountSync(),
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

    // Still track in storage and server
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

    // Save to server
    try {
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      })
    } catch (error) {
      console.error("Error saving native notification to server:", error)
    }

    // Also save to localStorage
    const notifications = getStoredNotificationsSync()
    notifications.push(notification)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))

    return notificationId
  } else {
    // Use web notifications via the regular schedule function
    const permission = await requestNotificationPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }

    return await scheduleNotification(interval, title, {
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
