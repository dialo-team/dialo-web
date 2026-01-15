import styles from "../../styles/module.auth/LoginForm.module.css"
import { LockIcon, SmartphoneIcon } from "lucide-react";
import footerImg from "../../../assets/banner_icon.svg";

export const LoginPass = ({
  onSwitchQR,
  onSwitchForgot,
}: {
  onSwitchQR: () => void;
  onSwitchForgot: () => void;
}) => {
  return (
    <>
      <div className={styles.headerBody}>
        <p>Đăng nhập qua mật khẩu</p>
      </div>
      <div className={styles.formInput}>
        <div className={styles.inputGroup}>
          <SmartphoneIcon size={20} color="#555" strokeWidth={2} />

          <input
            className={styles.inputField}
            type="text"
            placeholder="Số điện thoại"
          />
        </div>
        <div className={styles.inputGroup}>
          <LockIcon size={20} color="#555" strokeWidth={2} />
          <input
            className={styles.inputField}
            type="text"
            placeholder="Mật khẩu"
          />
        </div>
        <button className={styles.btnLogin}>Đăng nhập với mật khẩu</button>
        <button className={styles.btnForgotPass} onClick={onSwitchForgot}>
          Quên mật khẩu
        </button>{" "}
        <button className={styles.btnBackQR} onClick={onSwitchQR}>
          Đăng nhập qua mã QR
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
