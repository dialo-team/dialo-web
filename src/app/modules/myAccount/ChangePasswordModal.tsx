import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/ChangePasswordModal.module.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordApi } from "../../../../api/social/me/changePasswordApi";
import { AlertModal } from "../../components/AlertModal";

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

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [errors, setErrors] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  const resetForm = () => {
    setCurrent("");
    setNewPass("");
    setConfirm("");

    setErrors({
      current: "",
      newPass: "",
      confirm: "",
    });

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

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
        message = "Tối thiểu 6 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt";
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

  const handleSave = async () => {
    validateField("current", current);
    validateField("newPass", newPass);
    validateField("confirm", confirm);

    if (
      !current ||
      !newPass ||
      !confirm ||
      !passwordRegex.test(newPass) ||
      confirm !== newPass
    ) {
      return;
    }

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await changePasswordApi({
        oldPass: current,
        newPass: newPass,
        refreshToken: refreshToken || "",
      });

      // đóng modal đổi mật khẩu trước
      resetForm();
      onClose();


      // nếu BE trả 200
      setAlertMessage("Đổi mật khẩu thành công");
      setAlertOpen(true);

    } catch (error: any) {

      const data = error?.response?.data;

      // nếu BE trả lỗi 401 nhưng thực tế thành công
      if (
        error?.response?.status === 401 &&
        data?.message === "Refresh token not found"
      ) {
        // đóng modal đổi mật khẩu trước
        resetForm();
        onClose();


        setAlertMessage("Đổi mật khẩu thành công");
        setAlertOpen(true);
        return;
      }

      setAlertMessage("Mật khẩu hiện tại không đúng");
      setAlertOpen(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={() => { resetForm(); onClose(); }}>
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
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className={styles.closeBtn}
              >
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
      <AlertModal
        open={alertOpen}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </AnimatePresence>


  );
};
