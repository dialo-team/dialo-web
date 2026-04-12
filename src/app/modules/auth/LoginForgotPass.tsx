import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { SmartphoneIcon, ArrowLeft } from "lucide-react";
import { requestResetPasswordApi } from "../../../../api/auth/ForgotPasswordApi";
import { ErrorModal } from "@/app/components/ErrorModal";

export const LoginForgotPass = ({
  onBack,
  onVerify,
}: {
  onBack: () => void;
  onVerify: (phone: string) => void;
}) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) {
      setError("Số điện thoại không được rỗng");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await requestResetPasswordApi({
        source: phone,
        type: "SMS",
      });

      onVerify(phone); // chuyển sang màn OTP

    } catch (err: any) {
      setError("Số điện thoại phải 10 số");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.headerBody}>
        <p>Nhập số điện thoại của bạn</p>
      </div>

      <div className={styles.formInput}>

        <div className={styles.inputGroup}>
          <SmartphoneIcon size={20} />
          <input
            className={styles.inputField}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Số điện thoại"
          />
        </div>

        <button onClick={handleSendOtp} className={styles.btnLogin}>
          {loading ? "Đang gửi..." : "Tiếp tục"}
        </button>

        <button className={styles.btnBackPass} onClick={onBack}>
          <ArrowLeft size={20} />
          <p>Quay lại</p>
        </button>
      </div>

      <ErrorModal message={error} onClose={() => setError("")} />
    </div>
  );
};