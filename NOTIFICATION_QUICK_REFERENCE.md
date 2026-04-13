/**
 * Notification System - Developer Quick Reference
 * 
 * This file provides quick snippets and examples for implementing
 * the notification feature in your Safe Space pages and components
 */

# Notification System Quick Reference

## Quick Import

```tsx
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationBell } from "@/components/notification-bell"
```

## Basic Usage Examples

### 1. Using the Hook in a Component

```tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"

export function CheckInButton() {
  const { schedule, loading, error } = useNotifications()

  const handleSchedule = async () => {
    try {
      await schedule(5 * 60 * 1000, "Check-in reminder", {
        body: "Time to reflect with some grounding techniques",
        actionUrl: "/grounding"
      })
      // Show success toast or message
    } catch (err) {
      console.error("Failed:", err)
    }
  }

  return (
    <button onClick={handleSchedule} disabled={loading}>
      {loading ? "Setting reminder..." : "Remind me in 5 minutes"}
    </button>
  )
}
```

### 2. Schedule Directly Without Hook

```tsx
import { scheduleNotification, requestNotificationPermission } from "@/lib/notifications"

async function handleSchedule() {
  const permission = await requestNotificationPermission()
  if (permission === "granted") {
    const notificationId = scheduleNotification(
      10 * 60 * 1000, // 10 minutes
      "Time to check in!",
      {
        body: "How are you feeling?",
        actionUrl: "/grounding"
      }
    )
    console.log("Scheduled:", notificationId)
  }
}
```

### 3. Show Immediate Notification

```tsx
import { showNotification } from "@/lib/notifications"

await showNotification("Hello!", {
  body: "This appears immediately",
  actionUrl: "/wellness"
})
```

### 4. Check Status

```tsx
import { 
  getNotificationPermission,
  isNotificationSupported,
  getStoredNotifications
} from "@/lib/notifications"

const permission = getNotificationPermission() // 'granted' | 'denied' | 'default'
const isSupported = isNotificationSupported() // boolean
const allNotifications = getStoredNotifications() // array
```

## Time Intervals

Common intervals to use:

```typescript
// In milliseconds
const INTERVALS = {
  "5 minutes": 5 * 60 * 1000,
  "10 minutes": 10 * 60 * 1000,
  "15 minutes": 15 * 60 * 1000,
  "30 minutes": 30 * 60 * 1000,
  "1 hour": 60 * 60 * 1000,
  "2 hours": 2 * 60 * 60 * 1000,
  "immediate": 0
}
```

## Hook API Reference

```typescript
const {
  // State
  notifications,        // ScheduledNotification[]
  unreadCount,         // number
  permission,          // 'granted' | 'denied' | 'default'
  
  // Status
  loading,             // boolean
  error,               // string | null
  isSupported,         // boolean
  
  // Methods
  schedule,            // async (interval, title?, options?) => string
  requestPermission,   // async () => Promise<permission>
  markAsRead,          // (notificationId: string) => void
  clear,               // (notificationId: string) => void
  clearAll,            // () => void
  refresh              // () => void
} = useNotifications()
```

## Notification Options

```typescript
interface NotificationOptions {
  body?: string                    // Notification body text
  icon?: string                    // Icon URL
  badge?: string                   // Badge URL
  tag?: string                     // Unique identifier for grouping
  requireInteraction?: boolean     // Keep on screen until user interacts
  actionUrl?: string               // URL to navigate to on click
  sound?: string                   // Sound file URL
  vibrate?: number[]              // Vibration pattern [on, off, on, ...]
}
```

## Common Patterns

### Pattern 1: Add Reminder Button to Page

```tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"

export function GroundingPage() {
  const { schedule } = useNotifications()

  return (
    <div>
      <h1>Grounding Techniques</h1>
      {/* Your grounding content */}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3>Need a reminder?</h3>
        <div className="flex gap-2 mt-2">
          {[5, 10, 30].map(minutes => (
            <Button
              key={minutes}
              onClick={() => schedule(minutes * 60 * 1000)}
              variant="outline"
            >
              Remind me in {minutes}m
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Pattern 2: Notification Permission Banner

```tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { X } from "lucide-react"
import { useState } from "react"

export function NotificationBanner() {
  const { permission, isSupported, requestPermission } = useNotifications()
  const [dismissed, setDismissed] = useState(false)

  if (!isSupported || dismissed || permission === "granted") {
    return null
  }

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
      <div>
        <p className="font-medium text-green-900">
          Enable notifications to get reminders when it's time to check in!
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Enable
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
```

### Pattern 3: Notification Status Display

```tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"

export function NotificationStatus() {
  const { permission, unreadCount, notifications } = useNotifications()

  return (
    <div className="text-sm">
      <p>Permission: {permission}</p>
      <p>Unread: {unreadCount}</p>
      <p>Total: {notifications.length}</p>
    </div>
  )
}
```

## Advanced Patterns

### Pattern 4: Conditional Notifications Based on Page

```tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { useEffect } from "react"

export function PageNotificationHook({ pageName }: { pageName: string }) {
  const { schedule } = useNotifications()

  useEffect(() => {
    // Auto-suggest reminder when user lands on page
    const hasSeenSuggestion = sessionStorage.getItem(`reminder_${pageName}`)
    
    if (!hasSeenSuggestion) {
      // Could show a toast or banner suggesting reminder
      sessionStorage.setItem(`reminder_${pageName}`, "true")
    }
  }, [pageName])

  return null
}
```

### Pattern 5: Analytics Tracking

```tsx
import { getStoredNotifications } from "@/lib/notifications"

export function trackNotificationStats() {
  const notifications = getStoredNotifications()
  
  return {
    total: notifications.length,
    unopened: notifications.filter(n => !n.read).length,
    averageResponseTime: calculateAverageResponseTime(notifications),
    callToActionUrl: "/grounding", // most common
  }
}
```

## Troubleshooting Checklist

```typescript
// 1. Check if supported
if (!("Notification" in window)) {
  console.warn("Notifications not supported")
}

// 2. Check permission
console.log(Notification.permission)

// 3. Verify service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log("Service workers:", regs)
})

// 4. Check stored data
console.log(JSON.parse(localStorage.getItem("app_notifications") || "[]"))

// 5. Test scheduling
const testId = scheduleNotification(5000, "Test Notification")
console.log("Scheduled:", testId)
```

## Browser DevTools Tips

```javascript
// Console shortcuts

// Get all notifications
JSON.parse(localStorage.getItem("app_notifications"))

// Clear all
localStorage.removeItem("app_notifications")

// Get permission
Notification.permission

// Request permission
Notification.requestPermission()

// Test notification
new Notification("Test!", {
  body: "This is a test",
  icon: "/logo.png"
})

// Check service worker
navigator.serviceWorker.controller
```

## Performance Tips

1. **Debounce multiple schedules**: Don't schedule too many at once
2. **Clean up old notifications**: Archive notifications older than 30 days
3. **Use categories**: Tag notifications to filter later
4. **Batch operations**: Group clear/mark operations
5. **Monitor storage**: Check localStorage size periodically

```typescript
// Example: Clean old notifications
function cleanOldNotifications(daysOld = 30) {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
  let notifications = getStoredNotifications()
  notifications = notifications.filter(n => n.timestamp > cutoff)
  localStorage.setItem("app_notifications", JSON.stringify(notifications))
}
```

## Security Best Practices

1. ✅ Always validate `actionUrl` before navigation
2. ✅ Sanitize notification title and body
3. ✅ Verify permission before sending
4. ✅ Use HTTPS for service worker
5. ✅ Implement CSP headers
6. ✅ Don't store sensitive data in notification config

```typescript
// Safe URL validation
function isValidActionUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}
```

## Testing

### Unit Test Example

```typescript
import { scheduleNotification, getStoredNotifications } from "@/lib/notifications"

describe("Notifications", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it("should schedule a notification", () => {
    const id = scheduleNotification(5000, "Test")
    const notifications = getStoredNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].id).toBe(id)
  })

  it("should calculate correct scheduled time", () => {
    const now = Date.now()
    const delay = 10 * 60 * 1000
    scheduleNotification(delay, "Test")
    
    const notifications = getStoredNotifications()
    const diff = notifications[0].scheduledFor - now
    
    expect(Math.abs(diff - delay)).toBeLessThan(100)
  })
})
```

---

## Need More Help?

- See [NOTIFICATION_FEATURE_GUIDE.md](./NOTIFICATION_FEATURE_GUIDE.md) for detailed feature documentation
- See [NATIVE_APP_INTEGRATION.md](./NATIVE_APP_INTEGRATION.md) for native app bridge setup
- Check [components/notification-bell.tsx](./components/notification-bell.tsx) for UI component examples
