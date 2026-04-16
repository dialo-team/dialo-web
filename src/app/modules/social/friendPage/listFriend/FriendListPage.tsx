import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getUserInfoApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import styles from "../../../../styles/module.myAccount/AccountModal.module.css";

interface Friend {
  friendId: string;
  friendUserName: string;
  friendAvatar?: string | null;
  bio?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  friend: Friend | null;
}

export const FriendInfoModal = ({ open, onClose, friend }: Props) => {
  const [loading, setLoading] = useState(false);
  const [displayFriend, setDisplayFriend] = useState<Friend | null>(friend);

  useEffect(() => {
    if (!open || !friend?.friendId) {
      setDisplayFriend(friend);
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        setLoading(true);

        const res = await getUserInfoApi(friend.friendId);
        const data = res.data?.data || res.data || {};

        setDisplayFriend({
          friendId: data.id || friend.friendId,
          friendUserName: data.userName || friend.friendUserName,
          friendAvatar: data.avatar || friend.friendAvatar || null,
          bio: data.bio,
        });
      } catch (error) {
        console.error("Lỗi load thông tin bạn bè:", error);
        setDisplayFriend(friend);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [friend, open]);

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
                <img
                  src={
                    displayFriend?.friendAvatar ||
                    "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                  }
                  alt="avatar"
                />
              </div>
              <div className={styles.name}>{displayFriend?.friendUserName}</div>
            </div>

            {/* Info */}
            <div className={styles.infoSection}>
              <h4>Thông tin cá nhân</h4>

              {loading ? (
                <div className={styles.row}>
                  <span>Đang tải</span>
                  <span>...</span>
                </div>
              ) : null}

              <div className={styles.row}>
                <span>Bio</span>
                <span>{displayFriend?.bio || "Không có"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
