# Notification Feature - Setup & Installation Guide

**Status**: ✅ Fully Implemented & Ready to Use

## What You Got

A complete, production-ready notification reminder system with:
- 🔔 Bell icon in app header (top-right)
- ⏰ Schedule reminders (5m, 10m, 30m, 1h)
- 📱 Browser notifications at scheduled time
- 📋 Notification history & tracking
- 🔗 Click notification → direct to check-in page
- 🌍 Works on web, PWA, and native apps
- 📊 Unread notification badges
- 💾 Persistent storage using localStorage

## 🎯 What To Do Now

### 1. It's Already Working!
The notification bell is automatically included in your app header. Visit any page that uses `<AppHeader>` and you'll see it in the top-right.

### 2. View the Example Page
```bash
Visit: http://localhost:3000/notification-example
```
This shows the feature in action with quick-start buttons.

### 3. Try It Out
1. Click the bell icon in any app page
2. Select a time (5 minutes, 10 minutes, etc.)
3. Grant browser permission when prompted
4. You'll see "✓ Reminder set for X minutes"
5. Wait the specified time (or test with 5 minutes)
6. Browser notification appears
7. Click the notification to go to `/grounding` page

### 4. In Your Own Pages
Add reminder buttons to any page:

```tsx
import { useNotifications } from "@/hooks/use-notifications"

export function MyPage() {
  const { schedule } = useNotifications()

  return (
    <button onClick={() => schedule(5 * 60 * 1000)}>
      Remind me in 5 minutes
    </button>
  )
}
```

## 📂 Files Added (12 total)

### Core Implementation
| File | Purpose | Size |
|------|---------|------|
| `lib/notifications.ts` | Notification service | 400+ lines |
| `hooks/use-notifications.ts` | React hook | 120+ lines |
| `components/notification-bell.tsx` | UI component | 300+ lines |
| `components/service-worker-provider.tsx` | SW initialization | 80+ lines |
| `public/notification-service-worker.js` | Background handler | 180+ lines |

### Updated Files
| File | Change | Impact |
|------|--------|--------|
| `components/app-header.tsx` | Added `<NotificationBell />` | Visible in all pages |
| `app/layout.tsx` | Wrapped with `<ServiceWorkerProvider>` | Enables SW globally |

### Documentation
| File | Content |
|------|---------|
| `NOTIFICATION_FEATURE_GUIDE.md` | Complete feature documentation |
| `NOTIFICATION_QUICK_REFERENCE.md` | Code examples & patterns |
| `NATIVE_APP_INTEGRATION.md` | iOS/Android bridge setup |
| `NOTIFICATION_IMPLEMENTATION_SUMMARY.md` | Architecture & design |
| `NOTIFICATION_SETUP_GUIDE.md` | This file |

### Examples
| File | Purpose |
|------|---------|
| `app/notification-example/page.tsx` | Working example page |

## 🔧 No Configuration Needed!

The feature works out-of-the-box with:
- ✅ Default notification intervals (5m, 10m, 30m, 1h)
- ✅ Check-in page at `/grounding` (redirects notifications here)
- ✅ localStorage for persistence
- ✅ Service worker in `/public/notification-service-worker.js`
- ✅ Integrated into app header

### Optional: Customize

#### Change Time Intervals
In `components/notification-bell.tsx`:
```tsx
const CHECK_IN_INTERVALS = [
  { label: "2 minutes", value: "2", ms: 2 * 60 * 1000 },
  { label: "20 minutes", value: "20", ms: 20 * 60 * 1000 },
  // ... add or remove as needed
]
```

#### Change Destination Page
In `components/notification-bell.tsx`:
```tsx
await schedule(interval.ms, "Time to check in!", {
  body: "Let's take a moment to reflect and check in with yourself.",
  actionUrl: "/wellness"  // ← Change here
})
```

#### Change Notification Message
In `components/notification-bell.tsx`, update the `handleScheduleReminder` function:
```tsx
await schedule(interval.ms, "Your Custom Title!", {
  body: "Your custom message here",
  actionUrl: "/grounding"
})
```

## 🧪 Testing Checklist

Quick tests to verify everything works:

- [ ] **Bell Icon Visible**
  - Go to any app page
  - See bell icon in top-right of header
  - Red badge shows if you have unread notifications

- [ ] **Schedule a Reminder**
  - Click bell icon
  - Click "Schedule" tab
  - Click "5 minutes"
  - See "✓ Reminder set for 5 minutes"

- [ ] **Get Permission Dialog**
  - If you haven't used notifications before
  - Browser asks for permission
  - Grant it

- [ ] **Notification at Time**
  - Wait 5 minutes (or test with different time)
  - Notification appears on device
  - Can be from browser or system tray

- [ ] **Click Notification**
  - Click the notification
  - Browser focuses & navigates to `/grounding`
  - You're on the check-in page

- [ ] **History Tab**
  - Click bell icon again
  - Click "History" tab
  - See the notification you received
  - Has checkmark and timestamp
  - Click X to remove it

- [ ] **Badge Count**
  - If you haven't opened a notification
  - Badge shows "1" or corresponding count
  - Count goes away when you check history

## 🚀 Deployment

### For Web/PWA
Just deploy normally. Nothing special needed:
```bash
npm run build
npm run start
```

### For Native App (iOS/Android)
See [NATIVE_APP_INTEGRATION.md](./NATIVE_APP_INTEGRATION.md) for:
- iOS Swift bridge code
- Android Kotlin bridge code
- Testing instructions
- Deep linking setup

## 📱 Platform-Specific Notes

### Chrome/Chromium (Best)
- ✅ Full support
- ✅ Service worker works great
- ✅ Background notifications in PWA

### Firefox
- ✅ Full support
- ✅ Service worker works
- ⚠️ Background may require user focus

### Safari (iOS/macOS)
- ✅ Notifications work (iOS 16+)
- ⚠️ Service worker limited on iOS
- 💡 Native app recommended for best experience

### Edge
- ✅ Same as Chromium
- ✅ Full support

## 🆘 Troubleshooting

### Notifications Not Showing
```javascript
// Check in Browser Console:
console.log(Notification.permission)  // Should be 'granted'
navigator.serviceWorker.getRegistrations()  // Should show one
JSON.parse(localStorage.getItem("app_notifications"))  // Check storage
```

**Solutions**:
1. Check browser notifications aren't muted
   - Settings → Privacy → Notifications → This site
2. Grant permission when asked
3. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
4. Check HTTPS is enabled (required for notifications)

### Bell Icon Not Showing
1. Make sure you're on a page using `<AppHeader>`
2. Check that `components/app-header.tsx` imports `<NotificationBell />`
3. Hard refresh the page

### History Not Showing
1. Click the bell icon
2. Click "History" tab
3. If empty, you haven't received any notifications yet
4. Schedule a 5-minute reminder and come back

### Notification Doesn't Navigate
1. Check that `/grounding` page exists
2. Verify `actionUrl` in notification config
3. Check browser console for errors
4. Try hard refresh

## 📚 Documentation

**Which file answers my question?**

| Question | File |
|----------|------|
| How do I use this? | **Quick Reference** |
| I need code examples | **Quick Reference** → "Basic Usage Examples" |
| How does it work behind the scenes? | **Feature Guide** |
| Can I customize the intervals? | **Feature Guide** → "Customization" |
| I'm building a native iOS/Android app | **Native App Integration** |
| I need to understand the architecture | **Implementation Summary** |
| I see an error, how do I fix it? | **Quick Reference** → "Troubleshooting" |

## 🎓 Quick Learning Path

1. **Understand What It Does** (2 min)
   ```
   → Read the first section of Feature Guide
   ```

2. **See It In Action** (5 min)
   ```
   → Visit http://localhost:3000/notification-example
   → Try scheduling a reminder
   ```

3. **Use It In Your Page** (10 min)
   ```
   → Copy code snippet from Quick Reference
   → Add to your component
   → Test it
   ```

4. **Understand How It Works** (optional, 15 min)
   ```
   → Read Implementation Summary
   → Check components/notification-bell.tsx
   → Review lib/notifications.ts
   ```

## ✨ Cool Features You Can Build

### 1. Wellness Page Reminder
```tsx
"Taking your daily wellness check?"
<button>Remind me in 30 minutes</button>
```

### 2. Crisis Support Follow-Up
```tsx
"We're here for you. Want a gentle check-in later?"
<button>Yes, remind me in 1 hour</button>
```

### 3. Grounding Technique Reminder
```tsx
"Did grounding help? Set a reminder to use it again"
<button>Remind me tomorrow 3 PM</button>  {/* future feature */}
```

### 4. Journal Prompt
```tsx
"Haven't journaled today? Set a reminder"
<button>10 min from now</button>
```

## 🔐 Privacy & Security

- ✅ All data stored locally (no cloud)
- ✅ No tracking or analytics by default
- ✅ User controls via browser settings
- ✅ HTTPS required (automatically enforced)
- ✅ Open source - you can audit the code

## 📞 Support

**For questions:**
1. Check the Troubleshooting section above
2. Read the relevant documentation file
3. Check the code comments (well-documented)
4. Look at the example page at `/notification-example`

**For issues:**
1. Check browser console for errors
2. Verify notification permission settings
3. Try clearing localStorage and cache
4. Hard refresh the page

## 🎉 You're Done!

The notification feature is ready to use. Just:

1. ✅ Visit any app page - see the bell icon
2. ✅ Click it to set a reminder
3. ✅ Get notified at the right time
4. ✅ Click notification to check in

**Next Steps**:
- [ ] Test the feature yourself
- [ ] Review the example page
- [ ] Add reminders to pages where they make sense
- [ ] Show it to your team

---

**Questions?** See [NOTIFICATION_QUICK_REFERENCE.md](./NOTIFICATION_QUICK_REFERENCE.md) or the relevant documentation file above.

**Ready to customize?** See [NOTIFICATION_FEATURE_GUIDE.md](./NOTIFICATION_FEATURE_GUIDE.md) → Customization section.

**Building a native app?** See [NATIVE_APP_INTEGRATION.md](./NATIVE_APP_INTEGRATION.md).
