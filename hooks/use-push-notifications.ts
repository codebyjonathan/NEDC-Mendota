"use client"

import { useCallback, useEffect, useState } from "react"
import {
  isPushNotificationSupported,
  isPushNotificationSubscribed,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
  schedulePushNotification,
} from "@/lib/push-notifications"

export interface UsePushNotificationsResult {
  supported: boolean
  subscribed: boolean
  loading: boolean
  error: string | null
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  sendTest: () => Promise<boolean>
  schedule: (intervalMs: number, title?: string, options?: any) => Promise<string | null>
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications(): UsePushNotificationsResult {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check support and subscription status on mount
  useEffect(() => {
    const checkPushSupport = async () => {
      try {
        const isSupported = isPushNotificationSupported()
        setSupported(isSupported)

        if (isSupported) {
          const isSubscribed = await isPushNotificationSubscribed()
          setSubscribed(isSubscribed)
        }
      } catch (err) {
        console.error("Error checking push support:", err)
        setError("Failed to check push notification support")
      }
    }

    checkPushSupport()
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const success = await subscribeToPushNotifications()
      if (success) {
        setSubscribed(true)
      } else {
        setError("Failed to subscribe to push notifications")
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      console.error("Error subscribing:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const success = await unsubscribeFromPushNotifications()
      if (success) {
        setSubscribed(false)
      } else {
        setError("Failed to unsubscribe from push notifications")
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      console.error("Error unsubscribing:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const sendTest = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const success = await sendTestPushNotification()
      if (!success) {
        setError("Failed to send test notification")
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      console.error("Error sending test:", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const schedule = useCallback(
    async (
      intervalMs: number,
      title?: string,
      options?: any
    ): Promise<string | null> => {
      setLoading(true)
      setError(null)

      try {
        const id = await schedulePushNotification(intervalMs, title || "Safe Space reminder", options)
        if (!id) {
          setError("Failed to schedule push notification")
        }
        return id
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setError(message)
        console.error("Error scheduling:", err)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    supported,
    subscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTest,
    schedule,
  }
}
