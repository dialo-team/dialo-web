import { useState, useRef } from "react";
import styles from "../../styles/module.auth/VerifyForm.module.css";
import styles2 from "../../styles/module.auth/LoginForm.module.css";
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

  const [passErrors, setPassErrors] = useState({
    newPass: "",
    confirmPass: "",
  });

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
    if (!validatePassword()) return;

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


  const validatePassword = () => {
    const errors = {
      newPass: "",
      confirmPass: "",
    };

    let valid = true;

    if (!newPass) {
      errors.newPass = "Không được để trống";
      valid = false;
    }

    if (!confirmPass) {
      errors.confirmPass = "Không được để trống";
      valid = false;
    }

    if (newPass && confirmPass && newPass !== confirmPass) {
      errors.newPass = "Không trùng khớp";
      errors.confirmPass = "Không trùng khớp";
      valid = false;
    }

    setPassErrors(errors);
    return valid;
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
                  ref={(el) => { inputRefs.current[idx] = el; return void 0; }}
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
          <div className={styles2.formInput}>

            {/* NEW PASSWORD */}
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className={styles2.inputLabel} style={{ minWidth: 140 }}>
                  Mật khẩu mới
                </h3>

                {passErrors.newPass && (
                  <span style={{ color: "red", fontSize: 12, flex: 1, whiteSpace: "nowrap", }}>
                    {passErrors.newPass}
                  </span>
                )}
              </div>

              <div className={styles2.inputGroup}>
                <LockIcon size={20} color="#555" strokeWidth={2} />
                <input
                  className={styles2.inputField}
                  type={showPass1 ? "text" : "password"}
                  placeholder="Vui lòng nhập mật khẩu"
                  value={newPass}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPass(value);

                    setPassErrors((prev) => ({
                      ...prev,
                      newPass: "",
                      confirmPass:
                        confirmPass && value !== confirmPass
                          ? "Mật khẩu không khớp"
                          : "",
                    }));
                  }}
                />

                <button
                  type="button"
                  className={styles2.eyeButton}
                  onClick={() => setShowPass1(!showPass1)}
                >
                  {showPass1 ? (
                    <Eye size={20} color="#555" />
                  ) : (
                    <EyeOff size={20} color="#555" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className={styles2.inputLabel} style={{ minWidth: 140 }}>
                  Nhập lại mật khẩu
                </h3>

                {passErrors.confirmPass && (
                  <span style={{ color: "red", fontSize: 12, flex: 1, marginLeft: "auto" }}>
                    {passErrors.confirmPass}
                  </span>
                )}
              </div>

              <div className={styles2.inputGroup}>
                <LockIcon size={20} color="#555" strokeWidth={2} />

                <input
                  className={styles2.inputField}
                  type={showPass2 ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPass}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPass(value);

                    setPassErrors((prev) => ({
                      ...prev,
                      confirmPass:
                        newPass && value !== newPass
                          ? "Mật khẩu không khớp"
                          : "",
                    }));
                  }}
                />

                <button
                  type="button"
                  className={styles2.eyeButton}
                  onClick={() => setShowPass2(!showPass2)}
                >
                  {showPass2 ? (
                    <Eye size={20} color="#555" />
                  ) : (
                    <EyeOff size={20} color="#555" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button className={styles2.btnLogin} onClick={handleResetPassword}>
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