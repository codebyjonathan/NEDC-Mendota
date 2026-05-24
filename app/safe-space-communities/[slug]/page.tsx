"use client"

import { useSearchParams, useParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"
import type { Language } from "@/lib/translations"
import {
  getCommunityById,
  getLocalizedCommunityContent,
  EMOTIONAL_REACTIONS,
  generateAnonymousUsername,
} from "@/lib/safe-space/utils"
import { AlertCircle, X, Flag, MessageCircle, Eye, EyeOff } from "lucide-react"
import { moderateContent } from "@/lib/safe-space/moderation"
import {
  getCommunityBanRemainingMs,
  getCommunityBanDurationMsForBanNumber,
  getCommunityBanState,
  isCommunityBanActive,
  setCommunityBanCount,
  setCommunityBanUntil,
  setCommunityStrikes,
} from "@/lib/safe-space/community-ban"

type CommunityReply = {
  id: string
  author: string
  authorId?: string
  content: string
  timestamp: string
}

type CommunityPost = {
  id: string
  author: string
  authorId?: string
  content: string
  timestamp: string
  reactions: Record<string, number>
  replies: CommunityReply[]
  createdByUser?: boolean
}

type ReportEntry = {
  reason: string
  reportedBy: string
  createdAt: string
  postId: string
  communityId: string
}

function mergeReplies(base: CommunityReply[], incoming: CommunityReply[]): CommunityReply[] {
  const byId = new Map<string, CommunityReply>()
  base.forEach((reply) => byId.set(reply.id, reply))
  incoming.forEach((reply) => {
    const prev = byId.get(reply.id)
    byId.set(reply.id, prev ? { ...prev, ...reply } : reply)
  })
  return Array.from(byId.values())
}

function mergePosts(base: CommunityPost[], incoming: CommunityPost[]): CommunityPost[] {
  const byId = new Map<string, CommunityPost>()
  base.forEach((post) => byId.set(post.id, post))
  incoming.forEach((post) => {
    const prev = byId.get(post.id)
    if (!prev) {
      byId.set(post.id, post)
      return
    }
    byId.set(post.id, {
      ...prev,
      ...post,
      reactions: { ...prev.reactions, ...post.reactions },
      replies: mergeReplies(prev.replies || [], post.replies || []),
    })
  })
  return Array.from(byId.values())
}

function getStringArrayFromStorage(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
  } catch {
    return []
  }
}

function writeStringArrayToStorage(key: string, values: string[]) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))))
}

function CommunityContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const langParam = searchParams.get("lang") || "en"
  const communitySlug = params?.slug as string

  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as Language
  const t = translations[lang]
  const isRTL = lang === "ar"

  const community = getCommunityById(communitySlug || "")
  const localizedCommunity = community ? getLocalizedCommunityContent(community.id, lang) : null
  const [newPost, setNewPost] = useState("")
  const [showPostForm, setShowPostForm] = useState(false)
  const [moderationWarning, setModerationWarning] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [userReactions, setUserReactions] = useState<Record<string, string>>({})
  const [openReplyPostId, setOpenReplyPostId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replyWarnings, setReplyWarnings] = useState<Record<string, string>>({})
  const [postingReplyFor, setPostingReplyFor] = useState<string | null>(null)
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reports, setReports] = useState<Record<string, ReportEntry[]>>({})
  const [hiddenReplies, setHiddenReplies] = useState<Record<string, boolean>>({})
  const [hiddenPosts, setHiddenPosts] = useState<Record<string, boolean>>({})
  const [reportSuccessForPostId, setReportSuccessForPostId] = useState<string | null>(null)
  const [hydratedFromStorage, setHydratedFromStorage] = useState(false)
  const [currentAnonymousName, setCurrentAnonymousName] = useState("AnonymousUser")
  const [currentAnonymousId, setCurrentAnonymousId] = useState("")
  const [strikeCount, setStrikeCount] = useState(0)
  const [bannedUntil, setBannedUntil] = useState<string | null>(null)
  const [banCount, setBanCount] = useState(0)
  const [strikeOverlayMessage, setStrikeOverlayMessage] = useState<string | null>(null)
  const [guidelinesChecked, setGuidelinesChecked] = useState(false)

  const backLabel = lang === "es" ? "Volver" : "Back"

  const storageKeys = useMemo(() => {
    const id = community?.id || "default"
    return {
      posts: `safe_space_community_posts_${id}`,
      deletedPosts: `safe_space_community_deleted_posts_${id}`,
      deletedReplies: `safe_space_community_deleted_replies_${id}`,
      reactions: `safe_space_community_reactions_${id}`,
      reports: `safe_space_community_reports_${id}`,
      identity: "safe_space_community_identity_v1",
      identityId: "safe_space_community_identity_id_v1",
    }
  }, [community?.id])

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem("safe_space_guidelines_accepted_v1") === "true"
      if (!accepted) {
        router.replace(`/safe-space-communities?lang=${lang}`)
        return
      }
    } catch {
      router.replace(`/safe-space-communities?lang=${lang}`)
      return
    }
    setGuidelinesChecked(true)
  }, [lang, router])

  useEffect(() => {
    try {
      const storedIdentity = window.localStorage.getItem(storageKeys.identity)
      const storedIdentityId = window.localStorage.getItem(storageKeys.identityId)
      if (storedIdentity) {
        setCurrentAnonymousName(storedIdentity)
      } else {
        const newIdentity = generateAnonymousUsername()
        window.localStorage.setItem(storageKeys.identity, newIdentity)
        setCurrentAnonymousName(newIdentity)
      }

      if (storedIdentityId) {
        setCurrentAnonymousId(storedIdentityId)
      } else {
        const newIdentityId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        window.localStorage.setItem(storageKeys.identityId, newIdentityId)
        setCurrentAnonymousId(newIdentityId)
      }
    } catch (error) {
      console.warn("Failed to restore anonymous identity", error)
    }
  }, [storageKeys.identity, storageKeys.identityId])

  useEffect(() => {
    if (!community) return
    const hydrate = async () => {
      try {
        let cachedPosts: CommunityPost[] = []
        const storedPosts = window.localStorage.getItem(storageKeys.posts)
        if (storedPosts) {
          cachedPosts = (JSON.parse(storedPosts) as CommunityPost[]) || []
        }
        const postsResponse = await fetch(`/api/safe-space/posts?communityId=${community.id}`)
        if (postsResponse.ok) {
          const data = await postsResponse.json()
          const serverPosts = (data.posts || []) as CommunityPost[]
          const deletedPostIds = new Set(getStringArrayFromStorage(storageKeys.deletedPosts))
          const deletedReplyIds = new Set(getStringArrayFromStorage(storageKeys.deletedReplies))

          const visibleServerPosts = serverPosts
            .filter((post) => !deletedPostIds.has(post.id))
            .map((post) => ({
              ...post,
              replies: (post.replies || []).filter((reply) => !deletedReplyIds.has(reply.id)),
            }))

          setPosts(visibleServerPosts)
        } else {
          setPosts(cachedPosts)
        }
      const storedReactions = window.localStorage.getItem(storageKeys.reactions)
      if (storedReactions) {
        const parsed = JSON.parse(storedReactions) as Record<string, string>
        setUserReactions(parsed || {})
      }
      const storedReports = window.localStorage.getItem(storageKeys.reports)
      if (storedReports) {
        const parsed = JSON.parse(storedReports) as Record<string, ReportEntry[] | string>
        const normalized: Record<string, ReportEntry[]> = {}
        Object.entries(parsed || {}).forEach(([postId, value]) => {
          if (Array.isArray(value)) {
            normalized[postId] = value
          } else if (typeof value === "string") {
            normalized[postId] = [
              { reason: value, reportedBy: "You", createdAt: new Date().toISOString(), postId, communityId: community.id },
            ]
          }
        })
        setReports(normalized)
      }
      const banState = getCommunityBanState()
      setStrikeCount(banState.strikes)
      setBannedUntil(banState.bannedUntil)
      setBanCount(banState.banCount)
      } catch (error) {
        console.warn("Failed to restore community state", error)
      } finally {
        setHydratedFromStorage(true)
      }
    }
    void hydrate()
  }, [community, storageKeys])

  useEffect(() => {
    if (!community) return
    const intervalId = window.setInterval(async () => {
      try {
        const postsResponse = await fetch(`/api/safe-space/posts?communityId=${community.id}`)
        if (!postsResponse.ok) return
        const data = await postsResponse.json()
        const serverPosts = (data.posts || []) as CommunityPost[]
        const deletedPostIds = new Set(getStringArrayFromStorage(storageKeys.deletedPosts))
        const deletedReplyIds = new Set(getStringArrayFromStorage(storageKeys.deletedReplies))
        const visibleServerPosts = serverPosts
          .filter((post) => !deletedPostIds.has(post.id))
          .map((post) => ({
            ...post,
            replies: (post.replies || []).filter((reply) => !deletedReplyIds.has(reply.id)),
          }))
        setPosts(visibleServerPosts)
      } catch {
        // no-op
      }
    }, 8000)

    return () => window.clearInterval(intervalId)
  }, [community, storageKeys.deletedPosts, storageKeys.deletedReplies])

  useEffect(() => {
    if (!community || !hydratedFromStorage) return
    window.localStorage.setItem(storageKeys.reactions, JSON.stringify(userReactions))
  }, [userReactions, community, storageKeys, hydratedFromStorage])

  useEffect(() => {
    if (!community || !hydratedFromStorage) return
    window.localStorage.setItem(storageKeys.reports, JSON.stringify(reports))
  }, [reports, community, storageKeys, hydratedFromStorage])

  useEffect(() => {
    if (!community || !hydratedFromStorage) return
    window.localStorage.setItem(storageKeys.posts, JSON.stringify(posts))
  }, [posts, community, storageKeys, hydratedFromStorage])

  useEffect(() => {
    if (!hydratedFromStorage) return
    if (!isCommunityBanActive(bannedUntil)) return
    router.replace(`/main?lang=${lang}`)
  }, [bannedUntil, hydratedFromStorage, lang, router])

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Community not found</p>
        </div>
      </div>
    )
  }

  const isBanned = isCommunityBanActive(bannedUntil)

  const ensureAnonymousId = () => {
    if (currentAnonymousId) return currentAnonymousId
    const fallbackId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    setCurrentAnonymousId(fallbackId)
    try {
      window.localStorage.setItem(storageKeys.identityId, fallbackId)
    } catch (error) {
      console.warn("Failed to persist anonymous identity id", error)
    }
    return fallbackId
  }

  const clearLocalCommunityActivity = () => {
    try {
      window.localStorage.removeItem(storageKeys.reactions)
      window.localStorage.removeItem(storageKeys.reports)
      window.localStorage.removeItem(storageKeys.posts)
      window.localStorage.removeItem(storageKeys.deletedPosts)
      window.localStorage.removeItem(storageKeys.deletedReplies)
    } catch (error) {
      console.warn("Failed to clear local community activity", error)
    }
    setPosts([])
    setUserReactions({})
    setReports({})
    setReplyDrafts({})
    setReplyWarnings({})
  }

  const registerViolation = (reason: string) => {
    const nextStrikeCount = strikeCount + 1
    setStrikeCount(nextStrikeCount)
    setCommunityStrikes(nextStrikeCount)

    if (nextStrikeCount >= 3) {
      const nextBanCount = banCount + 1
      const durationMs = getCommunityBanDurationMsForBanNumber(nextBanCount)
      const until = new Date(Date.now() + durationMs).toISOString()
      setBannedUntil(until)
      setCommunityBanUntil(until)
      setBanCount(nextBanCount)
      setCommunityBanCount(nextBanCount)
      setStrikeCount(2)
      setCommunityStrikes(2)
      clearLocalCommunityActivity()
      setStrikeOverlayMessage(`You reached 3 strikes. You are temporarily banned from Communities.`)
      setTimeout(() => {
        router.replace(`/main?lang=${lang}`)
      }, 900)
      return
    }

    setStrikeOverlayMessage(`Community rules violation detected: ${reason}. Strike ${nextStrikeCount}/3.`)
  }

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return
    if (isBanned) {
      const remainingMs = getCommunityBanRemainingMs(bannedUntil)
      const remainingSec = Math.ceil(remainingMs / 1000)
      setStrikeOverlayMessage(
        `You're currently banned due to going against Community Guidelines for ${remainingSec} more seconds.`,
      )
      return
    }

    setIsPosting(true)
    setModerationWarning(null)

    try {
      const moderationResult = await moderateContent(newPost, community.id, "user_anonymous_id")

      if (moderationResult.recommended_action === "block") {
        setModerationWarning("This content contains harmful language and cannot be posted.")
        registerViolation("Blocked content")
        setIsPosting(false)
        return
      }

      if (moderationResult.recommended_action === "escalate") {
        setModerationWarning(
          "Your post contains crisis language. Would you like to speak with a counselor instead?",
        )
        registerViolation("Crisis-risk content")
        setIsPosting(false)
        return
      }

      if (moderationResult.recommended_action === "rewrite") {
        setModerationWarning("Your post violates community rules and must be rewritten before submitting.")
        registerViolation("Needs rewrite")
        setIsPosting(false)
        return
      }

      const authorId = ensureAnonymousId()
      const response = await fetch("/api/safe-space/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_post",
          communityId: community.id,
          lang,
          author: currentAnonymousName,
          authorId,
          content: newPost.trim(),
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        setModerationWarning(payload?.error || "Unable to submit post right now. Please try again.")
        setIsPosting(false)
        return
      }
      const data = await response.json()
      setPosts((data.posts || []) as CommunityPost[])
      setNewPost("")
      setShowPostForm(false)
      setIsPosting(false)
    } catch {
      setModerationWarning("Unable to submit post right now. Please try again.")
      setIsPosting(false)
    }
  }

  const toggleReaction = (postId: string, reactionType: string) => {
    const key = `${postId}_${reactionType}`
    const hasReaction = Boolean(userReactions[key])

    setUserReactions((prev) => {
      const next = { ...prev }
      if (hasReaction) {
        delete next[key]
      } else {
        next[key] = reactionType
      }
      return next
    })

    fetch("/api/safe-space/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_reaction",
        communityId: community.id,
        postId,
        reactionType,
        userKey: currentAnonymousName,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.posts) setPosts(data.posts as CommunityPost[])
      })
      .catch(() => undefined)
  }

  const handleReplySubmit = async (postId: string) => {
    if (postingReplyFor === postId) return
    const draft = (replyDrafts[postId] || "").trim()
    if (!draft) return
    if (isBanned) {
      const remainingMs = getCommunityBanRemainingMs(bannedUntil)
      const remainingSec = Math.ceil(remainingMs / 1000)
      setStrikeOverlayMessage(
        `You're currently banned due to going against Community Guidelines for ${remainingSec} more seconds.`,
      )
      return
    }

    setPostingReplyFor(postId)
    setReplyWarnings((prev) => ({ ...prev, [postId]: "" }))

    const moderationResult = await moderateContent(draft, community.id, "user_anonymous_id")

    if (moderationResult.recommended_action === "block") {
      setReplyWarnings((prev) => ({
        ...prev,
        [postId]: "This reply contains harmful language and cannot be posted.",
      }))
      registerViolation("Blocked reply content")
      setPostingReplyFor(null)
      return
    }

    if (moderationResult.recommended_action === "escalate") {
      setReplyWarnings((prev) => ({
        ...prev,
        [postId]: "Your reply contains crisis language. Consider reaching out to a counselor.",
      }))
      registerViolation("Crisis-risk reply content")
      setPostingReplyFor(null)
      return
    }

    if (moderationResult.recommended_action === "rewrite") {
      setReplyWarnings((prev) => ({
        ...prev,
        [postId]: "Your reply violates community rules and must be rewritten before submitting.",
      }))
      registerViolation("Reply needs rewrite")
      setPostingReplyFor(null)
      return
    }

    try {
      const authorId = ensureAnonymousId()
      const response = await fetch("/api/safe-space/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_reply",
        communityId: community.id,
        postId,
        author: currentAnonymousName,
        authorId,
        content: draft,
      }),
    })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        setReplyWarnings((prev) => ({
          ...prev,
          [postId]: payload?.error || "Unable to submit reply right now. Please try again.",
        }))
        setPostingReplyFor(null)
        return
      }
      const data = await response.json()
      setPosts((data.posts || []) as CommunityPost[])
      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }))
      setOpenReplyPostId(postId)
      setPostingReplyFor(null)
    } catch {
      setReplyWarnings((prev) => ({
        ...prev,
        [postId]: "Unable to submit reply right now. Please try again.",
      }))
      setPostingReplyFor(null)
    }
  }

  const openReportComposer = (postId: string) => {
    setReportingPostId(postId)
    setReportReason("")
    setReportSuccessForPostId(null)
  }

  const submitReport = async (postId: string) => {
    const trimmed = reportReason.trim()
    if (!trimmed) return
    const newEntry: ReportEntry = {
      postId,
      communityId: community.id,
      reason: trimmed,
      reportedBy: currentAnonymousName,
      createdAt: new Date().toISOString(),
    }
    try {
      await fetch("/api/safe-space/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      })
    } catch (error) {
      console.warn("Failed to send report to server logs", error)
    }
    setReports((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newEntry],
    }))
    setReportingPostId(null)
    setReportReason("")
    setReportSuccessForPostId(postId)
  }

  const deletePost = async (postId: string) => {
    const userId = ensureAnonymousId()
    const response = await fetch("/api/safe-space/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_post",
        communityId: community.id,
        postId,
        userId,
        userKey: currentAnonymousName,
      }),
    })
    if (response.ok) {
      const data = await response.json()
      setPosts((data.posts || []) as CommunityPost[])
      const deletedPostIds = getStringArrayFromStorage(storageKeys.deletedPosts)
      writeStringArrayToStorage(storageKeys.deletedPosts, [...deletedPostIds, postId])
    } else if (response.status === 404) {
      const postsResponse = await fetch(`/api/safe-space/posts?communityId=${community.id}`)
      if (postsResponse.ok) {
        const data = await postsResponse.json()
        setPosts((data.posts || []) as CommunityPost[])
      }
    }
    setOpenReplyPostId((prev) => (prev === postId ? null : prev))
    setReplyDrafts((prev) => {
      const next = { ...prev }
      delete next[postId]
      return next
    })
  }

  const deleteReply = async (postId: string, replyId: string) => {
    const userId = ensureAnonymousId()
    const response = await fetch("/api/safe-space/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_reply",
        communityId: community.id,
        postId,
        replyId,
        userId,
        userKey: currentAnonymousName,
      }),
    })
    if (response.ok) {
      const data = await response.json()
      setPosts((data.posts || []) as CommunityPost[])
      const deletedReplyIds = getStringArrayFromStorage(storageKeys.deletedReplies)
      writeStringArrayToStorage(storageKeys.deletedReplies, [...deletedReplyIds, replyId])
    } else if (response.status === 404) {
      const postsResponse = await fetch(`/api/safe-space/posts?communityId=${community.id}`)
      if (postsResponse.ok) {
        const data = await postsResponse.json()
        setPosts((data.posts || []) as CommunityPost[])
      }
    }
  }

  if (!guidelinesChecked) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader
        title={localizedCommunity?.name || community.name}
        subtitle={localizedCommunity?.description || community.description}
        backHref={`/safe-space-communities?lang=${lang}`}
        backLabel={backLabel}
        hideControlsOnMobile
      />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-5 py-8 space-y-6 pb-24">
        {strikeCount > 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Current strikes: {strikeCount}/3
          </div>
        )}

        <div className={`rounded-3xl p-6 shadow-md border-2 ${community.borderColor} ${community.color}`}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">{community.icon}</div>
            <div className="flex-1">
              <h2 className={`font-display text-xl font-bold ${community.accentColor} mb-1`}>
                {localizedCommunity?.name || community.name}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{localizedCommunity?.description || community.description}</p>
            </div>
          </div>
        </div>

        {!showPostForm && (
          <Button
            onClick={() => setShowPostForm(true)}
            className={`w-full h-16 rounded-3xl font-display font-semibold text-lg ${community.buttonColor} text-white`}
          >
            {t.createPost}
          </Button>
        )}

        {showPostForm && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-teal-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-gray-900">{t.createPost}</h3>
              <button onClick={() => setShowPostForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={t.postPlaceholder}
              className="w-full p-4 rounded-2xl border border-gray-300 focus:border-teal-500 focus:outline-none resize-none text-gray-900 placeholder-gray-500"
              rows={4}
            />

            {moderationWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">{t.warning}</p>
                  <p className="text-sm text-amber-800 mt-1">{moderationWarning}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPostForm(false)}
                variant="outline"
                className="flex-1 rounded-2xl h-12 border-gray-300 text-gray-900 hover:bg-gray-100"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handlePostSubmit}
                disabled={!newPost.trim() || isPosting}
                className="flex-1 rounded-2xl h-12 bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-400"
              >
                {isPosting ? "..." : t.submit}
              </Button>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.noPostsYet}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                  <button onClick={() => openReportComposer(post.id)} className="text-gray-400 hover:text-red-500 transition">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {reportingPostId === post.id && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                    <p className="text-sm font-semibold text-amber-900">{t.reportReason}</p>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder={t.reportPlaceholder}
                      className="w-full p-3 rounded-xl border border-amber-300 focus:border-amber-500 focus:outline-none resize-none text-gray-900"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setReportingPostId(null)
                          setReportReason("")
                        }}
                        variant="outline"
                        className="h-9 rounded-xl"
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={() => submitReport(post.id)}
                        disabled={!reportReason.trim()}
                        className="h-9 rounded-xl bg-amber-600 text-white hover:bg-amber-500 disabled:bg-gray-400"
                      >
                        {t.report}
                      </Button>
                    </div>
                  </div>
                )}

                {!hiddenPosts[post.id] ? (
                  <p className="text-gray-800 leading-relaxed text-sm">{post.content}</p>
                ) : null}

                <div className="pt-1">
                  <button
                    onClick={() => setHiddenPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
                    title={hiddenPosts[post.id] ? "Show post content" : "Hide post content"}
                  >
                    {hiddenPosts[post.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {hiddenPosts[post.id] ? "Show post" : "Hide post"}
                  </button>
                </div>

                {hiddenPosts[post.id] ? (
                  <p className="text-sm text-gray-500 italic">Post hidden. Tap the eye to show.</p>
                ) : null}

                {reportSuccessForPostId === post.id ? (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-2">
                    Report successfully sent. Owner will take a look into the issue.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {EMOTIONAL_REACTIONS.map((reaction) => {
                    const count = post.reactions[reaction.type] || 0
                    const isUserReaction = userReactions[`${post.id}_${reaction.type}`]

                    return (
                      <button
                        key={reaction.type}
                        onClick={() => toggleReaction(post.id, reaction.type)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                          isUserReaction
                            ? "bg-teal-100 text-teal-700 border border-teal-300"
                            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                        }`}
                        title={reaction.description}
                      >
                        <span className="mr-1">{reaction.emoji}</span>
                        {reaction.label}
                        {count > 0 && <span className="ml-1 font-bold">{count}</span>}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => setOpenReplyPostId((prev) => (prev === post.id ? null : post.id))}
                    className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.replies.length} {t.replies}
                  </button>

                  {openReplyPostId === post.id && (
                    <div className="space-y-3">
                      {post.replies.length > 0 && (
                        <div className="space-y-2">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900">{reply.author}</p>
                                  <button
                                    onClick={() =>
                                      setHiddenReplies((prev) => ({ ...prev, [reply.id]: !prev[reply.id] }))
                                    }
                                    className="text-gray-500 hover:text-gray-700"
                                    title={hiddenReplies[reply.id] ? "Show reply" : "Hide reply"}
                                  >
                                    {hiddenReplies[reply.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500">{reply.timestamp}</p>
                              </div>
                              {hiddenReplies[reply.id] ? (
                                <p className="mt-1 text-sm text-gray-500 italic">Reply hidden. Tap the eye to show.</p>
                              ) : (
                                <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                              )}
                              {(reply.authorId && reply.authorId === currentAnonymousId) ||
                              (!reply.authorId && reply.author === currentAnonymousName) ? (
                                <div className="mt-2">
                                  <Button
                                    onClick={() => deleteReply(post.id, reply.id)}
                                    variant="outline"
                                    className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs"
                                  >
                                    Delete Reply
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        value={replyDrafts[post.id] || ""}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder={t.reply}
                        className="w-full p-3 rounded-2xl border border-gray-300 focus:border-teal-500 focus:outline-none resize-none text-gray-900 placeholder-gray-500"
                        rows={2}
                      />

                      {replyWarnings[post.id] ? (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2">
                          {replyWarnings[post.id]}
                        </p>
                      ) : null}

                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleReplySubmit(post.id)}
                          disabled={!((replyDrafts[post.id] || "").trim()) || postingReplyFor === post.id}
                          className="rounded-xl h-10 bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-400"
                        >
                          {postingReplyFor === post.id ? "..." : t.reply}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {(post.authorId && post.authorId === currentAnonymousId) ||
                (!post.authorId && post.author === currentAnonymousName) ? (
                  <div className="pt-1">
                    <Button
                      onClick={() => void deletePost(post.id)}
                      variant="outline"
                      className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete Post
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />

      {strikeOverlayMessage ? (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-red-700">Community Strike Alert</h3>
            <p className="text-sm text-gray-800 leading-relaxed">{strikeOverlayMessage}</p>
            <Button
              onClick={() => setStrikeOverlayMessage(null)}
              className="w-full h-11 rounded-2xl bg-red-600 text-white hover:bg-red-500"
            >
              I Understand
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-teal-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  )
}
