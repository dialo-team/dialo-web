import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  friend: any;
}

export const RenameFriendModal = ({ open, onClose, friend }: Props) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (friend) {
      setName(friend.name);
    }
  }, [friend]);

  if (!open || !friend) return null;

  const handleConfirm = () => {
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Đổi tên gợi ý</h3>

        <div className={styles.avatarBox}>
          <img src={friend.avatar} />
        </div>

        <p className={styles.note}>
          Hãy đặt cho <b>{friend.name}</b> một cái tên dễ nhớ hơn.
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

          <button className={styles.confirm} onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
