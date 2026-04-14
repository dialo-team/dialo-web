import { useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/AddFriendModal.module.css";
import { InviteFriendModal } from "./InviteFriendModal";
type Props = {
  onClose: () => void;
};

export default function AddFriendModal({ onClose }: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);


  const fakeData = [
    {
      id: 1,
      name: "Trúc",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      phone: "0123456789",
    },
    {
      id: 2,
      name: "My",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      phone: "0987654321",
    },
  ];

  const handleSearch = () => {


    const filtered = fakeData.filter((u) =>
      u.phone.includes(keyword)
    );

    setResults(filtered);
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.title}>Thêm bạn</div>

          {/* input */}
          <input
            className={styles.input}
            placeholder="Nhập số điện thoại"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          {/* danh sách kết quả */}
          <div className={styles.resultList}>
            {results.map((user) => (
              <div key={user.id} className={styles.resultItem}>
                <img src={user.avatar} className={styles.avatar} />
                <span>{user.name}</span>

                <button
                  className={styles.addBtn}
                  onClick={() => setSelectedUser(user)}
                >
                  Kết bạn
                </button>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancel} onClick={onClose}>
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* modal gửi lời mời */}
      <InviteFriendModal
        open={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSend={(msg) => {
          console.log("Gửi lời mời:", msg);
        }}
        onSuccess={() => {

          setResults([]);
          setKeyword("");
        }}
      />
    </>
  );
}