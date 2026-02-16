import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, Eye, EyeOff } from "lucide-react";

export const LoginPass = ({
  onSwitchQR,
  onSwitchForgot,
  onSwitchRegister,
}: {
  onSwitchQR: () => void;
  onSwitchForgot: () => void;
  onSwitchRegister: () => void;
}) => {
  const [showPassWord, setShowPassWord] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassWord(!showPassWord);
  };

  return (
    <>
      <div className={styles.form}>
        <div className={styles.headerBody}>
          <p>Đăng nhập qua mật khẩu</p>
        </div>
        <div className={styles.formInput}>
          <h3 className={styles.inputLabel}>Tài khoản</h3>
          <div className={styles.inputGroup}>
            <SmartphoneIcon size={20} color="#555" strokeWidth={2} />

            <input
              className={styles.inputField}
              type="text"
              placeholder="Số điện thoại"
            />
          </div>
          <h3 className={styles.inputLabel}>Mật khẩu</h3>
          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" strokeWidth={2} />
            <input
              className={styles.inputField}
              type={showPassWord ? "text" : "password"}
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              className="eyeButton"
              onClick={togglePasswordVisibility}
            >
              {showPassWord ? (
                <Eye size={20} color="#555" strokeWidth={2} />
              ) : (
                <EyeOff size={20} color="#555" strokeWidth={2} />
              )}
            </button>
          </div>
          <button className={styles.btnLogin}>Đăng nhập với mật khẩu</button>
          <button className={styles.btnForgotPass} onClick={onSwitchForgot}>
            Quên mật khẩu
          </button>{" "}
          <button className={styles.btnForgotPass} onClick={onSwitchRegister}>
            Đăng ký tài khoản
          </button>
          <button className={styles.btnBackQR} onClick={onSwitchQR}>
            Đăng nhập qua mã QR
          </button>
        </div>
      </div>
    </>
  );
};
