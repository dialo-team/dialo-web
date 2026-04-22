// import { useEffect, useState } from "react";
// import styles from "../../../styles/message/ChatInfo.module.css";
// import {
//     ChevronLeft,
//     X,
//     Users,
//     Bell,
//     Pin,
//     Settings,
//     LogOut,
//     Trash2,
//     Edit3,
// } from "lucide-react";

// import {
//     getConversationMediaApi,
//     clearConversationHistoryApi,
// } from "../../../../../api/message/conversationApi";

// import axiosClient from "../../../../../api/axiosClient";
// import { RenameNameGroup } from "./RenameNameGroup";

// /* ================= TYPES ================= */

// type Member = {
//     id: string;
//     name: string;
//     avatar: string;
// };

// type Props = {
//     conversationId: string;
//     groupName: string;
//     members: Member[];
//     onClose?: () => void;
// };

// /* ================= HELPERS ================= */

// const API_BASE_URL =
//     import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";

// const toAbsoluteUrl = (url: string) => {
//     if (!url) return "";
//     if (url.startsWith("http")) return url;
//     return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
// };

// const resolveImageUrl = async (url?: string) => {
//     if (!url) return "";
//     try {
//         const res = await axiosClient.get(toAbsoluteUrl(url), {
//             responseType: "blob",
//         });
//         return URL.createObjectURL(res.data);
//     } catch {
//         return toAbsoluteUrl(url);
//     }
// };

// const getDateLabel = (date: string) => {
//     const d = new Date(date);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     const dStr = d.toLocaleDateString("vi-VN");
//     if (dStr === today.toLocaleDateString("vi-VN")) return "Hôm nay";
//     if (dStr === yesterday.toLocaleDateString("vi-VN")) return "Hôm qua";
//     return dStr;
// };

// /* ================= MAIN ================= */

// export const ChatGroupInfo = ({
//     conversationId,
//     groupName,
//     members,
//     onClose,
// }: Props) => {
//     const [images, setImages] = useState<{ url: string }[]>([]);
//     const [files, setFiles] = useState<{ name: string }[]>([]);
//     const [allMedia, setAllMedia] = useState<any[]>([]);
//     const [resolvedMap, setResolvedMap] = useState<Record<string, string>>({});
//     const [loading, setLoading] = useState(false);
//     const [clearing, setClearing] = useState(false);

//     const [viewAll, setViewAll] = useState(false);
//     const [tab, setTab] = useState<"images" | "files">("images");

//     /* ===== LOAD MEDIA ===== */
//     useEffect(() => {
//         const load = async () => {
//             setLoading(true);
//             try {
//                 const media = await getConversationMediaApi(conversationId);
//                 setAllMedia(media);

//                 const imgs: { url: string }[] = [];
//                 const fls: { name: string }[] = [];
//                 const resolved: Record<string, string> = {};

//                 for (const m of media) {
//                     if (m.attachment?.thumbnailUrl) {
//                         const url = await resolveImageUrl(
//                             m.attachment.thumbnailUrl
//                         );
//                         imgs.push({ url });
//                         resolved[m.id] = url;
//                     } else if (m.attachment?.fileUrl) {
//                         fls.push({ name: m.attachment.fileName || "File" });
//                     }
//                 }

//                 setImages(imgs);
//                 setFiles(fls);
//                 setResolvedMap(resolved);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (conversationId) load();
//     }, [conversationId]);

//     /* ===== CLEAR ===== */
//     const handleClear = async () => {
//         if (clearing) return;

//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (!user?.id) return;

//         setClearing(true);
//         try {
//             await clearConversationHistoryApi({
//                 conversationId,
//                 userId: user.id,
//             });

//             setImages([]);
//             setFiles([]);
//             setAllMedia([]);
//         } finally {
//             setClearing(false);
//         }
//     };

//     const [openRename, setOpenRename] = useState(false);

//     /* ================= UI ================= */

//     return (
//         <>
//             <div className={styles.overlay} onClick={onClose}>
//                 <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
//                     {!viewAll ? (
//                         <>
//                             {/* HEADER */}
//                             <div className={styles.titleRow}>
//                                 <h3 className={styles.title}>Thông tin nhóm</h3>
//                                 <button className={styles.closeBtn} onClick={onClose}>
//                                     <X size={18} />
//                                 </button>
//                             </div>

//                             {/* TOP */}
//                             <div className={styles.top}>
//                                 <img src={members[0]?.avatar} />

//                                 <div className={styles.usernameRow}>
//                                     <div className={styles.username}>{groupName}</div>

//                                     <Edit3
//                                         size={14}
//                                         className={styles.editIcon}
//                                         onClick={() => setOpenRename(true)}
//                                     />
//                                 </div>
//                             </div>

//                             {/* ACTIONS */}
//                             <div className={styles.actionsRow}>
//                                 <div className={styles.actionItem}>
//                                     <Bell size={20} />
//                                     <span>Tắt<br />thông báo</span>
//                                 </div>

//                                 <div className={styles.actionItem}>
//                                     <Pin size={20} />
//                                     <span>Ghim<br />hội thoại</span>
//                                 </div>

//                                 <div className={styles.actionItem}>
//                                     <Users size={20} />
//                                     <span>Thêm<br />thành viên</span>
//                                 </div>

//                                 <div className={styles.actionItem}>
//                                     <Settings size={20} />
//                                     <span>Quản lý<br />nhóm</span>
//                                 </div>
//                             </div>
//                             {/* MEMBERS */}
//                             <div className={styles.section}>
//                                 <div className={styles.sectionHeader}>
//                                     Thành viên ({members.length})
//                                 </div>

//                                 {members.map((m) => (
//                                     <div key={m.id} className={styles.item}>
//                                         {m.name}
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* MEDIA */}
//                             {!loading && (
//                                 <>
//                                     <div className={styles.section}>
//                                         <div className={styles.sectionHeader}>
//                                             Ảnh/Video
//                                         </div>

//                                         <div className={styles.imageGridContent}>
//                                             {images.slice(0, 8).map((i, idx) => (
//                                                 <img key={idx} src={i.url} className={styles.mediaImage} />
//                                             ))}
//                                         </div>

//                                         <button
//                                             className={styles.showMoreButton}
//                                             onClick={() => {
//                                                 setTab("images");
//                                                 setViewAll(true);
//                                             }}
//                                         >
//                                             Xem tất cả ({images.length})
//                                         </button>
//                                     </div>

//                                     <div className={styles.section}>
//                                         <div className={styles.sectionHeader}>File</div>

//                                         {files.slice(0, 3).map((f, i) => (
//                                             <div key={i} className={styles.item}>{f.name}</div>
//                                         ))}

//                                         <button
//                                             className={styles.showMoreButton}
//                                             onClick={() => {
//                                                 setTab("files");
//                                                 setViewAll(true);
//                                             }}
//                                         >
//                                             Xem tất cả ({files.length})
//                                         </button>
//                                     </div>
//                                 </>
//                             )}

//                             {/* BOTTOM */}
//                             <div className={styles.deleteBox}>
//                                 <button className={styles.deleteButton} onClick={handleClear}>
//                                     <Trash2 size={14} /> {clearing ? "Đang xóa..." : "Xóa đoạn hội thoại"}
//                                 </button>

//                                 <button className={styles.deleteButton}>
//                                     <LogOut size={14} /> Rời nhóm
//                                 </button>
//                             </div>
//                         </>
//                     ) : (
//                         <>
//                             {/* ALL MEDIA */}
//                             <div className={styles.storageTitleRow}>
//                                 <button className={styles.backBtn} onClick={() => setViewAll(false)}>
//                                     <ChevronLeft size={24} />
//                                 </button>

//                                 <h3 className={styles.storageTitle}>Kho lưu trữ</h3>

//                                 <button className={styles.storageCloseBtn} onClick={onClose}>
//                                     <X size={18} />
//                                 </button>
//                             </div>

//                             <div className={styles.allMediaTabs}>
//                                 <button
//                                     className={`${styles.allMediaTab} ${tab === "images" ? styles.active : ""}`}
//                                     onClick={() => setTab("images")}
//                                 >
//                                     Ảnh/Video
//                                 </button>

//                                 <button
//                                     className={`${styles.allMediaTab} ${tab === "files" ? styles.active : ""}`}
//                                     onClick={() => setTab("files")}
//                                 >
//                                     Files
//                                 </button>
//                             </div>

//                             <div className={styles.allMediaContent}>
//                                 {tab === "images"
//                                     ? (Object.entries(
//                                         allMedia.reduce((acc, m) => {
//                                             if (m.attachment?.thumbnailUrl) {
//                                                 const key = getDateLabel(m.createdAt);
//                                                 acc[key] = acc[key] || [];
//                                                 acc[key].push(m);
//                                             }
//                                             return acc;
//                                         }, {} as Record<string, any[]>)
//                                     ) as [string, any[]][])
//                                         .map(([date, list]) => (
//                                             <div key={date}>
//                                                 <h3 className={styles.dateSectionLabel}>{date}</h3>
//                                                 <div className={styles.allMediaGrid}>
//                                                     {list.map((m) => (
//                                                         <img
//                                                             key={m.id}
//                                                             src={resolvedMap[m.id]}
//                                                             className={styles.allMediaImage}
//                                                         />
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     : (Object.entries(
//                                         allMedia.reduce((acc, m) => {
//                                             if (m.attachment?.fileUrl && !m.attachment?.thumbnailUrl) {
//                                                 const key = getDateLabel(m.createdAt);
//                                                 acc[key] = acc[key] || [];
//                                                 acc[key].push(m);
//                                             }
//                                             return acc;
//                                         }, {} as Record<string, any[]>)
//                                     ) as [string, any[]][])
//                                         .map(([date, list]) => (
//                                             <div key={date}>
//                                                 <h3 className={styles.dateSectionLabel}>{date}</h3>
//                                                 <div className={styles.allMediaGrid}>
//                                                     {list.map((m) => (
//                                                         <div key={m.id} className={styles.allMediaFile}>
//                                                             {m.attachment.fileName}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))}
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {openRename && (
//                 <RenameNameGroup
//                     open={openRename}
//                     onClose={() => setOpenRename(false)}
//                     conversationId={conversationId}
//                     currentName={groupName}
//                 />
//             )}
//         </>


//     );
// };

import { useEffect, useState } from "react";
import styles from "../../../styles/message/ChatInfo.module.css";
import {
    ChevronLeft,
    X,
    Users,
    Bell,
    Pin,
    Settings,
    LogOut,
    Trash2,
    Edit3,
} from "lucide-react";

import {
    getConversationMediaApi,
    clearConversationHistoryApi,
} from "../../../../../api/message/conversationApi";

import axiosClient from "../../../../../api/axiosClient";
import { RenameNameGroup } from "./RenameNameGroup";
import { ChangeGroupAvatarModal } from "./ChangeGroupAvatarModal";

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
    onClose?: () => void;
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

    // ✅ FIX QUAN TRỌNG
    const [openAvatarModal, setOpenAvatarModal] = useState(false);

    /* ===== LOAD MEDIA ===== */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const media = await getConversationMediaApi(conversationId);
                setAllMedia(media);

                const imgs: { url: string }[] = [];
                const fls: { name: string }[] = [];
                const resolved: Record<string, string> = {};

                for (const m of media) {
                    if (m.attachment?.thumbnailUrl) {
                        const url = await resolveImageUrl(
                            m.attachment.thumbnailUrl
                        );
                        imgs.push({ url });
                        resolved[m.id] = url;
                    } else if (m.attachment?.fileUrl) {
                        fls.push({ name: m.attachment.fileName || "File" });
                    }
                }

                setImages(imgs);
                setFiles(fls);
                setResolvedMap(resolved);
            } finally {
                setLoading(false);
            }
        };

        if (conversationId) load();
    }, [conversationId]);

    /* ===== CLEAR ===== */
    const handleClear = async () => {
        if (clearing) return;

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.id) return;

        setClearing(true);
        try {
            await clearConversationHistoryApi({
                conversationId,
                userId: user.id,
            });

            setImages([]);
            setFiles([]);
            setAllMedia([]);
        } finally {
            setClearing(false);
        }
    };

    /* ================= UI ================= */

    return (
        <>
            <div className={styles.overlay} onClick={onClose}>
                <div
                    className={styles.panel}
                    onClick={(e) => e.stopPropagation()}
                >
                    {!viewAll ? (
                        <>
                            {/* HEADER */}
                            <div className={styles.titleRow}>
                                <h3 className={styles.title}>
                                    Thông tin nhóm
                                </h3>
                                <button
                                    className={styles.closeBtn}
                                    onClick={onClose}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* TOP */}
                            <div className={styles.top}>
                                {/* ✅ CLICK AVATAR */}
                                <img
                                    src={members[0]?.avatar}
                                    className={styles.avatar}
                                    onClick={() =>
                                        setOpenAvatarModal(true)
                                    }
                                    style={{ cursor: "pointer" }}
                                />

                                <div className={styles.usernameRow}>
                                    <div className={styles.username}>
                                        {groupName}
                                    </div>

                                    <Edit3
                                        size={14}
                                        className={styles.editIcon}
                                        onClick={() =>
                                            setOpenRename(true)
                                        }
                                    />
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className={styles.actionsRow}>
                                <div className={styles.actionItem}>
                                    <Bell size={20} />
                                    <span>
                                        Tắt<br />thông báo
                                    </span>
                                </div>

                                <div className={styles.actionItem}>
                                    <Pin size={20} />
                                    <span>
                                        Ghim<br />hội thoại
                                    </span>
                                </div>

                                <div className={styles.actionItem}>
                                    <Users size={20} />
                                    <span>
                                        Thêm<br />thành viên
                                    </span>
                                </div>

                                <div className={styles.actionItem}>
                                    <Settings size={20} />
                                    <span>
                                        Quản lý<br />nhóm
                                    </span>
                                </div>
                            </div>

                            {/* MEMBERS */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    Thành viên ({members.length})
                                </div>

                                {members.map((m) => (
                                    <div
                                        key={m.id}
                                        className={styles.item}
                                    >
                                        {m.name}
                                    </div>
                                ))}
                            </div>

                            {/* MEDIA */}
                            {!loading && (
                                <>
                                    <div className={styles.section}>
                                        <div
                                            className={
                                                styles.sectionHeader
                                            }
                                        >
                                            Ảnh/Video
                                        </div>

                                        <div
                                            className={
                                                styles.imageGridContent
                                            }
                                        >
                                            {images
                                                .slice(0, 8)
                                                .map((i, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={i.url}
                                                        className={
                                                            styles.mediaImage
                                                        }
                                                    />
                                                ))}
                                        </div>

                                        <button
                                            className={
                                                styles.showMoreButton
                                            }
                                            onClick={() => {
                                                setTab("images");
                                                setViewAll(true);
                                            }}
                                        >
                                            Xem tất cả (
                                            {images.length})
                                        </button>
                                    </div>

                                    <div className={styles.section}>
                                        <div
                                            className={
                                                styles.sectionHeader
                                            }
                                        >
                                            File
                                        </div>

                                        {files
                                            .slice(0, 3)
                                            .map((f, i) => (
                                                <div
                                                    key={i}
                                                    className={
                                                        styles.item
                                                    }
                                                >
                                                    {f.name}
                                                </div>
                                            ))}

                                        <button
                                            className={
                                                styles.showMoreButton
                                            }
                                            onClick={() => {
                                                setTab("files");
                                                setViewAll(true);
                                            }}
                                        >
                                            Xem tất cả (
                                            {files.length})
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* BOTTOM */}
                            <div className={styles.deleteBox}>
                                <button
                                    className={styles.deleteButton}
                                    onClick={handleClear}
                                >
                                    <Trash2 size={14} />{" "}
                                    {clearing
                                        ? "Đang xóa..."
                                        : "Xóa đoạn hội thoại"}
                                </button>

                                <button className={styles.deleteButton}>
                                    <LogOut size={14} /> Rời nhóm
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* STORAGE */}
                            <div className={styles.storageTitleRow}>
                                <button
                                    className={styles.backBtn}
                                    onClick={() =>
                                        setViewAll(false)
                                    }
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <h3 className={styles.storageTitle}>
                                    Kho lưu trữ
                                </h3>

                                <button
                                    className={
                                        styles.storageCloseBtn
                                    }
                                    onClick={onClose}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={styles.allMediaContent}>
                                {/* giữ nguyên */}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* RENAME */}
            {openRename && (
                <RenameNameGroup
                    open={openRename}
                    onClose={() => setOpenRename(false)}
                    conversationId={conversationId}
                    currentName={groupName}
                />
            )}

            {/* MODAL AVATAR */}
            <ChangeGroupAvatarModal
                open={openAvatarModal}
                onClose={() => setOpenAvatarModal(false)}
                conversationId={conversationId}
                currentAvatar={members[0]?.avatar}
            />
        </>
    );
};