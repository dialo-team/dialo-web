// import styles from "../../styles/module.auth/LoginForm.module.css";
// import qrImage from "../../../assets/QR.png";
// import { Menu } from "lucide-react";
// import { useState } from "react";

// export const LoginQR = ({ onSwitchLogin }: { onSwitchLogin: () => void }) => {
//   const [isClicked, setIsClicked] = useState(false);

//   return (
//     <>
//       <div className={styles.form}>
//         <div className={styles.headerBody}>
//           <p>Đăng nhập qua mã QR</p>
//           <button
//             className={styles.switchBtn}
//             onClick={() => setIsClicked(!isClicked)}
//           >
//             <Menu size={20} color="#555" strokeWidth={2} />
//           </button>
//         </div>
//         {isClicked && (
//           <div className={styles.extraSection}>
//             <button className={styles.btnLoginWithPass} onClick={onSwitchLogin}>
//               Đăng nhập với mật khẩu
//             </button>
//           </div>
//         )}
//         <div className={styles.codeQR}>
//           <div className={styles.qr}>
//             <img src={qrImage} alt="" className={styles.qrImage} />
//           </div>
//           <div className={styles.qrText}>
//             <p className={styles.qrTextBlue}>Chỉ dùng để đăng nhập</p>
//             <p>Diablo trên máy tính</p>
//           </div>
//         </div>
        
//       </div>
//     </>
//   );
// };


// import styles from "../../styles/module.auth/LoginForm.module.css";
// import { Menu } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getQrChallenge } from "../../../../api/auth/qrApi";
// import { QRCodeCanvas } from "qrcode.react";

// export const LoginQR = ({ onSwitchLogin }: { onSwitchLogin: () => void }) => {
//   const [isClicked, setIsClicked] = useState(false);
//   const [qrContent, setQrContent] = useState("");
//   const [expiredIn, setExpiredIn] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let timer: any;

//     const fetchQR = async () => {
//       try {
//         setLoading(true);

//         const res = await getQrChallenge();
//         const data = res.data.data;

//         if (!data) return;

//         setQrContent(data.content);
//         setExpiredIn(data.expiredIn);

//         // Auto refresh khi hết hạn
//         timer = setTimeout(fetchQR, data.expiredIn);
//       } catch (err) {
//         console.error("Lỗi lấy QR:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQR();

//     // cleanup tránh memory leak
//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, []);

//   return (
//     <>
//       <div className={styles.form}>
//         {/* HEADER */}
//         <div className={styles.headerBody}>
//           <p>Đăng nhập qua mã QR</p>

//           <button
//             className={styles.switchBtn}
//             onClick={() => setIsClicked(!isClicked)}
//           >
//             <Menu size={20} color="#555" />
//           </button>
//         </div>

//         {/* SWITCH LOGIN */}
//         {isClicked && (
//           <div className={styles.extraSection}>
//             <button
//               className={styles.btnLoginWithPass}
//               onClick={onSwitchLogin}
//             >
//               Đăng nhập với mật khẩu
//             </button>
//           </div>
//         )}

//         {/* QR */}
//         <div className={styles.codeQR}>
//           <div className={styles.qr}>
//             {loading ? (
//               <p>Đang tạo mã QR...</p>
//             ) : qrContent ? (
//               <QRCodeCanvas value={qrContent} size={200} />
//             ) : (
//               <p>Không tạo được QR</p>
//             )}
//           </div>

//           <div className={styles.qrText}>
//             <p className={styles.qrTextBlue}>Chỉ dùng để đăng nhập</p>
//             <p>
//               {expiredIn > 0
//                 ? `Hết hạn sau ${Math.floor(expiredIn / 1000)}s`
//                 : ""}
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

import styles from "../../styles/module.auth/LoginForm.module.css";
import { Menu, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getQrChallenge } from "../../../../api/auth/qrApi";
import { QRCodeCanvas } from "qrcode.react";

export const LoginQR = ({ onSwitchLogin }: { onSwitchLogin: () => void }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [qrContent, setQrContent] = useState("");
  const [countdown, setCountdown] = useState(20);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  // lấy QR
  const fetchQR = async () => {
    try {
      setLoading(true);
      setExpired(false);

      const res = await getQrChallenge();
      const data = res?.data?.data;

      if (!data || !data.content) {
        console.error("QR lỗi:", res.data);
        return;
      }

      setQrContent(data.content);
      setCountdown(20);
    } catch (err) {
      console.error("Lỗi QR:", err);
    } finally {
      setLoading(false);
    }
  };

  // load lần đầu
  useEffect(() => {
    fetchQR();
  }, []);

  // countdown
  useEffect(() => {
    if (!qrContent || expired) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrContent, expired]);

  return (
    <div className={styles.form}>
      {/* HEADER */}
      <div className={styles.headerBody}>
        <p>Đăng nhập qua mã QR</p>

        <button
          className={styles.switchBtn}
          onClick={() => setIsClicked(!isClicked)}
        >
          <Menu size={20} color="#555" />
        </button>
      </div>

      {/* SWITCH LOGIN */}
      {isClicked && (
        <div className={styles.extraSection}>
          <button
            className={styles.btnLoginWithPass}
            onClick={onSwitchLogin}
          >
            Đăng nhập với mật khẩu
          </button>
        </div>
      )}

      {/* BODY */}
      <div className={styles.codeQR}>
        {/* QR */}
        <div className={styles.qr}>
          {loading ? (
            <p>Đang tạo QR...</p>
          ) : qrContent && !expired ? (
            <QRCodeCanvas value={qrContent} size={200} />
          ) : (
            <p style={{ color: "red" }}>Mã QR đã hết hạn</p>
          )}
        </div>

        {/* TEXT */}
        <div className={styles.qrText}>
          {expired ? (
            <button
              className={styles.btnLogin}
              onClick={fetchQR}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <RotateCcw size={16} />
              Lấy lại mã QR
            </button>
          ) : (
            <>
              <p className={styles.qrTextBlue}>Chỉ dùng để đăng nhập</p>
              <p>Hết hạn sau {countdown}s</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};