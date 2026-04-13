/**
 * Native App Bridge Integration Guide
 * 
 * This file provides examples for integrating Safe Space notifications
 * with native iOS and Android applications
 */

# Native App Notification Bridge Integration

## Overview

The Safe Space app supports three deployment scenarios:

1. **Web App** - Standard browser-based PWA
2. **WebView Deployment** - Native app with embedded web view
3. **Hybrid App** - Native app with bridge communication

This guide covers scenario #3, with examples for #2.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Safe Space Web App                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Components (React, Next.js)                           │   │
│  │ - NotificationBell                                    │   │
│  │ - useNotifications Hook                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Service Layer (lib/notifications.ts)                  │   │
│  │ - sendCrossPlatformNotification()                     │   │
│  │ - Detects native bridge                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Platform Detection & Bridge                           │   │
│  │ window.__native_bridge available?                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ├──→ Web API (Notification)         ├──→ Native Bridge
         │    (Service Worker)               │    (WebView<->Native)
         │                                    │
    ┌────────┐                           ┌────────┐
    │ Node.js│ Service Worker            │ iOS   │
    │ Store  │ Background Tasks          │Android│
    └────────┘                           └────────┘
```

## JavaScript Bridge API

### The Native Bridge Interface

On the web side, detect and use the native bridge:

```typescript
// Check if app is running in native context
const isNativeApp = (window as any).__native_bridge !== undefined

interface NativeBridge {
  scheduleNotification(config: NotificationConfig): void
  cancelNotification(id: string): void
  onNotificationClick(callback: (data: NotificationData) => void): void
  requestPermission(): Promise<boolean>
  getPermissionStatus(): 'granted' | 'denied' | 'default'
}

interface NotificationConfig {
  id: string
  title: string
  body: string
  delay: number // milliseconds from now
  actionUrl?: string
  icon?: string
  badge?: string
  sound?: boolean
  vibrate?: boolean[] // vibration pattern
}

interface NotificationData {
  notificationId: string
  title: string
  actionUrl: string
}
```

### Usage Example

```typescript
import { sendCrossPlatformNotification } from "@/lib/notifications"

// This function automatically detects platform and uses appropriate API
const notificationId = await sendCrossPlatformNotification(
  5 * 60 * 1000, // 5 minutes in milliseconds
  {
    title: "Time to check in!",
    body: "Let's reflect together",
    actionUrl: "/grounding"
  }
)
```

## iOS Implementation

### Swift Bridge Code

```swift
import Foundation
import UserNotifications

class WebViewNotificationBridge: NSObject {
    weak var webView: WKWebView?
    
    func setupBridge(in webView: WKWebView) {
        self.webView = webView
        
        // Create notification bridge object
        let scriptSource = """
        window.__native_bridge = {
            scheduleNotification: function(config) {
                webkit.messageHandlers.notificationHandler.postMessage(config)
            },
            requestPermission: function() {
                webkit.messageHandlers.requestNotificationPermission.postMessage({})
                return Promise.resolve(true)
            },
            getPermissionStatus: function() {
                webkit.messageHandlers.getPermissionStatus.postMessage({})
            }
        }
        """
        
        let userScript = WKUserScript(
            source: scriptSource,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        
        webView.configuration.userContentController.addUserScript(userScript)
        
        // Setup message handlers
        webView.configuration.userContentController.add(
            self,
            name: "notificationHandler"
        )
        webView.configuration.userContentController.add(
            self,
            name: "requestNotificationPermission"
        )
        webView.configuration.userContentController.add(
            self,
            name: "getPermissionStatus"
        )
    }
}

// Implement WKScriptMessageHandler
extension WebViewNotificationBridge: WKScriptMessageHandler {
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        switch message.name {
        case "notificationHandler":
            if let config = message.body as? [String: Any] {
                scheduleNotification(from: config)
            }
        case "requestNotificationPermission":
            requestUserNotificationPermission()
        case "getPermissionStatus":
            getPermissionStatus()
        default:
            break
        }
    }
    
    private func scheduleNotification(from config: [String: Any]) {
        guard let id = config["id"] as? String,
              let title = config["title"] as? String,
              let body = config["body"] as? String,
              let delay = config["delay"] as? NSNumber else {
            return
        }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        // Add custom data for routing
        if let actionUrl = config["actionUrl"] as? String {
            content.userInfo["actionUrl"] = actionUrl
        }
        content.userInfo["notificationId"] = id
        
        // Schedule notification
        let triggerTimeInterval = TimeInterval(delay.doubleValue / 1000.0)
        let trigger = UNTimeIntervalNotificationTrigger(
            timeInterval: triggerTimeInterval,
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: id,
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification: \(error)")
            } else {
                print("Notification scheduled: \(id)")
            }
        }
    }
    
    private func requestUserNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, error in
            if let error = error {
                print("Authorization error: \(error)")
            } else if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }
    
    private func getPermissionStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let status: String
            switch settings.authorizationStatus {
            case .authorized, .provisional, .ephemeral:
                status = "granted"
            case .denied:
                status = "denied"
            case .notDetermined:
                status = "default"
            @unknown default:
                status = "default"
            }
            
            DispatchQueue.main.async {
                self.webView?.evaluateJavaScript(
                    "window.__notificationPermissionStatus = '\(status)'"
                )
            }
        }
    }
}

// Handle notification taps
extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        
        if let actionUrl = userInfo["actionUrl"] as? String {
            // Navigate to the action URL in the web view
            let script = "window.location.href = '\(actionUrl)'"
            // Execute on main web view
        }
        
        completionHandler()
    }
}
```

## Android Implementation

### Kotlin Bridge Code

```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.webkit.WebViewAssetLoader
import android.webkit.WebView
import android.webkit.JavascriptInterface
import java.util.*

class NotificationBridge(val context: Context) {
    private val notificationManager = 
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    
    fun setupBridge(webView: WebView) {
        webView.addJavascriptInterface(this, "android")
        
        // Create notification channel for Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel()
        }
        
        // Inject bridge script
        val bridgeScript = """
        window.__native_bridge = {
            scheduleNotification: function(config) {
                android.scheduleNotification(
                    config.id,
                    config.title,
                    config.body,
                    config.delay,
                    config.actionUrl || '/grounding'
                )
            },
            requestPermission: function() {
                return Promise.resolve(android.requestNotificationPermission())
            },
            getPermissionStatus: function() {
                return android.getPermissionStatus()
            }
        }
        """.trimIndent()
        
        webView.evaluateJavascript(bridgeScript, null)
    }
    
    @JavascriptInterface
    fun scheduleNotification(
        id: String,
        title: String,
        body: String,
        delay: Long,
        actionUrl: String
    ) {
        val timer = Timer()
        timer.schedule(object : TimerTask() {
            override fun run() {
                showNotification(id, title, body, actionUrl)
            }
        }, delay)
    }
    
    @JavascriptInterface
    fun requestNotificationPermission(): Boolean {
        // Android 13+ requires runtime permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Request POST_NOTIFICATIONS permission
            return true
        }
        return true
    }
    
    @JavascriptInterface
    fun getPermissionStatus(): String {
        // Check Android notification permission
        return "granted"
    }
    
    private fun showNotification(
        id: String,
        title: String,
        body: String,
        actionUrl: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("action_url", actionUrl)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, "CHECK_IN_CHANNEL")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        
        notificationManager.notify(id.hashCode(), notification)
    }
    
    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            "CHECK_IN_CHANNEL",
            "Check-in Reminders",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Reminders to check in with yourself"
            enableVibration(true)
        }
        notificationManager.createNotificationChannel(channel)
    }
}

// In MainActivity
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
            }
            webChromeClient = WebChromeClient()
            webViewClient = WebViewClient()
        }
        
        val bridge = NotificationBridge(this)
        bridge.setupBridge(webView)
        
        setContentView(webView)
        webView.loadUrl("https://your-domain.com")
    }
}
```

## Web/PWA Fallback

If native bridge is not available, the app automatically falls back to web APIs:

```typescript
// Automatic fallback in sendCrossPlatformNotification()
export async function sendCrossPlatformNotification(...) {
  const isNativeApp = (window as any).__native_bridge !== undefined
  
  if (isNativeApp) {
    // Use native bridge
    return (window as any).__native_bridge.scheduleNotification({...})
  } else {
    // Use web Notification API
    return scheduleNotification(interval, title, options)
  }
}
```

## Testing Native Integration

### iOS Testing Checklist
- [ ] Bridge object available in console: `window.__native_bridge`
- [ ] Schedule notification from JS console
- [ ] Notification appears at correct time
- [ ] Tapping notification navigates to correct URL
- [ ] Permission request dialog appears

### Android Testing Checklist
- [ ] Bridge object available: `android.scheduleNotification(...)`
- [ ] Notifications appear in notification tray
- [ ] Tapping navigates to correct URL
- [ ] Multiple notifications queue correctly
- [ ] App can be killed and notification still works

### Debugging
```javascript
// Check if bridge is available
console.log(window.__native_bridge)

// Manually trigger test notification
window.__native_bridge?.scheduleNotification({
  id: 'test_' + Date.now(),
  title: 'Test Notification',
  body: 'This is a test',
  delay: 5000,
  actionUrl: '/grounding'
})
```

## Cross-Platform Test Matrix

| Feature | Web | iOS PWA | Android PWA | iOS App | Android App |
|---------|-----|---------|-------------|---------|------------|
| Web Notifications | ✅ | ⚠️ | ✅ | ❌ | ❌ |
| Service Worker | ✅ | ✅ | ✅ | ❌ | ❌ |
| Native Bridge | ❌ | ❌ | ❌ | ✅ | ✅ |
| Background Notification | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Click Tracking | ✅ | ✅ | ✅ | ✅ | ✅ |
| History | ✅ | ✅ | ✅ | ✅ | ✅ |

## Deployment Guide

### 1. Web/PWA
- Deploy as-is in Next.js production
- Service worker automatically registers
- No additional backend needed

### 2. iOS App with WebView
- Import NotificationBridge.swift
- Call `bridge.setupBridge(in: webView)` in AppDelegate
- Handle notification taps in `UNUserNotificationCenterDelegate`

### 3. Android App with WebView
- Import NotificationBridge.kt
- Call `bridge.setupBridge(webView)` in MainActivity
- Handle intent extras for routing

## Limitations & Workarounds

| Issue | Web | Native |
|-------|-----|--------|
| Background notifications | SW required | ✅ Native |
| App killed | ❌ | ✅ Native |
| Multi-app state sync | ❌ | Possible |
| Analytics | Client-side | Backend logging |

## Security Considerations

1. **Verify URLs** - Always validate `actionUrl` before navigation
2. **Sanitize Data** - Clean notification config from JS before using
3. **Permission Checks** - Re-verify permission before sending
4. **HTTPS Only** - Service worker requires secure context
5. **CSP Headers** - Configure Content Security Policy for WebView

## Recommended Enhancements

1. **Server-Side Scheduling**
   - More reliable long-term scheduling
   - Enable push notifications
   - Better analytics

2. **Rich Notifications**
   - Custom UI in notification
   - Action buttons
   - Media attachments

3. **Sync Across Devices**
   - Cloud-based notification history
   - Cross-device reminders
   - Unified state

4. **Advanced Features**
   - Geofence-based reminders
   - Pattern-based recurring notifications
   - Smart scheduling (avoid quiet hours)

---

For questions or implementation support, refer to the main [NOTIFICATION_FEATURE_GUIDE.md](./NOTIFICATION_FEATURE_GUIDE.md)
