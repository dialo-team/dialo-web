

import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/InviteFriendModal.module.css";
import type { User } from "@/app/types/social/User";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import { useAuthStore } from "../../../../../../store/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;

  // popup message (ErrorModal)
  onSend: (message: string) => void;

  // clear search result
  onSuccess: () => void;
}

export const InviteFriendModal = ({
  open,
  onClose,
  user,
  onSend,
  onSuccess,
}: Props) => {
  const [message, setMessage] = useState("");
  const me = useAuthStore((state) => state.user);

  // auto fill message
  useEffect(() => {
    if (user && me) {
      setMessage(
        `Xin chào, mình là ${me.userName}. Kết bạn với mình nhé!`
      );
    }
  }, [user]);

  if (!open || !user || !me) return null;

  // send request API
  const handleSendRequest = async () => {
  if (!user) return;

  // 1. ĐÓNG MODAL TRƯỚC
  onClose();

  try {
    await userApi.sendFriendRequest(user.id, message);

    // 2. báo thành công
    onSend("Gửi lời mời thành công!");

    // 3. xóa search result
    onSuccess();
  } catch (err) {
    console.error(err);

    // 2. báo lỗi
    onSend("Gửi lời mời thất bại!");
  }
};

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Gửi lời mời kết bạn</h3>

        <div className={styles.userBox}>
          <img
            src={
              me.avatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
            }
          />
          <span>{me.userName}</span>
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
            onClick={handleSendRequest}
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};