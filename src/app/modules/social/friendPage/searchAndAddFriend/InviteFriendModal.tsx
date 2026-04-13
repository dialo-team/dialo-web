import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/InviteFriendModal.module.css";
import type { User } from "@/app/types/social/User";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSend: (message: string) => void;
}

export const InviteFriendModal = ({
  open,
  onClose,
  user, // fallback nếu chưa có
  onSend,
}: Props) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setMessage(
        `Xin chào, mình là ${user.userName}. Kết bạn với mình nhé!`
      );
    }
  }, [user]);

  if (!open || !user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Gửi lời mời kết bạn</h3>

        <div className={styles.userBox}>
          <img
            src={
              user.avatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
            }
          />
          <span>{user.userName}</span>
        </div>

        <textarea
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>

          <button
            className={styles.confirm}
            onClick={() => {
              onSend(message);
              onClose();
            }}
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};