/**
 * Service Worker for Push Notifications
 * Handles background push notifications even when the app is closed
 * 
 * This extends the notification service worker with push event handling
 */

// Store active notification timers
const notificationTimers = new Map()
let fcmToken = null

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data.type)

  if (event.data.type === "SCHEDULE_NOTIFICATION") {
    scheduleNotificationInBackground(event.data.notification)
  } else if (event.data.type === "CLEAR_NOTIFICATION") {
    clearNotificationTimer(event.data.notificationId)
  } else if (event.data.type === "CLEAR_ALL_NOTIFICATIONS") {
    clearAllNotificationTimers()
  } else if (event.data.type === "GET_FCM_TOKEN") {
    // Return stored FCM token
    event.ports[0].postMessage({
      type: "FCM_TOKEN",
      token: fcmToken,
    })
  }
})

/**
 * Handle incoming push notifications
 * This fires when a push event is received while the app is closed
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event)

  if (!event.data) {
    console.warn("[SW] Push notification has no data")
    return
  }

  try {
    const data = event.data.json()
    console.log("[SW] Push notification data:", data)

    const notificationOptions = {
      body: data.body || "Time to check in with yourself",
      icon: data.icon || "/logo.png",
      badge: data.badge || "/logo.png",
      tag: data.tag || "safe-space-notification",
      requireInteraction: data.requireInteraction !== false,
      data: {
        url: data.data?.url || data.actionUrl || "/grounding",
        title: data.title,
      },
      actions: [
        {
          action: "open",
          title: "Open App",
        },
        {
          action: "close",
          title: "Dismiss",
        },
      ],
    }

    event.waitUntil(
      self.registration.showNotification(data.title || "Safe Space", notificationOptions)
    )
  } catch (error) {
    console.error("[SW] Error processing push notification:", error)

    // Fallback for non-JSON push
    const text = event.data.text()
    event.waitUntil(
      self.registration.showNotification("Safe Space Notification", {
        body: text,
        icon: "/logo.png",
        badge: "/logo.png",
      })
    )
  }
})

/**
 * Handle push subscription change
 * Fires when push subscription renews
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed")

  event.waitUntil(
    (async () => {
      try {
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
        })

        // Send new subscription to server
        await fetch("/api/push-notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            endpoint: subscription.endpoint,
          }),
        })

        console.log("[SW] Push subscription renewed")
      } catch (error) {
        console.error("[SW] Failed to renew push subscription:", error)
      }
    })()
  )
})

/**
 * Handle notification clicks
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  const url = event.notification.data?.url || "/grounding"

  // Handle action buttons
  if (event.action === "close") {
    // Just dismiss, already closed above
    return
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus()
          // Send message to navigate
          client.postMessage({
            type: "NAVIGATE",
            url: url,
          })
          return client
        }
      }

      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

/**
 * Handle notification dismissal
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification dismissed")
  // Could track dismissals here if needed
})

/**
 * Background sync for scheduled notifications
 * Periodic sync to ensure scheduled notifications are sent even if app is closed
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    console.log("[SW] Background sync triggered")
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // This would sync with server to check for pending notifications
  console.log("[SW] Syncing notifications...")
}

/**
 * Original notification scheduling functions
 */

function scheduleNotificationInBackground(notification) {
  const timeUntil = notification.scheduledFor - Date.now()

  if (timeUntil <= 0) {
    showNotification(notification)
  } else {
    const timerId = setTimeout(() => {
      showNotification(notification)
      notificationTimers.delete(notification.id)
    }, timeUntil)

    notificationTimers.set(notification.id, timerId)
  }
}

function showNotification(notification) {
  self.registration.showNotification(notification.title, {
    body: "Time to check in with yourself. Click to open the app.",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: notification.id,
    requireInteraction: true,
    data: {
      notificationId: notification.id,
      actionUrl: notification.actionUrl || "/grounding",
    },
  })
}

function clearNotificationTimer(notificationId) {
  const timerId = notificationTimers.get(notificationId)
  if (timerId) {
    clearTimeout(timerId)
    notificationTimers.delete(notificationId)
  }
}

function clearAllNotificationTimers() {
  notificationTimers.forEach((timerId) => {
    clearTimeout(timerId)
  })
  notificationTimers.clear()
}
