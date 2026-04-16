import { useState } from "react";
import { MessageCircle, Users, Settings } from "lucide-react";
import { SettingsPopup } from "./SettingsPopup";
import styles from "../../styles/components/Sidebar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../store/authStore";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <img
          src={
            user?.avatar ||
            "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180"
          }
          className={styles.avatar}
          alt="avatar"
        />

        {/* nút chat */}
        <button
          className={styles.sidebarBtn}
          onClick={() => navigate("/home/chat")}
        >
          <MessageCircle size={24} />
        </button>

        {/* bạn bè */}
        <button
          className={styles.sidebarBtn}
          onClick={() => navigate("/home/friendHome")}
        >
          <Users size={24} />
        </button>
      </div>

      <div className={styles.sidebarBottom}>
        <button onClick={() => setOpen(!open)} className={styles.sidebarBtn}>
          <Settings size={24} />
        </button>
      </div>

      <SettingsPopup open={open} onClose={() => setOpen(false)} />
    </div>
  );
};
