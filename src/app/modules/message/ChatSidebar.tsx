

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

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

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

          // ===================== 1-1 CHAT =====================
          else {
            try {
              const userRes = await getUserInfoApi(item.counterpartId);

              console.log("USER INFO:", userRes.data);

              const userData = userRes.data.data;

              avatar =
                userData?.avatar ||
                item.counterpartAvatarUrl ||
                DEFAULT_AVATAR;

              displayName =
                userData?.userName ||
                item.counterpartName ||
                "Unknown";
            } catch (e) {
              console.warn("load user info failed", e);

              avatar =
                item.counterpartAvatarUrl ||
                DEFAULT_AVATAR;

              displayName =
                item.counterpartName ||
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
            memberAvatars, // 👈 QUAN TRỌNG
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
      () => {
        if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
        socketDebounceRef.current = setTimeout(() => {
          void loadConversations();
        }, 300);
      },
    );

    return unsubscribe;
  }, [loadConversations]);

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
