import styles from "../../../../styles/module.social/FriendsPage/listFriend/DeleteFriendModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  friend: any;
  onConfirm: () => void;
}

export const DeleteFriendModal = ({
  open,
  onClose,
  friend,
  onConfirm,
}: Props) => {
  if (!open || !friend) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Xóa bạn</h3>

        <p className={styles.text}>
          Bạn có chắc muốn xóa <b>{friend.name}</b> khỏi danh sách bạn bè không?
        </p>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>

          <button className={styles.confirm} onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
