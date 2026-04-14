import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/FrientdInvite.module.css";

import {
  getReceivedRequestsApi,
  getSentRequestsApi,
} from "../../../../../../api/social/friendInvite/getFriendInviteApi";

export const FriendInvite = () => {
  const navigate = useNavigate();
  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();

  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAllSent, setShowAllSent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // CALL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [receivedRes, sentRes] = await Promise.all([
          getReceivedRequestsApi(),
          getSentRequestsApi(),
        ]);

        const receivedData = receivedRes.data || [];
        const sentData = sentRes.data || [];

        // map UI
        const mapReceived = (item: any) => ({
          id: item.friendshipId,
          name: item.senderId,
          avatar:
            "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
          date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
          message: "Đã gửi lời mời kết bạn",
        });

        const mapSent = (item: any) => ({
          id: item.friendshipId,
          name: item.receiverId,
          avatar:
            "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
          date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
        });

        setReceived(receivedData.map(mapReceived));
        setSent(sentData.map(mapSent));
      } catch (err) {
        console.error("Lỗi fetch friend requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const visibleSent = showAllSent ? sent : sent.slice(0, 3);

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }
    navigate(-1);
  };

  return (
    <>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={handleBack}>
            <ChevronLeft size={24} />
          </button>

          <div className={styles.headerTitle}>
            <UserPlus size={24} />
            <h2>Lời mời kết bạn</h2>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.mainInvite}>
          {/* ================= RECEIVED ================= */}
          <p className={styles.sectionTitle}>
            Lời mời đã nhận ({received.length})
          </p>

          {loading ? (
            <p>Đang tải...</p>
          ) : received.length === 0 ? (
            <p className={styles.emptyText}>
              Không có lời mời kết bạn
            </p>
          ) : (
            <ul className={styles.invitedList}>
              {received.map((item) => (
                <li key={item.id} className={styles.invitedCard}>
                  <div className={styles.invitedHeader}>
                    <img
                      className={styles.invitedAvatar}
                      src={item.avatar}
                    />
                    <div className={styles.infoColumn}>
                      <span className={styles.invitedName}>
                        {item.name}
                      </span>
                      <span className={styles.invitedDate}>
                        {item.date}
                      </span>
                    </div>
                    <MessageCircle />
                  </div>

                  <p className={styles.invitedMessage}>
                    {item.message}
                  </p>

                  <div className={styles.cardActions}>
                    <button className={styles.btn}>
                      Từ chối
                    </button>
                    <button className={styles.primaryBtn}>
                      Đồng ý
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* ================= SENT ================= */}
          <p className={styles.sectionHeader}>
            Lời mời đã gửi ({sent.length})
          </p>

          {sent.length === 0 ? (
            <p className={styles.emptyText}>
              Không có lời mời đã gửi
            </p>
          ) : (
            <>
              <ul className={styles.inviteList}>
                {visibleSent.map((item) => (
                  <li key={item.id} className={styles.inviteCard}>
                    <div className={styles.inviteCardHeader}>
                      <img
                        className={styles.invitedAvatar}
                        src={item.avatar}
                      />
                      <div className={styles.inviteInfo}>
                        <span className={styles.invitedName}>
                          {item.name}
                        </span>
                        <span className={styles.inviteSubText}>
                          Bạn đã gửi lời mời
                        </span>
                      </div>
                      <MessageCircle />
                    </div>

                    <button className={styles.btn}>
                      Thu hồi lời mời
                    </button>
                  </li>
                ))}
              </ul>

              {sent.length > 3 && (
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

          {/* ================= SUGGEST ================= */}
          <p
            className={styles.sectionHeader}
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            Gợi ý kết bạn
            {showSuggestions ? <ChevronUp /> : <ChevronDown />}
          </p>

          {showSuggestions && (
            <p style={{ padding: 10 }}>Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </>
  );
};