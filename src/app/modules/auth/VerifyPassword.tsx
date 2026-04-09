

// import { useState, useRef } from "react";
// import styles from "../../styles/module.auth/VerifyForm.module.css";
// import {
//   confirmResetOtpApi,
//   resetPasswordApi,
// } from "../../../../api/auth/ForgotPasswordApi";
// import { Eye, EyeOff, LockIcon } from "lucide-react";

// export const VerifyPassword = ({
//   phone,
//   onSwitch,
// }: {
//   phone: string;
//   onSwitch: () => void;
// }) => {
//   const OTP_LENGTH = 6;

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
//   const [resetToken, setResetToken] = useState("");

//   const [step, setStep] = useState<"otp" | "password">("otp");

//   const [newPass, setNewPass] = useState("");
//   const [confirmPass, setConfirmPass] = useState("");
//   const [showPass1, setShowPass1] = useState(false);
//   const [showPass2, setShowPass2] = useState(false);


//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // nhập OTP
//   const handleChange = (index: number, value: string) => {
//     if (!/^\d*$/.test(value)) return;

//     setError("");

//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp);

//     if (value && index < OTP_LENGTH - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   // xác thực OTP
//   const handleVerifyOtp = async () => {
//     const code = otp.join("").trim();

//     if (code.length < OTP_LENGTH) {
//       setError("Nhập đủ OTP");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");



//       const res = await confirmResetOtpApi({
//         source: phone,
//         type: "SMS",
//         otp: code,
//       });


//       // FIX CHÍNH Ở ĐÂY
//       if (res.data.status === 0) {
//         const token = res.data.data?.resetToken;

//         if (token) {
//           setResetToken(token);
//           setStep("password");
//         } else {
//           setError("Không lấy được resetToken");
//         }

//       } else {
//         setError(res.data.message || "OTP không đúng");
//       }

//     } catch (err: any) {
//       setError(err?.response?.data?.message || "OTP sai");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // đổi mật khẩu
//   const handleResetPassword = async () => {
//     if (!newPass || !confirmPass) {
//       setError("Nhập đầy đủ mật khẩu");
//       return;
//     }

//     if (newPass !== confirmPass) {
//       setError("Mật khẩu không khớp");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       await resetPasswordApi(
//         {
//           password: newPass,
//         },
//         resetToken
//       );

//       alert("Đổi mật khẩu thành công!");
//       onSwitch();

//     } catch (err: any) {
//       setError(err?.response?.data?.message || "Lỗi đổi mật khẩu");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.form}>

//       {/* STEP OTP */}
//       {step === "otp" && (
//         <div className={styles.verifyForm}>
//           <p>Gửi tin nhắn để nhận mã xác thực qua</p>
//           <h1>{phone}</h1>

//           {error && <span className={styles.errorMsg}>{error}</span>}

//           <div className={styles.otpContainer}>
//             {otp.map((val, idx) => (
//               <input
//                 key={idx}
//                 ref={(el) => { inputRefs.current[idx] = el }}
//                 className={styles.otpInput}
//                 type="text"
//                 maxLength={1}
//                 value={val}
//                 onChange={(e) => handleChange(idx, e.target.value)}
//               />
//             ))}
//           </div>

//           <button
//             className={styles.btnLogin}
//             onClick={handleVerifyOtp}
//             disabled={loading}
//           >
//             {loading ? "Đang xác thực..." : "Xác thực"}
//           </button>
//         </div>
//       )}

//       {/* STEP PASSWORD */}
//       {step === "password" && (
//         <div className={styles.formInput}>
//           <p>Nhập mật khẩu mới</p>

//           {error && <span className={styles.errorMsg}>{error}</span>}

//           <input
//             type="password"
//             placeholder="Mật khẩu mới"
//             value={newPass}
//             onChange={(e) => setNewPass(e.target.value)}
//           />

//           <input
//             type="password"
//             placeholder="Nhập lại mật khẩu"
//             value={confirmPass}
//             onChange={(e) => setConfirmPass(e.target.value)}
//           />

//           <button onClick={handleResetPassword}>
//             {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
//           </button>
//         </div>

//         // <div className={styles.formInput}>
//         //   <div
//         //     className={styles.inputGroup}
//         //     style={{ borderBottomColor: "#008fe5" }}
//         //   >
//         //     <LockIcon size={20} color="#555" strokeWidth={2} />
//         //     <input
//         //       className={styles.inputField}
//         //       type={showPass1 ? "text" : "password"}
//         //       placeholder="Vui lòng nhập mật khẩu"
//         //     />
//         //     <button
//         //       type="button"
//         //       className={styles.eyeButton}
//         //       onClick={() => setShowPass1(!showPass1)}
//         //     >
//         //       {showPass1 ? (
//         //         <Eye size={20} color="#555" strokeWidth={2} />
//         //       ) : (
//         //         <EyeOff size={20} color="#555" strokeWidth={2} />
//         //       )}
//         //     </button>
//         //   </div>

//         //   <div
//         //     className={styles.inputGroup}
//         //     style={{ borderBottomColor: "#008fe5" }}
//         //   >
//         //     <LockIcon size={20} color="#555" strokeWidth={2} />
//         //     <input
//         //       className={styles.inputField}
//         //       type={showPass2 ? "text" : "password"}
//         //       placeholder="Nhập lại mật khẩu"
//         //     />
//         //     <button
//         //       type="button"
//         //       className={styles.eyeButton}
//         //       onClick={() => setShowPass2(!showPass2)}
//         //     >
//         //       {showPass2 ? (
//         //         <Eye size={20} color="#555" strokeWidth={2} />
//         //       ) : (
//         //         <EyeOff size={20} color="#555" strokeWidth={2} />
//         //       )}
//         //     </button>
//         //   </div>

//         //   <button className={styles.btnLogin} onClick={handleResetPassword}>
//         //     {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
//         //   </button>


//         // </div>
//       )}
//     </div>
//   );
// };

import { useState, useRef } from "react";
import styles from "../../styles/module.auth/VerifyForm.module.css";
import {
  confirmResetOtpApi,
  resetPasswordApi,
} from "../../../../api/auth/ForgotPasswordApi";
import { Eye, EyeOff, LockIcon } from "lucide-react";
import { ErrorModal } from "@/app/components/ErrorModal";

export const VerifyPassword = ({
  phone,
  onSwitch,
}: {
  phone: string;
  onSwitch: () => void;
}) => {
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");

  const [step, setStep] = useState<"otp" | "password">("otp");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- OTP input ---
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("").trim();

    if (code.length < OTP_LENGTH) {
      setError("Nhập đủ OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await confirmResetOtpApi({
        source: phone,
        type: "SMS",
        otp: code,
      });

      if (res.data.status === 0) {
        const token = res.data.data?.resetToken;
        if (token) {
          setResetToken(token);
          setStep("password");
        } else {
          setError("Không lấy được resetToken");
        }
      } else {
        setError(res.data.message || "OTP không đúng");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP sai");
    } finally {
      setLoading(false);
    }
  };

  // --- Password reset ---
  const handleResetPassword = async () => {
    if (!newPass || !confirmPass) {
      setError("Nhập đầy đủ mật khẩu");
      return;
    }

    if (newPass !== confirmPass) {
      setError("Mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPasswordApi({ password: newPass }, resetToken);

      onSwitch(); // chuyển view sau khi đổi mật khẩu thành công
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.form}>
        {/* --- STEP OTP --- */}
        {step === "otp" && (
          <div className={styles.verifyForm}>
            <p>Gửi tin nhắn để nhận mã xác thực qua</p>
            <h1>{phone}</h1>

            {error && <span className={styles.errorMsg}>{error}</span>}

            <div className={styles.otpContainer}>
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; return void 0;  }}
                  className={styles.otpInput}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(idx, e.target.value)}
                />
              ))}
            </div>

            <button
              className={styles.btnLogin}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </div>
        )}

        {/* --- STEP PASSWORD --- */}
        {step === "password" && (
          <div className={styles.formInput}>
            {error && <span className={styles.errorMsg}>{error}</span>}

            <div className={styles.inputGroup} style={{ borderBottomColor: "#008fe5" }}>
              <LockIcon size={20} color="#555" strokeWidth={2} />
              <input
                className={styles.inputField}
                type={showPass1 ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <button type="button" className={styles.eyeButton} onClick={() => setShowPass1(!showPass1)}>
                {showPass1 ? <Eye size={20} color="#555" strokeWidth={2} /> : <EyeOff size={20} color="#555" strokeWidth={2} />}
              </button>
            </div>

            <div className={styles.inputGroup} style={{ borderBottomColor: "#008fe5" }}>
              <LockIcon size={20} color="#555" strokeWidth={2} />
              <input
                className={styles.inputField}
                type={showPass2 ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <button type="button" className={styles.eyeButton} onClick={() => setShowPass2(!showPass2)}>
                {showPass2 ? <Eye size={20} color="#555" strokeWidth={2} /> : <EyeOff size={20} color="#555" strokeWidth={2} />}
              </button>
            </div>

            <button className={styles.btnLogin} onClick={handleResetPassword}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        )}
      </div>

      {/* Error modal */}
      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};