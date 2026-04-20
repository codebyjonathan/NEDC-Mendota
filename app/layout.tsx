import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppThemeProvider } from "@/components/app-theme-provider"
import { NotificationProvider } from "@/components/notification-provider"
import { RouteTransitionProvider } from "@/components/route-transition-provider"
import { RouteTransitionShell } from "@/components/route-transition-shell"
import { ScrollSmoothnessEnhancer } from "@/components/scroll-smoothness-enhancer"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Safe Space",
  description: "A multilingual suicide prevention and mental health support app. You are not alone.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Safe Space",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Safe Space" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppThemeProvider>
            <NotificationProvider>
              <RouteTransitionProvider />
              <ScrollSmoothnessEnhancer />
              <RouteTransitionShell>{children}</RouteTransitionShell>
            </NotificationProvider>
          </AppThemeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
