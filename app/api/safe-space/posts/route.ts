import { NextRequest, NextResponse } from "next/server"

type Reply = { id: string; author: string; content: string; timestamp: string }
type PostRecord = {
  id: string
  author: string
  content: string
  timestamp: string
  reactions: Record<string, number>
  reactionUsers: Record<string, Set<string>>
  replies: Reply[]
}

const store = new Map<string, PostRecord[]>()

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
  if (!communityId) return NextResponse.json({ error: "communityId is required" }, { status: 400 })
  return NextResponse.json({ posts: serialize(store.get(communityId) || []) })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, communityId } = body || {}
  if (!communityId) return NextResponse.json({ error: "communityId is required" }, { status: 400 })

  const posts = store.get(communityId) || []

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
    store.set(communityId, [post, ...posts])
    return NextResponse.json({ posts: serialize(store.get(communityId) || []) })
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
    store.set(communityId, next)
    return NextResponse.json({ posts: serialize(next) })
  }

  if (action === "toggle_reaction") {
    const { postId, reactionType, userKey } = body
    const next = posts.map((p) => {
      if (p.id !== postId) return p
      const users = p.reactionUsers[reactionType] || new Set<string>()
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
          [reactionType]: users,
        },
      }
    })
    store.set(communityId, next)
    return NextResponse.json({ posts: serialize(next) })
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
}
