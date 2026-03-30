import { useOutletContext } from "react-router-dom";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatWindow.module.css";
import { useState } from "react";
import { ChatInfo } from "./ChatInfo";
import { ChatSearch } from "./ChatSearch";
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
} from "lucide-react";

type Message = {
  id: number;
  sender: "me" | "them";
  content: string;
  time: string;
};

export const ChatWindow = () => {
  const { selectedUser, onBackToSidebar } = useOutletContext<{
    selectedUser: Friend | null;
    onBackToSidebar?: () => void;
  }>();

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const messages: Message[] = [
    { id: 1, sender: "them", content: "Bạn đã hoàn thành bài tập Toán hôm nay chưa?", time: "08:30" },
    { id: 2, sender: "me", content: "Chưa, mình dự định làm xong tối nay.", time: "08:32" },
    { id: 3, sender: "them", content: "Chúng ta nên làm nhóm 3 người, bạn có muốn tham gia không?", time: "08:33" },
    { id: 4, sender: "me", content: "Được, bạn gửi link Google Docs để tôi xem nhé.", time: "08:34" },
    { id: 5, sender: "them", content: "Link đây: https://docs.google.com/abc123", time: "08:35" },
    { id: 6, sender: "me", content: "Cảm ơn! Tôi sẽ thêm phần giải thích cho bước 2.", time: "08:36" },
    { id: 7, sender: "them", content: "Nhớ chuẩn bị cho buổi thuyết trình vào ngày mai.", time: "08:37" },
    { id: 8, sender: "me", content: "Được, tôi sẽ soạn slide xong tối nay.", time: "08:38" },
    { id: 9, sender: "them", content: "Bạn có đọc tài liệu tham khảo của môn Lý không?", time: "08:40" },
    { id: 10, sender: "me", content: "Đã đọc rồi, tôi thấy phần thí nghiệm thứ 3 khá khó hiểu.", time: "08:41" },
  ];

  if (!selectedUser) {
    return <div className={styles.empty}>Chọn người để chat</div>;
  }

  return (
    <div className={styles.container}>
      {/* CHAT */}
      <div
        className={`${styles.chat} ${showInfo || showSearch ? styles.chatWithPanel : ""
          }`}
      // Bỏ onClick ở đây, để không reset showSearch/showInfo
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.user}>
            <button
              className={styles.backButton}
              onClick={onBackToSidebar}
              type="button"
              aria-label="Quay lại danh sách chat"
            >
              <ChevronLeft size={20} />
            </button>
            <img src={selectedUser.avatar} />
            <div>
              <div className={styles.name}>{selectedUser.name}</div>
              <div className={styles.status}>Truy cập 1 giờ trước</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Phone size={18} />
            <Video size={20} />
            <Search
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                setShowSearch(true);
                setShowInfo(false);
              }}
              style={{ cursor: "pointer" }}
            />
            <div
              className={`${styles.infoButton} ${showInfo ? styles.active : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
                setShowSearch(false);
              }}
            >
              <Info size={18} />
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <div className={styles.body}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.sender === "me"
                  ? styles.messageRight
                  : styles.messageLeft
              }
            >
              {m.sender === "them" && (
                <img src={selectedUser.avatar} className={styles.avatar} />
              )}

              <div className={styles.bubble}>
                {m.content}
                <div className={styles.time}>{m.time}</div>
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
          <input placeholder={`Nhập @, tin nhắn tới ${selectedUser.name}`} />
          <ThumbsUp size={18} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      {showInfo && (
        <ChatInfo user={selectedUser} onClose={() => setShowInfo(false)} />
      )}
      {showSearch && <ChatSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
};