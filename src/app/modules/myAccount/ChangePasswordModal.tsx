import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/ChangePasswordModal.module.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ open, onClose }: Props) => {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // Validate realtime từng field
  const validateField = (field: string, value: string) => {
    let message = "";

    if (field === "current") {
      if (!value) {
        message = "Mật khẩu hiện tại không được rỗng";
      }
    }

    if (field === "newPass") {
      if (!value) {
        message = "Mật khẩu mới không được rỗng";
      } else if (!passwordRegex.test(value)) {
        message = "Tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt";
      }
    }

    if (field === "confirm") {
      if (!value) {
        message = "Vui lòng nhập lại mật khẩu";
      } else if (value !== newPass) {
        message = "Mật khẩu nhập lại không khớp";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleSave = () => {
    validateField("current", current);
    validateField("newPass", newPass);
    validateField("confirm", confirm);

    if (
      current &&
      newPass &&
      confirm &&
      passwordRegex.test(newPass) &&
      confirm === newPass
    ) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h3>Đổi mật khẩu</h3>
              <button onClick={onClose} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div className={styles.form}>
              {/* Mật khẩu hiện tại */}
              <label>
                Mật khẩu hiện tại
                {errors.current && (
                  <span className={styles.error}> {errors.current}</span>
                )}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={current}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrent(value);
                    validateField("current", value);
                  }}
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowCurrent((prev) => !prev)}
                >
                  {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Mật khẩu mới */}
              <label>
                Mật khẩu mới
                {errors.newPass && (
                  <span className={styles.error}> {errors.newPass}</span>
                )}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPass(value);
                    validateField("newPass", value);
                  }}
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Nhập lại mật khẩu */}
              <label>
                Nhập lại mật khẩu
                {errors.confirm && (
                  <span className={styles.error}> {errors.confirm}</span>
                )}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirm(value);
                    validateField("confirm", value);
                  }}
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <button className={styles.saveBtn} onClick={handleSave}>
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
