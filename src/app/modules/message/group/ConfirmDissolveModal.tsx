import styles from "../../../styles/module.social/ConfirmModal.module.css";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const ConfirmDissolveModal = ({ open, onClose, onConfirm, loading }: Props) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Xác nhận giải tán nhóm</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          Bạn có chắc muốn <b>giải tán nhóm</b> này không?
          <br />
          Toàn bộ tin nhắn sẽ bị xóa và không thể hoàn tác.
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : "Giải tán"}
          </button>
        </div>
      </div>
    </div>
  );
};
