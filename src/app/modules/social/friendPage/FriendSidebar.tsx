import { Search, User, UsersRound, UserPlus, UserPlus2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/module.social/FriendsPage/FriendSidebar.module.css";

export const FriendSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.left}>
      
      {/* search */}
      <div className={styles.searchBoxLeft}>
        <Search size={16} />
        <input placeholder="Tìm kiếm..." />
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
          <UserPlus2 size={18} />
          <span>Lời mời vào nhóm</span>
        </div>
      </div>
    </div>
  );
};