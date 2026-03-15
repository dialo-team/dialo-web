import { Search, MoreHorizontal } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useState } from "react";
import { FriendInfoModal } from "./FriendInfoModal";

export const FriendListPage = () => {
  const friends = [
    { id: 1, name: "Nguyễn Văn A", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" },
    { id: 2, name: "Trần Thị B", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" },
    { id: 3, name: "Nguyễn Thị c", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" },
    { id: 4, name: "Trần Thị D", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" }
  ];
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  return (
    <>
      <div className={styles.header}>
        <h2>Danh sách bạn bè</h2>
        <span>Bạn bè (45)</span>
      </div>

      <div className={styles.contentBox}>
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
  className={styles.menuAction}
  onClick={() => {
    setSelectedFriend(f);
    setOpenInfo(true);
    setOpenMenu(null);
  }}
>
  Xem thông tin
</div>

                    <div className={styles.menuAction}>Đổi tên gợi ý</div>
                    <div className={styles.menuAction}>Chặn người này</div>
                    <div className={`${styles.menuAction} ${styles.danger}`}>
                      Xóa bạn
                    </div>
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      </div>

      {/* bật modal account */}
      <FriendInfoModal
  open={openInfo}
  onClose={() => setOpenInfo(false)}
  friend={selectedFriend}
/>
    </>
  );
};