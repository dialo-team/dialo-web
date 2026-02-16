//npm install three @react-three/fiber @react-three/drei lucide-react simplex-noise
//chay cai o tren de chay <3

import logoDiablo from "../../../assets/logo-diablo.svg";
import styles from "../../styles/module.auth/LoginForm.module.css";
import { useState } from "react";
import { LoginQR } from "./LoginQR";
import { LoginPass } from "./LoginPass";
import { LoginForgotPass } from "./LoginForgotPass";
import { VerifyPassword } from "./VerifyPassword";
import Decoration from "./Decoration";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { RegisterForm } from "@/app/modules/auth/RegisterForm";
export const LoginForm = () => {
  const [currentView, setCurrentView] = useState("pass");

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.canvasLayer}>
            <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[-5, 5, 0]}
                intensity={3}
                color="#ffffff"
              />
              {/* <directionalLight
                position={[0, -5, 5]}
                intensity={3}
                color="#ffffff"
              /> */}
              {/* <spotLight
                position={[-10, 10, 5]}
                angle={0.5}
                penumbra={1}
                intensity={5}
                color="#ffffff"
                distance={30}
              />
              <pointLight
                position={[10, -5, 5]}
                intensity={3}
                color="#FF8040"
              /> */}

              <group position={[3.5, 3, 0]} scale={1.5}>
                <Decoration />
              </group>
              <group position={[-3.5, -3, 0]} scale={1.2}>
                <Decoration />
              </group>

              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
          <div className={styles.decorText}>
            <h1>
              Xóa nhòa <br />
              <span style={{ fontFamily: "Space Grotesk", opacity: 0.8 }}>
                mọi khoảng cách
              </span>
            </h1>

            <p>
              Trải nghiệm sự kết nối chân thực chưa từng có, nơi công nghệ trí
              tuệ nhân tạo đưa chúng ta đến gần nhau hơn.
            </p>
          </div>
        </div>
        <div className={styles.bodyRight}>
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <img src={logoDiablo} alt="" className={styles.logo} />
            </div>
            <h2>
              Đăng nhập tài khoản Dialo
              <br />
              để kết nối với ứng dụng Dialo Web
            </h2>
          </div>
          {currentView === "qr" && (
            <LoginQR onSwitchLogin={() => setCurrentView("pass")} />
          )}

          {currentView === "pass" && (
            <LoginPass
              onSwitchQR={() => setCurrentView("qr")}
              onSwitchForgot={() => setCurrentView("forgot")}
              onSwitchRegister={() => setCurrentView("register")}
            />
          )}

          {currentView === "register" && (
            <RegisterForm onSwitchLogin={() => setCurrentView("pass")} />
          )}
          {currentView === "forgot" && (
            <LoginForgotPass
              onBack={() => setCurrentView("pass")}
              onVerify={() => setCurrentView("verify")}
            />
          )}
          {currentView === "verify" && (
            <VerifyPassword onSwitch={() => setCurrentView("pass")} />
          )}
        </div>
      </div>
    </div>
  );
};
