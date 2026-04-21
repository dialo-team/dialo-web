import { useEffect, useState } from "react";
import { remarkConversationApi } from "../../../../api/message/conversationApi";
import { useAuthStore } from "../../../../store/authStore";
import styles from "../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentName: string;
  friend?: any;
  onSaved?: (name: string) => void;
};

export const RemarkFriendModal = ({
  open,
  onClose,
  conversationId,
  currentName,
  friend,
  onSaved,
}: Props) => {
  const [name, setName] = useState("");
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setName(currentName || "");
  }, [currentName, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!conversationId || !user?.id) return;

    const nextName = name.trim();

    await remarkConversationApi(conversationId, user.id, nextName);

    onSaved?.(nextName);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Đổi tên gợi ý</h3>

        {/* avatar giống UI cũ */}
        <div className={styles.avatarBox}>
          <img
            src={
              friend?.avatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
            }
          />
        </div>

        <p className={styles.note}>
          Hãy đặt cho <b>{friend?.name}</b> một cái tên dễ nhớ hơn.
        </p>

        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>

          <button className={styles.confirm} onClick={handleSave}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
