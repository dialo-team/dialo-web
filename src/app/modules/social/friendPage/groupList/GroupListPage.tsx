import { Search, MoreHorizontal } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useState } from "react";
import { LeaveGroupModal } from "./LeaveGroupModal";

export const GroupListPage = () => {
  const friends = [
    { id: 1, name: "TKMT", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" },
    { id: 2, name: "Di động", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" }
  ];

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openLeave, setOpenLeave] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  return (
    <>
      <div className={styles.header}>
        <h2>Danh sách nhóm</h2>
        <span>Nhóm (45)</span>
      </div>

      <div className={styles.contentBox} >
        <div className={styles.searchBoxRight}>
          <Search size={16} />
          <input placeholder="Tìm bạn bè..." />
        </div>

        <div className={styles.friendList}>
          {friends.map((f) => (
            <div key={f.id} className={styles.friendItem}>
              <div className={styles.friendInfo}>
                <img src={f.avatar} />
                <span>{f.name}</span>
              </div>

              <div className={styles.menuWrapper}>

                <MoreHorizontal
                  size={18}
                  className={styles.moreIcon}
                  onClick={() =>
                    setOpenMenu(openMenu === f.id ? null : f.id)
                  }
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

      {/* rời nhóm */}
      <LeaveGroupModal
        open={openLeave}
        onClose={() => setOpenLeave(false)}
        group={selectedGroup}
        onConfirm={() => {
          console.log("Đã rời nhóm:", selectedGroup.name);
          setOpenLeave(false);
        }}
      />
    </>
  );
};