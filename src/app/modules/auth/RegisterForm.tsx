import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, User, Eye, EyeOff } from "lucide-react";

export const RegisterForm = ({
  onSwitchLogin,
}: {
  onSwitchLogin: () => void;
}) => {
  // State quản lý ẩn/hiện cho 2 ô mật khẩu riêng biệt
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <>
      <div className={styles.form}>
        <div className={styles.headerBody}>
          <p>Đăng ký tài khoản mới</p>
        </div>
        <div className={styles.formInput}>
          {/* --- 1. HỌ VÀ TÊN --- */}
          <div className={styles.inputGroup}>
            <User size={20} color="#555" strokeWidth={2} />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Họ và tên"
            />
          </div>

          {/* --- 2. SỐ ĐIỆN THOẠI --- */}
          <div className={styles.inputGroup}>
            <SmartphoneIcon size={20} color="#555" strokeWidth={2} />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Số điện thoại"
            />
          </div>

          {/* --- 3. MẬT KHẨU --- */}
          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" strokeWidth={2} />
            <input
              className={styles.inputField}
              type={showPass ? "text" : "password"}
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? (
                <Eye size={20} color="#555" strokeWidth={2} />
              ) : (
                <EyeOff size={20} color="#555" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* --- 4. NHẬP LẠI MẬT KHẨU --- */}
          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" strokeWidth={2} />
            <input
              className={styles.inputField}
              type={showConfirmPass ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            >
              {showConfirmPass ? (
                <Eye size={20} color="#555" strokeWidth={2} />
              ) : (
                <EyeOff size={20} color="#555" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* --- BUTTON ĐĂNG KÝ --- */}
          <button className={styles.btnLogin}>Đăng ký ngay</button>

          {/* --- LINK QUAY VỀ ĐĂNG NHẬP --- */}
          <div
            style={{
              display: "flex",
              gap: "5px",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            <span style={{ color: "#666" }}>Đã có tài khoản?</span>
            <span
              className={styles.btnBackPass}
              style={{
                cursor: "pointer",
                color: "var(--main-color)",
                fontWeight: "bold",
              }}
              onClick={onSwitchLogin}
            >
              Đăng nhập ngay
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
