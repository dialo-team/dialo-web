import logoDiablo from "../../../assets/logo-diablo.svg";
import styles from "./LoginForm.module.css";
import { useState } from "react";
import { LoginQR } from "./LoginQR";
import { LoginPass } from "./LoginPass";
import { LoginForgotPass } from "./LoginForgotPass";
export const LoginForm = () => {
  const [currentView, setCurrentView] = useState("qr");

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logoDiablo} alt="" className={styles.logo} />
        </div>
        <h2>
          Đăng nhập tài khoản Diablo
          <br />
          để kết nối với ứng dụng Diablo Web
        </h2>
      </div>
      <div className={styles.body}>
        {currentView === "qr" && (
          <LoginQR onSwitch={() => setCurrentView("pass")} />
        )}

        {currentView === "pass" && (
          <LoginPass
            onSwitchQR={() => setCurrentView("qr")}
            onSwitchForgot={() => setCurrentView("forgot")}
          />
        )}

        {currentView === "forgot" && (
          <LoginForgotPass onBack={() => setCurrentView("pass")} />
        )}
      </div>
      <div className={styles.footer}>
        <a href="">Tiếng Việt</a>
        <a href="">English</a>
      </div>
    </div>
  );
};
