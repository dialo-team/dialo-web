import { useEffect, useState } from "react";
import styles from "../../../styles/message/ChatInfo.module.css";
import {
  X,
  Users,
  Bell,
  Pin,
  Settings,
  LogOut,
  Trash2,
  Edit3,
  ChevronLeft,
} from "lucide-react";

import {
  getConversationMediaApi,
  clearConversationHistoryApi,
} from "../../../../../api/message/conversationApi";

import axiosClient from "../../../../../api/axiosClient";

import { RenameNameGroup } from "./RenameNameGroup";
import { ChangeGroupAvatarModal } from "./ChangeGroupAvatarModal";
import CreateGroupModal from "../../social/friendPage/searchAndAddFriend/CreateGroupModal";
import { leaveGroupApi, getListMemberApi } from "../../../../../api/social/groupFriend/groupApi";
import { ConfirmLeaveGroupModal } from "./ConfirmLeaveGroupModal";
import { getUserInfoApi } from "../../../../../api/social/searchAndAddFriend/userApi";
import { getFriendsApi } from "../../../../../api/social/listFriend/ListFriendApi";
import { InviteFriendModal } from "../../social/friendPage/searchAndAddFriend/InviteFriendModal";
import type { User } from "@/app/types/social/User";

/* ================= TYPES ================= */

type Member = {
  id: string;
  name: string;
  avatar: string;
};

type Props = {
  conversationId: string;
  groupName: string;
  members: Member[];
  counterpartAvatarUrl?: string;
  onClose?: () => void;
  onConversationCleared?: () => void;
};

/* ================= HELPERS ================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";

const toAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
};

const resolveImageUrl = async (url?: string) => {
  if (!url) return "";

  // Nếu là base64 hoặc data URL → trả thẳng luôn
  if (url.startsWith("data:image") || url.startsWith("data:")) {
    return url;
  }

  try {
    const res = await axiosClient.get(toAbsoluteUrl(url), {
      responseType: "blob",
    });
    return URL.createObjectURL(res.data);
  } catch {
    return toAbsoluteUrl(url);
  }
};

const getDateLabel = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dStr = d.toLocaleDateString("vi-VN");
  if (dStr === today.toLocaleDateString("vi-VN")) return "Hôm nay";
  if (dStr === yesterday.toLocaleDateString("vi-VN")) return "Hôm qua";
  return dStr;
};



/* ================= MAIN ================= */

export const ChatGroupInfo = ({
  conversationId,
  groupName,
  members,
  counterpartAvatarUrl,
  onConversationCleared,
  onClose,
}: Props) => {
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [files, setFiles] = useState<{ name: string }[]>([]);
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [resolvedMap, setResolvedMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [viewAll, setViewAll] = useState(false);
  const [tab, setTab] = useState<"images" | "files">("images");

  const [openRename, setOpenRename] = useState(false);
  const [openAvatarModal, setOpenAvatarModal] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);

  const [leaving, setLeaving] = useState(false);
  const [openLeaveModal, setOpenLeaveModal] = useState(false);

  const [viewMode, setViewMode] = useState<"info" | "manage" | "members">("info");
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const [friends, setFriends] = useState<string[]>([]);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
  const isMe = (userId: string) => userId === currentUserId;

  const [openInvite, setOpenInvite] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);

  const [groupAvatar, setGroupAvatar] = useState(counterpartAvatarUrl || "");
  const [groupNameState, setGroupNameState] = useState(groupName);


  /* ================= LOAD MEDIA ================= */


  useEffect(() => {
    const load = async () => {
      if (!conversationId) return;

      setLoading(true);
      try {
        const media = await getConversationMediaApi(conversationId);
        setAllMedia(media);

        const imgs: { url: string }[] = [];
        const fls: { name: string }[] = [];
        const resolved: Record<string, string> = {};

        for (const m of media) {
          if (m.attachment?.thumbnailUrl) {
            const url = await resolveImageUrl(m.attachment.thumbnailUrl);
            imgs.push({ url });
            resolved[m.id] = url;
          } else if (m.attachment?.fileUrl) {
            fls.push({
              name: m.attachment.fileName || "File",
            });
          }
        }

        setImages(imgs);
        setFiles(fls);
        setResolvedMap(resolved);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [conversationId]);


  // lòa thông tin chi tiết của từng member
  useEffect(() => {
    const loadMembers = async () => {
      if (!conversationId) return;

      setLoadingMembers(true);
      try {
        // 1. lấy danh sách member (chỉ có userId)
        const res = await getListMemberApi(conversationId);
        const rawList = res.data || res;

        // 2. gọi API chi tiết song song
        const detailList = await Promise.all(
          rawList.map(async (m: any) => {
            try {
              const userRes = await getUserInfoApi(m.userId);
              const user = userRes.data?.data;

              return {
                id: m.userId,
                name: user?.userName || m.displayName,
                avatar: user?.avatar || "",
              };
            } catch {
              // fallback nếu lỗi
              return {
                id: m.userId,
                name: m.displayName,
                avatar: "",
              };
            }
          })
        );

        setMemberList(detailList);
      } catch (err) {
        console.error("Load members error:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [conversationId]);


  // load danh sách thành viên
  useEffect(() => {
    const loadMembers = async () => {
      if (!conversationId) return;

      setLoadingMembers(true);
      try {
        const res = await getListMemberApi(conversationId);

        // tùy backend trả về structure
        const data = res.data || res;

        const mapped = data.map((m: any) => ({
          id: m.id,
          name: m.userName,
          avatar: toAbsoluteUrl(m.avatar),
        }));

        setMemberList(mapped);
      } catch (err) {
        console.error("Load members error:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [conversationId]);


  // load danh scahs bạn bè
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const res = await getFriendsApi();
        const data = res.data?.friends || [];

        const friendIds = data.map((f: any) => f.friendId);

        setFriends(friendIds);
      } catch (err) {
        console.error("Load friends error:", err);
      }
    };

    loadFriends();
  }, []);

  useEffect(() => {
    setGroupNameState(groupName);
  }, [groupName]);
  /* ================= CLEAR CHAT ================= */

  const handleClear = async () => {
  if (clearing) return;

  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  if (!userLocal?.id) return;

  setClearing(true);
  try {
    await clearConversationHistoryApi({
      conversationId,
      userId: userLocal.id,
    });

    // reset state (giống ChatInfo)
    setImages([]);
    setFiles([]);
    setAllMedia([]);
    setResolvedMap({});

    // callback parent
    onConversationCleared?.();
  } catch (err) {
    console.error("Clear group conversation error:", err);
  } finally {
    setClearing(false);
  }
};

  // rời nhóm
  const handleLeaveGroup = async () => {
    if (leaving) return;

    setLeaving(true);
    try {
      await leaveGroupApi(conversationId);

      // đóng modal
      setOpenLeaveModal(false);

      // đóng luôn panel chat info (nếu có)
      onClose?.();
    } catch (err) {
      console.error("Leave group error:", err);
    } finally {
      setLeaving(false);
    }
  };

  // tìm kiếm
  const filteredMembers = memberList.filter((m) =>
    (m.name || "").toLowerCase().includes(keyword.toLowerCase())
  );

  // kiểm tra bạn bè
  const isFriend = (userId: string) => {
    return friends.includes(userId);
  };

  // Map Member → User
  const mapToUser = (m: Member): User => {
    return {
      id: m.id,
      userName: m.name,
      avatar: m.avatar,
      bio: "",
      background: "",
      theme: "LIGHT",
    };
  };


  /* ================= GROUP MEDIA ================= */

  const groupedImages = Object.entries(
    allMedia.reduce((acc: Record<string, any[]>, m) => {
      if (m.attachment?.thumbnailUrl) {
        const key = getDateLabel(m.createdAt);
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
      }
      return acc;
    }, {})
  );

  const groupedFiles = Object.entries(
    allMedia.reduce((acc: Record<string, any[]>, m) => {
      if (m.attachment?.fileUrl && !m.attachment?.thumbnailUrl) {
        const key = getDateLabel(m.createdAt);
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
      }
      return acc;
    }, {})
  );

  /* ================= UI ================= */
  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

          {/* Xem tát cả cho ảnh và file */}
          {viewAll && (
            <>
              <div className={styles.storageTitleRow}>
                <button onClick={() => setViewAll(false)}>
                  <ChevronLeft size={24} />
                </button>

                <h3 className={styles.storageTitle}>Kho lưu trữ</h3>

                {/* <button onClick={onClose}>
                  <X size={18} />
                </button> */}
              </div>

              {/* TAB */}
              <div className={styles.allMediaTabs}>
                <button
                  className={`${styles.allMediaTab} ${tab === "images" ? styles.active : ""}`}
                  onClick={() => setTab("images")}
                >
                  Ảnh/Video
                </button>

                <button
                  className={`${styles.allMediaTab} ${tab === "files" ? styles.active : ""}`}
                  onClick={() => setTab("files")}
                >
                  Files
                </button>
              </div>

              {/* CONTENT */}
              <div className={styles.allMediaContent}>
                {tab === "images" &&
                  groupedImages.map(([date, list]) => (
                    <div key={date}>
                      <h3 className={styles.dateSectionLabel}>{date}</h3>

                      <div className={styles.allMediaGrid}>
                        {list.map((m) => (
                          <img
                            key={m.id}
                            src={resolvedMap[m.id]}
                            className={styles.allMediaImage}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                {tab === "files" &&
                  groupedFiles.map(([date, list]) => (
                    <div key={date}>
                      <h3 className={styles.dateSectionLabel}>{date}</h3>

                      <div className={styles.allMediaGrid}>
                        {list.map((m) => (
                          <div key={m.id} className={styles.allMediaFile}>
                            {m.attachment.fileName || "File"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ============ INFO VIEW ============ */}
          {!viewAll && viewMode === "info" && (
            <>
              {/* HEADER */}
              <div className={styles.titleRow}>
                <h3 className={styles.title}>Thông tin nhóm</h3>
                {/* <button className={styles.closeBtn} onClick={onClose}>
                <X size={18} />
              </button> */}
              </div>

              {/* TOP */}
              <div className={styles.top}>
                {/* <img
                  src={members[0]?.avatar}
                  className={styles.avatar}
                  onClick={() => setOpenAvatarModal(true)}
                /> */}
                <img
                  src={
                    groupAvatar ||
                    (counterpartAvatarUrl && counterpartAvatarUrl.startsWith("data:image")
                      ? counterpartAvatarUrl
                      : toAbsoluteUrl(counterpartAvatarUrl || "")) ||
                    "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                  }
                  className={styles.avatar}
                  onClick={() => setOpenAvatarModal(true)}
                />

                <div className={styles.usernameRow}>
                  <div className={styles.username}>{groupNameState}</div>
                  <Edit3 size={14} onClick={() => setOpenRename(true)} />
                </div>
              </div>

              {/* ACTIONS */}
              <div className={styles.actionsRow}>
                <div className={styles.actionItem}>
                  <Bell size={20} />
                  <span>Tắt<br />thông báo</span>
                </div>

                <div className={styles.actionItem}>
                  <Pin size={20} />
                  <span>Ghim<br />hội thoại</span>
                </div>

                <div
                  className={styles.actionItem}
                  onClick={() => setOpenAddMember(true)}
                >
                  <Users size={20} />
                  <span>Thêm<br />thành viên</span>
                </div>

                <div
                  className={styles.actionItem}
                  onClick={() => setViewMode("manage")}
                >
                  <Settings size={20} />
                  <span>Quản lý<br />nhóm</span>
                </div>
              </div>

              {/* MEMBERS */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  Thành viên nhóm
                </div>

                <div
                  onClick={() => setViewMode("members")}
                  style={{ cursor: "pointer" }}
                >
                  Thành viên ({memberList.length})
                </div>

              </div>

              {/* MEDIA PREVIEW */}
              {!loading && (
                <>
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>Ảnh/Video</div>

                    <div className={styles.imageGridContent}>
                      {images.slice(0, 8).map((i, idx) => (
                        <img key={idx} src={i.url} className={styles.mediaImage} />
                      ))}
                    </div>

                    <button
                      className={styles.showMoreButton}
                      onClick={() => {
                        setTab("images");
                        setViewAll(true);
                      }}
                    >
                      Xem tất cả ({images.length})
                    </button>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>File</div>

                    {files.slice(0, 3).map((f, i) => (
                      <div key={i} className={styles.item}>
                        {f.name}
                      </div>
                    ))}

                    <button
                      className={styles.showMoreButton}
                      onClick={() => {
                        setTab("files");
                        setViewAll(true);
                      }}
                    >
                      Xem tất cả ({files.length})
                    </button>
                  </div>
                </>
              )}

              {/* DELETE */}
              <div className={styles.deleteBox}>
                <button className={styles.deleteButton} onClick={handleClear}>
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  {clearing ? "Đang xóa..." : "Xóa đoạn hội thoại"}
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={() => setOpenLeaveModal(true)}
                >
                  <LogOut size={14} /> Rời nhóm
                </button>
              </div>
            </>
          )}



          {/* ============ MANAGE VIEW ============ */}
          {!viewAll && viewMode === "manage" && (
            <div className={styles.manageWrapper}>

              <div className={styles.manageHeader}>
                <button onClick={() => setViewMode("info")}>
                  <ChevronLeft size={22} />
                </button>

                <h3>Quản lý nhóm</h3>
              </div>

              <div className={styles.manageContent}>

                <div className={styles.manageSectionTitle}>
                  Cho phép các thành viên trong nhóm:
                </div>

                {[
                  "Thay đổi tên & ảnh đại diện của nhóm",
                  "Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại",
                  "Tạo mới ghi chú, nhắc hẹn",
                  "Tạo mới bình chọn",
                  "Gửi tin nhắn",
                ].map((text, i) => (
                  <div key={i} className={styles.manageRow}>
                    <span>{text}</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                ))}

                <hr />

                {[
                  "Chế độ phê duyệt thành viên mới",
                  "Đánh dấu tin nhắn từ trưởng/phó nhóm",
                  "Cho phép thành viên mới đọc tin nhắn gần nhất",
                  "Cho phép dùng link tham gia nhóm",
                ].map((text, i) => (
                  <div key={i} className={styles.manageToggleRow}>
                    <span>{text}</span>
                    <input type="checkbox" />
                  </div>
                ))}

                <div className={styles.deleteBox}>
                  <div className={styles.manageDangerBox}>
                    <button>Chặn khỏi nhóm</button>
                    <button>Trưởng & phó nhóm</button>
                  </div>
                  <button className={styles.leaveGroupBtn}>
                    Giải tán nhóm
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ============ MEMBER VIEW ============ */}
          {!viewAll && viewMode === "members" && (
            <div className={styles.manageWrapper}>

              <div className={styles.manageHeader}>
                <button onClick={() => setViewMode("info")}>
                  <ChevronLeft size={22} />
                </button>

                <h3>Thành viên</h3>
              </div>

              <div className={styles.manageContent}>

                <div
                  className={styles.actionItem}
                  onClick={() => setOpenAddMember(true)}
                >
                  <Users size={20} />
                  <span>Thêm thành viên</span>
                </div>

                <div className={styles.searchBox}>


                  <input
                    type="text"
                    placeholder="Tìm thành viên"
                    value={search}
                    className={styles.searchInput}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setKeyword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setKeyword(search);
                        setSearch("");
                      }
                    }}
                  />
                </div>

                {loadingMembers ? (
                  <div>Đang tải...</div>
                ) : (
                  filteredMembers.map((m) => (
                    <div key={m.id} className={styles.item}>
                      <img
                        src={
                          m.avatar ||
                          "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"
                        }
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          marginRight: 10,
                        }}
                      />

                      <span className={styles.memberName}>
                        {isMe(m.id) ? "Bạn" : m.name}
                      </span>


                      {!isMe(m.id) && !isFriend(m.id) && (
                        <button
                          className={styles.addFriendBtn}
                          onClick={() => {
                            setSelectedUser(m);
                            setOpenInvite(true);
                          }}
                        >
                          Kết bạn
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>


      {/* ============ MODALS (LUÔN ĐẶT NGOÀI) ============ */}

      {openRename && (
        <RenameNameGroup
          open={openRename}
          onClose={() => setOpenRename(false)}
          conversationId={conversationId}
          currentName={groupName}
          currentAvatar={groupAvatar}
          onSaved={(newName) => {
            setGroupNameState(newName);
          }}
        />
      )}

      {openAvatarModal && (
        <ChangeGroupAvatarModal
          open={openAvatarModal}
          onClose={() => setOpenAvatarModal(false)}
          conversationId={conversationId}
          currentAvatar={groupAvatar}
          onUpdated={(newAvatar) => {
            setGroupAvatar(newAvatar);
          }}
        />
      )}

      {openAddMember && (
        <CreateGroupModal
          onClose={() => setOpenAddMember(false)}
          conversationId={conversationId}
        />
      )}

      <ConfirmLeaveGroupModal
        open={openLeaveModal}
        onClose={() => setOpenLeaveModal(false)}
        onConfirm={handleLeaveGroup}
        loading={leaving}
      />

      <InviteFriendModal
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        user={selectedUser ? mapToUser(selectedUser) : null}
        // onSend={(msg) => alert(msg)} // hoặc toast
        onSuccess={() => {
          console.log("Send success");
        }}
      />
    </>
  );
};