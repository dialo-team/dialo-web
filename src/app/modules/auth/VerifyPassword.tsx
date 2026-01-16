import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, Eye, EyeOff } from "lucide-react";

export const VerifyPassword = ({ onSwitch }: { onSwitch: () => void }) => {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  return (
    <>
      <div className={styles.verifyForm}>
        <p>Gửi tin nhắn để nhận mã xác thực</p>
        <h1>0900610041</h1>
        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5", width: "80%" }}
        >
          <input
            className={styles.verifyField}
            type="text"
            placeholder="Nhập mã xác thực"
          />
        </div>
        <span>
          Soạn tin nhắn với cú pháp "DIABLOPC" gửi đến 6020 (1000đ/tin)...
        </span>
      </div>

      <div className={styles.formInput}>
        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5" }}
        >
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type={showPass1 ? "text" : "password"}
            placeholder="Vui lòng nhập mật khẩu"
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPass1(!showPass1)}
          >
            {showPass1 ? (
              <Eye size={20} color="#555" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#555" strokeWidth={2} />
            )}
          </button>
        </div>

        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5" }}
        >
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type={showPass2 ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPass2(!showPass2)}
          >
            {showPass2 ? (
              <Eye size={20} color="#555" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#555" strokeWidth={2} />
            )}
          </button>
        </div>

        <button className={styles.btnLogin} onClick={onSwitch}>
          Tiếp tục
        </button>
      </div>
    </>
  );
};
