// import { Search, MoreHorizontal, ChevronLeft, Users } from "lucide-react";
// import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
// import { useState } from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import { RenameFriendModal } from "./RenameFriendModal";
// import { DeleteFriendModal } from "./DeleteFriendModal";
// import { FriendInfoModal } from "./FriendInfoModal";

// export const FriendListPage = () => {
//   const navigate = useNavigate();
//   const { isMobile, onBackToSidebar } = useOutletContext<{
//     isMobile?: boolean;
//     onBackToSidebar?: () => void;
//   }>();

//   const friends = [
//     {
//       id: 5,
//       name: "Nguyễn Văn A",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 6,
//       name: "Trần Thị B",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 7,
//       name: "Nguyễn Thị C",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 8,
//       name: "Trần Thị D",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 1,
//       name: "Nguyễn Văn A",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 2,
//       name: "Trần Thị B",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 3,
//       name: "Nguyễn Thị C",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//     {
//       id: 4,
//       name: "Trần Thị D",
//       avatar:
//         "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
//     },
//   ];

//   const [openMenu, setOpenMenu] = useState<number | null>(null);
//   const [openInfo, setOpenInfo] = useState(false);
//   const [selectedFriend, setSelectedFriend] = useState<any>(null);
//   const [openRename, setOpenRename] = useState(false);
//   const [openDelete, setOpenDelete] = useState(false);
//   const totalFriends = friends.length;

//   const handleBack = () => {
//     if (isMobile && onBackToSidebar) {
//       onBackToSidebar();
//       return;
//     }

//     navigate(-1);
//   };

//   return (
//     <>
//       <div className={styles.header}>
//         <div className={styles.headerTop}>
//           <button
//             className={styles.backButton}
//             onClick={handleBack}
//             type="button"
//             aria-label="Quay lại"
//           >
//             <ChevronLeft size={24} />
//           </button>

//           <div className={styles.headerTitle}>
//             <Users size={24} />
//             <h2>Danh sách bạn bè</h2>
//           </div>
//         </div>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionTitle}>Bạn bè ({totalFriends})</div>

//         <div className={styles.contentBox}>
//           <div className={styles.searchBoxRight}>
//             <Search size={16} />
//             <input placeholder="Tìm bạn bè..." />
//           </div>

//           <div className={styles.friendList}>
//             {friends.map((f) => (
//               <div key={f.id} className={styles.friendItem}>
//                 <div className={styles.friendInfo}>
//                   <img src={f.avatar} alt={f.name} />
//                   <span>{f.name}</span>
//                 </div>

//                 <div className={styles.menuWrapper}>
//                   <MoreHorizontal
//                     size={18}
//                     className={styles.moreIcon}
//                     onClick={() => setOpenMenu(openMenu === f.id ? null : f.id)}
//                   />

//                   {openMenu === f.id && (
//                     <div className={styles.actionMenu}>
//                       <div
//                         className={styles.menuAction}
//                         onClick={() => {
//                           setSelectedFriend(f);
//                           setOpenInfo(true);
//                           setOpenMenu(null);
//                         }}
//                       >
//                         Xem thông tin
//                       </div>

//                       <div
//                         className={styles.menuAction}
//                         onClick={() => {
//                           setSelectedFriend(f);
//                           setOpenRename(true);
//                           setOpenMenu(null);
//                         }}
//                       >
//                         Đổi tên gợi ý
//                       </div>

//                       <div
//                         className={`${styles.menuAction} ${styles.danger}`}
//                         onClick={() => {
//                           setSelectedFriend(f);
//                           setOpenDelete(true);
//                           setOpenMenu(null);
//                         }}
//                       >
//                         Xóa bạn
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <FriendInfoModal
//         open={openInfo}
//         onClose={() => setOpenInfo(false)}
//         friend={selectedFriend}
//       />

//       <RenameFriendModal
//         open={openRename}
//         onClose={() => setOpenRename(false)}
//         friend={selectedFriend}
//       />

//       <DeleteFriendModal
//         open={openDelete}
//         onClose={() => setOpenDelete(false)}
//         friend={selectedFriend}
//         onConfirm={() => {
//           console.log("Đã xóa bạn:", selectedFriend.name);
//           setOpenDelete(false);
//         }}
//       />
//     </>
//   );
// };


import { Search, MoreHorizontal, ChevronLeft, Users } from "lucide-react";
import styles from "../../../../styles/module.social/FriendsPage/FriendContentList.module.css";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { getFriendsApi } from "../../../../../../api/social/listFriend/ListFriendApi";

import { RenameFriendModal } from "./RenameFriendModal";
import { DeleteFriendModal } from "./DeleteFriendModal";
import { FriendInfoModal } from "./FriendInfoModal";

export const FriendListPage = () => {
  const navigate = useNavigate();

  const { isMobile, onBackToSidebar } = useOutletContext<{
    isMobile?: boolean;
    onBackToSidebar?: () => void;
  }>();

  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const handleBack = () => {
    if (isMobile && onBackToSidebar) {
      onBackToSidebar();
      return;
    }
    navigate(-1);
  };

  // 🔥 CALL API
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);

        const res = await getFriendsApi();

        // ✅ đúng cấu trúc API: data.friends
        setFriends(res?.data?.friends || []);
      } catch (err) {
        console.error("Lỗi load friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

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
          <div className={styles.searchBoxRight}>
            <Search size={16} />
            <input placeholder="Tìm bạn bè..." />
          </div>

          {/* LOADING */}
          {loading ? (
            <p>Đang tải danh sách bạn bè...</p>
          ) : (
            <div className={styles.friendList}>
              {friends.length === 0 ? (
                <p>Chưa có bạn bè</p>
              ) : (
                friends.map((f) => (
                  <div key={f.id} className={styles.friendItem}>
                    <div className={styles.friendInfo}>
                      <img
                        src={f.avatar || "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"}
                        alt={f.name}
                      />
                      <span>{f.name}</span>
                    </div>

                    <div className={styles.menuWrapper}>
                      <MoreHorizontal
                        size={18}
                        className={styles.moreIcon}
                        onClick={() =>
                          setOpenMenu(openMenu === f.id ? null : f.id)
                        }
                      />

                      {openMenu === f.id && (
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
                ))
              )}
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
      />

      <DeleteFriendModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        friend={selectedFriend}
        onConfirm={() => {
          console.log("Đã xóa bạn:", selectedFriend?.name);
          setOpenDelete(false);
        }}
      />
    </>
  );
};