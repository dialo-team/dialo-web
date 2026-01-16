import styles from "../../styles/module.auth/LoginForm.module.css";
import qrImage from "../../../assets/QR.png";
import { Menu } from "lucide-react";
import { useState } from "react";

export const LoginQR = ({ onSwitch }: { onSwitch: () => void }) => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <>
      <div className={styles.headerBody}>
        <p>Đăng nhập qua mã QR</p>
        <button
          className={styles.switchBtn}
          onClick={() => setIsClicked(!isClicked)}
        >
          <Menu size={20} color="#555" strokeWidth={2} />
        </button>
      </div>
      {isClicked && (
        <div className={styles.extraSection}>
          <button className={styles.btnLoginWithPass} onClick={onSwitch}>
            Đăng nhập với mật khẩu
          </button>
        </div>
      )}
      <div className={styles.codeQR}>
        <div className={styles.qr}>
          <img src={qrImage} alt="" className={styles.qrImage} />
        </div>
        <div className={styles.qrText}>
          <p className={styles.qrTextBlue}>Chỉ dùng để đăng nhập</p>
          <p>Diablo trên máy tính</p>
        </div>
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
