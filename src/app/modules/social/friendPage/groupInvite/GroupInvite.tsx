import { ChevronLeft, ClipboardList } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/GroupInvite.module.css";

export const GroupInvite = () => {
  const navigate = useNavigate();
  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();
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

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }

    navigate(-1);
  };

  return (
    <>
      {/* <div className={styles.header}>
        <ArrowLeft size={16} />
        <UserPlus size={16} />
        <h2>Lời mời vào nhóm</h2>
      </div> */}

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
            <ClipboardList size={24} />
            <h2>Lời mời vào nhóm</h2>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Lời mời đã nhận được ({groupInvites.length})</p>

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
            {groupInvites.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className={styles.groupCard}
              >
                <div className={styles.groupCardHeader}>
                  <img
                    className={styles.groupAvatar}
                    src={item.avatar}
                    alt={item.name}
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
      </div>
    </>
  );
};
