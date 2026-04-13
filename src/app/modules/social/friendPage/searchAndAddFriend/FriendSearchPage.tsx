import { useSearchParams } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/FriendSearchPage.module.css";
import { useEffect, useState } from "react";
import { InviteFriendModal } from "./InviteFriendModal";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi"
import type { User } from "@/app/types/social/User";



export const FriendSearchPage = () => {
  const [params] = useSearchParams();
  const phone = params.get("q") || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const isValidPhone = /^\d{10}$/.test(phone);

  //  gọi API
  useEffect(() => {
    if (!isValidPhone) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);

      const res = await userApi.getUserByPhone(phone);
      console.log("RES:", res);

      setUser(res);
      setLoading(false);
    };

    fetchUser();
  }, [phone]);

  return (
    <>
      <div className={styles.container}>
        <h2>Kết quả tìm kiếm</h2>

        {/* không hợp lệ */}
        {!isValidPhone && (
          <span>Không có kết quả phù hợp</span>
        )}

        {/* loading */}
        {loading && <span>Đang tìm kiếm...</span>}

        {/* có user */}
        {user && isValidPhone && (
          <div className={styles.userItem}>
            <div className={styles.userInfo}>
              <img
                src={
                  user.avatar ||
                  "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                }
              />
              <div>
                <span className={styles.name}>{user.userName}</span>
                <span className={styles.phone}>{phone}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.messageBtn}>
                Nhắn tin
              </button>

              <button
                className={styles.addBtn}
                onClick={() => setOpenAdd(true)}
              >
                Kết bạn
              </button>
            </div>
          </div>
        )}

        {/*  không tìm thấy */}
        {!loading && isValidPhone && !user && (
          <span>Không có kết quả phù hợp</span>
        )}
      </div>

      <InviteFriendModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        user={user}
        onSend={(msg) => {
          console.log("Gửi lời mời tới:", user?.userName);
          console.log("Lời giới thiệu:", msg);
        }}
      />
    </>
  );
};