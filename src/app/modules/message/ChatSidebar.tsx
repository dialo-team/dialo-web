// import { Search, UserPlus } from "lucide-react";
// import styles from "../../styles/message/ChatSidebar.module.css";
// import { useEffect, useState } from "react";
// import addGroupIcon from "../../../assets/add_group.jpg";
// import AddFriendModal from "../social/friendPage/searchAndAddFriend/AddFriendModal";
// import CreateGroupModal from "../social/friendPage/searchAndAddFriend/CreateGroupModal";
// import type { Friend } from "../../types/message/Friend";
// import { useSearchParams } from "react-router-dom";

// type Props = {
//   onSelectUser: (user: Friend) => void;
// };

// export const ChatSidebar = ({ onSelectUser }: Props) => {
//   const [params] = useSearchParams();
//   const [keyword, setKeyword] = useState("");
//   const [openAddFriend, setOpenAddFriend] = useState(false);
//   const [openCreateGroup, setOpenCreateGroup] = useState(false);

//   const [friends] = useState<Friend[]>([
//     {
//       id: 1,
//       name: "Nguyễn Văn A",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//       lastMessage: "Ê hôm qua đi đâu vậy?",
//     },
//     {
//       id: 2,
//       name: "Trần Thị B",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//       lastMessage: "Mai học không?",
//     },
//     {
//       id: 3,
//       name: "Lê Văn C",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//       lastMessage: "Ok bro",
//     },
//   ]);

//   const filteredFriends = friends.filter((f) =>
//     f.name.toLowerCase().includes(keyword.toLowerCase()),
//   );

//   useEffect(() => {
//     const q = params.get("q") || "";
//     setKeyword(q);
//   }, [params]);

//   return (
//     <div className={styles.left}>
//       {/* SEARCH */}
//       <div className={styles.searchWrapper}>
//         <div className={styles.searchBoxLeft}>
//           <Search size={16} />
//           <input
//             placeholder="Tìm kiếm..."
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//           />
//         </div>

//         <div className={styles.actions}>
//           <UserPlus
//             size={20}
//             className={styles.actionIcon}
//             onClick={() => setOpenAddFriend(true)}
//           />
//           <img
//             src={addGroupIcon}
//             className={styles.actionIcon}
//             onClick={() => setOpenCreateGroup(true)}
//             alt="create-group"
//           />
//         </div>
//       </div>

//       {/* LIST FRIEND */}
//       <div className={styles.list}>
//         {filteredFriends.map((f) => (
//           <div
//             key={f.id}
//             className={styles.chatItem}
//             onClick={() => onSelectUser(f)}
//           >
//             <img src={f.avatar} className={styles.avatar} alt={f.name} />

//             <div className={styles.info}>
//               <div className={styles.name}>{f.name}</div>
//               <div className={styles.lastMessage}>{f.lastMessage}</div>
//             </div>
//           </div>
//         ))}

//         {filteredFriends.length === 0 && (
//           <div className={styles.empty}>Không tìm thấy</div>
//         )}
//       </div>

//       {/* MODAL */}
//       {openAddFriend && (
//         <AddFriendModal onClose={() => setOpenAddFriend(false)} />
//       )}

//       {openCreateGroup && (
//         <CreateGroupModal onClose={() => setOpenCreateGroup(false)} />
//       )}
//     </div>
//   );
// };

import { Search, UserPlus } from "lucide-react";
import styles from "../../styles/message/ChatSidebar.module.css";
import { useCallback, useEffect, useState } from "react";
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

  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversationsApi();

      // const mapped: Friend[] = data.map((item) => ({
      //   id: item.conversationId,
      //   name: item.counterpartName,
      //   avatar: item.counterpartAvatarUrl || DEFAULT_AVATAR,
      //   lastMessage: item.lastMessage,
      //   unreadCount: item.unreadCount,
      //   unreadDisplay: item.unreadDisplay,
      // }));
      const mapped: Friend[] = await Promise.all(
        data.map(async (item) => {
          let avatar = DEFAULT_AVATAR;

          try {
            const res = await getUserInfoApi(item.counterpartId);

            avatar = res.data?.data?.avatar || DEFAULT_AVATAR;
          } catch (error) {
            console.warn("Không lấy được avatar:", error);
          }

          return {
            id: item.conversationId,
            name: item.counterpartName,
            avatar,
            lastMessage: item.lastMessage,
            unreadCount: item.unreadCount,
            unreadDisplay: item.unreadDisplay,
          };
        })
      );

      // So sánh shallow: id, lastMessage, unreadCount
      const isSame =
        mapped.length === friends.length &&
        mapped.every((f, i) => {
          const old = friends[i];
          return (
            old &&
            old.id === f.id &&
            old.lastMessage === f.lastMessage &&
            old.unreadCount === f.unreadCount
          );
        });

      if (!isSame) {
        setFriends(mapped);
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
              onClick={() => onSelectUser(f)}
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
