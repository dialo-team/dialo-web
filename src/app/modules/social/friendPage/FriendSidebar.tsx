import { Search, User, UsersRound, UserPlus, UserPlus2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/module.social/FriendsPage/FriendSidebar.module.css";
import { useState } from "react";
import addGroupIcon from "../../../../assets/add_group.jpg";
import AddFriendModal from "./searchAndAddFriend/AddFriendModal";
import CreateGroupModal from "./searchAndAddFriend/CreateGroupModal";

export const FriendSidebar = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      navigate(`/home/friendHome/search?q=${keyword}`);
    }
  };

  return (
    <div className={styles.left}>
      <div className={styles.searchWrapper}>
        {/* ô search */}
        <div className={styles.searchBoxLeft}>
          <Search size={16} />
          <input
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* icon bên ngoài */}
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
          onClick={() => navigate("/home/friendHome")}
        >
          <User size={18} />
          <span>Danh sách bạn bè</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => navigate("/home/friendHome/groups")}
        >
          <UsersRound size={18} />
          <span>Danh sách nhóm</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => navigate("/home/friendHome/friendInvite")}
        >
          <UserPlus size={18} />
          <span>Lời mời kết bạn</span>
        </div>

        <div
          className={styles.menuItem}
          onClick={() => navigate("/home/friendHome/groupInvite")}
        >
          <img
            src={addGroupIcon}
            alt="group-plus"
            className={styles.icon}
          />
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
