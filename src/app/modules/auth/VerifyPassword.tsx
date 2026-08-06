
import { useState, useRef } from "react";
import styles from "../../styles/module.auth/VerifyForm.module.css";
import styles2 from "../../styles/module.auth/LoginForm.module.css";
import {
  confirmResetOtpApi,
  resetPasswordApi,
} from "../../../../api/auth/ForgotPasswordApi";
import { Eye, EyeOff, LockIcon, ArrowLeft } from "lucide-react";
import { ErrorModal } from "@/app/components/ErrorModal";

export const VerifyPassword = ({
  phone,
  onSwitch,
  onBack,
}: {
  phone: string;
  onSwitch: () => void;
  onBack: () => void;
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

  const [success, setSuccess] = useState("");

  // --- OTP INPUT ---
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

  // 
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // PASTE OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;

    const newOtp = [...otp];

    for (let i = 0; i < OTP_LENGTH; i++) {
      newOtp[i] = pasteData[i] || "";
    }

    setOtp(newOtp);

    const lastIndex = Math.min(pasteData.length, OTP_LENGTH) - 1;
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("").trim();

    if (code.length < OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 số OTP");
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

      if (res.data.status === 200) {
        const token = res.data.data?.resetToken;
        if (token) {
          setResetToken(token);
          setStep("password");
        } else {
          setError("Không lấy được resetToken");
        }
      } else {
        if (res.data.status === 500) {
          setError("Lỗi server");
        } else {
          setError(res.data.message || "OTP không đúng");
        }
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      if (err?.response?.status === 500) {
        setError("Lỗi server");
      } else {
        setError(err?.response?.data?.message || "OTP không hợp lệ!");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // --- RESET PASSWORD ---
  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    try {
      setLoading(true);
      setError("");

      await resetPasswordApi({ password: newPass }, resetToken);
      setSuccess("Đổi mật khẩu thành công!");

      // onSwitch();
    } catch (err: any) {
      if (err?.response?.status === 500) {
        setError("Lỗi server");
      } else {
        setError(err?.response?.data?.message || "Lỗi đổi mật khẩu");
      }
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
      errors.newPass = "";
      errors.confirmPass = "Mật khẩu nhập lại không trùng khớp";
      valid = false;
    }

    setPassErrors(errors);
    return valid;
  };

  return (
    <>
      <div className={styles.form}>
        {/* NÚT QUAY LẠI */}
        {step === "otp" && (
          <button className={styles2.btnBackPass} onClick={onBack}>
            <ArrowLeft size={20} />
            <p>Quay lại</p>
          </button>
        )}

        {/* --- STEP OTP --- */}
        {step === "otp" && (
          <div className={styles.verifyForm}>
            <p>Gửi tin nhắn để nhận mã xác thực qua</p>
            <h1>{phone}</h1>

            {/* {error && <span className={styles.errorMsg}>{error}</span>} */}

            <div className={styles.otpContainer}>
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  className={styles.otpInput}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
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
                  <span style={{ color: "red", fontSize: 12, whiteSpace: "nowrap", marginLeft: "auto", }}>
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
                    setNewPass(e.target.value);
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
                  <span style={{ color: "red", fontSize: 12, marginLeft: "auto", whiteSpace: "nowrap" }}>
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
                    setConfirmPass(e.target.value);
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
      {success && (
        <ErrorModal
          message={success}
          onClose={() => {
            setSuccess("");
            onSwitch();
          }}
        />
      )}
    </>
  );
};