import { Outlet } from "react-router-dom";
import { FriendSidebar } from "./FriendSidebar";
import styles from "../../../styles/module.social/FriendsPage/FriendsPage.module.css";
import { useEffect, useState } from "react";

export const FriendsPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const handleMedia = () => {
      setIsMobile(media.matches);
      if (!media.matches) {
        setShowContent(true);
      }
    };
    handleMedia();
    media.addEventListener("change", handleMedia);
    return () => media.removeEventListener("change", handleMedia);
  }, []);

  const shouldShowSidebar = !isMobile || !showContent;
  const shouldShowRight = !isMobile || showContent;

  return (
    <div className={styles.container}>
      {shouldShowSidebar && <FriendSidebar onNavigate={() => setShowContent(true)} />}

      {shouldShowRight && (
        <div className={styles.right}>
          <Outlet
            context={{
              isMobile,
              onBackToSidebar: () => setShowContent(false),
            }}
          />
        </div>
      )}
    </div>
  );
};
