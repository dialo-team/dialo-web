import { Outlet } from "react-router-dom";
import styles from "../../styles/message/ChatPage.module.css";
import { ChatSidebar } from "./ChatSidebar";
import { useState } from "react";
import type { Friend } from "@/app/types/message/Friend";

export const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);

  return (
    <div className={styles.container}>
      <ChatSidebar onSelectUser={setSelectedUser}/>

      <div className={styles.right}>
        <Outlet context={{ selectedUser }}/>
      </div>
    </div>
  );
};
