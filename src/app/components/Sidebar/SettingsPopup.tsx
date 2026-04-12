import { motion, AnimatePresence } from "framer-motion";
import { User, KeyRound, LogOut } from "lucide-react";
import styles from "../../styles/components/SettingsPopup.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AccountModal } from "@/app/modules/myAccount/AccountModal";
import { ChangePasswordModal } from "@/app/modules/myAccount/ChangePasswordModal";
import { signoutApi } from "../../../../api/auth/LoginPassApi";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  danger?: boolean;
  onClick?: () => void;
}

export const SettingsPopup = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [openAccount, setOpenAccount] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.warn("Missing refreshToken, skip signout API call");
      return;
    }

    try {
      // Gọi API signout của BE (Bearer token tự được gắn bởi axios interceptor)
      const res = await signoutApi({ refreshToken });
      console.log("Signout success:", res.data);

      // Chỉ xóa token và điều hướng khi signout thành công
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (err) {
      // Nếu signout fail thì giữ nguyên màn hiện tại
      console.error("Signout API error:", err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={styles.popup}
          >
            <div className={styles.menu}>
              <MenuItem
                icon={<User size={18} />}
                text="Thông tin tài khoản"
                onClick={() => {
                  setOpenAccount(true);
                  onClose(); // tắt settings
                }}
              />
              <MenuItem
                icon={<KeyRound size={18} />}
                text="Đổi mật khẩu"
                onClick={() => {
                  setOpenChangePass(true);
                  onClose(); // tắt settings
                }}
              />

              <div className={styles.divider}></div>

              <MenuItem
                icon={<LogOut size={18} />}
                text="Đăng xuất"
                danger
                onClick={handleLogout}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal thông tin */}
      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} />

      {/* Modal đổi mật khẩu */}
      <ChangePasswordModal
        open={openChangePass}
        onClose={() => setOpenChangePass(false)}
      />
    </>
  );
};

const MenuItem = ({ icon, text, danger, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`${styles.menuItem} ${danger ? styles.danger : styles.normal}`}
  >
    <span className={styles.icon}>{icon}</span>
    {text}
  </button>
);
