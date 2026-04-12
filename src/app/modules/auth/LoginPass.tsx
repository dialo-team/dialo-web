import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, Eye, EyeOff } from "lucide-react";
import { loginPassApi } from "../../../../api/auth/LoginPassApi";
import { ErrorModal } from "@/app/components/ErrorModal";

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
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });

  // VALIDATE
  const validate = () => {
    const newErrors = { phone: "", password: "" };
    let valid = true;

    if (!phone) {
      newErrors.phone = "Không được để trống";
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phải 10 số";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Không được để trống";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await loginPassApi({ phone, password });
      onSwitchVerify(phone);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        setError("Số điện thoại hoặc mật khẩu không đúng");
      } else {
        setError(err?.response?.data?.message || "Đăng nhập thất bại");
      }

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
        {/* PHONE */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className={styles.inputLabel}>Số điện thoại</h3>
            {errors.phone && (
              <span
                style={{
                  color: "red",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {errors.phone}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <SmartphoneIcon size={20} color="#555" />
            <input
              className={styles.inputField}
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhone(value);
                setErrors((prev) => ({ ...prev, phone: "" })); // 🔥 xoá lỗi ngay
              }}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className={styles.inputLabel}>Mật khẩu</h3>
            {errors.password && (
              <span
                style={{
                  color: "red",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <LockIcon size={20} color="#555" />
            <input
              className={styles.inputField}
              type={showPassWord ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassWord(!showPassWord)}
            >
              {showPassWord ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <button
          className={styles.btnLogin}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập với mật khẩu"}
        </button>

        <button className={styles.btnForgotPass} onClick={onSwitchForgot}>
          Quên mật khẩu
        </button>

        <button className={styles.btnForgotPass} onClick={onSwitchRegister}>
          Đăng ký tài khoản
        </button>

        <button className={styles.btnBackQR} onClick={onSwitchQR}>
          Đăng nhập qua mã QR
        </button>
      </div>

      <ErrorModal message={error} onClose={() => setError("")} />
    </div>
  );
};
