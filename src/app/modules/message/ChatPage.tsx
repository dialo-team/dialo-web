import { Outlet } from "react-router-dom";
import styles from "../../styles/message/ChatPage.module.css";
import { ChatSidebar } from "./ChatSidebar";
import { useState } from "react";
import type { Friend } from "@/app/types/message/Friend";

export const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const hasSelectedUser = Boolean(selectedUser);
  const handleBackToSidebar = () => setSelectedUser(null);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.sideBarWrapper} ${
          hasSelectedUser ? styles.mobileHide : styles.mobileShow
        }`}
      >
        <ChatSidebar onSelectUser={setSelectedUser} />
      </div>

      <div
        className={`${styles.right} ${
          hasSelectedUser ? styles.mobileShow : styles.mobileHide
        }`}
      >
        <Outlet context={{ selectedUser, onBackToSidebar: handleBackToSidebar }} />
      </div>
    </div>
  );
};
