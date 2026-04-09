// import { useState } from "react";
// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { LockIcon, SmartphoneIcon, User, Eye, EyeOff } from "lucide-react";
// import { registerApi } from "../../../../api/auth/RegisterFormApi";

// export const RegisterForm = ({
//   onSwitchLogin,
// }: {
//   onSwitchLogin: () => void;
// }) => {
//   // State quản lý ẩn/hiện cho 2 ô mật khẩu riêng biệt
//   const [showPass, setShowPass] = useState(false);
//   const [showConfirmPass, setShowConfirmPass] = useState(false);

//   return (
//     <>
//       <div className={styles.form}>
//         <div className={styles.headerBody}>
//           <p>Đăng ký tài khoản mới</p>
//         </div>
//         <div className={styles.formInput}>
//           {/* --- 1. HỌ VÀ TÊN --- */}
//           <div className={styles.inputGroup}>
//             <User size={20} color="#555" strokeWidth={2} />
//             <input
//               className={styles.inputField}
//               type="text"
//               placeholder="Họ và tên"
//             />
//           </div>

//           {/* --- 2. SỐ ĐIỆN THOẠI --- */}
//           <div className={styles.inputGroup}>
//             <SmartphoneIcon size={20} color="#555" strokeWidth={2} />
//             <input
//               className={styles.inputField}
//               type="text"
//               placeholder="Số điện thoại"
//             />
//           </div>

//           {/* --- 3. MẬT KHẨU --- */}
//           <div className={styles.inputGroup}>
//             <LockIcon size={20} color="#555" strokeWidth={2} />
//             <input
//               className={styles.inputField}
//               type={showPass ? "text" : "password"}
//               placeholder="Mật khẩu"
//             />
//             <button
//               type="button"
//               className={styles.eyeButton}
//               onClick={() => setShowPass(!showPass)}
//             >
//               {showPass ? (
//                 <Eye size={20} color="#555" strokeWidth={2} />
//               ) : (
//                 <EyeOff size={20} color="#555" strokeWidth={2} />
//               )}
//             </button>
//           </div>

//           {/* --- 4. NHẬP LẠI MẬT KHẨU --- */}
//           <div className={styles.inputGroup}>
//             <LockIcon size={20} color="#555" strokeWidth={2} />
//             <input
//               className={styles.inputField}
//               type={showConfirmPass ? "text" : "password"}
//               placeholder="Nhập lại mật khẩu"
//             />
//             <button
//               type="button"
//               className={styles.eyeButton}
//               onClick={() => setShowConfirmPass(!showConfirmPass)}
//             >
//               {showConfirmPass ? (
//                 <Eye size={20} color="#555" strokeWidth={2} />
//               ) : (
//                 <EyeOff size={20} color="#555" strokeWidth={2} />
//               )}
//             </button>
//           </div>

//           {/* --- BUTTON ĐĂNG KÝ --- */}
//           <button className={styles.btnLogin}>Đăng ký ngay</button>

//           {/* --- LINK QUAY VỀ ĐĂNG NHẬP --- */}
//           <div
//             style={{
//               display: "flex",
//               gap: "5px",
//               fontSize: "14px",
//               marginTop: "10px",
//             }}
//           >
//             <span style={{ color: "#666" }}>Đã có tài khoản?</span>
//             <span
//               className={styles.btnBackPass}
//               style={{
//                 cursor: "pointer",
//                 color: "var(--main-color)",
//                 fontWeight: "bold",
//               }}
//               onClick={onSwitchLogin}
//             >
//               Đăng nhập ngay
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, User, Eye, EyeOff } from "lucide-react";
import { registerApi } from "../../../../api/auth/RegisterFormApi";
import { ErrorModal } from "@/app/components/ErrorModal";

export const RegisterForm = ({
  onSwitchLogin,
  onSwitchVerify,
}: {
  onSwitchLogin: () => void;
  onSwitchVerify: (phone: string) => void;
}) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Lỗi input
  const [inputErrors, setInputErrors] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Lỗi modal
  const [error, setError] = useState("");

  const validateForm = () => {
    const errors: typeof inputErrors = {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };
    let valid = true;

    if (!fullName) {
      errors.fullName = "Họ và tên không được để trống";
      valid = false;
    }
    if (!phone) {
      errors.phone = "Số điện thoại không được để trống";
      valid = false;
    }
    if (!password) {
      errors.password = "Mật khẩu không được để trống";
      valid = false;
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp";
      errors.password = "Mật khẩu không khớp";
      valid = false;
    }

    setInputErrors(errors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await registerApi({ phone, password });
      onSwitchVerify(phone);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Đăng ký thất bại";
      setError(message); // bật modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.form}>
        <div className={styles.headerBody}>
          <p>Đăng ký tài khoản mới</p>
        </div>

        <div className={styles.formInput}>
          {/* Full Name */}
          {inputErrors.fullName && (
            <span style={{ color: "red", fontSize: 12, alignSelf: "flex-start" }}>
              {inputErrors.fullName}
            </span>
          )}
          <div className={styles.inputGroup}>
            <User size={20} color="#555" />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Phone */}
          {inputErrors.phone && (
            <span style={{ color: "red", fontSize: 12, alignSelf: "flex-start" }}>
              {inputErrors.phone}
            </span>
          )}
          <div className={styles.inputGroup}>
            <SmartphoneIcon size={20} color="#555" />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password */}
          {inputErrors.password && (
            <span style={{ color: "red", fontSize: 12, alignSelf: "flex-start" }}>
              {inputErrors.password}
            </span>
          )}
          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" />
            <input
              className={styles.inputField}
              type={showPass ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {inputErrors.password && (
            <span style={{ color: "red", fontSize: 12, alignSelf: "flex-start" }}>{inputErrors.password}</span>
          )}

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" />
            <input
              className={styles.inputField}
              type={showConfirmPass ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            >
              {showConfirmPass ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {inputErrors.confirmPassword && (
            <span style={{ color: "red", fontSize: 12, alignSelf: "flex-start" }}>{inputErrors.confirmPassword}</span>
          )}
          

          {/* Button */}
          <button
            className={styles.btnLogin}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
          </button>

          {/* Back to login */}
          <div style={{ display: "flex", gap: 5, fontSize: 14, marginTop: 10 }}>
            <span style={{ color: "#666" }}>Đã có tài khoản?</span>
            <span
              className={styles.btnBackPass}
              style={{ cursor: "pointer", color: "var(--main-color)", fontWeight: "bold" }}
              onClick={onSwitchLogin}
            >
              Đăng nhập ngay
            </span>
          </div>
        </div>
      </div>

      {/* Modal báo lỗi chung */}
      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};