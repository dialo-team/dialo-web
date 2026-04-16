
// import { useOutletContext } from "react-router-dom";
// import type { Friend } from "../../types/message/Friend";
// import styles from "../../styles/message/ChatWindow.module.css";
// import { useEffect, useState } from "react";
// import { ChatInfo } from "./ChatInfo";
// import { ChatSearch } from "./ChatSearch";
// import {
//   ChevronLeft,
//   Phone,
//   Video,
//   Search,
//   Info,
//   Smile,
//   Image,
//   Paperclip,
//   Zap,
//   ThumbsUp,
// } from "lucide-react";
// import { getConversationDetailApi } from "../../../../api/message/conversationApi";

// type PropsContext = {
//   selectedUser: Friend | null;
//   onBackToSidebar?: () => void;
// };

// type MessageUI = {
//   id: string;
//   sender: "me" | "them";
//   content: string;
//   time: string;
// };

// export const ChatWindow = () => {
//   const { selectedUser, onBackToSidebar } =
//     useOutletContext<PropsContext>();

//   const [showInfo, setShowInfo] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);

//   const [messages, setMessages] = useState<MessageUI[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ================= FETCH MESSAGES =================
//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!selectedUser?.id) return;

//       setLoading(true);

//       try {
//         const data = await getConversationDetailApi(selectedUser.id);

//         const mapped: MessageUI[] = data.messages.map((m) => ({
//           id: m.id,
//           content: m.content,
//           sender:
//             m.displayPosition === "RIGHT"
//               ? "me"
//               : m.displayPosition === "LEFT"
//               ? "them"
//               : "them",
//           time: new Date(m.createdAt).toLocaleTimeString("vi-VN", {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         }));

//         setMessages(mapped);
//       } catch (err) {
//         console.error("Load messages error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMessages();
//   }, [selectedUser?.id]);

//   if (!selectedUser) {
//     return <div className={styles.empty}>Chọn người để chat</div>;
//   }

//   return (
//     <div className={styles.container}>
//       <div
//         className={`${styles.chat} ${
//           showInfo || showSearch ? styles.chatWithPanel : ""
//         }`}
//       >
//         {/* HEADER */}
//         <div className={styles.header}>
//           <div className={styles.user}>
//             <button
//               className={styles.backButton}
//               onClick={onBackToSidebar}
//             >
//               <ChevronLeft size={20} />
//             </button>

//             <img src={selectedUser.avatar} />

//             <div>
//               <div className={styles.name}>{selectedUser.name}</div>
//               <div className={styles.status}>Truy cập gần đây</div>
//             </div>
//           </div>

//           <div className={styles.actions}>
//             <Phone size={18} />
//             <Video size={20} />

//             <Search
//               size={18}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowSearch(true);
//                 setShowInfo(false);
//               }}
//               style={{ cursor: "pointer" }}
//             />

//             <div
//               className={`${styles.infoButton} ${
//                 showInfo ? styles.active : ""
//               }`}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowInfo(!showInfo);
//                 setShowSearch(false);
//               }}
//             >
//               <Info size={18} />
//             </div>
//           </div>
//         </div>

//         {/* BODY */}
//         <div className={styles.body}>
//           {loading && <div>Đang tải tin nhắn...</div>}

//           {!loading &&
//             messages.map((m) => (
//               <div
//                 key={m.id}
//                 className={
//                   m.sender === "me"
//                     ? styles.messageRight
//                     : styles.messageLeft
//                 }
//               >
//                 {m.sender === "them" && (
//                   <img
//                     src={selectedUser.avatar}
//                     className={styles.avatar}
//                   />
//                 )}

//                 <div className={styles.bubble}>
//                   {m.content}
//                   <div className={styles.time}>{m.time}</div>
//                 </div>
//               </div>
//             ))}
//         </div>

//         {/* TOOLBAR */}
//         <div className={styles.toolbar}>
//           <Smile size={18} />
//           <Image size={18} />
//           <Paperclip size={18} />
//           <Zap size={18} />
//         </div>

//         {/* INPUT */}
//         <div className={styles.input}>
//           <input
//             placeholder={`Nhập @, tin nhắn tới ${selectedUser.name}`}
//           />
//           <ThumbsUp size={18} />
//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       {showInfo && (
//         <ChatInfo user={selectedUser} onClose={() => setShowInfo(false)} />
//       )}

//       {showSearch && <ChatSearch onClose={() => setShowSearch(false)} />}
//     </div>
//   );
// };
import { useOutletContext } from "react-router-dom";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatWindow.module.css";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  Info,
  Smile,
  Image,
  Paperclip,
  Zap,
  ThumbsUp,
  MoreVertical,
  Reply,
  Trash2,
  Send,
} from "lucide-react";
import { getConversationDetailApi } from "../../../../api/message/conversationApi";

type PropsContext = {
  selectedUser: Friend | null;
  onBackToSidebar?: () => void;
};

type MessageUI = {
  id: string;
  sender: "me" | "them";
  content: string;
  time: string;
  revoked?: boolean;
};

export const ChatWindow = () => {
  const { selectedUser, onBackToSidebar } =
    useOutletContext<PropsContext>();

  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  // click outside
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // fetch messages
  useEffect(() => {
    const load = async () => {
      if (!selectedUser?.id) return;

      setLoading(true);
      try {
        const data = await getConversationDetailApi(selectedUser.id);

        const mapped: MessageUI[] = data.messages.map((m: any) => ({
          id: m.id,
          sender: m.displayPosition === "RIGHT" ? "me" : "them",
          content: m.revoked
            ? "Tin nhắn đã được thu hồi"
            : m.content,
          time: new Date(m.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          revoked: m.revoked,
        }));

        setMessages(mapped);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedUser?.id]);

  if (!selectedUser) {
    return <div className={styles.empty}>Chọn người để chat</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.chat}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.user}>
            <button
              className={styles.backButton}
              onClick={onBackToSidebar}
            >
              <ChevronLeft size={20} />
            </button>

            <img src={selectedUser.avatar} />

            <div>
              <div className={styles.name}>
                {selectedUser.name}
              </div>
              <div className={styles.status}>
                Online
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Phone size={18} />
            <Video size={18} />
            <Search size={18} />
            <Info size={18} />
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {loading && <div>Loading...</div>}

          {!loading &&
            messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "me"
                    ? styles.messageRight
                    : styles.messageLeft
                }
              >
                {m.sender === "them" && (
                  <img
                    src={selectedUser.avatar}
                    className={styles.avatar}
                  />
                )}

                <div className={styles.messageBox}>
                  {m.sender === "me" && (
                    <div
                      className={styles.moreBtn}
                      onClick={(e) => {
                        e.stopPropagation();

                        const rect =
                          e.currentTarget.getBoundingClientRect();

                        setMenuPos({
                          x: rect.left - 190,
                          y: rect.top,
                        });

                        setOpenMenuId(
                          openMenuId === m.id ? null : m.id,
                        );
                      }}
                    >
                      <MoreVertical size={16} />
                    </div>
                  )}

                  {openMenuId === m.id && (
                    <div
                      className={styles.menu}
                      style={{
                        left: menuPos.x,
                        top: menuPos.y,
                      }}
                    >
                      <div className={styles.menuItem}>
                        <Reply size={14} />
                        Thu hồi
                      </div>
                      <div className={styles.menuItem}>
                        <Trash2 size={14} />
                        Xóa chỉ mình tôi
                      </div>
                    </div>
                  )}

                  <div
                    className={`${styles.bubble} ${
                      m.revoked ? styles.revoked : ""
                    }`}
                  >
                    {m.content}
                    <div className={styles.time}>
                      {m.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <Smile size={18} />
          <Image size={18} />
          <Paperclip size={18} />
          <Zap size={18} />
        </div>

        {/* INPUT */}
<div className={styles.input}>
  <input placeholder="Nhập tin nhắn..." />

  <button
    className={styles.sendBtn}
    type="button"
  >
    <Send size={18} />
  </button>
</div>
      </div>
    </div>
  );
};