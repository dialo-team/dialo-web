import { Outlet } from "react-router-dom";
import { FriendSidebar } from "./FriendSidebar";
import styles from "../../../styles/module.social/FriendsPage/FriendsPage.module.css";

export const FriendsPage = () => {
  return (
    <div className={styles.container}>
      <FriendSidebar />

      <div className={styles.right}>
        <Outlet />
      </div>
    </div>
  );
};
