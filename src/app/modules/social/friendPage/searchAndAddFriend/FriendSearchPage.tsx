import { useSearchParams } from "react-router-dom";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/FriendSearchPage.module.css";
import { useState } from "react";
import { InviteFriendModal } from "./InviteFriendModal";

export const FriendSearchPage = () => {
  const [params] = useSearchParams();
  const phone = params.get("q");

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0901234567",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
    },
    {
      id: 2,
      name: "Trần Văn B",
      phone: "0908888888",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa",
    },
  ];

  const result = users.filter((u) => u.phone.includes(phone || ""));

  return (
    <>
      <div className={styles.container}>
        <h2>Kết quả tìm kiếm</h2>
        <span>Kết quả trùng khớp ({result.length})</span>

        {result.map((u) => (
          <div key={u.id} className={styles.userItem}>
            <div className={styles.userInfo}>
              <img src={u.avatar} />
              <div>
                <span className={styles.name}>{u.name}</span>
                <span className={styles.phone}>{u.phone}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.messageBtn}>Nhắn tin</button>

              <button
                className={styles.addBtn}
                onClick={() => {
                  setSelectedUser(u);
                  setOpenAdd(true);
                }}
              >
                Kết bạn
              </button>
            </div>
          </div>
        ))}
      </div>

      <InviteFriendModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        user={selectedUser}
        onSend={(msg) => {
          console.log("Gửi lời mời tới:", selectedUser?.name);
          console.log("Lời giới thiệu:", msg);
        }}
      />
    </>
  );
};
