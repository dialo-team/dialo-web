import { useEffect, useState } from "react";
import styles from "../../../styles/message/ChatInfo.module.css";
import {
  Users,
  Bell,
  Pin,
  Settings,
  LogOut,
  Trash2,
  Edit3,
  ChevronLeft,
  HelpCircle,
  UserMinus,
  KeyRound
} from "lucide-react";

import {
  getConversationMediaApi,
  clearConversationHistoryApi,
} from "../../../../../api/message/conversationApi";

import axiosClient from "../../../../../api/axiosClient";

import { RenameNameGroup } from "./RenameNameGroup";
import { ChangeGroupAvatarModal } from "./ChangeGroupAvatarModal";
import CreateGroupModal from "../../social/friendPage/searchAndAddFriend/CreateGroupModal";
import { leaveGroupApi, getListMemberApi, dissolveGroupApi } from "../../../../../api/social/groupFriend/groupApi";
import { AssignRoleModal } from "./AssignRoleModal";
import { ConfirmDissolveModal } from "./ConfirmDissolveModal";
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
  role?: string;
};

type Props = {
  conversationId: string;
  groupName: string;
  members: Member[];
  counterpartAvatarUrl?: string;
  onClose?: () => void;
  onConversationCleared?: () => void;
  onGroupDissolved?: () => void;
  onLeaveGroup?: () => void;
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
  onGroupDissolved,
  onLeaveGroup,
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

  const [viewMode, setViewMode] = useState<"info" | "manage" | "members" | "leaders">("info");
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const [friends, setFriends] = useState<string[]>([]);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
  const isMe = (userId: string) => userId === currentUserId;

  const currentUserRole = memberList.find((m) => m.id === currentUserId)?.role ?? "MEMBER";
  const isOwner = currentUserRole === "OWNER";

  const [openInvite, setOpenInvite] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignRoleType, setAssignRoleType] = useState<"ADMIN" | "OWNER">("ADMIN");
  const [leaveAfterAssign, setLeaveAfterAssign] = useState(false);

  const [openDissolveModal, setOpenDissolveModal] = useState(false);
  const [dissolving, setDissolving] = useState(false);

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

  /* ================= LOAD MEMBERS ================= */

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
                role: m.role,
              };
            } catch {
              return {
                id: m.userId,
                name: m.displayName,
                avatar: "",
                role: m.role,
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

  /* ================= LOAD FRIENDS ================= */

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

  useEffect(() => {
    const handler = (e: any) => {
      const { userId, avatar } = e.detail;
      setMemberList((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, avatar } : m))
      );
    };
    window.addEventListener("user-avatar-updated", handler);
    return () => window.removeEventListener("user-avatar-updated", handler);
  }, []);

  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userLocal?.id) return;

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

      // const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userLocal?.id) return;
      // reset state (giống ChatInfo)
      setImages([]);
      setFiles([]);
      setAllMedia([]);
      setResolvedMap({});

      onConversationCleared?.();
      window.dispatchEvent(
        new CustomEvent("conversation-cleared", { detail: { conversationId } })
      );
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
      setOpenLeaveModal(false);
      onLeaveGroup?.();
    } catch (err) {
      console.error("Leave group error:", err);
    } finally {
      setLeaving(false);
    }
  };

  const handleLeaveClick = () => {
    if (isOwner) {
      setLeaveAfterAssign(true);
      setAssignRoleType("OWNER");
      setOpenAssignModal(true);
    } else {
      setOpenLeaveModal(true);
    }
  };

  const handleAssignSuccess = async () => {
    if (leaveAfterAssign) {
      setLeaveAfterAssign(false);
      setLeaving(true);
      try {
        await leaveGroupApi(conversationId);
        onLeaveGroup?.();
      } catch (err) {
        console.error("Leave after transfer error:", err);
      } finally {
        setLeaving(false);
      }
    }
  };

  const handleDissolve = async () => {
    if (dissolving) return;
    setDissolving(true);
    try {
      await dissolveGroupApi(conversationId);

      setOpenDissolveModal(false);
      window.dispatchEvent(
        new CustomEvent("group-dissolved", { detail: { conversationId } })
      );
      onGroupDissolved?.();
      onClose?.();
    } catch (err) {
      console.error("Dissolve group error:", err);
    } finally {
      setDissolving(false);
    }
  };

  const filteredMembers = memberList.filter((m) =>
    (m.name || "").toLowerCase().includes(keyword.toLowerCase())
  );

  const isFriend = (userId: string) => friends.includes(userId);

  const mapToUser = (m: Member): User => ({
    id: m.id,
    userName: m.name,
    avatar: m.avatar,
    bio: "",
    background: "",
    theme: "LIGHT",
  });

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
                            alt="media"
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
                            <span className={styles.fileNameInGrid}>{m.attachment.fileName || "File"}</span>
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
              <div className={styles.titleRow}>
                <h3 className={styles.title}>Thông tin nhóm</h3>
                {/* <button className={styles.closeBtn} onClick={onClose}>
                <X size={18} />
              </button> */}
              </div>

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
                  onClick={() => isOwner && setOpenAvatarModal(true)}
                  style={{ cursor: isOwner ? "pointer" : "default" }}
                />
                <div className={styles.usernameRow}>
                  <div className={styles.username}>{groupNameState}</div>
                  {isOwner && <Edit3 size={14} onClick={() => setOpenRename(true)} />}
                </div>
              </div>

              <div className={styles.actionsRow}>
                <div className={styles.actionItem}>
                  <Bell size={30} />
                  <span>Tắt<br />thông báo</span>
                </div>
                <div className={styles.actionItem}>
                  <Pin size={30} />
                  <span>Ghim<br />hội thoại</span>
                </div>
                <div className={styles.actionItem} onClick={() => setOpenAddMember(true)}>
                  <Users size={30} />
                  <span>Thêm<br />thành viên</span>
                </div>

                <div
                  className={styles.actionItem}
                  onClick={() => setViewMode("manage")}
                >
                  <Settings size={30} />
                  <span>Quản lý<br />nhóm</span>
                </div>
              </div>

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

              {!loading && (
                <>
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>Ảnh/Video</div>
                    <div className={styles.imageGridContent}>
                      {images.slice(0, 8).map((i, idx) => (
                        <img key={idx} src={i.url} className={styles.mediaImage} alt="media" />
                      ))}
                    </div>
                    {images.length > 0 && (
                      <button className={styles.showMoreButton} onClick={() => { setTab("images"); setViewAll(true); }}>
                        Xem tất cả ({images.length})
                      </button>
                    )}
                  </div>

                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>File</div>
                    {files.slice(0, 3).map((f, i) => (
                      <div key={i} className={styles.item}>{f.name}</div>
                    ))}
                    {files.length > 0 && (
                      <button className={styles.showMoreButton} onClick={() => { setTab("files"); setViewAll(true); }}>
                        Xem tất cả ({files.length})
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* DELETE */}
              <div className={styles.deleteBox}>
                <button className={styles.deleteButton} onClick={handleClear}>
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  {clearing ? "Đang xóa..." : "Xóa đoạn hội thoại"}
                </button>
                <button className={styles.deleteButton} onClick={handleLeaveClick}>
                  <LogOut size={14} /> {isOwner ? "Chuyển quyền & Rời nhóm" : "Rời nhóm"}
                </button>
              </div>
            </>
          )}

          {/* ============ MANAGE VIEW (ZALO LAYOUT) ============ */}
          {!viewAll && viewMode === "manage" && (
            <div className={styles.manageWrapper}>
              <div className={styles.manageHeader}>
                <button className={styles.pointer} style={{ border: 'none', background: 'none' }} onClick={() => setViewMode("info")}>
                  <ChevronLeft size={22} />
                </button>
                <h3 style={{ fontSize: 16, margin: 0 }}>Quản lý nhóm</h3>
              </div>

              {/* Bọc toàn bộ vào nền xám */}
              <div className={styles.manageContainer}>

                {!isOwner && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f0f2f5",
                    padding: "10px 16px",
                    fontSize: 13,
                    color: "#555",
                    borderBottom: "1px solid #e0e0e0",
                  }}>
                    Tính năng chỉ dành cho quản trị viên
                  </div>
                )}

                {/* Block 1: Checkbox quyền */}
                <div className={styles.manageBlock} style={!isOwner ? { opacity: 0.5, pointerEvents: "none" } : {}}>
                  <div className={styles.blockTitle}>
                    Cho phép các thành viên trong nhóm:
                  </div>
                  {[
                    "Thay đổi tên & ảnh đại diện của nhóm",
                    "Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại",
                    "Tạo mới ghi chú, nhắc hẹn",
                    "Tạo mới bình chọn",
                    "Gửi tin nhắn",
                  ].map((text, i) => (
                    <div key={i} className={styles.rowItem}>
                      <span>{text}</span>
                      <input type="checkbox" defaultChecked disabled={!isOwner} className={styles.zaloCheckbox} />
                    </div>
                  ))}
                </div>

                {/* Block 2: Toggle switches */}
                <div className={styles.manageBlock} style={!isOwner ? { opacity: 0.5, pointerEvents: "none" } : {}}>
                  <div className={styles.rowItem}>
                    <div className={styles.rowText}>
                      Chế độ phê duyệt thành viên mới <HelpCircle size={16} className={styles.helpIcon} />
                    </div>
                    <input type="checkbox" disabled={!isOwner} className={styles.toggleSwitch} />
                  </div>

                  <div className={styles.rowItem}>
                    <div className={styles.rowText}>
                      Đánh dấu tin nhắn từ trưởng/phó nhóm <HelpCircle size={16} className={styles.helpIcon} />
                    </div>
                    <input type="checkbox" defaultChecked disabled={!isOwner} className={styles.toggleSwitch} />
                  </div>

                  <div className={styles.rowItem}>
                    <div className={styles.rowText}>
                      Cho phép thành viên mới đọc tin nhắn gần nhất <HelpCircle size={16} className={styles.helpIcon} />
                    </div>
                    <input type="checkbox" defaultChecked disabled={!isOwner} className={styles.toggleSwitch} />
                  </div>

                  <div className={styles.rowItem}>
                    <div className={styles.rowText}>
                      Cho phép dùng link tham gia nhóm <HelpCircle size={16} className={styles.helpIcon} />
                    </div>
                    <input type="checkbox" disabled={!isOwner} className={styles.toggleSwitch} />
                  </div>
                </div>

                {/* Block 3: Hành động danh sách */}
                <div className={styles.manageBlock} style={{ padding: '4px 16px', ...(!isOwner ? { opacity: 0.5, pointerEvents: "none" } : {}) }}>
                  <button className={styles.listActionBtn} disabled={!isOwner}>
                    <UserMinus size={20} />
                    Chặn khỏi nhóm
                  </button>
                  <button className={styles.listActionBtn} disabled={!isOwner} onClick={() => setViewMode("leaders")}>
                    <KeyRound size={20} />
                    Trưởng & phó nhóm
                  </button>
                </div>

                {/* Block 4: Giải tán */}
                <div style={{ padding: "16px" }}>
                  <button
                    onClick={() => setOpenDissolveModal(true)}
                    disabled={!isOwner || dissolving}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: isOwner ? "#fff0f0" : "#f5f5f5",
                      color: isOwner ? "#d32f2f" : "#aaa",
                      border: `1px solid ${isOwner ? "#ffcdd2" : "#e0e0e0"}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: isOwner ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background 0.2s",
                    }}
                  >
                     {dissolving ? "Đang giải tán..." : "Giải tán nhóm"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ============ LEADERS VIEW ============ */}
          {!viewAll && viewMode === "leaders" && (
            <div className={styles.manageWrapper}>
              <div className={styles.manageHeader}>
                <button className={styles.pointer} style={{ border: 'none', background: 'none' }} onClick={() => setViewMode("manage")}>
                  <ChevronLeft size={22} />
                </button>
                <h3 style={{ fontSize: 16, margin: 0 }}>Trưởng & phó nhóm</h3>
              </div>

              <div className={styles.manageContainer} style={{ background: '#fff', padding: '0 16px' }}>
                {(() => {
                  const owner = memberList.find((m) => m.role === "OWNER");
                  if (!owner) return null;
                  return (
                    <div className={styles.leaderProfileRow}>
                      <img
                        src={owner.avatar || "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"}
                        alt="avatar"
                        className={styles.userAvatarLg}
                      />
                      <div>
                        <div className={styles.userNameText}>{owner.name}</div>
                        <div className={styles.userRoleText}>Trưởng nhóm</div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  className={styles.leaderActionBtn}
                  onClick={() => { setLeaveAfterAssign(false); setAssignRoleType("ADMIN"); setOpenAssignModal(true); }}
                >
                  Thêm phó nhóm
                </button>
                <button
                  className={styles.leaderActionBtn}
                  onClick={() => { setLeaveAfterAssign(false); setAssignRoleType("OWNER"); setOpenAssignModal(true); }}
                >
                  Chuyển quyền trưởng nhóm
                </button>
              </div>
            </div>
          )}

          {/* ============ MEMBERS VIEW ============ */}
          {!viewAll && viewMode === "members" && (
            <div className={styles.manageWrapper}>
              <div className={styles.manageHeader}>
                <button className={styles.pointer} style={{ border: 'none', background: 'none' }} onClick={() => setViewMode("info")}>
                  <ChevronLeft size={22} />
                </button>
                <h3 style={{ fontSize: 16, margin: 0 }}>Thành viên</h3>
              </div>

              <div className={styles.allMediaContent} style={{ padding: 0 }}>
                <div className={styles.actionItem} onClick={() => setOpenAddMember(true)} style={{ flexDirection: "row", justifyContent: "center", padding: '16px 0' }}>
                  <Users size={20} />
                  <span style={{ fontSize: 14 }}>Thêm thành viên</span>
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

                <div style={{ padding: '0 12px' }}>
                  {loadingMembers ? (
                    <div>Đang tải...</div>
                  ) : (
                    filteredMembers.map((m) => (
                      <div key={m.id} className={styles.item} style={{ margin: '0 0 8px 0' }} onClick={() => console.log("conversationId:", conversationId, "memberId:", m.id)}>
                        <img
                          src={m.avatar || "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa"}
                          className={styles.userAvatarMd}
                          alt="avatar"
                        />
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                          <span className={styles.memberName}>
                            {isMe(m.id) ? "Bạn" : m.name}
                          </span>
                          {m.role && m.role !== "MEMBER" && (
                            <span style={{ fontSize: 11, color: m.role === "OWNER" ? "#e6a817" : "#0068ff" }}>
                              {m.role === "OWNER" ? "Trưởng nhóm" : "Phó nhóm"}
                            </span>
                          )}
                        </div>

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
          onSaved={(newName) => setGroupNameState(newName)}
        />
      )}

      {openAvatarModal && (
        <ChangeGroupAvatarModal
          open={openAvatarModal}
          onClose={() => setOpenAvatarModal(false)}
          conversationId={conversationId}
          currentAvatar={groupAvatar}
          onUpdated={(newAvatar) => setGroupAvatar(newAvatar)}
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
        onSuccess={() => console.log("Send success")}
      />

      <AssignRoleModal
        open={openAssignModal}
        onClose={() => { setOpenAssignModal(false); setLeaveAfterAssign(false); }}
        conversationId={conversationId}
        members={memberList}
        roleType={assignRoleType}
        onSuccess={handleAssignSuccess}
      />

      <ConfirmDissolveModal
        open={openDissolveModal}
        onClose={() => setOpenDissolveModal(false)}
        onConfirm={handleDissolve}
        loading={dissolving}
      />
    </>
  );
};