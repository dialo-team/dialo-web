// import { Search, User, UsersRound, UserPlus } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import styles from "../../../styles/module.social/FriendsPage/FriendSidebar.module.css";
// import { useState } from "react";
// import addGroupIcon from "../../../../assets/add_group.jpg";
// import AddFriendModal from "./searchAndAddFriend/AddFriendModal";
// import CreateGroupModal from "./searchAndAddFriend/CreateGroupModal";

// type FriendSidebarProps = {
//   onNavigate?: () => void;
// };

// export const FriendSidebar = ({ onNavigate }: FriendSidebarProps) => {
//   const navigate = useNavigate();
//   const [keyword, setKeyword] = useState("");
//   const [openAddFriend, setOpenAddFriend] = useState(false);
//   const [openCreateGroup, setOpenCreateGroup] = useState(false);

//   const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && keyword.trim() !== "") {
//       navigate(`/home/friendHome/search?q=${keyword}`);
//       onNavigate?.();
//     }
//   };

//   return (
//     <div className={styles.left}>
//       <div className={styles.searchWrapper}>
//         {/* ô search */}
//         <div className={styles.searchBoxLeft}>
//           <Search size={16} />
//           <input
//             placeholder="Tìm kiếm..."
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             onKeyDown={handleSearch}
//           />
//         </div>

//         {/* icon bên ngoài */}
//         <div className={styles.actions}>
//           <UserPlus
//             size={20}
//             className={styles.actionIcon}
//             onClick={() => setOpenAddFriend(true)}
//           />
//           <img
//             src={addGroupIcon}
//             className={styles.actionIcon}
//             onClick={() => setOpenCreateGroup(true)}
//           />
//         </div>
//       </div>

//       {/* menu */}
//       <div className={styles.menu}>
//         <div
//           className={styles.menuItem}
//           onClick={() => {
//             navigate("/home/friendHome");
//             onNavigate?.();
//           }}
//         >
//           <User size={18} />
//           <span>Danh sách bạn bè</span>
//         </div>

//         <div
//           className={styles.menuItem}
//           onClick={() => {
//             navigate("/home/friendHome/groups");
//             onNavigate?.();
//           }}
//         >
//           <UsersRound size={18} />
//           <span>Danh sách nhóm</span>
//         </div>

//         <div
//           className={styles.menuItem}
//           onClick={() => {
//             navigate("/home/friendHome/friendInvite");
//             onNavigate?.();
//           }}
//         >
//           <UserPlus size={18} />
//           <span>Lời mời kết bạn</span>
//         </div>

//         <div
//           className={styles.menuItem}
//           onClick={() => {
//             navigate("/home/friendHome/groupInvite");
//             onNavigate?.();
//           }}
//         >
//           <img
//             src={addGroupIcon}
//             alt="group-plus"
//             className={styles.icon}
//           />
//           <span>Lời mời vào nhóm</span>
//         </div>
//       </div>

//       {/* modal */}
//       {openAddFriend && (
//         <AddFriendModal onClose={() => setOpenAddFriend(false)} />
//       )}

//       {openCreateGroup && (
//         <CreateGroupModal onClose={() => setOpenCreateGroup(false)} />
//       )}
//     </div>
//   );
// };

import { Search, User, UsersRound, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/module.social/FriendsPage/FriendSidebar.module.css";
import { useState } from "react";
import addGroupIcon from "../../../../assets/add_group.jpg";
import AddFriendModal from "./searchAndAddFriend/AddFriendModal";
import CreateGroupModal from "./searchAndAddFriend/CreateGroupModal";

type FriendSidebarProps = {
  onNavigate?: () => void;
};

export const FriendSidebar = ({ onNavigate }: FriendSidebarProps) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  // 🔥 xử lý search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const isValid = /^\d{10}$/.test(keyword);

      if (!isValid) {
        navigate(`/home/friendHome/search?q=invalid`);
      } else {
        navigate(`/home/friendHome/search?q=${keyword}`);
      }

      setKeyword(""); 
      onNavigate?.();
    }
  };

  return (
    <div className={styles.left}>
      <div className={styles.searchWrapper}>
        {/* ô search */}
        <div className={styles.searchBoxLeft}>
          <Search size={16} />
          <input
            placeholder="Nhập số điện thoại..."
            value={keyword}
            onChange={(e) => {
              // 🔥 chỉ cho nhập số
              const value = e.target.value.replace(/\D/g, "");
              setKeyword(value);
            }}
            onKeyDown={handleSearch}
          />
        </div>

        {/* icon */}
        <div className={styles.actions}>
          <UserPlus
            size={20}
            className={styles.actionIcon}
            onClick={() => setOpenAddFriend(true)}
          />
          <img
            src={addGroupIcon}
            className={styles.actionIcon}
            onClick={() => setOpenCreateGroup(true)}
          />
        </div>
      </div>

      {/* menu */}
      <div className={styles.menu}>
        <div
          className={styles.menuItem}
          onClick={() => {
            navigate("/home/friendHome");
            onNavigate?.();
          }}
        >
          <User size={18} />
          <span>Danh sách bạn bè</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => {
            navigate("/home/friendHome/groups");
            onNavigate?.();
          }}
        >
          <UsersRound size={18} />
          <span>Danh sách nhóm</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => {
            navigate("/home/friendHome/friendInvite");
            onNavigate?.();
          }}
        >
          <UserPlus size={18} />
          <span>Lời mời kết bạn</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => {
            navigate("/home/friendHome/groupInvite");
            onNavigate?.();
          }}
        >
          <img src={addGroupIcon} className={styles.icon} />
          <span>Lời mời vào nhóm</span>
        </div>
      </div>

      {/* modal */}
      {openAddFriend && (
        <AddFriendModal onClose={() => setOpenAddFriend(false)} />
      )}

      {openCreateGroup && (
        <CreateGroupModal onClose={() => setOpenCreateGroup(false)} />
      )}
    </div>
  );
};