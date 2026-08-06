import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/FrientdInvite.module.css";
import {
  getReceivedRequestsApi,
  getSentRequestsApi,
  cancelFriendRequestApi,
  rejectFriendRequestApi,
  acceptFriendRequestApi,
} from "../../../../../../api/social/friendInvite/getFriendInviteApi";
import { getUserInfoApi } from "../../../../../../api/social/searchAndAddFriend/userApi";

// ================= TYPES =================
interface ReceivedItem {
  id: string;
  senderId: string;
  name: string;
  avatar: string;
  date: string;
}

interface SentItem {
  id: string;
  targetId: string;
  name: string;
  avatar: string;
  date: string;
}

export const FriendInvite = () => {
  const navigate = useNavigate();
  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();

  const [received, setReceived] = useState<ReceivedItem[]>([]);
  const [sent, setSent] = useState<SentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAllSent, setShowAllSent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ================= FETCH DATA =================
  // const fetchData = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     const [receivedRes, sentRes] = await Promise.all([
  //       getReceivedRequestsApi(),
  //       getSentRequestsApi(),
  //     ]);

  //     const receivedData = receivedRes.data || [];
  //     const sentData = sentRes.data || [];

  //     // map RECEIVED
  //     const mapReceived: ReceivedItem[] = receivedData.map((item: any) => ({
  //       id: item.friendshipId,
  //       senderId: item.senderId,
  //       name: item.senderId,
  //       avatar:
  //         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
  //       date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
  //     }));

  //     // map SENT
  //     const mapSent: SentItem[] = sentData.map((item: any) => ({
  //       id: item.friendshipId,
  //       targetId: item.receiverId,
  //       name: item.receiverId,
  //       avatar:
  //         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
  //       date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
  //     }));

  //     setReceived(mapReceived);
  //     setSent(mapSent);
  //   } catch (err) {
  //     console.error("Lỗi fetch friend requests:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [receivedRes, sentRes] = await Promise.all([
        getReceivedRequestsApi(),
        getSentRequestsApi(),
      ]);

      const receivedData = receivedRes.data || [];
      const sentData = sentRes.data || [];

      const uniqueUserIds = Array.from(
        new Set([
          ...receivedData.map((item: any) => item.senderId),
          ...sentData.map((item: any) => item.receiverId),
        ].filter(Boolean))
      );

      const userMap = new Map<string, { name: string; avatar: string }>();

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userRes = await getUserInfoApi(userId);
            const user = userRes.data?.data || userRes.data;

            userMap.set(userId, {
              name: user.userName || userId,
              avatar:
                user.avatar ||
                "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
            });
          } catch {
            userMap.set(userId, {
              name: userId,
              avatar:
                "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
            });
          }
        })
      );

      // ================= RECEIVED =================
      // const mapReceived: ReceivedItem[] = receivedData.map((item: any) => ({
      //   id: item.friendshipId,
      //   senderId: item.senderId,
      //   name: item.senderId, // chưa có API user -> tạm
      //   avatar:
      //     "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
      //   date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
      // }));

      const mapReceived: ReceivedItem[] = await Promise.all(
        receivedData.map(async (item: any) => {
          const senderInfo = userMap.get(item.senderId);

          return {
            id: item.friendshipId,
            senderId: item.senderId,
            name: senderInfo?.name || item.senderId,
            avatar:
              senderInfo?.avatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
            date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
          };
        })
      );

      // ================= SENT =================
      const mapSent: SentItem[] = await Promise.all(
        sentData.map(async (item: any) => {
          const receiverInfo = userMap.get(item.receiverId);

          return {
            id: item.friendshipId,
            targetId: item.receiverId,
            name: receiverInfo?.name || item.receiverId,
            avatar:
              receiverInfo?.avatar ||
              "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
            date: new Date(item.requestedAt).toLocaleDateString("vi-VN"),
          };
        })
      );

      setReceived(mapReceived);
      setSent(mapSent);
    } catch (err) {
      console.error("Lỗi fetch friend requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= ACTIONS =================

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }
    navigate(-1);
  };

  //  Thu hồi lời mời (SENT)
  const handleCancelRequest = async (targetId: string) => {
    try {
      await cancelFriendRequestApi(targetId);
      await fetchData();
    } catch (err) {
      console.error("Thu hồi thất bại:", err);
    }
  };

  // Từ chối lời mời (RECEIVED)
  const handleRejectRequest = async (senderId: string) => {
    try {
      await rejectFriendRequestApi(senderId);
      await fetchData();
    } catch (err) {
      console.error("Từ chối thất bại:", err);
    }
  };

  // Chấp nhận lời mời
  const handleAcceptRequest = async (senderId: string) => {
    try {
      await acceptFriendRequestApi(senderId);
      await fetchData(); // reload lại list
    } catch (err) {
      console.error("Chấp nhận thất bại:", err);
    }
  };

  const visibleSent = showAllSent ? sent : sent.slice(0, 3);

  // ================= UI =================
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
            <p>
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
                    Đã gửi lời mời kết bạn
                  </p>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.btn}
                      onClick={() =>
                        handleRejectRequest(item.senderId)
                      }
                    >
                      Từ chối
                    </button>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => handleAcceptRequest(item.senderId)}
                    >
                      Đồng ý
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* ================= SENT ================= */}
          <p className={styles.sectionTitle}>
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

                    <button
                      className={styles.btn}
                      onClick={() =>
                        handleCancelRequest(item.targetId)
                      }
                    >
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
            <p>Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </>
  );
};