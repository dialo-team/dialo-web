import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  friend: any;
  currentName: string;
  onSave: (friendId: string, nextName: string) => void;
}

export const RenameFriendModal = ({
  open,
  onClose,
  friend,
  currentName,
  onSave,
}: Props) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (friend) {
      setName(currentName || friend.friendUserName || "");
    }
  }, [friend, currentName, open]);

  if (!open || !friend) return null;

  const handleConfirm = () => {
    const nextName = name.trim() || friend.friendUserName;
    onSave(friend.friendId, nextName);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Đổi tên gợi ý</h3>

        <div className={styles.avatarBox}>
          <img
            src={
              friend.friendAvatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
            }
          />
        </div>

        <p className={styles.note}>
          Hãy đặt cho <b>{friend.friendUserName}</b> một cái tên dễ nhớ hơn.
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
