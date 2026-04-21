import { useEffect, useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/AddFriendModal.module.css";
import { InviteFriendModal } from "./InviteFriendModal";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import type { User } from "@/app/types/social/User";
import { getFriendsApi } from "../../../../../../api/social/listFriend/ListFriendApi";

type Props = {
  onClose: () => void;
};

export default function AddFriendModal({ onClose }: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const fetchFriends = async () => {
      try {
        const res = await getFriendsApi();
        const ids = (res?.data?.friends || [])
          .map((friend: { friendId?: string }) => friend.friendId)
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

  const handleSearch = async () => {
    const phone = keyword.trim();

    if (!/^\d{10}$/.test(phone)) {
      setSearchError("Số điện thoại phải gồm đúng 10 chữ số");
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setSearchError("");

      const foundUser = await userApi.getUserByPhone(phone);

      if (!foundUser) {
        setResults([]);
        setSearchError("Không tìm thấy người dùng");
        return;
      }

      setResults([foundUser]);
    } catch (err: any) {
      setResults([]);
      setSearchError(err?.response?.data?.message || "Không thể tìm kiếm lúc này");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.title}>Thêm bạn</div>

          {/* input */}
          <input
            className={styles.input}
            placeholder="Nhập số điện thoại"
            value={keyword}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setKeyword(value);
              if (searchError) {
                setSearchError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <div className={styles.actions}>
            <button className={styles.add} onClick={handleSearch} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
            <button className={styles.cancel} onClick={onClose}>
              Hủy
            </button>
          </div>

          {searchError && <p className={styles.errorText}>{searchError}</p>}

          {/* danh sách kết quả */}
          <div className={styles.resultList}>
            {results.map((user) => (
              <div key={user.id} className={styles.resultItem}>
                <img
                  src={
                    user.avatar ||
                    "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180"
                  }
                  className={styles.avatar}
                />
                <span>{user.userName}</span>

                {friendIds.has(user.id) ? (
                  <button className={styles.addedBtn} disabled>
                    Đã kết bạn
                  </button>
                ) : (
                  <button
                    className={styles.addBtn}
                    onClick={() => setSelectedUser(user)}
                  >
                    Kết bạn
                  </button>
                )}
              </div>
            ))}
          </div>

          {results.length === 0 && !searchError && !loading && keyword && (
            <p className={styles.emptyText}>Nhấn Tìm kiếm để tra số điện thoại</p>
          )}
        </div>
      </div>

      {/* modal gửi lời mời */}
      <InviteFriendModal
        open={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSend={() => {}}
        onSuccess={() => {

          setResults([]);
          setKeyword("");
        }}
      />
    </>
  );
}