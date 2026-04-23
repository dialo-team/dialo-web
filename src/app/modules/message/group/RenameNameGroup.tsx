


import { useEffect, useState } from "react";
import styles from "../../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";
import { updateGroupNameApi } from "../../../../../api/social/groupFriend/groupApi";

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentName: string;
  currentAvatar?: string;
  onSaved?: (name: string) => void;
};

export const RenameNameGroup = ({
  open,
  onClose,
  conversationId,
  currentName,
  currentAvatar,
  onSaved,
}: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (open) {
      setName(currentName || "");
    }
  }, [open, currentName]);

  if (!open) return null;

  /* ================= HANDLE SAVE ================= */
  const handleSave = async () => {
    const nextName = name.trim();

    if (!conversationId) return;
    if (!nextName) return;

    if (nextName === currentName) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      await updateGroupNameApi(conversationId, nextName);

      // cập nhật UI cha
      onSaved?.(nextName);

      // (optional) bắn event để sidebar update nếu có
      window.dispatchEvent(
        new CustomEvent("conversation-updated", {
          detail: { conversationId, name: nextName },
        })
      );

      onClose();
    } catch (err) {
      console.error("Lỗi đổi tên nhóm:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Đổi tên nhóm</h3>

        {/* Avatar placeholder */}
        <div className={styles.avatarBox}>
          <img
            src={
              currentAvatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
            }
            alt="group-avatar"
          />
        </div>

        <p className={styles.note}>
          Tên mới sẽ hiển thị với tất cả thành viên trong nhóm.
        </p>

        <input
          className={styles.input}
          value={name}
          placeholder="Nhập tên nhóm..."
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className={styles.confirm}
            onClick={handleSave}
            disabled={loading || !name.trim()}
          >
            {loading ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};