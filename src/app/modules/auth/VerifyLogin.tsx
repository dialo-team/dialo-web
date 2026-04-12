
import { useState, useRef } from "react";
import styles from "../../styles/module.auth/VerifyForm.module.css";
import styles2 from "../../styles/module.auth/LoginForm.module.css";
import { verifyLoginOtpApi } from "../../../../api/auth/LoginPassApi";
import { ErrorModal } from "@/app/components/ErrorModal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const VerifyLogin = ({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

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

        navigate("/home"); 
      } else {
        setError( "OTP không hợp lệ!");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 500) {
          setError("OTP không hợp lệ!");
          setOtp(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
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
        {/* NÚT QUAY LẠI */}
        <button className={styles2.btnBackPass} onClick={onBack}>
          <ArrowLeft size={20} />
          <p>Quay lại</p>
        </button>

        <div className={styles.verifyForm}>
          <p>Gửi tin nhắn để nhận mã xác thực qua</p>
          <h1>{phone}</h1>

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
                onPaste={handlePaste} 
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