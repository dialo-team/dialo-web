import { Outlet } from "react-router-dom";
import styles from "../../styles/message/ChatPage.module.css";
import { ChatSidebar } from "./ChatSidebar";
import { useState } from "react";
import type { Friend } from "@/app/types/message/Friend";
import { CallProvider } from "./CallContext";
import { IncomingCallModal } from "./IncomingCallModal";

const getCurrentUserId = () => {
  try {
    const u = localStorage.getItem("user");
    if (!u) return null;
    const parsed = JSON.parse(u);
    return typeof parsed?.id === "string" ? parsed.id.trim() || null : null;
  } catch {
    return null;
  }
};

export const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const hasSelectedUser = Boolean(selectedUser);
  const handleBackToSidebar = () => setSelectedUser(null);
  const userId = getCurrentUserId();

  return (
    <CallProvider userId={userId}>
      <IncomingCallModal />
      <div className={styles.container}>
        <div
          className={`${styles.sideBarWrapper} ${
            hasSelectedUser ? styles.mobileHide : styles.mobileShow
          }`}
        >
          <ChatSidebar onSelectUser={setSelectedUser} selectedConversationId={selectedUser?.id} />
        </div>

        <div
          className={`${styles.right} ${
            hasSelectedUser ? styles.mobileShow : styles.mobileHide
          }`}
        >
          <Outlet context={{ selectedUser, onBackToSidebar: handleBackToSidebar }} />
        </div>
      </div>
    </CallProvider>
  );
};
