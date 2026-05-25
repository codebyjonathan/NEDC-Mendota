import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { tmpdir } from "os"
import { enforceRateLimit, readJsonObject, sanitizeTextInput } from "@/lib/server/api-security"

type Reply = { id: string; author: string; authorId?: string; content: string; timestamp: string }
type PostRecord = {
  id: string
  author: string
  authorId?: string
  content: string
  timestamp: string
  reactions: Record<string, number>
  reactionUsers: Record<string, string[]>
  replies: Reply[]
}

type StoreShape = Record<string, PostRecord[]>

const DEFAULT_LANG = "en"
const STORE_PATH =
  process.env.SAFE_SPACE_POSTS_STORE_PATH?.trim() ||
  (process.env.NODE_ENV === "production"
    ? path.join(tmpdir(), "safe-space-posts-store.json")
    : path.join(process.cwd(), "lib", "server", "safe-space-posts-store.json"))

function getThreadKey(communityId: string) {
  return communityId
}

function getLegacyThreadKeys(store: StoreShape, communityId: string) {
  const prefix = `${communityId}::`
  return Object.keys(store).filter((k) => k.startsWith(prefix))
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8")
    return (JSON.parse(raw) as StoreShape) || {}
  } catch {
    return {}
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store), "utf8")
}

function serialize(posts: PostRecord[]) {
  return posts.map((p) => ({
    id: p.id,
    author: p.author,
    content: p.content,
    timestamp: p.timestamp,
    reactions: p.reactions,
    replies: p.replies,
  }))
}

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, { key: "safe-space-posts:get", maxRequests: 90, windowMs: 60_000 })
  if (limited) return limited
  const communityId = sanitizeTextInput(request.nextUrl.searchParams.get("communityId"), { maxLen: 120 })
  if (!communityId.ok) return NextResponse.json({ error: "communityId is required" }, { status: 400 })

  const threadKey = getThreadKey(communityId.value)
  const store = await readStore()
  const primaryPosts = store[threadKey] || []
  if (primaryPosts.length > 0) {
    return NextResponse.json({ posts: serialize(primaryPosts) })
  }

  const legacyPosts = getLegacyThreadKeys(store, communityId.value).flatMap((key) => store[key] || [])
  if (legacyPosts.length === 0) {
    return NextResponse.json({ posts: [] })
  }

  const deduped = new Map<string, PostRecord>()
  legacyPosts.forEach((post) => {
    deduped.set(post.id, post)
  })
  const migrated = Array.from(deduped.values())
  store[threadKey] = migrated
  await writeStore(store)
  return NextResponse.json({ posts: serialize(migrated) })
}

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, { key: "safe-space-posts:post", maxRequests: 40, windowMs: 60_000 })
    if (limited) return limited
    const body = await readJsonObject(request)
    const { action, communityId } = body || {}
    const actionValue = sanitizeTextInput(action, { maxLen: 40 })
    const communityIdValue = sanitizeTextInput(communityId, { maxLen: 120 })
    if (!communityIdValue.ok) return NextResponse.json({ error: "communityId is required" }, { status: 400 })

    const threadKey = getThreadKey(communityIdValue.value)
    const store = await readStore()
    const posts = store[threadKey] || []

    if (actionValue.ok && actionValue.value === "create_post") {
      const author = sanitizeTextInput(body.author, { maxLen: 64, allowEmpty: true, strict: true })
      const authorId = sanitizeTextInput(body.authorId, { maxLen: 120, allowEmpty: true })
      const content = sanitizeTextInput(body.content, { maxLen: 3000, strict: true })
      if (!content.ok) return NextResponse.json({ error: "Invalid post content" }, { status: 400 })

      const post: PostRecord = {
        id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        author: author.ok && author.value ? author.value : "Anonymous",
        authorId: authorId.ok ? authorId.value : "",
        content: content.value,
        timestamp: "Just now",
        reactions: { heard: 0, strong: 0, relate: 0, support: 0, hope: 0 },
        reactionUsers: {},
        replies: [],
      }

      store[threadKey] = [post, ...posts]
      await writeStore(store)
      return NextResponse.json({ posts: serialize(store[threadKey] || []) })
    }

    if (actionValue.ok && actionValue.value === "create_reply") {
      const postId = sanitizeTextInput(body.postId, { maxLen: 120 })
      const author = sanitizeTextInput(body.author, { maxLen: 64, allowEmpty: true, strict: true })
      const authorId = sanitizeTextInput(body.authorId, { maxLen: 120, allowEmpty: true })
      const content = sanitizeTextInput(body.content, { maxLen: 2000, strict: true })
      if (!postId.ok || !content.ok) return NextResponse.json({ error: "Invalid reply payload" }, { status: 400 })
      const targetPost = posts.find((p) => p.id === postId.value)
      if (!targetPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }
      const next = posts.map((p) =>
        p.id === postId.value
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                  author: author.ok && author.value ? author.value : "Anonymous",
                  authorId: authorId.ok ? authorId.value : "",
                  content: content.value,
                  timestamp: "Just now",
                },
              ],
            }
          : p,
      )

      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    if (actionValue.ok && actionValue.value === "toggle_reaction") {
      const postId = sanitizeTextInput(body.postId, { maxLen: 120 })
      const reactionType = sanitizeTextInput(body.reactionType, { maxLen: 24 })
      const userKey = sanitizeTextInput(body.userKey, { maxLen: 120 })
      if (!postId.ok || !reactionType.ok || !userKey.ok) {
        return NextResponse.json({ error: "Invalid reaction payload" }, { status: 400 })
      }
      if (!["heard", "strong", "relate", "support", "hope"].includes(reactionType.value)) {
        return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
      }
      const targetPost = posts.find((p) => p.id === postId.value)
      if (!targetPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }
      const next = posts.map((p) => {
        if (p.id !== postId.value) return p
        const users = new Set<string>(p.reactionUsers[reactionType.value] || [])
        const already = users.has(userKey.value)
        if (already) users.delete(userKey.value)
        else users.add(userKey.value)

        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType.value]: already
              ? Math.max(0, (p.reactions[reactionType.value] || 0) - 1)
              : (p.reactions[reactionType.value] || 0) + 1,
          },
          reactionUsers: {
            ...p.reactionUsers,
            [reactionType.value]: Array.from(users),
          },
        }
      })

      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    if (actionValue.ok && actionValue.value === "delete_post") {
      const postId = sanitizeTextInput(body.postId, { maxLen: 120 })
      const userId = sanitizeTextInput(body.userId, { maxLen: 120, allowEmpty: true })
      const userKey = sanitizeTextInput(body.userKey, { maxLen: 120, allowEmpty: true })
      if (!postId.ok || (!userId.ok || !userId.value) && (!userKey.ok || !userKey.value)) {
        return NextResponse.json({ error: "userId or userKey is required" }, { status: 400 })
      }
      const next = posts.filter((p) => {
        if (p.id !== postId.value) return true
        const isOwnerById = Boolean(userId.ok && userId.value && p.authorId && p.authorId === userId.value)
        const isOwnerByLegacyName = Boolean(userKey.ok && userKey.value && !p.authorId && p.author === userKey.value)
        return !(isOwnerById || isOwnerByLegacyName)
      })
      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    if (actionValue.ok && actionValue.value === "delete_reply") {
      const postId = sanitizeTextInput(body.postId, { maxLen: 120 })
      const replyId = sanitizeTextInput(body.replyId, { maxLen: 120 })
      const userId = sanitizeTextInput(body.userId, { maxLen: 120, allowEmpty: true })
      const userKey = sanitizeTextInput(body.userKey, { maxLen: 120, allowEmpty: true })
      if (!postId.ok || !replyId.ok || ((!userId.ok || !userId.value) && (!userKey.ok || !userKey.value))) {
        return NextResponse.json({ error: "userId or userKey is required" }, { status: 400 })
      }
      const targetPost = posts.find((p) => p.id === postId.value)
      if (!targetPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }
      const next = posts.map((p) =>
        p.id !== postId.value
          ? p
          : {
              ...p,
              replies: p.replies.filter((r) => {
                if (r.id !== replyId.value) return true
                const isOwnerById = Boolean(userId.ok && userId.value && r.authorId && r.authorId === userId.value)
                const isOwnerByLegacyName = Boolean(userKey.ok && userKey.value && !r.authorId && r.author === userKey.value)
                return !(isOwnerById || isOwnerByLegacyName)
              }),
            },
      )

      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  } catch (error) {
    console.error("safe-space posts error:", error)
    return NextResponse.json({ error: "Unable to save post data" }, { status: 500 })
  }
}
