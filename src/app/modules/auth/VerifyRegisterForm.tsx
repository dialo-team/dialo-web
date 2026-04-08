// import { useState } from "react";
// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { LockIcon, Eye, EyeOff } from "lucide-react";

// export const VerifyPassword = ({ onSwitch }: { onSwitch: () => void }) => {

//   return (
//     <>
//       <div className={styles.form}>
//         <div className={styles.verifyForm}>
//           <p>Gửi tin nhắn để nhận mã xác thực</p>
//           <h1>0900610041</h1>
//           <div
//             className={styles.inputGroup}
//             style={{ borderBottomColor: "#008fe5", width: "80%" }}
//           >
//             <input
//               className={styles.verifyField}
//               type="text"
//               placeholder="Nhập mã xác thực"
//             />
//           </div>
//           <span>
//             Soạn tin nhắn với cú pháp "DIABLOPC" gửi đến 6020 (1000đ/tin)...
//           </span>
//         </div>

//       </div>
//     </>
//   );
// };


import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { verifyOtpApi } from "../../../../api/auth/RegisterFormApi";

export const VerifyRegisterForm = ({
  phone,
  onSwitch,
}: {
  phone: string;
  onSwitch: () => void;
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      alert("Vui lòng nhập OTP");
      return;
    }

    try {
      setLoading(true);

      await verifyOtpApi({
        phone,
        otp,
      });

      alert("Xác thực thành công!");

      // 👉 quay về login
      onSwitch();
    } catch (err: any) {
      alert(err.message || "OTP không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.verifyForm}>
        <p>Gửi tin nhắn để nhận mã xác thực</p>

        {/* HIỂN THỊ PHONE */}
        <h1>{phone}</h1>

        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5", width: "80%" }}
        >
          <input
            className={styles.verifyField}
            type="text"
            placeholder="Nhập mã xác thực"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button
          className={styles.btnLogin}
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>

        <span>
          Soạn tin nhắn với cú pháp "DIABLOPC" gửi đến 6020 (1000đ/tin)...
        </span>
      </div>
    </div>
  );
};