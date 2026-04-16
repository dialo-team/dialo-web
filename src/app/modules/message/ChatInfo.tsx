// import { useState, useEffect } from "react";
// import type { Friend } from "../../types/message/Friend";
// import styles from "../../styles/message/ChatInfo.module.css";
// import { ChevronDown, ChevronUp, X, ChevronLeft, Edit3 } from "lucide-react";
// import {
//   clearConversationHistoryApi,
//   getConversationMediaApi,
// } from "../../../../api/message/conversationApi";
// import type { MessageDto } from "../../types/message/Message";
// import axiosClient from "../../../../api/axiosClient";
// import { ChatInfoSkeleton } from "./ChatSkeletonLoading";
// import { RemarkFriendModal } from "./RemarkFriendModal";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";

// const toAbsoluteMediaUrl = (url: string): string => {
//   if (!url) return "";
//   if (url.startsWith("http://") || url.startsWith("https://")) return url;
//   return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
// };

// const normalizeCandidateUrls = (
//   rawUrls: (string | undefined)[],
//   fileName?: string,
// ): string[] => {
//   const candidates: Set<string> = new Set();
//   const addCandidate = (url: string) => {
//     if (url) candidates.add(toAbsoluteMediaUrl(url));
//   };

//   rawUrls.forEach((url) => {
//     if (!url) return;

//     const normalizedRaw = url.replace(/^\/+/, "/");
//     addCandidate(normalizedRaw);

//     if (!normalizedRaw.startsWith("/uploads/")) {
//       const normalizedPath = normalizedRaw.replace(/^\/+/, "");
//       addCandidate(`/uploads/${normalizedPath}`);
//     }
//   });

//   if (fileName) {
//     addCandidate(`/uploads/${fileName}`);
//   }

//   return [...candidates];
// };

// const resolveImageUrl = async (
//   thumbnailUrl?: string,
//   fileUrl?: string,
//   fileName?: string,
// ): Promise<string> => {
//   const candidates = normalizeCandidateUrls([thumbnailUrl, fileUrl], fileName);

//   if (candidates.length === 0) return "";

//   for (const candidateUrl of candidates) {
//     try {
//       const res = await axiosClient.get(candidateUrl, {
//         responseType: "blob",
//       });
//       return URL.createObjectURL(res.data);
//     } catch {
//       // Try next candidate
//     }
//   }

//   // Fallback to first candidate if all fail
//   return candidates[0];
// };

// type ImageItem = {
//   url: string;
//   fileName?: string;
// };

// type ChatInfoProps = {
//   user: Friend;
//   conversationId: string;
//   onClose?: () => void;
//   onConversationCleared?: () => void;
//   onReload?: () => void;
// };

// type FileItem = {
//   name: string;
//   url: string;
// };

// type ImageGridProps = {
//   title: string;
//   images: { url: string; fileName?: string }[];
//   onViewAll?: () => void;
// };

// const ImageGrid = ({ title, images, onViewAll }: ImageGridProps) => {
//   const [collapsed, setCollapsed] = useState(false);
//   const displayImages = images.slice(0, 8);

//   return (
//     <div className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <span>{title}</span>
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           style={{ background: "none", border: "none", cursor: "pointer" }}
//         >
//           {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//         </button>
//       </div>

//       {!collapsed && displayImages.length > 0 && (
//         <div className={styles.imageGridContent}>
//           {displayImages.map((img, idx) => (
//             <div key={idx} className={styles.mediaItem}>
//               <img
//                 src={img.url}
//                 alt={`media-${idx}`}
//                 className={styles.mediaImage}
//               />
//             </div>
//           ))}
//         </div>
//       )}

//       {!collapsed && displayImages.length === 0 && (
//         <div className={styles.emptyState}>Không có ảnh/video</div>
//       )}

//       {!collapsed && (
//         <button
//           type="button"
//           className={styles.showMoreButton}
//           onClick={onViewAll}
//         >
//           Xem tất cả ({images.length})
//         </button>
//       )}
//     </div>
//   );
// };

// type FileListProps = {
//   title: string;
//   files: FileItem[];
//   onViewAll?: () => void;
// };

// const FileList = ({ title, files, onViewAll }: FileListProps) => {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <span>{title}</span>
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           style={{ background: "none", border: "none", cursor: "pointer" }}
//         >
//           {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//         </button>
//       </div>

//       {!collapsed &&
//         files.slice(0, 3).map((file, idx) => (
//           <div
//             key={idx}
//             className={styles.item}
//             style={{
//               padding: "8px 0",
//               cursor: "pointer",
//               transition: "background-color 0.2s ease",
//               borderRadius: "4px",
//               marginLeft: "-8px",
//               marginRight: "-8px",
//               paddingLeft: "8px",
//               paddingRight: "8px",
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLDivElement).style.backgroundColor =
//                 "#e8e8e8";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLDivElement).style.backgroundColor =
//                 "transparent";
//             }}
//           >
//             {file.name}
//           </div>
//         ))}

//       {!collapsed && files.length === 0 && (
//         <div className={styles.emptyState}>Không có file</div>
//       )}

//       {!collapsed && (
//         <button
//           type="button"
//           className={styles.showMoreButton}
//           onClick={onViewAll}
//         >
//           Xem tất cả ({files.length})
//         </button>
//       )}
//     </div>
//   );
// };

// export const ChatInfo = ({
//   user,
//   conversationId,
//   onClose,
//   onConversationCleared,
// }: ChatInfoProps) => {
//   const [images, setImages] = useState<ImageItem[]>([]);
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [loadingMedia, setLoadingMedia] = useState(false);
//   const [clearingHistory, setClearingHistory] = useState(false);
//   const [viewingAllMedia, setViewingAllMedia] = useState(false);
//   const [mediaTab, setMediaTab] = useState<"images" | "files">("images");
//   const [allMedia, setAllMedia] = useState<MessageDto[]>([]);
//   const [resolvedAllImages, setResolvedAllImages] = useState<{
//     [key: string]: string;
//   }>({});

//   const getCurrentUserId = () => {
//     try {
//       const savedUser = localStorage.getItem("user");

//       if (!savedUser) {
//         return null;
//       }

//       const parsedUser = JSON.parse(savedUser);
//       return typeof parsedUser?.id === "string" ? parsedUser.id : null;
//     } catch {
//       return null;
//     }
//   };

//   const getDateLabel = (dateString: string): string => {
//     const msgDate = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     const msgDateOnly = msgDate.toLocaleDateString("vi-VN");
//     const todayDateOnly = today.toLocaleDateString("vi-VN");
//     const yesterdayDateOnly = yesterday.toLocaleDateString("vi-VN");

//     if (msgDateOnly === todayDateOnly) {
//       return "Hôm nay";
//     } else if (msgDateOnly === yesterdayDateOnly) {
//       return "Hôm qua";
//     }
//     return msgDateOnly;
//   };

//   const openAllImages = () => {
//     setMediaTab("images");
//     setViewingAllMedia(true);
//   };

//   const openAllFiles = () => {
//     setMediaTab("files");
//     setViewingAllMedia(true);
//   };

//   const handleClearConversationHistory = async () => {
//     const currentUserId = getCurrentUserId();

//     if (!conversationId || !currentUserId || clearingHistory) {
//       return;
//     }

//     setClearingHistory(true);

//     try {
//       await clearConversationHistoryApi({
//         conversationId,
//         userId: currentUserId,
//       });

//       setImages([]);
//       setFiles([]);
//       onConversationCleared?.();
//     } catch (error) {
//       console.error("Clear conversation history failed:", error);
//     } finally {
//       setClearingHistory(false);
//     }
//   };

//   useEffect(() => {
//     const loadMedia = async () => {
//       setLoadingMedia(true);
//       try {
//         const media = await getConversationMediaApi(conversationId);
//         setAllMedia(media);

//         const imageItems: ImageItem[] = [];
//         const fileItems: FileItem[] = [];
//         const resolved: { [key: string]: string } = {};

//         // Resolve all images
//         for (const msg of media) {
//           if (msg.attachment?.thumbnailUrl) {
//             imageItems.push({
//               url: msg.attachment.thumbnailUrl,
//               fileName: msg.attachment.fileName,
//             });
//             const resolvedUrl = await resolveImageUrl(
//               msg.attachment.thumbnailUrl,
//               undefined,
//               msg.attachment.fileName,
//             );
//             resolved[msg.id] = resolvedUrl;
//           } else if (msg.attachment?.fileUrl && !msg.attachment?.thumbnailUrl) {
//             const fileName = msg.attachment?.fileName || "File";
//             fileItems.push({
//               name: fileName,
//               url: msg.attachment.fileUrl,
//             });
//           }
//         }

//         setResolvedAllImages(resolved);

//         // Set ALL images with resolved URLs
//         const allImages: ImageItem[] = [];
//         media.forEach((msg) => {
//           if (msg.attachment?.thumbnailUrl) {
//             allImages.push({
//               url: resolved[msg.id] || msg.attachment.thumbnailUrl,
//               fileName: msg.attachment.fileName,
//             });
//           }
//         });

//         setImages(allImages);
//         setFiles(fileItems);
//       } catch (error) {
//         console.error("Load conversation media failed:", error);
//       } finally {
//         setLoadingMedia(false);
//       }
//     };

//     if (conversationId) {
//       loadMedia();
//     }
//   }, [conversationId]);

//   const [openRemark, setOpenRemark] = useState(false);

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
//         {!viewingAllMedia ? (
//           /* Normal View */
//           <>
//             <div className={styles.titleRow}>
//               <h3 className={styles.title}>Thông tin hội thoại</h3>
//               <button
//                 type="button"
//                 className={styles.closeBtn}
//                 onClick={onClose}
//                 aria-label="Đóng thông tin hội thoại"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* <div className={styles.top}>
//               <img src={user.avatar} alt={user.name} />
//               <div className={styles.username}>{user.name}</div>
//             </div> */}
//             <div className={styles.top}>
//               <img src={user.avatar} alt={user.name} />

//               <div className={styles.usernameRow}>
//                 <div className={styles.username}>{user.name}</div>

//                 <Edit3
//                   size={14}
//                   className={styles.editIcon}
//                   onClick={() => setOpenRemark(true)}
//                 />
//               </div>
//             </div>

//             {loadingMedia ? (
//               <ChatInfoSkeleton />
//             ) : (
//               <>
//                 <ImageGrid
//                   title="Ảnh/Video"
//                   images={images}
//                   onViewAll={openAllImages}
//                 />
//                 <FileList title="File" files={files} onViewAll={openAllFiles} />
//               </>
//             )}

//             <div className={styles.deleteBox}>
//               <button
//                 type="button"
//                 className={styles.deleteButton}
//                 onClick={() => void handleClearConversationHistory()}
//                 disabled={clearingHistory}
//               >
//                 {clearingHistory ? "Đang xóa..." : "Xóa đoạn hội thoại"}
//               </button>
//             </div>
//           </>
//         ) : (
//           /* All Media View */
//           <>
//             <div className={styles.storageTitleRow}>
//               <button
//                 type="button"
//                 className={styles.backBtn}
//                 onClick={() => setViewingAllMedia(false)}
//               >
//                 <ChevronLeft size={24} />
//               </button>
//               <h3 className={styles.storageTitle}>Kho lưu trữ</h3>
//               <button
//                 type="button"
//                 className={styles.storageCloseBtn}
//                 onClick={onClose}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Tabs */}
//             <div className={styles.allMediaTabs}>
//               <button
//                 className={`${styles.allMediaTab} ${mediaTab === "images" ? styles.active : ""}`}
//                 onClick={() => setMediaTab("images")}
//               >
//                 Ảnh/Video
//               </button>
//               <button
//                 className={`${styles.allMediaTab} ${mediaTab === "files" ? styles.active : ""}`}
//                 onClick={() => setMediaTab("files")}
//               >
//                 Files
//               </button>
//             </div>

//             <div className={styles.allMediaContent}>
//               {loadingMedia ? (
//                 <ChatInfoSkeleton />
//               ) : (
//                 <>
//                   {mediaTab === "images"
//                     ? /* Images Tab */
//                     Object.entries(
//                       allMedia.reduce(
//                         (acc, msg) => {
//                           if (msg.attachment?.thumbnailUrl) {
//                             const dateLabel = getDateLabel(msg.createdAt);
//                             if (!acc[dateLabel]) {
//                               acc[dateLabel] = [];
//                             }
//                             acc[dateLabel].push(msg);
//                           }
//                           return acc;
//                         },
//                         {} as Record<string, MessageDto[]>,
//                       ),
//                     ).map(([date, messages]) => (
//                       <div key={date}>
//                         <h3 className={styles.dateSectionLabel}>{date}</h3>
//                         <div className={styles.allMediaGrid}>
//                           {messages.map((msg) => (
//                             <img
//                               key={msg.id}
//                               src={resolvedAllImages[msg.id] || ""}
//                               alt="media"
//                               className={styles.allMediaImage}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     ))
//                     : /* Files Tab */
//                     Object.entries(
//                       allMedia.reduce(
//                         (acc, msg) => {
//                           if (
//                             msg.attachment?.fileUrl &&
//                             !msg.attachment?.thumbnailUrl
//                           ) {
//                             const dateLabel = getDateLabel(msg.createdAt);
//                             if (!acc[dateLabel]) {
//                               acc[dateLabel] = [];
//                             }
//                             acc[dateLabel].push(msg);
//                           }
//                           return acc;
//                         },
//                         {} as Record<string, MessageDto[]>,
//                       ),
//                     ).map(([date, messages]) => (
//                       <div key={date}>
//                         <h3 className={styles.dateSectionLabel}>{date}</h3>
//                         <div className={styles.allMediaGrid}>
//                           {messages.map((msg) => (
//                             <div key={msg.id} className={styles.allMediaFile}>
//                               <div className={styles.fileNameInGrid}>
//                                 {msg.attachment?.fileName || "File"}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                 </>
//               )}
//             </div>
//           </>
//         )}
//       </div>
      
//     </div>
    
//   );
// };


import { useEffect, useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatInfo.module.css";
import { ChevronDown, ChevronUp, X, ChevronLeft, Edit3 } from "lucide-react";
import {
  clearConversationHistoryApi,
  getConversationMediaApi,
} from "../../../../api/message/conversationApi";
import type { MessageDto } from "../../types/message/Message";
import axiosClient from "../../../../api/axiosClient";
import { ChatInfoSkeleton } from "./ChatSkeletonLoading";
import { RemarkFriendModal } from "../../modules/message/RemarkFriendModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";

/* ================= HELPERS ================= */

const toAbsoluteMediaUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
};

const normalizeCandidateUrls = (
  rawUrls: (string | undefined)[],
  fileName?: string,
): string[] => {
  const set = new Set<string>();

  const add = (u: string) => u && set.add(toAbsoluteMediaUrl(u));

  rawUrls.forEach((u) => {
    if (!u) return;

    const clean = u.replace(/^\/+/, "/");
    add(clean);

    if (!clean.startsWith("/uploads/")) {
      add(`/uploads/${clean.replace(/^\/+/, "")}`);
    }
  });

  if (fileName) add(`/uploads/${fileName}`);

  return [...set];
};

const resolveImageUrl = async (
  thumbnailUrl?: string,
  fileUrl?: string,
  fileName?: string,
): Promise<string> => {
  const candidates = normalizeCandidateUrls(
    [thumbnailUrl, fileUrl],
    fileName,
  );

  for (const url of candidates) {
    try {
      const res = await axiosClient.get(url, { responseType: "blob" });
      return URL.createObjectURL(res.data);
    } catch {}
  }

  return candidates[0] || "";
};

/* ================= TYPES ================= */

type ImageItem = { url: string; fileName?: string };

type FileItem = { name: string; url: string };

type ChatInfoProps = {
  user: Friend;
  conversationId: string;
  onClose?: () => void;
  onConversationCleared?: () => void;
  onReload?: () => void;
};

/* ================= COMPONENTS ================= */

const ImageGrid = ({
  title,
  images,
  onViewAll,
}: {
  title: string;
  images: ImageItem[];
  onViewAll?: () => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{title}</span>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!collapsed && images.length > 0 && (
        <div className={styles.imageGridContent}>
          {images.slice(0, 8).map((img, i) => (
            <img key={i} src={img.url} className={styles.mediaImage} />
          ))}
        </div>
      )}

      {!collapsed && images.length === 0 && (
        <div className={styles.emptyState}>Không có ảnh/video</div>
      )}

      {!collapsed && (
        <button className={styles.showMoreButton} onClick={onViewAll}>
          Xem tất cả ({images.length})
        </button>
      )}
    </div>
  );
};

const FileList = ({
  title,
  files,
  onViewAll,
}: {
  title: string;
  files: FileItem[];
  onViewAll?: () => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{title}</span>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!collapsed &&
        files.slice(0, 3).map((f, i) => (
          <div key={i} className={styles.item}>
            {f.name}
          </div>
        ))}

      {!collapsed && files.length === 0 && (
        <div className={styles.emptyState}>Không có file</div>
      )}

      {!collapsed && (
        <button className={styles.showMoreButton} onClick={onViewAll}>
          Xem tất cả ({files.length})
        </button>
      )}
    </div>
  );
};

/* ================= MAIN ================= */

export const ChatInfo = ({
  user,
  conversationId,
  onClose,
  onConversationCleared,
  onReload,
}: ChatInfoProps) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [openRemark, setOpenRemark] = useState(false);

  /* ===== LOAD MEDIA ===== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const media = await getConversationMediaApi(conversationId);

        const imgs: ImageItem[] = [];
        const fls: FileItem[] = [];

        for (const m of media) {
          if (m.attachment?.thumbnailUrl) {
            const url = await resolveImageUrl(
              m.attachment.thumbnailUrl,
              undefined,
              m.attachment.fileName,
            );

            imgs.push({ url, fileName: m.attachment.fileName });
          } else if (m.attachment?.fileUrl) {
            fls.push({
              name: m.attachment.fileName || "File",
              url: m.attachment.fileUrl,
            });
          }
        }

        setImages(imgs);
        setFiles(fls);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) load();
  }, [conversationId]);

  /* ===== CLEAR CHAT ===== */
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
      onConversationCleared?.();
    } finally {
      setClearing(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className={styles.titleRow}>
            <h3 className={styles.title}>Thông tin hội thoại</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* USER (GIỮ NGUYÊN UI CŨ) */}
          <div className={styles.top}>
            <img src={user.avatar} alt={user.name} />

            <div className={styles.usernameRow}>
              <div className={styles.username}>{user.name}</div>

              <Edit3
                size={14}
                className={styles.editIcon}
                onClick={() => setOpenRemark(true)}
              />
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <ChatInfoSkeleton />
          ) : (
            <>
              <ImageGrid title="Ảnh/Video" images={images} />
              <FileList title="File" files={files} />
            </>
          )}

          {/* DELETE */}
          <div className={styles.deleteBox}>
            <button
              className={styles.deleteButton}
              onClick={() => void handleClear()}
            >
              {clearing ? "Đang xóa..." : "Xóa đoạn hội thoại"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <RemarkFriendModal
        open={openRemark}
        onClose={() => setOpenRemark(false)}
        conversationId={conversationId}
        currentName={user.name}
        friend={user}
        onSaved={() => onReload?.()}
      />
    </>
  );
};