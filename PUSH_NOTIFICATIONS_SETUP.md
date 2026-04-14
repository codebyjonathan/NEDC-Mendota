# Push Notifications Implementation Guide

This guide explains how to set up push notifications for the Safe Space app using Firebase Cloud Messaging (FCM).

## Overview

Push notifications allow users to receive messages on their mobile devices even when the app is not actively running. This is crucial for mental health support reminders.

### How It Works

1. **User subscribes** → Device registers with push service
2. **Server stores subscription** → Saves endpoint + keys
3. **Server schedules notification** → Sets up timing
4. **At scheduled time** → Server sends push via FCM/APNs
5. **User receives notification** → Even if app is closed
6. **User clicks notification** → App opens and navigates to grounding/support page

## Setup Steps

### 1. Generate VAPID Keys

VAPID keys are required for Web Push Protocol. Generate them once:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Save the output:
```
Public Key: BXxxx...
Private Key: xxx...
Subject: mailto:your-email@example.com
```

### 2. Set Environment Variables

Create or update `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=safe-space-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=safe-space-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=safe-space-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=optional

# VAPID Keys for Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_from_above
VAPID_PRIVATE_KEY=your_private_key_from_above
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Firebase Project Setup

1. Go to [Firebase Console](https://firebase.google.com)
2. Create a new project or select existing
3. Get credentials from **Project Settings → Service Accounts**
4. Enable Cloud Messaging in Firebase Console
5. Copy config values to `.env.local`

### 4. Install Dependencies

```bash
npm install firebase
npm install web-push  # For server-side push sending
```

### 5. Web App Manifest

Make sure `public/manifest.json` exists and includes:

```json
{
  "name": "Safe Space",
  "short_name": "Safe Space",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 6. Metadata Tags

Update `app/layout.tsx` with:

```tsx
<meta name="theme-color" content="#10b981" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="manifest" href="/manifest.json" />
```

## Usage in App

### Subscribe to Push Notifications

```tsx
import { usePushNotifications } from "@/hooks/use-push-notifications"

export function NotificationSettings() {
  const { subscribed, subscribe, unsubscribe, loading } = usePushNotifications()

  const handleToggle = async () => {
    if (subscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  return (
    <button onClick={handleToggle} disabled={loading}>
      {subscribed ? "Disable Push" : "Enable Push"} Notifications
    </button>
  )
}
```

### Schedule a Push Notification

```tsx
const { schedule } = usePushNotifications()

// Schedule for 10 minutes from now
await schedule(10 * 60 * 1000, "Time to check in!", {
  body: "Let's take a moment to reflect and check in with yourself.",
  actionUrl: "/grounding",
})
```

### Send Test Notification

```tsx
const { sendTest } = usePushNotifications()

// Immediately send a test push to the current device
await sendTest()
```

## API Endpoints

### POST /api/push-notifications/subscribe
Subscribe device to push notifications

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "auth": "...",
      "p256dh": "..."
    }
  }
}
```

### POST /api/push-notifications/send-test
Send immediate test notification to current device

### POST /api/push-notifications/schedule
Schedule a push notification for later

```json
{
  "intervalMs": 300000,
  "title": "Time to check in!",
  "body": "Optional message",
  "actionUrl": "/grounding"
}
```

### POST /api/push-notifications/unsubscribe
Unsubscribe from push notifications

## Server-Side Push Sending (Next Steps)

To actually send push notifications from server, install `web-push`:

```bash
npm install web-push
```

Update API route:

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

async function sendPushNotification(subscription: any, payload: any) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (error) {
    console.error('Push failed:', error)
  }
}
```

## Troubleshooting

### Notifications not working?

1. **Check service worker** → Open DevTools → Application → Service Workers
2. **Check permissions** → Site needs to grant notification permissions
3. **Check VAPID keys** → Make sure configured correctly
4. **Check Firebase** → Verify project has Cloud Messaging enabled
5. **Check browser support** → Not all browsers support all features

### iOS Limitations

- iOS Safari has limited push notification support
- Consider native app wrapper for full iOS support
- Web app can still use local notifications when app is open

### Android Limitations

- Service workers must be registered from HTTPS
- Some devices can aggressively kill service workers

## Browser Support

| Browser | Push Notifications | Status |
|---------|-------------------|--------|
| Chrome  | ✅ Full support    | Production ready |
| Firefox | ✅ Full support    | Production ready |
| Edge    | ✅ Full support    | Production ready |
| Safari  | ⚠️ Limited support | Use native app for best experience |
| Opera   | ✅ Full support    | Production ready |

## Security Notes

- VAPID keys identify your app to push services
- Private key should never be exposed to client
- Always validate origins before sending notifications
- Use HTTPS in production

## Next Steps

1. Set up Firebase project
2. Generate VAPID keys
3. Configure environment variables
4. Test with test notifications
5. Integrate into notification bell UI
6. Monitor delivery in Firebase Console
7. Set up analytics tracking for engagement

## References

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-protocol)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push Library](https://www.npmjs.com/package/web-push)
