import { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "../../styles/message/Forward.module.css";
import {
  getConversationsApi,
  forwardMessageApi,
} from "../../../../api/message/conversationApi";
import type { ConversationDto } from "../../types/message/Conversation";

const DEFAULT_AVATAR =
  "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

type Props = {
  open: boolean;
  sourceMessageId: string;
  onClose: () => void;
  onForwarded: () => void;
};

export const ForwardModal = ({
  open,
  sourceMessageId,
  onClose,
  onForwarded,
}: Props) => {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSearch("");
    getConversationsApi()
      .then((data) => setConversations(data))
      .catch((err) => console.error("Load conversations error:", err))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const filtered = conversations.filter((c) =>
    c.counterpartName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = async (conv: ConversationDto) => {
    if (forwarding) return;
    setForwarding(true);
    try {
      await forwardMessageApi({
        sourceMessageId,
        targetConversationId: conv.conversationId,
      });
      onForwarded();
      onClose();
    } catch (err) {
      console.error("Forward error:", err);
    } finally {
      setForwarding(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${forwarding ? styles.forwarding : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span>Chuyển tiếp tin nhắn</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>Không tìm thấy cuộc trò chuyện</div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.conversationId}
                className={styles.convItem}
                onClick={() => handleSelect(conv)}
              >
                <img
                  src={conv.counterpartAvatarUrl || DEFAULT_AVATAR}
                  alt={conv.counterpartName}
                  className={styles.avatar}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
                <div>
                  <div className={styles.convName}>{conv.counterpartName}</div>
                  {conv.lastMessage && (
                    <div className={styles.lastMsg}>{conv.lastMessage}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
