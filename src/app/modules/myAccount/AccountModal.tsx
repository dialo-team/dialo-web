import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/AccountModal.module.css";
import { EditAccountModal } from "./EditAccountModal";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AccountModal = ({ open, onClose }: Props) => {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
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
                <h3>Thông tin tài khoản</h3>
                <button onClick={onClose} className={styles.closeBtn}>
                  ✕
                </button>
              </div>

              {/* Cover */}
              <div className={styles.cover}></div>

              {/*Avatar + Name */}
              <div className={styles.profileSection}>
                <div className={styles.avatar}>
                  <img
                    src="https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180"
                    alt="avatar"
                  />
                </div>
                <div className={styles.name}>Thanh</div>
              </div>

              {/* Info */}
              <div className={styles.infoSection}>
                <h4>Thông tin cá nhân</h4>

                <div className={styles.row}>
                  <span>Giới tính</span>
                  <span>Nữ</span>
                </div>

                <div className={styles.row}>
                  <span>Ngày sinh</span>
                  <span>12/12/2006</span>
                </div>

                <div className={styles.row}>
                  <span>Điện thoại</span>
                  <span>0909090909</span>
                </div>

                <button
                  className={styles.updateBtn}
                  onClick={() => {
                    setOpenEdit(true);
                    onClose(); // đóng AccountModal
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditAccountModal open={openEdit} onClose={() => setOpenEdit(false)} />
    </>
  );
};
