"use client"

import { useState } from "react"
import { BellRing, Settings2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

export function NotificationSettingsButton() {
  const {
    settings,
    loading,
    error,
    permission,
    pushSupported,
    pushSubscribed,
    pushConfigured,
    enablePush,
    disablePush,
    sendTestPush,
    updateDailyMotivation,
  } = useNotifications()
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const handlePushToggle = async (checked: boolean) => {
    if (checked) {
      await enablePush()
      return
    }

    await disablePush()
  }

  const handleDailyToggle = async (checked: boolean) => {
    try {
      await updateDailyMotivation(checked)
    } catch {
      // Provider already manages the error message
    }
  }

  const handleTest = async () => {
    const success = await sendTestPush()
    setTestMessage(success ? "Test push sent to this device." : "Unable to send a test push.")
    window.setTimeout(() => setTestMessage(null), 4000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-100"
          aria-label="Notification settings"
        >
          <Settings2 className="h-5 w-5 text-gray-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b bg-gray-50 px-6 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Notification Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Manage browser push alerts and daily in-app reminders for this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Background browser notifications</p>
                <p className="mt-1 text-sm text-gray-600">
                  Receive check-in reminders when Safe Space is not the active tab.
                </p>
              </div>
              <Switch
                checked={pushSubscribed}
                disabled={!pushSupported || !pushConfigured || loading}
                onCheckedChange={handlePushToggle}
                aria-label="Enable background browser notifications"
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {pushSupported
                ? pushConfigured
                  ? pushSubscribed
                    ? "Background push is enabled on this device."
                    : "Enable this to receive browser push notifications."
                  : "Server push keys are missing, so background push is not fully configured yet."
                : "This browser does not support push notifications."}
            </p>
            <p className="mt-1 text-xs text-gray-500">Browser permission: {permission}</p>
            {pushSubscribed && pushConfigured && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleTest}
                disabled={loading}
              >
                Send test push
              </Button>
            )}
            {testMessage && <p className="mt-2 text-xs text-emerald-700">{testMessage}</p>}
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Daily motivational check-in</p>
                <p className="mt-1 text-sm text-gray-600">
                  Send a random motivational reminder every day at 7:00 AM.
                </p>
              </div>
              <Switch
                checked={settings.dailyMotivationEnabled}
                disabled={loading}
                onCheckedChange={handleDailyToggle}
                aria-label="Enable daily motivational reminder"
              />
            </div>
            <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-800">
              Each day uses a different quote when possible, and the preference stays saved after reload.
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <BellRing className="h-4 w-4" />
              Current browser limitation
            </div>
            <p className="mt-2">
              Daily reminders and scheduled check-ins are fully reliable while the app or local scheduler is active.
              For production-grade delivery across closed browsers, restarts, or multiple devices, a durable backend
              scheduler or push service worker backend job is still required.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
