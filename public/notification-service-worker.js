/**
 * Service Worker for Notification Scheduling
 * Handles background notification scheduling and dispatch
 * Supports persistent reminders even when the app is not actively used
 */

// Store active notification timers
const notificationTimers = new Map()

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data.type === "SCHEDULE_NOTIFICATION") {
    scheduleNotificationInBackground(event.data.notification)
  } else if (event.data.type === "CLEAR_NOTIFICATION") {
    clearNotificationTimer(event.data.notificationId)
  } else if (event.data.type === "CLEAR_ALL_NOTIFICATIONS") {
    clearAllNotificationTimers()
  }
})

function scheduleNotificationInBackground(notification) {
  // Calculate time until notification should be shown
  const timeUntil = notification.scheduledFor - Date.now()

  if (timeUntil <= 0) {
    // Show immediately
    showNotification(notification)
  } else {
    // Schedule for later
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

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const actionUrl = event.notification.data?.actionUrl || "/grounding"

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus()
          // Send message to navigate to the action URL
          client.postMessage({
            type: "NAVIGATE",
            url: actionUrl,
          })
          return client
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(actionUrl)
      }
    })
  )
})

// Handle notification dismissal
self.addEventListener("notificationclose", (event) => {
  // Could track dismissals here if needed
  const notificationId = event.notification.data?.notificationId
  if (notificationId) {
    // Send to client to mark as read
  }
})

// Periodic background sync for notifications (optional - requires manifest setup)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // This could be used to sync notifications from a server
  // For now, just ensure stored notifications are still active
}
