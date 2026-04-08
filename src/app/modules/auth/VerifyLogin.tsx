

// import { useState } from "react";
// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { verifyOtpApi } from "../../../../api/auth/RegisterFormApi";

// export const VerifyLogin = ({
//   phone,
//   onSwitch,
// }: {
//   phone: string;
//   onSwitch: () => void;
// }) => {
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleVerify = async () => {
//     if (!otp) {
//       alert("Vui lòng nhập OTP");
//       return;
//     }

//     try {
//       setLoading(true);

//       await verifyOtpApi({
//         phone,
//         otp,
//       });

//       alert("Xác thực thành công!");

//       // 👉 quay về login
//       onSwitch();
//     } catch (err: any) {
//       alert(err.message || "OTP không đúng");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.form}>
//       <div className={styles.verifyForm}>
//         <p>Gửi tin nhắn để nhận mã xác thực</p>

//         {/* HIỂN THỊ PHONE */}
//         <h1>{phone}</h1>

//         <div
//           className={styles.inputGroup}
//           style={{ borderBottomColor: "#008fe5", width: "80%" }}
//         >
//           <input
//             className={styles.verifyField}
//             type="text"
//             placeholder="Nhập mã xác thực"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//           />
//         </div>

//         <button
//           className={styles.btnLogin}
//           onClick={handleVerify}
//           disabled={loading}
//         >
//           {loading ? "Đang xác thực..." : "Xác thực"}
//         </button>

//         <span>
//           Soạn tin nhắn với cú pháp "DIABLOPC" gửi đến 6020 (1000đ/tin)...
//         </span>
//       </div>
//     </div>
//   );
// };

import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { verifyLoginOtpApi } from "../../../../api/auth/LoginPassApi";
import { useNavigate } from "react-router-dom";

export const VerifyLogin = ({
  phone,
}: {
  phone: string;
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!otp) {
      alert("Nhập OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyLoginOtpApi({
        phone,
        otp,
      });

      // 👉 lưu token nếu có
      // localStorage.setItem("token", res.data.token);

      alert("Đăng nhập thành công!");

      navigate("/home");

    } catch (err: any) {
      alert(err?.response?.data?.message || "OTP sai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.verifyForm}>
        <h3>Xác thực OTP</h3>
        <h2>{phone}</h2>

        <input
          placeholder="Nhập OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify} disabled={loading}>
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>
      </div>
    </div>
  );
};