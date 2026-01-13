import styles from "./LoginForm.module.css";
import {  SmartphoneIcon } from "lucide-react";

export const LoginForgotPass = ({ onBack }: { onBack: () => void }) => {
  return (
    <>
      <div className={styles.headerBody} style={{ marginTop: 50 }}>
        <p>Nhập số điện thoại của bạn</p>
      </div>
      <div className={styles.formInput} style={{ minHeight: "auto" }}>
        <div className={styles.inputGroup}>
          <SmartphoneIcon size={20} color="#555" strokeWidth={2} />

          <input
            className={styles.inputField}
            type="text"
            placeholder="Số điện thoại"
          />
        </div>

        <button className={styles.btnLogin}>Tiếp tục</button>
        <button className={styles.btnBackPass} onClick={onBack}>
          Quay lại
        </button>
      </div>
    </>
  );
};
