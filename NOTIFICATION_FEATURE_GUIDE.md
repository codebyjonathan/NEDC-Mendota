/**
 * Notification Feature - Configuration & Best Practices
 * 
 * This document outlines the advanced notification system for the Safe Space app
 * covering web app, PWA, and native app implementations.
 */

# Advanced Notification Feature Guide

## Overview

The notification feature provides a multi-platform check-in reminder system:
- **Browser Notifications API** for web and PWA
- **Service Worker** for persistent background notifications
- **Native Bridge Support** for iOS/Android apps
- **Notification History** with unread tracking
- **Smooth UX** with clear confirmations and visual feedback

## Components

### 1. **NotificationBell** (`components/notification-bell.tsx`)
The main UI component featuring:
- Bell icon in the app header (top right)
- Red badge showing unread count
- Two tabs: "Schedule" and "History"
- Time selector dropdown (5m, 10m, 30m, 1h)
- Notification history with read/unread status

### 2. **Notification Service** (`lib/notifications.ts`)
Core functionality:
- `scheduleNotification()` - Schedule timed notifications
- `requestNotificationPermission()` - Request browser permission
- `showNotification()` - Display immediate notifications
- `sendCrossPlatformNotification()` - Support web and native apps
- Storage management using localStorage
- Service Worker integration

### 3. **useNotifications Hook** (`hooks/use-notifications.ts`)
React hook for managing notification state:
- `schedule()` - Schedule a new reminder
- `requestPermission()` - Request user permission
- `markAsRead()` - Mark notification as read
- `clear()` / `clearAll()` - Remove notifications
- `refresh()` - Sync state with storage

### 4. **Service Worker** (`public/notification-service-worker.js`)
Background notification handling:
- Schedules notifications to trigger at correct time
- Handles notification clicks and redirects
- Works even when app tab is closed
- Periodic sync support (future enhancement)

### 5. **ServiceWorkerProvider** (`components/service-worker-provider.tsx`)
Initialization component:
- Registers service worker on app load
- Sets up message listeners
- Handles cross-tab navigation

## How It Works

### User Flow

1. **User clicks bell icon** → Dropdown menu appears
2. **Selects time** (5m, 10m, 30m, 1h)
3. **Browser requests permission** (if not already granted)
4. **Notification scheduled** → Confirmation message shows for 3 seconds
5. **At scheduled time** → Notification appears on device
6. **User clicks notification** → Redirected to `/grounding` check-in page
7. **History tab** shows recent notifications with unread count

### Technical Flow

**Web/PWA:**
```
User selects time
    ↓
scheduleNotification() called
    ↓
Data stored in localStorage
    ↓
setTimeout scheduled (for open tab)
    ↓
Message sent to Service Worker (for closed tab)
    ↓
At scheduled time: notification fires
    ↓
User clicks → redirects to /grounding
```

**Native App:**
```
User selects time
    ↓
sendCrossPlatformNotification() detects native bridge
    ↓
Calls native bridge API
    ↓
Native layer schedules notification
    ↓
Native layer shows notification at time
    ↓
Native layer routes to /grounding on click
```

## Platform Support

### Browsers
- ✅ Chrome/Edge (desktop & Android)
- ✅ Firefox (desktop & Android)
- ✅ Safari (iOS 16+, macOS)
- ✅ Samsung Internet

### Features by Platform
| Feature | Web | PWA | Native |
|---------|-----|-----|--------|
| Scheduled notifications | ✅ | ✅ | ✅ |
| Background notifications | ⚠️ (SW) | ✅ | ✅ |
| Click tracking | ✅ | ✅ | ✅ |
| History | ✅ | ✅ | ✅ |
| Persistent reminders | ✅ | ✅ | ✅ |

⚠️ = Requires service worker or tab to remain open

## Usage Examples

### Basic Usage in Components

```tsx
import { useNotifications } from "@/hooks/use-notifications"

export function CheckInReminder() {
  const { schedule, unreadCount, isSupported } = useNotifications()

  const handleSchedule = async () => {
    try {
      await schedule(5 * 60 * 1000, "Time to check in!", {
        body: "Let's reflect for a moment",
        actionUrl: "/grounding"
      })
    } catch (error) {
      console.error("Failed to schedule:", error)
    }
  }

  if (!isSupported) return null

  return (
    <button onClick={handleSchedule}>
      Set reminder in 5 minutes
      {unreadCount > 0 && ` (${unreadCount} new)`}
    </button>
  )
}
```

### Manual Notification

```tsx
import { showNotification } from "@/lib/notifications"

// Single notification
await showNotification("Check in!", {
  body: "How are you feeling?",
  actionUrl: "/grounding"
})
```

### Permission Check

```tsx
import { getNotificationPermission } from "@/lib/notifications"

const permission = getNotificationPermission()
// 'granted' | 'denied' | 'default'
```

## Customization

### Change Check-in Intervals
Edit `CHECK_IN_INTERVALS` in `components/notification-bell.tsx`:
```tsx
const CHECK_IN_INTERVALS = [
  { label: "2 minutes", value: "2", ms: 2 * 60 * 1000 },
  { label: "15 minutes", value: "15", ms: 15 * 60 * 1000 },
  // ... etc
]
```

### Change Check-in Page
Update the default `actionUrl`:
```tsx
actionUrl: "/wellness"  // Instead of /grounding
```

### Notification Content
Customize in `handleScheduleReminder()`:
```tsx
await schedule(interval.ms, "Custom Title!", {
  body: "Custom message here",
  actionUrl: "/custom-page"
})
```

## Integration with Native Apps

For iOS/Android apps, implement a native bridge:

```tsx
// Detect native bridge
const isNativeApp = (window as any).__native_bridge !== undefined

if (isNativeApp) {
  (window as any).__native_bridge.scheduleNotification({
    id: "notif_123",
    title: "Time to check in!",
    body: "Open the app to reflect",
    delay: 300000, // milliseconds
    actionUrl: "/grounding"
  })
}
```

## Browser Permission Flow

The app handles three permission states:

1. **default** - User hasn't decided
   - Permission request shown on first schedule attempt
   - Clean, non-intrusive experience

2. **granted** - User allowed notifications
   - Notifications send immediately
   - No additional prompts

3. **denied** - User blocked notifications
   - Silent failure, no error shown
   - User can re-enable in browser settings

## Troubleshooting

### Notifications Not Showing
1. Check browser permission: `Notification.permission`
2. Verify service worker is running: DevTools → Application → Service Workers
3. Check browser notification settings (not muted/blocked)
4. For PWA: Ensure HTTPS is enabled

### Notification Doesn't Navigate
1. Service worker may be old - hard refresh (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify `/grounding` page exists
4. For native: Verify native bridge is initialized

### Badge Count Not Updating
1. Close/open the notification dropdown
2. Hard refresh the page
3. Check localStorage: `app_notifications`

## Performance Considerations

- **Storage**: Uses localStorage (~10KB per 100 notifications)
- **Service Worker**: Registers on app load (minimal overhead)
- **Memory**: Timeout IDs stored in sessionStorage (temporary)
- **Battery**: Native notifications more efficient than web polling

## Privacy & Security

- ✅ All notification data stored locally (no cloud sync)
- ✅ Permission required before any notifications
- ✅ User can clear all history anytime
- ✅ No analytics or tracking by default
- ✅ Works offline (cached in service worker)

## Future Enhancements

- [ ] Persistent background notifications (Backgroundable Web Workers)
- [ ] Server-based scheduling for ultra-reliable delivery
- [ ] Rich notification UI (images, buttons, etc.)
- [ ] Analytics dashboard for check-in completion
- [ ] Push notifications from admin panel
- [ ] Recurring reminders (daily at 3pm, etc.)
- [ ] Scheduled notification editing/cancellation
- [ ] Cross-device notification sync

## Testing Checklist

- [ ] Schedule and receive notification on same device
- [ ] Click notification and redirect to `/grounding`
- [ ] Close app and receive notification after reopening
- [ ] Badge count updates correctly
- [ ] History tab shows recent notifications
- [ ] Clear all notifications works
- [ ] Permission dialog shows correctly on first use
- [ ] Works in different browsers
- [ ] Works in PWA mode
- [ ] Mobile push notification test (iOS/Android)
