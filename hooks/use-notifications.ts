"use client"

import { useCallback, useEffect, useState } from "react"
import {
  scheduleNotification,
  requestNotificationPermission,
  getNotificationState,
  getNotificationStateSync,
  getStoredNotifications,
  getStoredNotificationsSync,
  markNotificationAsRead,
  clearNotification,
  clearAllNotifications,
  getUnreadNotificationCount,
  getUnreadNotificationCountSync,
  isNotificationSupported,
  getNotificationPermission,
  type ScheduledNotification,
  type NotificationState,
} from "@/lib/notifications"

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    permission: "default",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize state on mount with sync version, then fetch from server
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    if (isNotificationSupported()) {
      // Start with sync state
      setState(getNotificationStateSync())

      // Fetch from server asynchronously
      getNotificationState().then(setState).catch((err) => {
        console.error("Failed to fetch notification state from server:", err)
      })

      // Set up periodic sync with server every 30 seconds
      const syncInterval = setInterval(() => {
        getNotificationState().then(setState).catch((err) => {
          console.error("Failed to sync notifications:", err)
        })
      }, 30000)

      // Listen for storage changes
      const handleStorageChange = () => {
        setState(getNotificationStateSync())
      }

      window.addEventListener("storage", handleStorageChange)
      return () => {
        clearInterval(syncInterval)
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [])

  // Refresh state from server
  const refresh = useCallback(async () => {
    if (isNotificationSupported()) {
      try {
        const newState = await getNotificationState()
        setState(newState)
      } catch (err) {
        console.error("Failed to refresh notifications:", err)
        setState(getNotificationStateSync())
      }
    }
  }, [])

  // Schedule notification
  const schedule = useCallback(
    async (intervalMs: number, title?: string, options?: { body?: string; actionUrl?: string }) => {
      setLoading(true)
      setError(null)

      try {
        // Request permission if needed
        const permission = await requestNotificationPermission()
        if (permission !== "granted") {
          throw new Error("Notification permission was denied")
        }

        // Schedule the notification
        const notificationId = await scheduleNotification(intervalMs, title, options)

        // Refresh state
        await refresh()

        return notificationId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to schedule notification"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  // Request permission
  const requestPermission = useCallback(async () => {
    setError(null)
    try {
      const permission = await requestNotificationPermission()
      setState((prev) => ({
        ...prev,
        permission,
      }))
      return permission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to request permission"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Mark as read
  const markAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId)
    setState(getNotificationStateSync())
    // Also sync with server in background
    getNotificationState().then(setState).catch(console.error)
  }, [])

  // Clear notification
  const clear = useCallback((notificationId: string) => {
    clearNotification(notificationId)
    setState(getNotificationStateSync())
    // Also sync with server in background
    getNotificationState().then(setState).catch(console.error)
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    clearAllNotifications()
    setState({
      notifications: [],
      unreadCount: 0,
      permission: getNotificationPermission(),
    })
    // Also sync with server in background
    getNotificationState().then(setState).catch(console.error)
  }, [])

  return {
    ...state,
    loading,
    error,
    schedule,
    requestPermission,
    markAsRead,
    clear,
    clearAll,
    refresh,
    isSupported: isNotificationSupported(),
  }
}
