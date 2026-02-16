import styles from "../../styles/module.auth/LoginForm.module.css";
import { SmartphoneIcon, ArrowLeft } from "lucide-react";

export const LoginForgotPass = ({
  onBack,
  onVerify,
}: {
  onBack: () => void;
  onVerify: () => void;
}) => {
  return (
    <>
      <div className={styles.form}>
        <div className={styles.headerBody}>
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

          <button className={styles.btnLogin} onClick={onVerify}>
            Tiếp tục
          </button>
          <button className={styles.btnBackPass} onClick={onBack}>
            <ArrowLeft size={20} color="#555" strokeWidth={2} />
            <p>Quay lại</p>
          </button>
        </div>
      </div>
    </>
  );
};
