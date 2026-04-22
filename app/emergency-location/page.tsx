"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"

type LocationDetails = {
  nearestStreet: string
  city: string
  state: string
  country: string
}

function EmergencyLocationContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [shared, setShared] = useState(false)
  const [trustedContact, setTrustedContact] = useState(CONFIG.TRUSTED_CONTACT_NUMBER)
  const [shareStatus, setShareStatus] = useState<"idle" | "sms-draft" | "share-sheet" | "copied">("idle")
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const lookupLocationDetails = async (lat: number, lng: number) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
      )
      if (!response.ok) {
        throw new Error("Reverse geocoding failed")
      }

      const data = await response.json()
      const address = data?.address ?? {}
      const city = address.city || address.town || address.village || address.hamlet || ""
      const state = address.state || ""
      const country = address.country || ""
      const nearestStreet = address.road || address.pedestrian || address.cycleway || address.footway || ""

      if (city || state || country || nearestStreet) {
        setLocationDetails({
          nearestStreet,
          city,
          state,
          country,
        })
      } else {
        setLocationDetails(null)
      }
    } catch {
      setLocationDetails(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedContact = window.localStorage.getItem("trusted_contact_number")
    if (savedContact) {
      setTrustedContact(savedContact)
    }
  }, [])

  const getLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          void lookupLocationDetails(lat, lng)
          setLoading(false)
        },
        () => {
          setLoading(false)
          alert("Unable to access location. Please enable location services.")
        },
      )
    }
  }

  const saveTrustedContact = () => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("trusted_contact_number", trustedContact.trim())
  }

  const shareLocation = async () => {
    if (!location) return

    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`
    const lines = [
      "I need help.",
      `Precise coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      locationDetails?.city ? `City: ${locationDetails.city}` : "",
      locationDetails?.state ? `State/Province: ${locationDetails.state}` : "",
      locationDetails?.country ? `Country: ${locationDetails.country}` : "",
      locationDetails?.nearestStreet ? `Nearest street: ${locationDetails.nearestStreet}` : "",
      `Live location link: ${mapsUrl}`,
    ].filter(Boolean)
    const message = lines.join("\n")

    if (trustedContact.trim()) {
      const encodedMessage = encodeURIComponent(message)
      window.location.href = `sms:${trustedContact.trim()}?&body=${encodedMessage}`
      setShared(true)
      setShareStatus("sms-draft")
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Emergency location",
          text: message,
          url: mapsUrl,
        })
        setShared(true)
        setShareStatus("share-sheet")
        return
      } catch {
        // fall through to clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(message)
      setShared(true)
      setShareStatus("copied")
      alert("Location message copied. Paste it into a text or call emergency services now.")
    } catch {
      alert("Unable to share automatically. Please call 911 or 988 now.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t.emergencyLocation}</h2>
          <p className="text-gray-600">Share your location link with a trusted contact or emergency responder.</p>
        </div>

        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Emergency Use Only</h3>
            <p className="text-sm text-red-800">
              This opens an SMS draft or share sheet with your location link. This app does not directly dispatch emergency services.
            </p>
          </div>
        </div>

        {!location && !shared && (
          <Button
            onClick={getLocation}
            disabled={loading}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl"
          >
            {loading ? "Getting Location..." : "Get My Location"}
          </Button>
        )}

        {location && !shared && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">Your Location</h3>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm text-gray-700">
                <div>Latitude: {location.lat.toFixed(6)}</div>
                <div>Longitude: {location.lng.toFixed(6)}</div>
                {detailsLoading && <div className="mt-2 font-sans text-gray-500">Looking up nearby address details...</div>}
                {!detailsLoading && locationDetails?.city && (
                  <div className="mt-2 font-sans">City: {locationDetails.city}</div>
                )}
                {!detailsLoading && locationDetails?.state && (
                  <div className="font-sans">State/Province: {locationDetails.state}</div>
                )}
                {!detailsLoading && locationDetails?.country && (
                  <div className="font-sans">Country: {locationDetails.country}</div>
                )}
                {!detailsLoading && locationDetails?.nearestStreet && (
                  <div className="font-sans">Nearest street: {locationDetails.nearestStreet}</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="font-bold text-gray-900">Trusted Contact (Optional)</h3>
              <p className="text-sm text-gray-600">Add a phone number to open a pre-filled SMS draft with your location link.</p>
              <input
                type="tel"
                value={trustedContact}
                onChange={(event) => setTrustedContact(event.target.value)}
                onBlur={saveTrustedContact}
                placeholder="e.g. 15551234567"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <Button
              onClick={shareLocation}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl"
            >
              Share Location Link
            </Button>
            <Button
              onClick={() => {
                if (!location) return
                window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`, "_blank", "noopener,noreferrer")
              }}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-semibold rounded-xl"
            >
              Open In Google Maps
            </Button>
          </div>
        )}

        {shared && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-bold text-green-900">Location Ready</h3>
            <p className="text-green-800">
              {shareStatus === "sms-draft"
                ? "SMS draft opened with your location link. Send it now and call 911 if needed."
                : shareStatus === "share-sheet"
                  ? "Share sheet opened and your location link was shared."
                  : "Location message copied. Paste it into a message and call 911 if needed."}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-bold text-gray-900">Other Emergency Options</h3>
          <Button
            onClick={() => (window.location.href = "tel:911")}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
          >
            Call 911
          </Button>
          <Button
            onClick={() => (window.location.href = `tel:${CONFIG.CRISIS_HOTLINE}`)}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
          >
            {`Call ${CONFIG.CRISIS_HOTLINE} (Crisis Line)`}
          </Button>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function EmergencyLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      }
    >
      <EmergencyLocationContent />
    </Suspense>
  )
}
