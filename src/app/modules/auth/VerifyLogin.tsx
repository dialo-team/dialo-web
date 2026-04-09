

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



import { useState, useRef } from "react";
import styles from "../../styles/module.auth/VerifyForm.module.css";
import { verifyLoginOtpApi } from "../../../../api/auth/LoginPassApi";
import { ErrorModal } from "@/app/components/ErrorModal";
import { useNavigate } from "react-router-dom";

export const VerifyLogin = ({
  phone,
  onSwitch,
}: {
  phone: string;
  onSwitch: () => void;
}) => {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);

  // Refs cho từng input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho nhập số
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // chỉ lấy 1 ký tự
    setOtp(newOtp);

    // Tự focus sang ô tiếp theo
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await verifyLoginOtpApi({ phone, otp: code });

      if (res.data.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        // onSwitch(); // hoặcnếu muốn redirect ngay
        navigate("/home") 
      } else {
        setError(res.data.message || "Xác thực thất bại!");
      }
    } catch (err: any) {

      if (err.response) {
        // Lỗi từ server
        if (err.response.status === 500 ) {
          setError("OTP không đúng");
        } else {
          setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
      } else {
        setError(err.message || "Đã xảy ra lỗi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.form}>
        <div className={styles.verifyForm}>
          <p>Gửi tin nhắn để nhận mã xác thực qua</p>
          <h1>{phone}</h1>

          {error && <span className={styles.errorMsg}>{error}</span>}

          <div className={styles.otpContainer}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el }}
                className={styles.otpInput}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
              />
            ))}
          </div>

          <button
            className={styles.btnLogin}
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>
        </div>
      </div>

      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};

