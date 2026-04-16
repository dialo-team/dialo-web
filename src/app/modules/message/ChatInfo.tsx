

import { useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatInfo.module.css";
import { ChevronDown, ChevronUp, X, Edit3 } from "lucide-react";
import { RemarkFriendModal } from "../../modules/message/RemarkFriendModal";

type Props = {
  user: Friend;
  conversationId: string;
  onClose: () => void;
  onReload?: () => void;
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
          {collapsed ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {!collapsed &&
        data.slice(0, 3).map((i) => (
          <div key={i} className={styles.item}>
            {i}
          </div>
        ))}
    </div>
  );
};

export const ChatInfo = ({
  user,
  conversationId,
  onClose,
  onReload,
}: Props) => {
  const [openRemark, setOpenRemark] = useState(false);

  const images = ["img1", "img2", "img3", "img4"];
  const files = ["file1", "file2", "file3", "file4"];
  const links = ["link1", "link2", "link3", "link4"];

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER (giống bản cũ) */}
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Thông tin hội thoại</h3>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* USER (giống bản cũ layout) */}
          <div className={styles.top}>
            <img src={user.avatar} alt={user.name} />

            <div className={styles.usernameRow}>
              <div className={styles.username}>{user.name}</div>

              <Edit3
                size={14}
                className={styles.editIcon}
                onClick={() => setOpenRemark(true)}
              />
            </div>
          </div>

          {/* SECTIONS */}
          <InfoSection title="Ảnh/Video" data={images} />
          <InfoSection title="File" data={files} />
          <InfoSection title="Link" data={links} />

          {/* DELETE BUTTON (nếu bản cũ có) */}
          <div className={styles.deleteBox}>
            <button className={styles.deleteButton}>
              Xóa đoạn hội thoại
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openRemark && (
        <RemarkFriendModal
          open={openRemark}
          onClose={() => setOpenRemark(false)}
          conversationId={conversationId}
          currentName={user.name}
          onSaved={() => {
            setOpenRemark(false);
            onReload?.();
          }}
        />
      )}
    </>
  );
};