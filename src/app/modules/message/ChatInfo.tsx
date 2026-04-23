

import { useEffect, useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatInfo.module.css";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  X,
  Edit3,
  Trash2,
} from "lucide-react";

import {
  clearConversationHistoryApi,
  getConversationMediaApi,
} from "../../../../api/message/conversationApi";

import axiosClient from "../../../../api/axiosClient";
import { ChatInfoSkeleton } from "./ChatSkeletonLoading";
import { RemarkFriendModal } from "../../modules/message/RemarkFriendModal";

/* ================= CONFIG ================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";

/* ================= HELPERS ================= */

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

/* ================= TYPES ================= */

type ImageItem = { url: string };
type FileItem = { name: string };

type Props = {
  user: Friend;
  conversationId: string;
  onClose?: () => void;
  onConversationCleared?: () => void;
  onReload?: () => void;
};

/* ================= MAIN ================= */

export const ChatInfo = ({
  user,
  conversationId,
  onClose,
  onConversationCleared,
  onReload,
}: Props) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [resolvedMap, setResolvedMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [viewAll, setViewAll] = useState(false);
  const [tab, setTab] = useState<"images" | "files">("images");

  const [openRemark, setOpenRemark] = useState(false);

  /* ===== LOAD MEDIA ===== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const media = await getConversationMediaApi(conversationId);
        setAllMedia(media);

        const imgs: ImageItem[] = [];
        const fls: FileItem[] = [];
        const resolved: Record<string, string> = {};

        for (const m of media) {
          if (m.attachment?.thumbnailUrl) {
            const url = await resolveImageUrl(
              m.attachment.thumbnailUrl
            );
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

    if (conversationId) load();
  }, [conversationId]);

  /* ===== CLEAR ===== */
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

      setImages([]);
      setFiles([]);
      setAllMedia([]);
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
          {!viewAll ? (
            <>
              {/* HEADER */}
              <div className={styles.titleRow}>
                <h3 className={styles.title}>Thông tin hội thoại</h3>
                {/* <button className={styles.closeBtn} onClick={onClose}>
                  <X size={18} />
                </button> */}
              </div>

              {/* USER */}
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
                  {/* IMAGES */}
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      Ảnh/Video
                    </div>

                    <div className={styles.imageGridContent}>
                      {images.slice(0, 8).map((i, idx) => (
                        <img
                          key={idx}
                          src={i.url}
                          className={styles.mediaImage}
                        />
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

                  {/* FILES */}
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
                <button
                  className={styles.deleteButton}
                  onClick={handleClear}
                >
                   <Trash2 size={16} style={{ marginRight: 6 }} />
                  {clearing ? "Đang xóa..." : "Xóa đoạn hội thoại"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* VIEW ALL */}
              <div className={styles.storageTitleRow}>
                <button
                  className={styles.backBtn}
                  onClick={() => setViewAll(false)}
                >
                  <ChevronLeft size={24} />
                </button>

                <h3 className={styles.storageTitle}>Kho lưu trữ</h3>

                <button
                  className={styles.storageCloseBtn}
                  onClick={onClose}
                >
                  <X size={18} />
                </button>
              </div>

              {/* TABS */}
              <div className={styles.allMediaTabs}>
                <button
                  className={`${styles.allMediaTab} ${tab === "images" ? styles.active : ""
                    }`}
                  onClick={() => setTab("images")}
                >
                  Ảnh/Video
                </button>

                <button
                  className={`${styles.allMediaTab} ${tab === "files" ? styles.active : ""
                    }`}
                  onClick={() => setTab("files")}
                >
                  Files
                </button>
              </div>

              {/* CONTENT */}
              <div className={styles.allMediaContent}>
                {tab === "images"
                  ? (Object.entries(
                    allMedia.reduce((acc, m) => {
                      if (m.attachment?.thumbnailUrl) {
                        const key = getDateLabel(m.createdAt);
                        acc[key] = acc[key] || [];
                        acc[key].push(m);
                      }
                      return acc;
                    }, {} as Record<string, any[]>)
                  ) as [string, any[]][]
                  ).map(([date, list]) => (
                    <div key={date}>
                      <h3 className={styles.dateSectionLabel}>
                        {date}
                      </h3>

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
                  ))
                  : (Object.entries(
                    allMedia.reduce((acc, m) => {
                      if (m.attachment?.fileUrl && !m.attachment?.thumbnailUrl) {
                        const key = getDateLabel(m.createdAt);
                        acc[key] = acc[key] || [];
                        acc[key].push(m);
                      }
                      return acc;
                    }, {} as Record<string, any[]>)
                  ) as [string, any[]][]
                  ).map(([date, list]) => (
                    <div key={date}>
                      <h3 className={styles.dateSectionLabel}>
                        {date}
                      </h3>

                      <div className={styles.allMediaGrid}>
                        {list.map((m) => (
                          <div
                            key={m.id}
                            className={styles.allMediaFile}
                          >
                            {m.attachment.fileName}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RENAME */}
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