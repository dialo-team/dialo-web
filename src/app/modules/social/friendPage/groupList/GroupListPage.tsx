import { Search, MoreHorizontal } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";

export const GroupListPage = () => {
  const friends = [
    { id: 1, name: "TKMT", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" },
    { id: 2, name: "Di động", avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180" }
  ];

  return (
    <>
      <div className={styles.header}>
        <h2>Danh sách nhóm</h2>
        <span>Nhóm (45)</span>
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
              <MoreHorizontal size={18} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};