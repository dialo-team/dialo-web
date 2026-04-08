// import { useState } from "react";
// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { LockIcon, SmartphoneIcon, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export const LoginPass = ({
//   onSwitchQR,
//   onSwitchForgot,
//   onSwitchRegister,
// }: {
//   onSwitchQR: () => void;
//   onSwitchForgot: () => void;
//   onSwitchRegister: () => void;
// }) => {
//   const [showPassWord, setShowPassWord] = useState(false);
//   const togglePasswordVisibility = () => {
//     setShowPassWord(!showPassWord);
//   };

//   const navigate = useNavigate();
//   const handleLogin = () => {
//     navigate("/home");
//   };

//   return (
//     <>
//       <div className={styles.form}>
//         <div className={styles.headerBody}>
//           <p>Đăng nhập qua mật khẩu</p>
//         </div>
//         <div className={styles.formInput}>
//           <h3 className={styles.inputLabel}>Tài khoản</h3>
//           <div className={styles.inputGroup}>
//             <SmartphoneIcon size={20} color="#555" strokeWidth={2} />

//             <input
//               className={styles.inputField}
//               type="text"
//               placeholder="Số điện thoại"
//             />
//           </div>
//           <h3 className={styles.inputLabel}>Mật khẩu</h3>
//           <div className={styles.inputGroup}>
//             <LockIcon size={20} color="#555" strokeWidth={2} />
//             <input
//               className={styles.inputField}
//               type={showPassWord ? "text" : "password"}
//               placeholder="Mật khẩu"
//             />
//             <button
//               type="button"
//               className={styles.eyeButton}
//               onClick={togglePasswordVisibility}
//             >
//               {showPassWord ? (
//                 <Eye size={20} color="#555" strokeWidth={2} />
//               ) : (
//                 <EyeOff size={20} color="#555" strokeWidth={2} />
//               )}
//             </button>
//           </div>
//           <button className={styles.btnLogin} onClick={handleLogin}>
//             Đăng nhập với mật khẩu
//           </button>
//           <button className={styles.btnForgotPass} onClick={onSwitchForgot}>
//             Quên mật khẩu
//           </button>{" "}
//           <button className={styles.btnForgotPass} onClick={onSwitchRegister}>
//             Đăng ký tài khoản
//           </button>
//           <button className={styles.btnBackQR} onClick={onSwitchQR}>
//             Đăng nhập qua mã QR
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };
import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, Eye, EyeOff } from "lucide-react";
import { loginPassApi } from "../../../../api/auth/LoginPassApi";

export const LoginPass = ({
  onSwitchQR,
  onSwitchForgot,
  onSwitchRegister,
  onSwitchVerify,
}: {
  onSwitchQR: () => void;
  onSwitchForgot: () => void;
  onSwitchRegister: () => void;
  onSwitchVerify: (phone: string) => void;
}) => {
  const [showPassWord, setShowPassWord] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      await loginPassApi({
        phone,
        password,
      });

      alert("Nhập OTP để tiếp tục");
      onSwitchVerify(phone);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.headerBody}>
        <p>Đăng nhập qua mật khẩu</p>
      </div>

      <div className={styles.formInput}>
        {/* Label */}
        <h3 className={styles.inputLabel}>Tài khoản</h3>
        <div className={styles.inputGroup}>
          <SmartphoneIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type="text"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Label */}
        <h3 className={styles.inputLabel}>Mật khẩu</h3>
        <div className={styles.inputGroup}>
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type={showPassWord ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassWord(!showPassWord)}
          >
            {showPassWord ? (
              <Eye size={20} color="#555" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#555" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Buttons giữ nguyên style cũ */}
        <button
          className={styles.btnLogin}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập với mật khẩu"}
        </button>

        <button
          className={styles.btnForgotPass}
          onClick={onSwitchForgot}
        >
          Quên mật khẩu
        </button>

        <button
          className={styles.btnForgotPass}
          onClick={onSwitchRegister}
        >
          Đăng ký tài khoản
        </button>

        <button
          className={styles.btnBackQR}
          onClick={onSwitchQR}
        >
          Đăng nhập qua mã QR
        </button>
      </div>
    </div>
  );
};