import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { tmpdir } from "os"

type Reply = { id: string; author: string; content: string; timestamp: string }
type PostRecord = {
  id: string
  author: string
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

function getThreadKey(communityId: string, lang?: string) {
  const safeLang = typeof lang === "string" && lang.trim() ? lang.trim() : DEFAULT_LANG
  return `${communityId}::${safeLang}`
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
  const communityId = request.nextUrl.searchParams.get("communityId")
  const lang = request.nextUrl.searchParams.get("lang") || DEFAULT_LANG
  if (!communityId) return NextResponse.json({ error: "communityId is required" }, { status: 400 })

  const threadKey = getThreadKey(communityId, lang)
  const store = await readStore()
  return NextResponse.json({ posts: serialize(store[threadKey] || []) })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, communityId, lang } = body || {}
    if (!communityId) return NextResponse.json({ error: "communityId is required" }, { status: 400 })

    const threadKey = getThreadKey(communityId, lang)
    const store = await readStore()
    const posts = store[threadKey] || []

    if (action === "create_post") {
      const post: PostRecord = {
        id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        author: body.author || "Anonymous",
        content: body.content || "",
        timestamp: "Just now",
        reactions: { heard: 0, strong: 0, relate: 0, support: 0, hope: 0 },
        reactionUsers: {},
        replies: [],
      }

      store[threadKey] = [post, ...posts]
      await writeStore(store)
      return NextResponse.json({ posts: serialize(store[threadKey] || []) })
    }

    if (action === "create_reply") {
      const { postId, author, content } = body
      const next = posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                  author: author || "Anonymous",
                  content: content || "",
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

    if (action === "toggle_reaction") {
      const { postId, reactionType, userKey } = body
      const next = posts.map((p) => {
        if (p.id !== postId) return p
        const users = new Set<string>(p.reactionUsers[reactionType] || [])
        const already = users.has(userKey)
        if (already) users.delete(userKey)
        else users.add(userKey)

        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: already
              ? Math.max(0, (p.reactions[reactionType] || 0) - 1)
              : (p.reactions[reactionType] || 0) + 1,
          },
          reactionUsers: {
            ...p.reactionUsers,
            [reactionType]: Array.from(users),
          },
        }
      })

      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    if (action === "delete_post") {
      const { postId, userKey } = body
      const next = posts.filter((p) => !(p.id === postId && p.author === userKey))
      store[threadKey] = next
      await writeStore(store)
      return NextResponse.json({ posts: serialize(next) })
    }

    if (action === "delete_reply") {
      const { postId, replyId, userKey } = body
      const next = posts.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              replies: p.replies.filter((r) => !(r.id === replyId && r.author === userKey)),
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
