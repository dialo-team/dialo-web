import { useSearchParams } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/FriendSearchPage.module.css";
import { useEffect, useState } from "react";
import { InviteFriendModal } from "./InviteFriendModal";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import { getFriendsApi } from "../../../../../../api/social/listFriend/ListFriendApi";
import type { User } from "@/app/types/social/User";
import { ErrorModal } from "@/app/components/ErrorModal";

export const FriendSearchPage = () => {
  const [params] = useSearchParams();
  const phone = params.get("q") || "";

  const [user, setUser] = useState<User | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [searchError, setSearchError] = useState("");

  // popup message
  const [modalMessage, setModalMessage] = useState("");

  const isValidPhone = /^\d{10}$/.test(phone);
  const isAlreadyFriend = Boolean(user?.id && friendIds.has(user.id));

  useEffect(() => {
    let isMounted = true;

    const fetchFriends = async () => {
      try {
        const res = await getFriendsApi();
        const ids = (res?.data?.friends || [])
          .map((f: any) => f.friendId)
          .filter(Boolean);

        if (isMounted) {
          setFriendIds(new Set(ids));
        }
      } catch (err) {
        console.error("Lỗi load danh sách bạn bè:", err);
      }
    };

    fetchFriends();

    return () => {
      isMounted = false;
    };
  }, []);

  // search API
  useEffect(() => {
    if (!isValidPhone) {
      setOpenAdd(false);
      setUser(null);
      setSearchError("");
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const activeQuery = phone;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setSearchError("");

        const res = await userApi.getUserByPhone(activeQuery);

        if (!isCancelled && activeQuery === phone) {
          setUser(res);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setUser(null);
          setSearchError(err?.response?.data?.message || "Không thể tìm kiếm lúc này");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isCancelled = true;
    };
  }, [phone]);

  return (
    <>
      <div className={styles.container}>
        <h2>Kết quả tìm kiếm</h2>

        {searchError ? (
          <span>{searchError}</span>
        ) : null}

        {!isValidPhone && !searchError && (
          <span>Không có kết quả phù hợp</span>
        )}

        {loading && <span>Đang tìm kiếm...</span>}

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

              {isAlreadyFriend ? (
                <button className={styles.addedBtn} disabled>
                  Đã là bạn bè
                </button>
              ) : (
                <button
                  className={styles.addBtn}
                  onClick={() => setOpenAdd(true)}
                >
                  Kết bạn
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && isValidPhone && !user && !searchError && (
          <span>Không có kết quả phù hợp</span>
        )}
      </div>

      {/* MODAL GỬI LỜI MỜI */}
      <InviteFriendModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        user={user}
        onSend={(msg) => setModalMessage(msg)}
        onSuccess={() => {
          setUser(null);      // 🔥 xóa kết quả search
          setOpenAdd(false);  // đóng modal
        }}
      />

      {/* SUCCESS / ERROR MODAL */}
      <ErrorModal
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
    </>
  );
};