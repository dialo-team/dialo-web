// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { SmartphoneIcon, ArrowLeft } from "lucide-react";

// export const LoginForgotPass = ({
//   onBack,
//   onVerify,
// }: {
//   onBack: () => void;
//   onVerify: () => void;
// }) => {
//   return (
//     <>
//       <div className={styles.form}>
//         <div className={styles.headerBody}>
//           <p>Nhập số điện thoại của bạn</p>
//         </div>

//         <div className={styles.formInput} style={{ minHeight: "auto" }}>
//           <div className={styles.inputGroup}>
//             <SmartphoneIcon size={20} color="#555" strokeWidth={2} />

//             <input
//               className={styles.inputField}
//               type="text"
//               placeholder="Số điện thoại"
//             />
//           </div>

//           <button className={styles.btnLogin} onClick={onVerify}>
//             Tiếp tục
//           </button>
//           <button className={styles.btnBackPass} onClick={onBack}>
//             <ArrowLeft size={20} color="#555" strokeWidth={2} />
//             <p>Quay lại</p>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };


import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { SmartphoneIcon, ArrowLeft } from "lucide-react";
import { requestResetPasswordApi } from "../../../../api/auth/ForgotPasswordApi";

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
      setError("Nhập số điện thoại");
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
      setError(err?.response?.data?.message || "Gửi OTP thất bại");
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
        {error && <span className={styles.errorMsg}>{error}</span>}

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
    </div>
  );
};