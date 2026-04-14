"use client"

import { useNotificationContext } from "@/components/notification-provider"

export function useNotifications() {
  return useNotificationContext()
}
