"use client"

import { useEffect } from "react"

/**
 * Initialize Service Workers for background notifications
 * Registers both standard notification and push notification workers
 * This component should be placed in the root layout
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service workers for notifications
    if ("serviceWorker" in navigator) {
      // Register main notification service worker
      navigator.serviceWorker
        .register("/notification-service-worker.js", { scope: "/" })
        .then((registration) => {
          console.log("Notification service worker registered successfully", registration)

          // Request permission proactively
          if ("Notification" in window) {
            if (Notification.permission === "default") {
              // Don't request immediately, wait for user interaction
              // This will be requested when they try to schedule a notification
            }
          }
        })
        .catch((error) => {
          console.warn("Service worker registration failed:", error)
          // Graceful degradation - app will still work with web notifications
        })

      // Register push notification service worker
      navigator.serviceWorker
        .register("/push-notification-worker.js", { scope: "/" })
        .then((registration) => {
          console.log("Push notification service worker registered successfully", registration)
        })
        .catch((error) => {
          console.warn("Push notification service worker registration failed:", error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NAVIGATE") {
          // Navigate to the URL
          window.location.href = event.data.url
        }
      })
    }

    // Cleanup
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", () => {})
      }
    }
  }, [])

  return children
}
