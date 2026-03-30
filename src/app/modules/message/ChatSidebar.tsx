import { Search, UserPlus } from "lucide-react";
import styles from "../../styles/message/ChatSidebar.module.css";
import { useState } from "react";
import addGroupIcon from "../../../assets/add_group.jpg";
import AddFriendModal from "../social/friendPage/searchAndAddFriend/AddFriendModal";
import CreateGroupModal from "../social/friendPage/searchAndAddFriend/CreateGroupModal";
import type { Friend } from "../../types/message/Friend";

type Props = {
  onSelectUser: (user: Friend) => void;
};

export const ChatSidebar = ({ onSelectUser }: Props) => {
  const [keyword, setKeyword] = useState("");
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  const [friends] = useState<Friend[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      lastMessage: "Ê hôm qua đi đâu vậy?",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      lastMessage: "Mai học không?",
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar:
        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
      lastMessage: "Ok bro",
    },
  ]);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className={styles.left}>
      {/* SEARCH */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBoxLeft}>
          <Search size={16} />
          <input
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

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
            alt="create-group"
          />
        </div>
      </div>

      {/* LIST FRIEND */}
      <div className={styles.list}>
        {filteredFriends.map((f) => (
          <div
            key={f.id}
            className={styles.chatItem}
            onClick={() => onSelectUser(f)}
          >
            <img src={f.avatar} className={styles.avatar} alt={f.name} />

            <div className={styles.info}>
              <div className={styles.name}>{f.name}</div>
              <div className={styles.lastMessage}>{f.lastMessage}</div>
            </div>
          </div>
        ))}

        {filteredFriends.length === 0 && (
          <div className={styles.empty}>Không tìm thấy</div>
        )}
      </div>

      {/* MODAL */}
      {openAddFriend && (
        <AddFriendModal onClose={() => setOpenAddFriend(false)} />
      )}

      {openCreateGroup && (
        <CreateGroupModal onClose={() => setOpenCreateGroup(false)} />
      )}
    </div>
  );
};
