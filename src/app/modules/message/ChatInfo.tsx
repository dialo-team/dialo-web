import { useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatInfo.module.css";
import { ChevronDown, ChevronUp } from "lucide-react"; // import icon

export const ChatInfo = ({ user }: { user: Friend }) => {
  const images = ["img1", "img2", "img3", "img4"];
  const files = ["file1", "file2", "file3", "file4"];
  const links = ["link1", "link2", "link3", "link4"];

  const render = (title: string, data: string[]) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>{title}</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {!collapsed &&
          data.slice(0, 3).map((i) => (
            <div key={i} className={styles.item}>
              {i}
            </div>
          ))}

        {!collapsed && data.length > 3 && (
          <button className={styles.showMore}>Xem thêm</button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Thông tin hội thoại</h3>

      <div className={styles.top}>
        <img src={user.avatar} alt={user.name} />
        <div className={styles.username}>{user.name}</div>
      </div>

      {render("Ảnh/Video", images)}
      {render("File", files)}
      {render("Link", links)}

      <div className={styles.deleteBox}>
        <button className={styles.deleteButton}>Xóa đoạn hội thoại</button>
      </div>
    </div>
  );
};