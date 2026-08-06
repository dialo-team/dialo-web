import { ChevronLeft, UserX } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";


import {
  getBlockedUsersApi,
  unblockUserApi,
} from "../../../../../../api/social/listFriend/ListFriendApi";

interface BlockedUser {
  id: string;
  userName: string;
  avatar?: string;
}

export const BlockedList = () => {
  const navigate = useNavigate();

  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= BACK =================
  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }
    navigate(-1);
  };

  // ================= FETCH =================
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const res = await getBlockedUsersApi();

      const data = res?.data?.blocks || res?.data || [];

      const mapped = data.map((u: any) => ({
        id: u.blockedUserId || u.userId || u.id,
        userName: u.blockedUserName ,
        avatar: u.blockedAvatar ,
      }));

      setBlockedUsers(mapped);
    } catch (err) {
      console.error("Lỗi load blocked users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // ================= UNBLOCK =================
  const handleUnblock = async (user: BlockedUser) => {
    try {
      await unblockUserApi(user.id);

      // remove luôn khỏi UI (không cần gọi lại API)
      setBlockedUsers((prev) =>
        prev.filter((item) => item.id !== user.id)
      );
    } catch (err) {
      console.error("Bỏ chặn thất bại:", err);
    }
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
            <UserX size={24} />
            <h2>Danh sách chặn</h2>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.section}>
        {/* <div className={styles.sectionTitle}>
          Đã chặn ({blockedUsers.length})
        </div> */}

        <div className={styles.contentBox}>
          {loading ? (
            <p>Đang tải danh sách...</p>
          ) : blockedUsers.length === 0 ? (
            <p>Chưa chặn ai</p>
          ) : (
            <div className={styles.friendList}>
              {blockedUsers.map((u) => (
                <div key={u.id} className={styles.friendItem}>
                  {/* INFO */}
                  <div className={styles.friendInfo}>
                    <img
                      src={
                        u.avatar ||
                        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                      }
                      alt={u.userName}
                    />
                    <span>{u.userName}</span>
                  </div>

                  {/* BUTTON UNBLOCK */}
                  <button
                    className={styles.unblockBtn}
                    onClick={() => handleUnblock(u)}
                  >
                    Bỏ chặn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};