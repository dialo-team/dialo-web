import { useEffect, useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/CreateGroupModal.module.css";
import { X, Search, Camera } from "lucide-react";
import { getFriendsApi } from "../../../../../../api/social/listFriend/ListFriendApi";
import { userApi } from "../../../../../../api/social/searchAndAddFriend/userApi";
import {
  addMembersApi,
  createGroupApi,
  getListMemberApi,
} from "../../../../../../api/social/groupFriend/groupApi";
import { useAuthStore } from "../../../../../../store/authStore";

type Friend = {
  id: string;
  name: string;
  avatar: string;
};

type Props = {
  onClose: () => void;
  conversationId?: string;
};

export default function CreateGroupModal({
  onClose,
  conversationId,
}: Props) {
  const isAddMemberMode = !!conversationId;

  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<Friend[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [groupName, setGroupName] = useState("");

  const currentUser = useAuthStore((state) => state.user);
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);


  //  FIX LOGIC: add member cần >=1, create group cần >=2
  const canSubmit = isAddMemberMode
    ? selected.length >= 1
    : selected.length >= 2;

  const loadFriends = async () => {
    try {
      const res = await getFriendsApi();
      const data = res?.data?.friends || [];

      const mapped: Friend[] = data.map((f: any) => ({
        id: f.friendId,
        name: f.friendUserName ?? "",
        avatar: f.friendAvatar ?? "",
      }));


      // setFriends(mapped);
      setAllFriends(mapped);
      setNotFound(false);
    } catch (err) {
      console.error(err);
    }
  };





  const loadGroupMembers = async () => {
    try {
      const res = await getListMemberApi(conversationId!);

      const data = res?.data || [];

      const mapped: Friend[] = data.map((m: any) => ({
        id: m.userId,
        name: m.displayName ?? "",
        avatar: m.avatarUrl ?? "",
      }));

      setGroupMembers(mapped);
    } catch (err) {
      console.error(err);
    }
  };


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
        setKeyword("");
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
    } catch {
      setLoading(false);
      setFriends([]);
      setNotFound(true);
      setKeyword("");
    }
  };

  const buildGroupName = () => {
    if (groupName.trim()) return groupName.trim();

    const filtered = selected.filter((u) => u.id !== currentUser?.id);
    const baseList = filtered.length > 0 ? filtered : selected;

    const names = baseList.slice(0, 3).map((u) => u.name);

    if (baseList.length <= 3) {
      return names.join(", ");
    }

    return names.join(", ") + ", ...";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      // ADD MEMBER
      if (isAddMemberMode) {
        await addMembersApi(
          conversationId!,
          selected.map((u) => u.id)
        );

        onClose();
        return;
      }

      // CREATE GROUP
      const finalName = buildGroupName();

      await createGroupApi(
        finalName,
        selected.map((u) => u.id)
      );

      onClose();
    } catch (err) {
      console.error("HANDLE GROUP ERROR:", err);
    }
  };

  useEffect(() => {
    if (!isAddMemberMode) {
      setFriends(allFriends);
      return;
    }

    if (!groupMembers.length) {
      setFriends(allFriends);
      return;
    }

    const memberIds = new Set(groupMembers.map((m) => m.id));

    const filtered = allFriends.filter(
      (f) => !memberIds.has(f.id)
    );

    setFriends(filtered);
  }, [allFriends, groupMembers, isAddMemberMode]);

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (isAddMemberMode && conversationId) {
      loadGroupMembers();
    }
  }, [isAddMemberMode, conversationId]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <span>
            {isAddMemberMode ? "Thêm thành viên" : "Tạo nhóm"}
          </span>
          <X size={20} onClick={onClose} className={styles.close} />
        </div>

        {/* GROUP INFO (chỉ tạo group mới) */}
        {!isAddMemberMode && (
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
        )}

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
          <div className={styles.list}>
            {loading && <div>Đang tìm kiếm...</div>}

            {!loading && notFound && (
              <div className={styles.notFound}>
                Không có kết quả phù hợp
              </div>
            )}

            {!loading &&
              friends.map((f) => {
                const isChecked = selected.some(
                  (s) => s.id === f.id
                );

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
                    <img
                      src={f.avatar}
                      className={styles.avatar}
                    />
                    <span>{f.name}</span>
                  </div>
                );
              })}
          </div>

          {/* SELECTED */}
          {selected.length > 0 && (
            <div className={styles.selectedPanel}>
              <div className={styles.selectedHeader}>
                Đã chọn {selected.length}/100
              </div>

              <div className={styles.selectedList}>
                {selected.map((f) => (
                  <div
                    key={f.id}
                    className={styles.selectedItem}
                  >
                    <img
                      src={f.avatar}
                      className={styles.avatar2}
                    />
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
            className={`${styles.confirm} ${!canSubmit ? styles.disabled : ""
              }`}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isAddMemberMode
              ? "Thêm thành viên"
              : "Tạo nhóm"}
          </button>
        </div>
      </div>
    </div>
  );
}