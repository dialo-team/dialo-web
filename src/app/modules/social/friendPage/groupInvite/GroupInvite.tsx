import { ArrowLeft, ClipboardList, UserPlus, UserPlus2 } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/GroupInvite.module.css";

export const GroupInvite = () => {
  const groupInvites = [
    {
      id: 1,
      name: "Hội Lập Trình Viên Việt Nam",
      meta: "Nhóm công khai • 128.000 thành viên",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "ReactJS Việt Nam",
      meta: "Nhóm công khai • 45.200 thành viên",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 3,
      name: "Cộng đồng Designer UX/UI",
      meta: "Nhóm riêng tư • 23.500 thành viên",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 4,
      name: "Khoá học TypeScript nâng cao",
      meta: "Nhóm riêng tư • 5.800 thành viên",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
  ];

  return (
    <>
      {/* <div className={styles.header}>
        <ArrowLeft size={16} />
        <UserPlus size={16} />
        <h2>Lời mời vào nhóm</h2>
      </div> */}

      <div className={styles.header}>
        <h2>Lời mời vào nhóm</h2>
        <span>Lời mời đã nhận được (6)</span>
      </div>
      

      <div className={styles.mainContent}>
        {/* <p className={styles.sectionHeader}>
          Lời mời đã nhận được ({groupInvites.length})
        </p> */}

        {groupInvites.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ClipboardList size={48} color="#b0b8d1" />
            </div>
            <p className={styles.emptyTitle}>
              Không có lời mời vào nhóm và cộng đồng
            </p>
            <p className={styles.emptySubText}>
              Khi nào tôi nhận được lời mời?{" "}
              <span className={styles.learnMore}>Tìm hiểu thêm</span>
            </p>
          </div>
        ) : (
          <ul className={styles.groupList}>
            {groupInvites.map((item) => (
              <li key={item.id} className={styles.groupCard}>
                <div className={styles.groupCardHeader}>
                  <img
                    className={styles.groupAvatar}
                    src={item.avatar}
                    alt=""
                  />
                  <div className={styles.groupInfo}>
                    <span className={styles.groupName}>{item.name}</span>
                    <span className={styles.groupMeta}>{item.meta}</span>
                  </div>
                </div>
                <div className={styles.groupActions}>
                  <button className={styles.btn}>Từ chối</button>
                  <button className={styles.primaryBtn}>Tham gia</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
