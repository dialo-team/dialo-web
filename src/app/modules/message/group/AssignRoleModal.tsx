import { useState } from "react";
import { X } from "lucide-react";
import styles from "../../../styles/module.social/ConfirmModal.module.css";
import { updateMemberRoleApi } from "../../../../../api/social/groupFriend/groupApi";

type Member = {
  id: string;
  name: string;
  avatar: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  members: Member[];
  roleType: "ADMIN" | "OWNER";
  onSuccess?: () => void;
};

const DEFAULT_AVATAR = "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

export const AssignRoleModal = ({
  open,
  onClose,
  conversationId,
  members,
  roleType,
  onSuccess,
}: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");

  if (!open) return null;

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  const filtered = members
    .filter((m) => m.id !== currentUserId)
    .filter((m) => (m.name || "").toLowerCase().includes(search.toLowerCase()));

  const title = roleType === "OWNER" ? "Chuyển quyền trưởng nhóm" : "Thêm phó nhóm";
  const confirmLabel = roleType === "OWNER" ? "Chuyển quyền" : "Xác nhận";

  const handleConfirm = async () => {
    if (!selectedId || assigning) return;
    setAssigning(true);
    try {
      await updateMemberRoleApi(conversationId, selectedId, roleType);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Assign role error:", err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ width: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span style={{ fontSize: 15 }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={styles.body}
          style={{ padding: "12px 16px", maxHeight: 360, overflowY: "auto" }}
        >
          <input
            type="text"
            placeholder="Tìm thành viên"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 20,
              border: "1px solid #ddd",
              marginBottom: 12,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: 14,
                padding: "12px 0",
              }}
            >
              Không tìm thấy thành viên
            </div>
          )}

          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                background: selectedId === m.id ? "#e8f0fe" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <img
                src={m.avatar || DEFAULT_AVATAR}
                alt="avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, flex: 1 }}>{m.name}</span>
              {selectedId === m.id && (
                <span style={{ color: "#0068ff", fontWeight: 700 }}>✓</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || assigning}
            style={{
              padding: "6px 16px",
              border: "none",
              background: selectedId && !assigning ? "#0068ff" : "#ccc",
              color: "white",
              borderRadius: 6,
              cursor: selectedId && !assigning ? "pointer" : "not-allowed",
              fontWeight: 500,
            }}
          >
            {assigning ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
