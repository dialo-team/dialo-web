

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

type Props = {
  onSelectUser: (user: Friend) => void;
};

const DEFAULT_AVATAR =
  "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

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

export const ChatSidebar = ({ onSelectUser }: Props) => {
  const [params] = useSearchParams();

  const [keyword, setKeyword] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const clearedIds = useRef<Set<string>>(new Set());

  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  useEffect(() => {
  const handler = (e: any) => {
    const { conversationId, name, avatar } = e.detail;

    setFriends((prev) =>
      prev.map((f) =>
        f.id === conversationId
          ? {
              ...f,
              name: name ?? f.name,
              avatar: avatar ?? f.avatar,
            }
          : f
      )
    );
  };

  window.addEventListener("conversation-updated", handler);

  return () => {
    window.removeEventListener("conversation-updated", handler);
  };
}, []);

  useEffect(() => {
    const handler = (e: any) => {
      const { conversationId } = e.detail;
      console.log("[sidebar] conversation-cleared received:", conversationId);
      clearedIds.current.add(conversationId);
      setFriends((prev) => prev.filter((f) => f.id !== conversationId));
    };

    window.addEventListener("conversation-cleared", handler);
    return () => window.removeEventListener("conversation-cleared", handler);
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversationsApi();

      const mapped: Friend[] = await Promise.all(
        data.map(async (item) => {


          let avatar = item.counterpartAvatarUrl || DEFAULT_AVATAR;

          // nếu là base64 thì dùng luôn
          if (!avatar.startsWith("data:image")) {
            try {
              const res = await getUserInfoApi(item.counterpartId);
              avatar = res.data?.data?.avatar || avatar || DEFAULT_AVATAR;
            } catch (error) {
              console.warn("Không lấy được avatar:", error);
            }
          }

          return {
            id: item.conversationId,
            // name: item.counterpartName,
            name: formatGroupName(item.counterpartName),
            counterpartId: item.counterpartId,
            avatar,
            lastMessage: item.lastMessage,
            unreadCount: item.unreadCount,
            unreadDisplay: item.unreadDisplay,
          };
        })
      );

      const filtered = mapped.filter((f) => !clearedIds.current.has(f.id));

      const isSame =
        filtered.length === friends.length &&
        filtered.every((f, i) => {
          const old = friends[i];
          return (
            old &&
            old.id === f.id &&
            old.lastMessage === f.lastMessage &&
            old.unreadCount === f.unreadCount
          );
        });

      if (!isSame) {
        setFriends(filtered);
      }
    } catch (error) {
      console.error("Load conversations failed:", error);
    } finally {
      setLoading(false);
    }
  }, [friends]);

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
        void loadConversations();
      },
    );

    return unsubscribe;
  }, [loadConversations]);

  // ===================== FALLBACK POLLING =====================
  // useEffect(() => {
  //   const interval = window.setInterval(() => {
  //     if (!document.hidden) {
  //       void loadConversations();
  //     }
  //   }, 3000);
  //
  //   return () => window.clearInterval(interval);
  // }, [loadConversations]);

  // ===================== SEARCH PARAM =====================
  useEffect(() => {
    setKeyword(params.get("q") || "");
  }, [params]);

  // ===================== FILTER =====================
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  // fomat lại tên 
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const formatGroupName = (name: string) => {
    if (!name) return "";

    const myName = currentUser?.userName?.trim();
    if (!myName) return name;

    // tách theo dấu ,
    const parts = name
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    // loại bỏ tên của mình
    const filtered = parts.filter((n) => n !== myName);

    // nếu xoá xong mà rỗng → fallback lại name cũ
    if (filtered.length === 0) return name;

    return filtered.join(", ");
  };

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
          filteredFriends.map((f) => (
            <div
              key={f.id}
              className={`${styles.chatItem} ${(f.unreadCount || 0) > 0 ? styles.chatItemUnread : ""
                }`}
              // onClick={() => onSelectUser(f)}
              onClick={() => onSelectUser(f as any)}
            >
              <img src={f.avatar} className={styles.avatar} alt={f.name} />

              <div className={styles.info}>
                <div
                  className={`${styles.name} ${(f.unreadCount || 0) > 0 ? styles.nameUnread : ""
                    }`}
                >
                  {f.name}
                </div>
                <div
                  className={`${styles.lastMessage} ${(f.unreadCount || 0) > 0 ? styles.lastMessageUnread : ""
                    }`}
                >
                  {f.lastMessage}
                </div>
              </div>

              {(f.unreadCount || 0) > 0 && (
                <div
                  className={styles.unreadBadge}
                  title={f.unreadDisplay || String(f.unreadCount)}
                >
                  {f.unreadCount}
                </div>
              )}
            </div>
          ))}

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
