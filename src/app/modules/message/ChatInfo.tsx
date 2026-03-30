import { useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatInfo.module.css";
import { ChevronDown, ChevronUp, X } from "lucide-react";

type ChatInfoProps = {
  user: Friend;
  onClose?: () => void;
};

type InfoSectionProps = {
  title: string;
  data: string[];
};

const InfoSection = ({ title, data }: InfoSectionProps) => {
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

export const ChatInfo = ({ user, onClose }: ChatInfoProps) => {
  const images = ["img1", "img2", "img3", "img4"];
  const files = ["file1", "file2", "file3", "file4"];
  const links = ["link1", "link2", "link3", "link4"];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Thông tin hội thoại</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng thông tin hội thoại"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.top}>
          <img src={user.avatar} alt={user.name} />
          <div className={styles.username}>{user.name}</div>
        </div>

        <InfoSection title="Ảnh/Video" data={images} />
        <InfoSection title="File" data={files} />
        <InfoSection title="Link" data={links} />

        <div className={styles.deleteBox}>
          <button className={styles.deleteButton}>Xóa đoạn hội thoại</button>
        </div>
      </div>
    </div>
  );
};