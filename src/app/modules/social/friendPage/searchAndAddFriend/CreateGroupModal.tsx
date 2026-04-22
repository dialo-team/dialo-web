import { useEffect, useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/CreateGroupModal.module.css";
import { X, Search, Camera } from "lucide-react";
import { getFriendsApi } from "../../../../../../api/social/listFriend/ListFriendApi";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import { createGroupApi } from "../../../../../../api/social/groupFriend/groupApi";
import { useAuthStore } from "../../../../../../store/authStore";

type Friend = {
  id: string;
  name: string;
  avatar: string;
};

type Props = {
  onClose: () => void;
};

export default function CreateGroupModal({ onClose }: Props) {

  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<Friend[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [groupName, setGroupName] = useState("");

  const canCreateGroup = selected.length >= 2;
  const currentUser = useAuthStore((state) => state.user);

  // lấy dnah sách bạn bè 
  const loadFriends = async () => {
    try {
      const res = await getFriendsApi();
      const data = res?.data?.friends || [];

      const mapped: Friend[] = data.map((f: any) => ({
        id: f.friendId,
        name: f.friendUserName ?? "",
        avatar: f.friendAvatar ?? "",
      }));

      setAllFriends(mapped);
      setFriends(mapped);
      setNotFound(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);


  // TOGGLE SELECT (lưu FULL OBJECT)
  const toggleSelect = (friend: Friend) => {
    setSelected((prev) => {
      const exists = prev.find((f) => f.id === friend.id);

      if (exists) {
        return prev.filter((f) => f.id !== friend.id);
      }

      if (prev.length >= 100) return prev;

      return [...prev, friend];
    });
  };


  // SEARCH BY PHONE
  const handleSearch = async () => {
    const value = keyword.trim();

    if (!value) {
      setFriends(allFriends);
      setNotFound(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const res = await userApi.getUserByPhone(value);

      setLoading(false);

      if (!res) {
        setFriends([]);
        setNotFound(true);
        setKeyword(""); //
        return;
      }

      setFriends([
        {
          id: res.id,
          name: res.userName ?? "",
          avatar: res.avatar ?? "",
        },
      ]);

      setKeyword("");
    } catch (err) {
      setLoading(false);
      setFriends([]);
      setNotFound(true);
      setKeyword("");
    }
  };

  // HÀM TẠO TÊN NHÓM AUTO
  const buildGroupName = () => {
    if (groupName.trim()) return groupName.trim();

    // loại bỏ chính mình
    const filtered = selected.filter(
      (u) => u.id !== currentUser?.id
    );

    // nếu sau khi lọc mà rỗng (hiếm) thì fallback lại selected
    const baseList = filtered.length > 0 ? filtered : selected;

    const names = baseList.slice(0, 3).map((u) => u.name);

    if (baseList.length <= 3) {
      return names.join(", ");
    }

    return names.join(", ") + ", ...";
  };


  // HÀM HANDLE CREATE GROUP
  const handleCreateGroup = async () => {
    if (!canCreateGroup) return;

    const finalName = buildGroupName();

    try {
      const res = await createGroupApi(
        finalName,
        selected.map((u) => u.id)
      );

      console.log("CREATE SUCCESS:", res);

      onClose();
    } catch (err) {
      console.error("CREATE ERROR:", err);
    }
  };


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className={styles.header}>
          <span>Tạo nhóm</span>
          <X size={20} onClick={onClose} className={styles.close} />
        </div>

        {/* GROUP INFO */}
        <div className={styles.groupInfo}>
          <div className={styles.avatarUpload}>
            <Camera size={18} />
          </div>

          <input
            className={styles.inputBottom}
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* SEARCH */}
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            placeholder="Nhập số điện thoại..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        {/* CONTENT */}
        <div className={styles.content}>

          {/* LEFT LIST */}
          <div className={styles.list}>
            {loading && <div>Đang tìm kiếm...</div>}

            {!loading && notFound && (
              <div className={styles.notFound}>
                Không có kết quả phù hợp
              </div>
            )}

            {!loading &&
              friends.map((f) => {
                const isChecked = selected.some((s) => s.id === f.id);

                return (
                  <div
                    key={f.id}
                    className={styles.item}
                    onClick={() => toggleSelect(f)}
                  >
                    <div
                      className={`${styles.checkbox} ${isChecked ? styles.checked : ""
                        }`}
                    />

                    <img src={f.avatar} className={styles.avatar} />
                    <span>{f.name}</span>
                  </div>
                );
              })}
          </div>

          {/* RIGHT SELECTED */}
          {selected.length > 0 && (
            <div className={styles.selectedPanel}>
              <div className={styles.selectedHeader}>
                Đã chọn {selected.length}/100
              </div>

              <div className={styles.selectedList}>
                {selected.map((f) => (
                  <div key={f.id} className={styles.selectedItem}>
                    <img src={f.avatar} className={styles.avatar2} />
                    <span>{f.name}</span>

                    <span
                      className={styles.remove}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(f);
                      }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>

          <button
            className={`${styles.confirm} ${!canCreateGroup ? styles.disabled : ""
              }`}
            disabled={!canCreateGroup}
            onClick={handleCreateGroup}
          >
            Tạo nhóm
          </button>
        </div>

      </div>
    </div>
  );
}