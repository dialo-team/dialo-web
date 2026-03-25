import styles from "../../../../styles/module.social/FriendsPage/listFriend/DeleteFriendModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  group: any;
  onConfirm: () => void;
}

export const LeaveGroupModal = ({ open, onClose, group, onConfirm }: Props) => {
  if (!open || !group) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Rời nhóm</h3>

        <p className={styles.text}>
          Bạn có chắc muốn rời nhóm <b>{group.name}</b> không?
        </p>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>

          <button className={styles.confirm} onClick={onConfirm}>
            Rời nhóm
          </button>
        </div>
      </div>
    </div>
  );
};
