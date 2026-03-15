import { motion, AnimatePresence } from "framer-motion";
import styles from "../../../../styles/module.myAccount/AccountModal.module.css";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  gender?: string;
  birthday?: string;
  phone?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  friend: Friend | null;
}

export const FriendInfoModal = ({ open, onClose, friend }: Props) => {
  if (!friend) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <h3>Thông tin người dùng</h3>
              <button onClick={onClose} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            {/* Cover */}
            <div className={styles.cover}></div>

            {/* Avatar + Name */}
            <div className={styles.profileSection}>
              <div className={styles.avatar}>
                <img src={friend.avatar} alt="avatar" />
              </div>
              <div className={styles.name}>{friend.name}</div>
            </div>

            {/* Info */}
            <div className={styles.infoSection}>
              <h4>Thông tin cá nhân</h4>

              <div className={styles.row}>
                <span>Giới tính</span>
                <span>{friend.gender || "Không có"}</span>
              </div>

              <div className={styles.row}>
                <span>Ngày sinh</span>
                <span>{friend.birthday || "Không có"}</span>
              </div>

              <div className={styles.row}>
                <span>Điện thoại</span>
                <span>{friend.phone || "Không có"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};