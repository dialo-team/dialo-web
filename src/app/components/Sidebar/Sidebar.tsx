import { useEffect, useState } from "react";
import { MessageCircle, Users, Settings } from "lucide-react";
import { SettingsPopup } from "./SettingsPopup";
import styles from "../../styles/components/Sidebar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../store/authStore";
import { getReceivedRequestsApi } from "../../../../api/social/friendInvite/getFriendInviteApi";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await getReceivedRequestsApi();
        const list = res?.data ?? res ?? [];
        setPendingRequests(Array.isArray(list) ? list.length : 0);
      } catch {}
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => {
      getReceivedRequestsApi()
        .then((res) => {
          const list = res?.data ?? res ?? [];
          setPendingRequests(Array.isArray(list) ? list.length : 0);
        })
        .catch(() => {});
    };
    window.addEventListener("friend-requests-updated", handler);
    return () => window.removeEventListener("friend-requests-updated", handler);
  }, []);

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
        <div className={styles.btnWrapper}>
          <button
            className={styles.sidebarBtn}
            onClick={() => navigate("/home/friendHome")}
          >
            <Users size={24} />
          </button>
          {pendingRequests > 0 && <span className={styles.friendDot} />}
        </div>
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
