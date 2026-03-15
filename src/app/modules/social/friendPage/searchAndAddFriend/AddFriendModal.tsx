import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/AddFriendModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  user: any;
  onSend: (message: string) => void;
}

export const AddFriendModal = ({ open, onClose, user, onSend }: Props) => {
  const [message, setMessage] = useState(
    user ? "Xin chào, mình là Trúc. Kết bạn với mình nhé!" : ""
  );

  useEffect(() => {
    if (user) {
      setMessage("Xin chào, mình là Trúc. Kết bạn với mình nhé!");
    }
  }, [user]);

  if (!open || !user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Gửi lời mời kết bạn</h3>

        <div className={styles.userBox}>
          <img src={user.avatar} />
          <span>{user.name}</span>
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