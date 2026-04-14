const DEFAULT_URL = "/main"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  const payload = event.data?.json?.() || {}
  const title = payload.title || "Safe Space"
  const body = payload.body || "Open Safe Space to continue your check-in."
  const actionUrl = payload.actionUrl || payload.data?.actionUrl || DEFAULT_URL
  const notificationId = payload.notificationId || payload.data?.notificationId || payload.tag || "safe-space"

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: payload.tag || notificationId,
      requireInteraction: payload.requireInteraction ?? true,
      data: {
        notificationId,
        actionUrl,
      },
      actions: [
        { action: "open", title: "Open app" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "dismiss") {
    return
  }

  const actionUrl = event.notification.data?.actionUrl || DEFAULT_URL
  const notificationId = event.notification.data?.notificationId

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus()
          client.postMessage({
            type: "OPEN_NOTIFICATION",
            notificationId,
            actionUrl,
          })
          return client
        }
      }

      return self.clients.openWindow(actionUrl)
    })
  )
})
