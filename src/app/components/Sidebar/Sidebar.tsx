import { useState } from "react";
import { MessageCircle, Users, Settings } from "lucide-react";
import { SettingsPopup } from "./SettingsPopup";
import styles from "../../styles/components/Sidebar.module.css";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.sidebar}>
      
      <div className={styles.sidebarTop}>
        <img
          src="https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180"
          className={styles.avatar}
          alt="avatar"
        />

        <button className={styles.sidebarBtn}>
          <MessageCircle size={26} />
        </button>

        <button className={styles.sidebarBtn}>
          <Users size={26} />
        </button>
      </div>

      <div className={styles.sidebarBottom}>
        <button
          onClick={() => setOpen(!open)}
          className={styles.sidebarBtn}
        >
          <Settings size={26} />
        </button>
      </div>

      <SettingsPopup open={open} onClose={() => setOpen(false)} />
    </div>
  );
};