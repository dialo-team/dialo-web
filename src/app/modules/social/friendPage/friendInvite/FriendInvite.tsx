import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/FrientdInvite.module.css";

export const FriendInvite = () => {
  const [showAllSent, setShowAllSent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const invited = [
    {
      id: 1,
      name: "TKMT",
      date: "26/02",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      message:
        "hoansdoajsodajsdoajsdoasjdoasjdoadoajdoasjdoashoansdoajsodajsdoajsdoasjdoasjdoad",
    },
    {
      id: 2,
      name: "TKMT",
      date: "26/02",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      message: "xin chao",
    },
    {
      id: 3,
      name: "TKMT",
      date: "26/02",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      message: "xin chao",
    },
  ];

  const sentInvites = [
    {
      id: 1,
      name: "Trần Hữu Thắng",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "Công Danh",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 3,
      name: "Thang Nguyen",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 1,
      name: "Trần Hữu Thắng",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "Công Danh",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 3,
      name: "Thang Nguyen",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
  ];

  const suggestions = [
    {
      id: 1,
      name: "Nguyễn Trần Long",
      mutual: 6,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "Lê Trần Gia Huy",
      mutual: 5,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 3,
      name: "Thanh Thảo",
      mutual: 4,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 4,
      name: "An",
      mutual: 2,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 5,
      name: "Khánh Duy",
      mutual: 3,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 6,
      name: "Nguyễn Hoàng Hà",
      mutual: 3,
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
  ];

  const visibleSent = showAllSent ? sentInvites : sentInvites.slice(0, 3);

  return (
    <>
      <div className={styles.header}>
        <h2>Lời mời kết bạn</h2>
      </div>

      {/* <div className={styles.header}>
        <ArrowLeft size={16} />
        <UserPlus size={16} />
        <h2>Lời mời kết bạn</h2>
      </div> */}

      <div className={styles.mainInvite}>
        {/* Lời mời đã nhận */}
        <p className={styles.sectionHeader}>
          Lời mời đã nhận được ({invited.length})
        </p>
        {invited.length === 0 ? (
          <p className={styles.emptyText}>Không có lời mời kết bạn</p>
        ) : (
          <ul className={styles.invitedList}>
            {invited.map((item) => (
              <li key={item.id} className={styles.invitedCard}>
                <div className={styles.invitedHeader}>
                  <img
                    className={styles.invitedAvatar}
                    src={item.avatar}
                    alt=""
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <span className={styles.invitedName}>{item.name}</span>
                    <span className={styles.invitedDate}>{item.date}</span>
                  </div>
                  <div className={styles.messageIcon}>
                    <MessageCircle />
                  </div>
                </div>
                <p className={styles.invitedMessage}>{item.message}</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button className={styles.btn}>Từ chối</button>
                  <button className={styles.primaryBtn}>Đồng ý</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Lời mời đã gửi */}
        <p className={styles.sectionHeader}>
          Lời mời đã gửi ({sentInvites.length})
        </p>
        {sentInvites.length === 0 ? (
          <p className={styles.emptyText}>Không có gửi lời mời kết bạn</p>
        ) : (
          <>
            <ul className={styles.inviteList}>
              {visibleSent.map((item) => (
                <li key={item.id} className={styles.inviteCard}>
                  <div className={styles.inviteCardHeader}>
                    <img
                      className={styles.invitedAvatar}
                      src={item.avatar}
                      alt=""
                    />
                    <div className={styles.inviteInfo}>
                      <span className={styles.invitedName}>{item.name}</span>
                      <span className={styles.inviteSubText}>
                        Bạn đã gửi lời mời
                      </span>
                    </div>
                    <div className={styles.messageIcon}>
                      <MessageCircle />
                    </div>
                  </div>
                  <button className={styles.btn}>Thu hồi lời mời</button>
                </li>
              ))}
            </ul>

            {sentInvites.length > 3 && (
              <button
                className={styles.viewMore}
                onClick={() => setShowAllSent(!showAllSent)}
              >
                {showAllSent ? "Ẩn bớt" : "Xem thêm"}
                {showAllSent ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}
          </>
        )}

        {/* Gợi ý kết bạn — toggle */}
        <p
          className={styles.sectionHeader}
          style={{ cursor: "pointer" }}
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          Gợi ý kết bạn ({suggestions.length})
          {showSuggestions ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </p>

        {showSuggestions && (
          <ul className={styles.suggestionList}>
            {suggestions.map((item) => (
              <li key={item.id} className={styles.suggestionCard}>
                <div className={styles.suggestionCardHeader}>
                  <img
                    className={styles.invitedAvatar}
                    src={item.avatar}
                    alt=""
                  />
                  <div className={styles.inviteInfo}>
                    <span className={styles.invitedName}>{item.name}</span>
                    <span className={styles.mutualText}>
                      {item.mutual} nhóm chung
                    </span>
                  </div>
                </div>
                <div className={styles.suggestionActions}>
                  <button className={styles.btn}>Bỏ qua</button>
                  <button className={styles.primaryBtn}>Kết bạn</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
