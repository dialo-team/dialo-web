import { useState } from "react";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { LockIcon, Eye, EyeOff } from "lucide-react";

export const VerifyPassword = ({ onSwitch }: { onSwitch: () => void }) => {
  const [showPassWord, setShowPassWord] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassWord(!showPassWord);
  };

  return (
    <>
      <div className={styles.verifyForm}>
        <p>Gửi tin nhắn để nhận mã xác thực</p>
        <h1>0900610041</h1>
        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5", width: "80%" }}
        >
          <input
            className={styles.verifyField}
            type="text"
            placeholder="Nhập mã xác thực"
          />
        </div>
        <span>
          Soạn tin nhắn với cú pháp "DIABLOPC" gửi đến 6020 (1000đ/tin) để nhận
          mã xác thực (Chỉ áp dụng cho mạng Viettel, Mobifone, Vinaphone,
          Vietnamobile, Gmobile)
        </span>
      </div>
      <div className={styles.formInput}>
        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5" }}
        >
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type={showPassWord ? "text" : "password"}
            placeholder="Vui lòng nhập mật khẩu"
          />
          <button
            type="button"
            className="eyeButton"
            onClick={togglePasswordVisibility}
          >
            {showPassWord ? (
              <Eye size={20} color="#555" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#555" strokeWidth={2} />
            )}
          </button>
        </div>
        <div
          className={styles.inputGroup}
          style={{ borderBottomColor: "#008fe5" }}
        >
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type={showPassWord ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
          />
          <button
            type="button"
            className="eyeButton"
            onClick={togglePasswordVisibility}
          >
            {showPassWord ? (
              <Eye size={20} color="#555" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#555" strokeWidth={2} />
            )}
          </button>
        </div>
        <button className={styles.btnLogin} onClick={onSwitch}>
          Tiếp tục
        </button>
      </div>
      {/* <div className={styles.footerBody}>
        <div className={styles.leftFooter}>
          <img src={footerImg} alt="" className={styles.footerImg} />
        </div>
        <div className={styles.midFooter}>
          <strong className={styles.textBold}>
            Nâng cao hiệu quả công việc với Diablo PC
          </strong>
          <p>
            Gửi file lớn lên đến 1 GB, chụp màn hình, gọi video và nhiều tiện
            ích hơn nữa
          </p>
        </div>
        <div className={styles.rightFooter}>
          <button className={styles.btn}>
            <p>Tải ngay</p>
          </button>
        </div>
      </div> */}
    </>
  );
};
