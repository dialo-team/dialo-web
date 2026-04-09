import React from "react";
import styles from "../styles/components/Error.module.css";
interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export const ErrorModal = ({ message, onClose }: ErrorModalProps) => {
  if (!message) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose} // click ra ngoài backdrop sẽ đóng modal
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // ngăn không đóng khi click vào modal
      >
        <p>{message}</p>
        <button className={styles.closeBtn} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};