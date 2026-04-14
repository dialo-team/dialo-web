import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  Users,
} from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getFriendsApi, unfriendApi } from "../../../../../../api/social/listFriend/ListFriendApi";
import { RenameFriendModal } from "./RenameFriendModal";
import { DeleteFriendModal } from "./DeleteFriendModal";
import { FriendInfoModal } from "./FriendInfoModal";
import { blockUserApi } from "../../../../../../api/social/listFriend/ListFriendApi";
import { BlockFriendModal } from "./BlockFriendModal";

const FRIEND_ALIAS_STORAGE_KEY = "dialo.friendAliases";

const loadFriendAliases = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(FRIEND_ALIAS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const FriendListPage = () => {
  const navigate = useNavigate();

  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();

  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [openBlock, setOpenBlock] = useState(false);
  const [friendAliases, setFriendAliases] = useState<Record<string, string>>(
    () => loadFriendAliases()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      FRIEND_ALIAS_STORAGE_KEY,
      JSON.stringify(friendAliases)
    );
  }, [friendAliases]);

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }
    navigate(-1);
  };

  // ================= FETCH =================
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await getFriendsApi();

        setFriends(res?.data?.friends || []);
      } catch (err) {
        console.error("Lỗi load friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleDeleteFriend = async () => {
    if (!selectedFriend) return;

    try {
      await unfriendApi(selectedFriend.friendId);

      // reload lại list
      const res = await getFriendsApi();
      setFriends(res?.data?.friends || []);

      setOpenDelete(false);
    } catch (err) {
      console.error("Xóa bạn thất bại:", err);
    }
  };

  const handleBlockFriend = async () => {
    if (!selectedFriend) return;

    try {
      await blockUserApi(selectedFriend.friendId);

      // reload lại list
      const res = await getFriendsApi();
      setFriends(res?.data?.friends || []);

      setOpenBlock(false);
    } catch (err) {
      console.error("Chặn thất bại:", err);
    }
  };

  const handleRenameFriend = (friendId: string, nextName: string) => {
    const trimmedName = nextName.trim();

    if (!trimmedName) return;

    setFriendAliases((prev) => ({
      ...prev,
      [friendId]: trimmedName,
    }));
  };

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
            <Users size={24} />
            <h2>Danh sách bạn bè</h2>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Bạn bè ({friends.length})
        </div>

        <div className={styles.contentBox}>
          {/* SEARCH */}
          <div className={styles.searchBoxRight}>
            <Search size={16} />
            <input placeholder="Tìm bạn bè..." />
          </div>

          {/* LOADING */}
          {loading ? (
            <p>Đang tải danh sách bạn bè...</p>
          ) : friends.length === 0 ? (
            <p>Chưa có bạn bè</p>
          ) : (
            <div className={styles.friendList}>
              {friends.map((f) => (
                <div
                  key={f.friendshipId}
                  className={styles.friendItem}
                >
                  {/* INFO */}
                  <div className={styles.friendInfo}>
                    <img
                      src={
                        f.friendAvatar ||
                        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                      }
                      alt={friendAliases[f.friendId] || f.friendUserName}
                    />
                    <span>{friendAliases[f.friendId] || f.friendUserName}</span>
                  </div>

                  {/* MENU */}
                  <div className={styles.menuWrapper}>
                    <MoreHorizontal
                      size={18}
                      className={styles.moreIcon}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === f.friendshipId
                            ? null
                            : f.friendshipId
                        )
                      }
                    />

                    {openMenu === f.friendshipId && (
                      <div className={styles.actionMenu}>
                        <div
                          className={styles.menuAction}
                          onClick={() => {
                            setSelectedFriend(f);
                            setOpenInfo(true);
                            setOpenMenu(null);
                          }}
                        >
                          Xem thông tin
                        </div>

                        <div
                          className={styles.menuAction}
                          onClick={() => {
                            setSelectedFriend(f);
                            setOpenRename(true);
                            setOpenMenu(null);
                          }}
                        >
                          Đổi tên gợi ý
                        </div>

                        <div
                          className={styles.menuAction}
                          onClick={() => {
                            setSelectedFriend(f);
                            setOpenBlock(true);
                            setOpenMenu(null);
                          }}
                        >
                          Chặn người này
                        </div>

                        <div
                          className={`${styles.menuAction} ${styles.danger}`}
                          onClick={() => {
                            setSelectedFriend(f);
                            setOpenDelete(true);
                            setOpenMenu(null);
                          }}
                        >
                          Xóa bạn
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <FriendInfoModal
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        friend={selectedFriend}
      />

      <RenameFriendModal
        open={openRename}
        onClose={() => setOpenRename(false)}
        friend={selectedFriend}
        currentName={
          selectedFriend
            ? friendAliases[selectedFriend.friendId] ||
              selectedFriend.friendUserName
            : ""
        }
        onSave={handleRenameFriend}
      />

      <DeleteFriendModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        friend={selectedFriend}
        onConfirm={handleDeleteFriend}
      />

      <BlockFriendModal
        open={openBlock}
        onClose={() => setOpenBlock(false)}
        friend={selectedFriend}
        onConfirm={handleBlockFriend}
      />
    </>
  );
};