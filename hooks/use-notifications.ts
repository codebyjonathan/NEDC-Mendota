"use client"

import { useCallback, useEffect, useState } from "react"
import {
  scheduleNotification,
  requestNotificationPermission,
  getNotificationState,
  getStoredNotifications,
  markNotificationAsRead,
  clearNotification,
  clearAllNotifications,
  getUnreadNotificationCount,
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

  // Initialize state on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setState(getNotificationState())

      // Listen for storage changes
      const handleStorageChange = () => {
        setState(getNotificationState())
      }

      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Refresh state
  const refresh = useCallback(() => {
    if (isNotificationSupported()) {
      setState(getNotificationState())
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
        const notificationId = scheduleNotification(intervalMs, title, options)

        // Refresh state
        setState(getNotificationState())

        return notificationId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to schedule notification"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
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
    setState(getNotificationState())
  }, [])

  // Clear notification
  const clear = useCallback((notificationId: string) => {
    clearNotification(notificationId)
    setState(getNotificationState())
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    clearAllNotifications()
    setState({
      notifications: [],
      unreadCount: 0,
      permission: getNotificationPermission(),
    })
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
