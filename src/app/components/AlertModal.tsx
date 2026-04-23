import styles from "../styles/components/AlertModal.module.css";

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
}

export const AlertModal = ({ open, message, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Thông báo</h3>

        <p className={styles.message}>{message}</p>

        <button className={styles.button} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};