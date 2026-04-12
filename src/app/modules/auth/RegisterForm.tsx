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

  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // VALIDATE 
  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Không được để trống";
      valid = false;
    }

    //  báo lỗi cả 2 ô
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.password = "";
      newErrors.confirmPassword = "Mật khẩu nhập lại không trùng khớp";
      valid = false;
    }

    setErrors({ ...newErrors });
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await registerApi({ phone, password });
      onSwitchVerify(phone);
    } catch (err: any) {
      const status = err?.response?.status;
      const path = err?.response?.data?.path;
      const message = err?.response?.data?.message;

      if (status === 409 && path === "ACCOUNT_ALREADY_EXISTS") {
        setError("Tài khoản đã tồn tại");
      } else {
        setError(message || "Đăng ký thất bại");
      }
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

          {/* PHONE */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 className={styles.inputLabel} style={{ minWidth: 140 }}>
                Số điện thoại
              </h3>
              {errors.phone && (
                <span
                  style={{
                    color: "red",
                    fontSize: 12,
                    flex: 1,
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
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 className={styles.inputLabel} style={{ minWidth: 140 }}>
                Mật khẩu
              </h3>
              {errors.password && (
                <span
                  style={{
                    color: "red",
                    fontSize: 12,
                    flex: 1,
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
                type={showPass ? "text" : "password"}
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
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 className={styles.inputLabel} style={{ minWidth: 140 }}>
                Nhập lại mật khẩu
              </h3>
              {errors.confirmPassword && (
                <span
                  style={{
                    color: "red",
                    fontSize: 12,
                    flex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <LockIcon size={20} color="#555" />
              <input
                className={styles.inputField}
                type={showConfirmPass ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));
                }}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            className={styles.btnLogin}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
          </button>

          {/* BACK LOGIN */}
          <div style={{ display: "flex", gap: 5, fontSize: 14, marginTop: 10 }}>
            <span style={{ color: "#666" }}>Đã có tài khoản?</span>
            <span
              className={styles.btnBackPass}
              style={{
                cursor: "pointer",
                color: "var(--main-color)",
                fontWeight: "bold",
              }}
              onClick={onSwitchLogin}
            >
              Đăng nhập ngay
            </span>
          </div>
        </div>
      </div>

      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};