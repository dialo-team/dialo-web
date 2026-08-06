import { Search, MoreHorizontal, ChevronLeft, Users } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LeaveGroupModal } from "./LeaveGroupModal";

export const GroupListPage = () => {
  const navigate = useNavigate();
  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();
  const friends = [
    {
      id: 1,
      name: "TKMT",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "Di động",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
  ];

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openLeave, setOpenLeave] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const totalGroups = friends.length;

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }

    navigate(-1);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            type="button"
            aria-label="Quay lại"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.headerTitle}>
            <Users size={24} />
            <h2>Danh sách nhóm</h2>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Nhóm ({totalGroups})</div>

        <div className={styles.contentBox}>
          <div className={styles.searchBoxRight}>
            <Search size={16} />
            <input placeholder="Tìm nhóm..." />
          </div>

          <div className={styles.friendList}>
            {friends.map((f) => (
              <div key={f.id} className={styles.friendItem}>
                <div className={styles.friendInfo}>
                  <img src={f.avatar} alt={f.name} />
                  <span>{f.name}</span>
                </div>

                <div className={styles.menuWrapper}>
                  <MoreHorizontal
                    size={18}
                    className={styles.moreIcon}
                    onClick={() => setOpenMenu(openMenu === f.id ? null : f.id)}
                  />

                  {openMenu === f.id && (
                    <div className={styles.actionMenu}>
                      <div
                        className={styles.menuOverlay}
                        onClick={() => setOpenMenu(null)}
                      />

                      <div
                        className={`${styles.menuAction} ${styles.danger}`}
                        onClick={() => {
                          setSelectedGroup(f);
                          setOpenLeave(true);
                          setOpenMenu(null);
                        }}
                      >
                        Rời nhóm
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* rời nhóm */}
      <LeaveGroupModal
        open={openLeave}
        onClose={() => setOpenLeave(false)}
        group={selectedGroup}
        onConfirm={() => setOpenLeave(false)}
      />
    </>
  );
};
