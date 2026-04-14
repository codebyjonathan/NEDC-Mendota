# Push Notifications Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Safe Space App                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                   User Interface Layer                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │  │
│  │  │ Notification │  │ Push Settings│  │ Demo Page    │         │  │
│  │  │ Bell         │  │ Component    │  │              │         │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                   Client Logic Layer                            │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  use-notifications.ts     │  use-push-notifications.ts  │  │  │
│  │  │  (Local/setTimeout)        │  (Web Push/FCM)             │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │     ↓ (postMessage)                 ↓ (subscribe)        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│          ↓                                    ↓                         │
│  ┌──────────────────────┐         ┌─────────────────────────┐          │
│  │Service Worker Layer  │         │ Service Worker Layer    │          │
│  │(notification-SW.js)  │         │ (push-notification-SW)  │          │
│  │ - scheduleNotif()    │         │ - handle push events    │          │
│  │ - showNotification() │         │ - notificationclick     │          │
│  └──────────────────────┘         └─────────────────────────┘          │
│                                            ↓                            │
│                                  ┌────────────────────┐                │
│                                  │  OS Notification   │                │
│                                  │  Service           │                │
│                                  └────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │   Server-Side (Next.js API)     │
                    │   /api/push-notifications/      │
                    │                                 │
                    │ - /subscribe                    │
                    │ - /send-test                    │
                    │ - /schedule                     │
                    │ - /cancel/:id                   │
                    └─────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │  Push Service                   │
                    │                                 │
                    │ - Web Push Protocol             │
                    │ - Firebase Cloud Messaging      │
                    │ - Apple Push Notification       │
                    └─────────────────────────────────┘
                                      ↓
                    ┌─────────────────────────────────┐
                    │   User Device                   │
                    │   (Phone/Tablet/Desktop)        │
                    │                                 │
                    │   Receives notification         │
                    │   even when app is closed!      │
                    └─────────────────────────────────┘
```

---

## Flow: User Enables Push Notifications

```
1. User clicks "Enable Push Notifications"
   ↓
2. usePushNotifications hook calls subscribeToPushNotifications()
   ↓
3. Browser requests notification permission
   ↓ (User grants permission)
   ↓
4. Service worker subscribes to push
   ↓
5. Service worker gets subscription object:
   {
     endpoint: "https://fcm.googleapis.com/...",
     keys: {
       auth: "...",
       p256dh: "..."
     }
   }
   ↓
6. Client sends to: POST /api/push-notifications/subscribe
   ↓
7. Server stores subscription in database (or in-memory)
   ↓
8. UI shows "✅ Push notifications enabled"
   ↓
9. User can now schedule notifications that work in background!
```

---

## Flow: User Schedules Check-in Reminder

```
SCENARIO: App is OPEN
────────────────────────────────────────

1. User opens notification bell → taps "Set Reminder" → "10 minutes"
   ↓
2. schedule() called with interval: 10 * 60 * 1000 ms
   ↓
3. Two parallel actions:
   a) Save to localStorage (local state)
   b) POST to /api/notifications (sync with server)
   ↓
4. Service worker receives message: scheduleNotificationInBackground()
   ↓
5. setTimeout(10 mins) set in service worker
   ↓
6. After 10 minutes, notification shows in app
   ↓
7. User clicks → grounding page opens


SCENARIO: App is CLOSED
────────────────────────────────────────

1. User enables push notifications first (subscribed)
   ↓
2. User opens notification bell → "Push Notifications" menu
   ↓
3. User enters time for reminder (10 minutes)
   ↓
4. Client calls: POST /api/push-notifications/schedule
   ↓
5. Server stores scheduled push in database:
   {
     id: "push_123456",
     endpoint: "https://fcm.googleapis.com/...",
     title: "Time to check in!",
     body: "Let's check in with yourself",
     scheduledFor: Date.now() + 10*60*1000
   }
   ↓
6. Server sets setTimeout for 10 minutes
   ↓
7. User closes app / browser / phone / ANYTHING
   ↓
8. After 10 minutes, server timeout fires
   ↓
9. Server sends push via Web Push Protocol:
   POST https://fcm.googleapis.com/...
   {
     push_service_token: "...",
     payload: {
       title: "Time to check in!",
       body: "...",
       icon: "/logo.png"
     }
   }
   ↓
10. Device OS receives push (FCM/APNs)
   ↓
11. NOTIFICATION APPEARS (even if app is closed!) ✅
   ↓
12. User clicks notification
   ↓
13. Service worker notificationclick event fires
   ↓
14. Opens or focuses app to /grounding page
```

---

## Data Flow: Complete Cycle

```
SEND TEST NOTIFICATION
─────────────────────

UI Button Click
    ↓
usePushNotifications.sendTest()
    ↓
fetch POST /api/push-notifications/send-test
    ↓
[Server] Find device's subscription
    ↓
[Server] Call sendPushNotification(subscription, payload)
    ↓
[Server] Send to FCM/Web Push service
    ↓
[FCM] Route to device
    ↓
[Device] Service Worker receives "push" event
    ↓
[SW] Call self.registration.showNotification()
    ↓
[OS] Display notification
    ↓
[User] Clicks notification
    ↓
[SW] notificationclick handler
    ↓
[SW] Open or focus app window
    ↓
[SW] postMessage with navigation URL
    ↓
[App] Listen for message, navigate to URL
    ↓
[UI] Show grounding exercise
```

---

## Key Components & Their Roles

### Client-Side

| File | Purpose | Key Functions |
|------|---------|---|
| `lib/push-notifications.ts` | Core push logic | `subscribeToPushNotifications()`, `schedulePushNotification()` |
| `hooks/use-push-notifications.ts` | React integration | State management, loading, errors |
| `components/push-notification-settings.tsx` | UI component | Toggle, test button, status display |
| `app/push-notifications-demo/page.tsx` | Testing interface | Full demo of all features |

### Server-Side

| File | Purpose | Endpoints |
|------|---------|-----------|
| `app/api/push-notifications/route.ts` | Backend API | `/subscribe`, `/send-test`, `/schedule`, `/cancel` |

### Service Workers

| File | Purpose | Events |
|------|---------|--------|
| `public/notification-service-worker.js` | Original notifications | Messages, setTimeout scheduling |
| `public/push-notification-worker.js` | Push notifications | `push`, `notificationclick`, `pushsubscriptionchange` |

---

## State Diagram: User Journey

```
                    ┌──────────────────┐
                    │  Notification    │
                    │  Bell Component  │
                    └────────┬─────────┘
                             │ "Enable Push?"
                             ↓
                    ┌──────────────────┐
                    │ Show Permission  │
                    │ Prompt           │
                    └────────┬─────────┘
                             │
                   ┌─────────┴─────────┐
                   ↓                   ↓
            ┌────────────┐      ┌────────────┐
            │ DENIED ✗   │      │ GRANTED ✅ │
            │            │      │            │
            │ Show error │      │ Subscribe  │
            │ message    │      │ to push    │
            └────────────┘      └─────┬──────┘
                                      │
                    ┌─────────────────┘
                    ↓
           ┌─────────────────┐
           │ SUBSCRIBED      │
           │ ✅ Push Enabled │
           └─────────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    ┌────────┐  ┌─────────┐  ┌──────────┐
    │ Send   │  │Schedule │  │Unsubscribe
    │ Test   │  │ Reminder│  │           
    │        │  │ Time    │  │           
    └────────┘  └─────────┘  └──────────┘
        ↓            ↓            │
     NOTIF       SET TIMER      │
     NOW!        (in DB)        │
                  ↓             │
            ╔════════════╗      │
            ║ SCHEDULED  ║      │
            ╚════════════╝      │
                 ↓              │
        [Device closes]         │
        [Browser closes]        │
        [Time passes...]        │
                 ↓              │
        ╔═══════════════╗       │
        ║ NOTIFICATION  ║       │
        ║ RECEIVED! 📬  ║       │
        ╚═════════╤═════╝       │
                  │             │
            [User clicks]       │
                  ↓             │
            ┌─────────────┐     │
            │ App Opens   │     │
            │ To Grounding│     │
            │ Page        │     │
            └─────────────┘     │
                                │
                                ↓
                        [Unsubscribe]
                             ↓
                      ┌──────────────┐
                      │ Remove subs  │
                      │ Delete tokens│
                      │ Push OFF ✅  │
                      └──────────────┘
```

---

## Comparison: Different Notification Types

```
┌────────────────────┬──────────────┬──────────────┬──────────────┐
│ Feature            │ Local (SW)   │ Push (FCM)   │ App Foreground
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ App Must Be Open   │ ✅ Yes       │ ❌ No        │ ✅ Yes
│ Browser Open       │ ✅ Required  │ ❌ No        │ ✅ Required
│ Device Asleep      │ ❌ No        │ ✅ Wakes up  │ ❌ No
│ Persistence        │ ❌ Resets    │ ✅ Persists  │ ⚠️ If kept open
│ Battery Use        │ ⚠️ If onTime │ ✅ Minimal   │ ❌ High
│ Latency            │ ⚠️ Variable  │ ✅ <1s       │ ✅ Immediate
│ Cross-Tab Sync     │ ❌ No        │ ✅ Yes       │ ✅ Yes
│ Offline Support    │ ❌ No        │ ✅ Yes*      │ ❌ No
│ Implementation     │ ⭐⭐ Easy    │ ⭐⭐⭐ Med  │ ⭐ Simplest
│ Reliability        │ ⭐⭐ Medium  │ ⭐⭐⭐ High  │ ⭐⭐ Moderate
└────────────────────┴──────────────┴──────────────┴──────────────┘

*stored in queue until online
```

---

## Configuration: VAPID Keys Flow

```
YOU                      Browser              Server
 │                          │                    │
 ├─ Generate Keys ──────────┤
 │  (web-push)              │
 │                          │
 │ Public Key ──────────────┤──────────────────── [Add to client]
 │                          │
 │ Private Key ─────────────┤──────────────────── [Add to server]
 │                          │
 │ Subject ──────────────────┤──────────────────── [Add to server]
 │                          │
 └──────────────────────────┴──────────────────┘
                            │
                    [SETUP COMPLETE]
                            │
    User clicks "Enable"    │
         │                  │
         └─────────────────→ │ Subscribe
                            ↓
                   Subscription Token
                            ↓
                            └──────────────────→ [Stored in DB]
                                                │
    [Later] User schedules                     │
         │                                      │
         └─────────────────→ Schedule Request  │
                                               ↓
                                    [Create timer]
                                               ↓
    [Time passes]                         [Fire timer]
                                               ↓
                                   [Send push to FCM]
                                               ↓
                                    [FCM sends to device]
                                               ↓
                          [Device notifies user] ✅
```

---

## Error Handling Flow

```
User Action
   │
   ├─ Subscribe Button Clicked
   │
   ├─ Check: Browser supports?
   │  │
   │  ├─ ❌ No → Show "Not supported"
   │  │
   │  └─ ✅ Yes → Continue
   │
   ├─ Request permission
   │  │
   │  ├─ ❌ Denied → Show "Enable in settings"
   │  │
   │  └─ ✅ Granted → Continue
   │
   ├─ Send to server
   │  │
   │  ├─ ❌ Error → Show error message
   │  │  - Network issue?
   │  │  - VAPID key invalid?
   │  │  - Database down?
   │  │
   │  └─ ✅ Success → Show "✅ Enabled"
   │
   └─ Handle edge cases:
      - Subscription already exists → Update
      - Service worker crashed → Re-register
      - Permission revoked → Unsubscribe
      - Subscription invalid → Remove
```

---

## Deployment Considerations

```
Local Development          Staging              Production
│                          │                    │
├─ VAPID Keys ✅           ├─ VAPID Keys ✅     ├─ VAPID Keys ✅
├─ HTTP OK ✅              ├─ HTTPS ✅          ├─ HTTPS Required ✅
├─ Firebase Optional ✅    ├─ Firebase ✅       ├─ Firebase ✅
├─ In-memory DB OK ✅      ├─ Real DB ⚠️        ├─ Real DB Required ✅
├─ No env file OK ✅       ├─ Env vars ✅       ├─ Env vars ✅
└─ Testing ✅              └─ Testing ✅        └─ Monitoring Required ✅
```

This architecture ensures:
- ✅ Notifications work even when app is closed
- ✅ Cross-device persistence
- ✅ Reliable delivery
- ✅ Scalable to millions of users
- ✅ Easy testing and debugging
