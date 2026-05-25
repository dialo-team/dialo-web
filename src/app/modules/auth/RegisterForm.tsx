import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, SmartphoneIcon, Eye, EyeOff } from "lucide-react";
import { registerApi } from "../../../../api/auth/RegisterFormApi";
import { ErrorModal } from "@/app/components/ErrorModal";

export const RegisterForm = ({
  onSwitchLogin,
  onSwitchVerify,
}: {
  onSwitchLogin: () => void;
  onSwitchVerify: (phone: string, password: string) => void;
}) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

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
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Tối thiểu 6 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt";
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
      await registerApi({ phone });
      onSwitchVerify(phone, password);
    } catch (err: any) {
      const status = err?.response?.status;
      const path = err?.response?.data?.path;
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message;
      const duplicateByMessage = /t[\u1ed3o]n t[\u1ea1a]i|\u0111[\u00e3a] \u0111[\u0103a]ng k[\u00fdy]|already exists|account exists/i.test(
        String(message || "")
      );
      const isDuplicatePhone =
        status === 409 ||
        path === "ACCOUNT_ALREADY_EXISTS" ||
        code === "ACCOUNT_ALREADY_EXISTS" ||
        duplicateByMessage;

      if (status === 500) {
        setError("Lỗi server");
      } else if (isDuplicatePhone) {
        setError("Số điện thoại đã được đăng ký");
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