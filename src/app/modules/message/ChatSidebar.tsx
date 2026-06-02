

import { Search, UserPlus } from "lucide-react";
import styles from "../../styles/message/ChatSidebar.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import addGroupIcon from "../../../assets/add_group.jpg";
import AddFriendModal from "../social/friendPage/searchAndAddFriend/AddFriendModal";
import CreateGroupModal from "../social/friendPage/searchAndAddFriend/CreateGroupModal";
import type { Friend } from "../../types/message/Friend";
import { useSearchParams } from "react-router-dom";
import { getConversationsApi } from "../../../../api/message/conversationApi";
import { subscribeChatTopic } from "./chatSocket";
import { getUserInfoApi } from "../../../../api/social/searchAndAddFriend/userApi";
import { GroupAvatar } from "@/app/components/GroupAvatar";
import { getListMemberApi } from "../../../../api/social/groupFriend/groupApi";

type Props = {
  onSelectUser: (user: Friend) => void;
  selectedConversationId?: string;
};

const DEFAULT_AVATAR =
  "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

const formatGroupName = (name: string) => {
  if (!name) return "";
  try {
    const saved = localStorage.getItem("user");
    const currentUser = saved ? JSON.parse(saved) : null;
    const myName = currentUser?.userName?.trim();
    if (!myName) return name;
    const parts = name.split(",").map((n: string) => n.trim()).filter(Boolean);
    const filtered = parts.filter((n: string) => n !== myName);
    if (filtered.length === 0) return name;
    return filtered.join(", ");
  } catch {
    return name;
  }
};

const getCurrentUserId = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    if (typeof parsedUser?.id === "string") {
      const trimmed = parsedUser.id.trim();
      return trimmed || null;
    }

    if (typeof parsedUser?.id === "number" && Number.isFinite(parsedUser.id)) {
      return String(parsedUser.id);
    }

    return null;
  } catch {
    return null;
  }
};

export const ChatSidebar = ({ onSelectUser, selectedConversationId }: Props) => {
  const [params] = useSearchParams();

  const [keyword, setKeyword] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const clearedIds = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem("clearedConversations") || "[]"))
  );
  const selectedIdRef = useRef<string | undefined>(selectedConversationId);
  const hasLoadedRef = useRef(false);
  const socketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationSubscriptionsRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const friendsRef = useRef<Friend[]>([]);

  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      const { conversationId } = e.detail;

      setFriends((prev) =>
        prev.map((f) =>
          f.id === conversationId
            ? {
              ...f,
              lastMessage: "",
              unreadCount: 0,
              unreadDisplay: "0",
            }
            : f
        )
      );
    };

    window.addEventListener("conversation-cleared", handler);

    return () =>
      window.removeEventListener("conversation-cleared", handler);
  }, []);

  // Realtime name/avatar update (e.g., group rename)
  useEffect(() => {
    const handler = (e: any) => {
      const { conversationId, name, avatar } = e.detail;
      setFriends(prev => prev.map(f =>
        f.id === conversationId
          ? {
            ...f,
            ...(name !== undefined ? { name } : {}),
            ...(avatar !== undefined ? { avatar } : {}),
          }
          : f
      ));
    };
    window.addEventListener("conversation-updated", handler);
    return () => window.removeEventListener("conversation-updated", handler);
  }, []);

  // useEffect(() => {
  //   const handler = (e: any) => {
  //     const { conversationId } = e.detail;
  //     clearedIds.current.add(conversationId);
  //     localStorage.setItem("clearedConversations", JSON.stringify([...clearedIds.current]));
  //     setFriends((prev) => prev.filter((f) => f.id !== conversationId));
  //   };

  //   window.addEventListener("conversation-cleared", handler);
  //   return () => window.removeEventListener("conversation-cleared", handler);
  // }, []);

  const loadConversations = useCallback(async () => {
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const data = await getConversationsApi();
      const localCache = JSON.parse(localStorage.getItem("friendCache") || "{}");

      const mapped: Friend[] = await Promise.all(
        data.map(async (item) => {

          let avatar = item.counterpartAvatarUrl || DEFAULT_AVATAR;
          let displayName = item.counterpartName || "";

          let memberAvatars: string[] = [];

          // CHECK GROUP
          const isGroup =
            item.conversationId === item.counterpartId &&
            (!item.counterpartAvatarUrl ||
              item.counterpartAvatarUrl.trim() === "");

          // ===================== GROUP =====================
          if (isGroup) {
            avatar = item.counterpartAvatarUrl || "";

            // Use cached avatars to avoid N+1 API calls on every socket refresh
            const cachedFriend = friendsRef.current.find(f => f.id === item.conversationId);
            if (cachedFriend?.memberAvatars?.length) {
              memberAvatars = cachedFriend.memberAvatars;
            } else {
              try {
                const res = await getListMemberApi(item.conversationId);

                const members = res.data || [];

                memberAvatars = await Promise.all(
                  members.slice(0, 4).map(async (m: any) => {
                    try {
                      const userRes = await getUserInfoApi(m.userId);

                      return (
                        userRes.data?.data?.avatar ||
                        userRes.data?.avatar ||
                        DEFAULT_AVATAR
                      );
                    } catch {
                      return DEFAULT_AVATAR;
                    }
                  })
                );
              } catch (e) {
                console.warn("load group members failed", e);
              }
            }
          }

          // ===================== 1-1 CHAT =====================
          else {
            try {
              const userRes = await getUserInfoApi(item.counterpartId);

              console.log("USER INFO:", userRes.data);

              const userData = userRes.data.data;

              avatar =
                item.counterpartAvatarUrl ||
                userData?.avatar ||
                DEFAULT_AVATAR;

              displayName =
                item.counterpartName &&
                  !/^\d{10}$/.test(item.counterpartName)
                  ? item.counterpartName
                  : userData?.userName;

              localCache[item.counterpartId] = { name: displayName, avatar };
              localStorage.setItem("friendCache", JSON.stringify(localCache));
            } catch (e) {
              console.warn("load user info failed", e);

              const cached = localCache[item.counterpartId];

              avatar =
                item.counterpartAvatarUrl ||
                cached?.avatar ||
                DEFAULT_AVATAR;

              displayName =
                item.counterpartName ||
                cached?.name ||
                "Unknown";
            }

            memberAvatars = [avatar];
          }

          return {
            id: item.conversationId,
            // name: formatGroupName(item.counterpartName),
            name: isGroup ? formatGroupName(displayName) : displayName,
            counterpartId: item.counterpartId,
            avatar,
            memberAvatars,
            lastMessage: item.lastMessage,
            unreadCount: item.unreadCount,
            unreadDisplay: item.unreadDisplay,
          };
        })
      );

      setFriends((prev) => {
        const activeId = selectedIdRef.current;

        mapped.forEach((f) => {
          // nếu conversation có tin nhắn mới
          // thì bỏ khỏi danh sách đã clear
          if (f.lastMessage && f.lastMessage.trim() !== "") {
            clearedIds.current.delete(f.id);
          }
        });

        localStorage.setItem(
          "clearedConversations",
          JSON.stringify([...clearedIds.current])
        );

        const filtered = mapped.map((f) =>
          f.id === activeId
            ? { ...f, unreadCount: 0, unreadDisplay: "0" }
            : f
        );

        const isSame =
          filtered.length === prev.length &&
          filtered.every((f, i) => {
            const old = prev[i];
            return (
              old &&
              old.id === f.id &&
              old.lastMessage === f.lastMessage &&
              old.unreadCount === f.unreadCount
            );
          });

        return isSame ? prev : filtered;
      });
    } catch (error) {
      console.error("Load conversations failed:", error);
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, []);

  // Full reload trigger (e.g., after group creation)
  useEffect(() => {
    const handler = () => void loadConversations();
    window.addEventListener("conversations-reload", handler);
    return () => window.removeEventListener("conversations-reload", handler);
  }, [loadConversations]);

  useEffect(() => {
    const onConversationRead = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>;
      const conversationId = customEvent.detail?.conversationId;

      if (!conversationId) {
        return;
      }

      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === conversationId
            ? {
              ...friend,
              unreadCount: 0,
              unreadDisplay: "0",
            }
            : friend,
        ),
      );
    };

    window.addEventListener("conversation-read", onConversationRead);
    return () =>
      window.removeEventListener("conversation-read", onConversationRead);
  }, []);

  // Update lastMessage when message is revoked/deleted
  useEffect(() => {
    const onConversationMessageUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        conversationId?: string;
        lastMessage?: string;
      }>;
      const { conversationId, lastMessage } = customEvent.detail;

      if (!conversationId) {
        return;
      }

      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === conversationId
            ? {
              ...friend,
              lastMessage: lastMessage || "",
            }
            : friend,
        ),
      );
    };

    window.addEventListener(
      "conversation-message-updated",
      onConversationMessageUpdated,
    );
    return () =>
      window.removeEventListener(
        "conversation-message-updated",
        onConversationMessageUpdated,
      );
  }, []);

  // ===================== FETCH CONVERSATIONS =====================
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // ===================== SOCKET: INBOX =====================
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      return;
    }

    const unsubscribe = subscribeChatTopic(
      `/topic/inbox/${currentUserId}`,
      (payload) => {
        // Apply payload directly for instant update (lastMessage, unread, name)
        if (Array.isArray(payload) && payload.length > 0) {
          const summaries = payload as Array<{
            conversationId: string;
            lastMessage?: string | null;
            unreadCount?: number;
            unreadDisplay?: string;
            counterpartName?: string | null;
          }>;
          const summaryMap = new Map(summaries.map((s) => [s.conversationId, s]));
          const currentIds = new Set(friendsRef.current.map((f) => f.id));
          const hasNew = summaries.some((s) => !currentIds.has(s.conversationId));

          setFriends((prev) => {
            const activeId = selectedIdRef.current;
            return prev.map((f) => {
              const s = summaryMap.get(f.id);
              if (!s) return f;
              const isActive = f.id === activeId;
              const isGroup = !!f.counterpartId && f.id === f.counterpartId;
              const newName = s.counterpartName
                ? (isGroup ? formatGroupName(s.counterpartName) : s.counterpartName)
                : f.name;
              return {
                ...f,
                name: newName,
                lastMessage: s.lastMessage ?? f.lastMessage,
                unreadCount: isActive ? 0 : (s.unreadCount ?? f.unreadCount),
                unreadDisplay: isActive ? "0" : (s.unreadDisplay ?? f.unreadDisplay),
              };
            });
          });

          if (hasNew) {
            void loadConversations();
            return;
          }
        }

        // Debounced full refetch for order sync and fallback
        if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
        socketDebounceRef.current = setTimeout(() => {
          void loadConversations();
        }, 300);
      },
    );

    return unsubscribe;
  }, [loadConversations]);

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

  // ===================== FRIEND REMOVED =====================
  useEffect(() => {
    const handler = (e: any) => {
      const { friendId } = e.detail as { friendId: string };
      setFriends((prev) => {
        const conv = prev.find((f) => f.counterpartId === friendId);
        if (conv) {
          clearedIds.current.delete(conv.id);
          localStorage.setItem(
            "clearedConversations",
            JSON.stringify([...clearedIds.current])
          );
        }
        return prev;
      });
      void loadConversations();
    };
    window.addEventListener("friend-removed", handler);
    return () => window.removeEventListener("friend-removed", handler);
  }, [loadConversations]);

  // ===================== SEARCH PARAM =====================
  useEffect(() => {
    setKeyword(params.get("q") || "");
  }, [params]);

  // ===================== FILTER =====================
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className={styles.left}>
      {/* ===================== SEARCH ===================== */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBoxLeft}>
          <Search size={16} />
          <input
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <UserPlus
            size={20}
            className={styles.actionIcon}
            onClick={() => setOpenAddFriend(true)}
          />
          <img
            src={addGroupIcon}
            className={styles.actionIcon}
            onClick={() => setOpenCreateGroup(true)}
            alt="create-group"
          />
        </div>
      </div>

      {/* ===================== LIST ===================== */}
      <div className={styles.list}>
        {loading && <div className={styles.empty}>Đang tải...</div>}

        {!loading &&
          filteredFriends.map((f) => {
            const isActive = f.id === selectedConversationId;
            const hasUnread = (f.unreadCount || 0) > 0 && !isActive;
            return (
              <div
                key={f.id}
                className={`${styles.chatItem} ${hasUnread ? styles.chatItemUnread : ""
                  }`}
                onClick={() => onSelectUser(f as any)}
              >
                <GroupAvatar
                  avatars={
                    f.memberAvatars?.length
                      ? f.memberAvatars
                      : [f.avatar || DEFAULT_AVATAR]
                  }
                />

                <div className={styles.info}>
                  <div
                    className={`${styles.name} ${hasUnread ? styles.nameUnread : ""
                      }`}
                  >
                    {f.name}
                  </div>
                  <div
                    className={`${styles.lastMessage} ${hasUnread ? styles.lastMessageUnread : ""
                      }`}
                  >
                    {f.lastMessage}
                  </div>
                </div>

                {hasUnread && (
                  <div
                    className={styles.unreadBadge}
                    title={f.unreadDisplay || String(f.unreadCount)}
                  >
                    {f.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        }
        {!loading && filteredFriends.length === 0 && (
          <div className={styles.empty}>Không tìm thấy</div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}
      {openAddFriend && (
        <AddFriendModal onClose={() => setOpenAddFriend(false)} />
      )}

      {openCreateGroup && (
        <CreateGroupModal onClose={() => setOpenCreateGroup(false)} />
      )}
    </div>
  );
};
