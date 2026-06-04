# Session Context — Dialo Web Bug Fixes

## Project
- React 19 + TypeScript strict, Vite, Zustand
- STOMP WebSocket via `@stomp/stompjs` + SockJS — singleton `chatSocket.ts`
- Backend: Spring Boot + MongoDB (READ ONLY — do NOT modify backend)
- Backend repo: `D:\TaiLieuHocTap\CongNgheMoi\Project\dialo-backend`
- Frontend repo: `D:\TaiLieuHocTap\CongNgheMoi\Project\dialo-web`
- Current branch: `phuc_fix`

## Bugs to Fix (5 total)
1. Rename/nickname not realtime in sidebar ← partially addressed via inbox/conversation subscriptions
2. Creating group doesn't reload list ← done (fires `conversations-reload` event)
3. Poll votes not realtime ← done
4. Files in group info no download button ← done
5. **Sidebar doesn't show latest messages without F5** ← CURRENT FOCUS, NOT YET FIXED

## Key Architecture

### chatSocket.ts
- `subscribeChatTopic(destination, handler)` — managed subscriptions Map, auto-reconnect
- Handler sig: `(payload: unknown, message: IMessage) => void`
- Singleton connects to `http://14.225.254.174:8085/ws-chat`

### Backend WebSocket topics
- `/topic/inbox/{userId}` — sends `List<ConversationSummaryResponse>` to each participant
- `/topic/conversations/{conversationId}` — sends `MessageResponse` to each participant
- `/topic/typing/{conversationId}`

### Backend flow (persistAndPublish)
1. save message
2. updateLastMessage
3. `pushConversationEvent(message, conversation)` → broadcasts to `/topic/conversations/{id}`
4. `pushInboxUpdates(conversation)` → broadcasts to `/topic/inbox/{userId}` for ALL participants

## Root Cause — Bug 5 (Sidebar not updating)

`pushInboxUpdates` calls `getUserConversations(participant)` which calls `userProfileService.findEntity(participant)`.
If ANY participant's UserProfile is missing in MongoDB → method THROWS → `convertAndSend` never called → `/topic/inbox/{userId}` message NEVER sent to frontend.

**Confirmed via debug logs:**
- `[SIDEBAR] subscribing inbox for userId: 2014a33d-3641-4c22-a0cb-8ed42b20363c` ← appears (subscription OK)
- `[SIDEBAR] inbox received:` ← NEVER appears (message never arrives)

**`/topic/conversations/{id}` IS working** — ChatWindow receives messages fine.

Cannot fix backend → must use `/topic/conversations/{id}` in sidebar instead of inbox.

## Current State of ChatSidebar.tsx

File: `src/app/modules/message/ChatSidebar.tsx`

The inbox socket section (lines ~371-432) has debug logs and the broken inbox approach.
Need to:
1. Keep the inbox subscription (it might work for some users) but add per-conversation fallback
2. Add `conversationSubscriptionsRef` ref
3. Add per-conversation subscription useEffect (deps: `[friends]`)
4. Add cleanup useEffect (deps: `[]`)
5. Remove debug `console.log` statements

## Fix to Implement

Add to `ChatSidebar.tsx`:

### Step 1 — Add ref near other refs (after `socketDebounceRef`):
```tsx
const conversationSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
```

### Step 2 — Remove debug console.logs from inbox section:
- Remove: `console.log("[SIDEBAR] subscribing inbox for userId:", currentUserId);`
- Remove: `console.log("[SIDEBAR] inbox received:", payload);`

### Step 3 — Add per-conversation subscription effect AFTER the inbox useEffect block:
```tsx
// ===================== SOCKET: PER-CONVERSATION (sidebar realtime fallback) =====================
useEffect(() => {
  const currentUserId = getCurrentUserId();
  friends.forEach((f) => {
    if (conversationSubscriptionsRef.current.has(f.id)) return;
    const seenMsgIds = new Set<string>();
    const unsub = subscribeChatTopic(
      `/topic/conversations/${f.id}`,
      (payload: any) => {
        if (!payload?.id || seenMsgIds.has(payload.id)) return;
        seenMsgIds.add(payload.id);
        // Skip own messages (unread count already 0 for active)
        if (payload.senderId === currentUserId) return;
        const isSystem = payload.system === true;
        const isRevoked = payload.revoked === true;
        setFriends((prev) =>
          prev.map((friend) => {
            if (friend.id !== f.id) return friend;
            const isActive = friend.id === selectedIdRef.current;
            const newLastMsg = isRevoked
              ? "Tin nhắn đã được thu hồi"
              : (payload.content || friend.lastMessage);
            const newUnread = isSystem || isActive
              ? (friend.unreadCount || 0)
              : (friend.unreadCount || 0) + 1;
            return {
              ...friend,
              lastMessage: newLastMsg,
              unreadCount: newUnread,
              unreadDisplay: newUnread > 9 ? "9+" : String(newUnread),
            };
          })
        );
      }
    );
    conversationSubscriptionsRef.current.set(f.id, unsub);
  });
}, [friends]);

// Cleanup all conversation subscriptions on unmount
useEffect(() => {
  const subsRef = conversationSubscriptionsRef.current;
  return () => {
    subsRef.forEach((unsub) => unsub());
    subsRef.clear();
  };
}, []);
```

## Important Notes
- `friends` dependency on the subscription effect is intentional — new conversations added to friends list need subscriptions
- `conversationSubscriptionsRef.current.has(f.id)` guard prevents infinite loop (friends change → effect re-runs → skip already subscribed)
- `seenMsgIds` per subscription prevents duplicate processing (backend sends N copies of same message for N participants)
- Backend `MessageResponse` fields: `id`, `senderId`, `content`, `revoked`, `system`
- `selectedIdRef.current` tracks active conversation to avoid incrementing unread for it

## Friend type (src/app/types/message/Friend.ts)
```ts
export type Friend = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unreadCount?: number;
  unreadDisplay?: string;
  memberAvatars: string[];
  counterpartId?: string;
};
```

## Helper functions in ChatSidebar.tsx
- `getCurrentUserId()` — reads from localStorage `user.id`
- `formatGroupName(name)` — strips current user's name from comma-separated group name
- `loadConversations()` — full reload, uses `friendsRef` for avatar caching
- `selectedIdRef` — tracks current active conversation ID
- `friendsRef` — mirrors `friends` state for use inside callbacks
