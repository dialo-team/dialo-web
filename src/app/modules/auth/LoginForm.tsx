import logoDiablo from "../../../assets/logo-diablo.svg";
import styles from "../../styles/module.auth/LoginForm.module.css"
import { useState } from "react";
import { LoginQR } from "./LoginQR";
import { LoginPass } from "./LoginPass";
import { LoginForgotPass } from "./LoginForgotPass";
export const LoginForm = () => {
  const [currentView, setCurrentView] = useState("pass");

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
    </div>
  );
};
