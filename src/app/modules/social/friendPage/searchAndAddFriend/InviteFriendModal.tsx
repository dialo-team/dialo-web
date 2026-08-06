

import { useState, useEffect } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/InviteFriendModal.module.css";
import type { User } from "@/app/types/social/User";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import { useAuthStore } from "../../../../../../store/authStore";
import { AlertModal } from "@/app/components/AlertModal";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const InviteFriendModal = ({
  open,
  onClose,
  user,
  onSuccess,
}: Props) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const me = useAuthStore((state) => state.user);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  // auto fill message
  useEffect(() => {
    if (user && me) {
      setMessage(`Xin chào, mình là ${me.userName}. Kết bạn với mình nhé!`);
    }
  }, [user, me]);


  if (!user || !me) return null;

  const handleSendRequest = async () => {
    if (!user || submitting) return;

    try {
      setSubmitting(true);
      await userApi.sendFriendRequest(user.id, message.trim());


      setAlertMessage("Gửi lời mời thành công!");
      setAlertOpen(true);

      onSuccess();
       onClose();
    } catch (err: any) {
      setAlertMessage(
         "Gửi lời mời thất bại!"
      );
      onClose();
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Invite Modal */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => !submitting && onClose()}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
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
              <button
                className={styles.cancel}
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>

              <button
                className={styles.confirm}
                onClick={handleSendRequest}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      
      <AlertModal
        open={alertOpen}
        message={alertMessage}
        onClose={() => {
          setAlertOpen(false);
          onClose(); 
        }}
      />
    </>
  );
};