
import { useOutletContext } from "react-router-dom";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatWindow.module.css";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  Phone,
  Video,
  Search,
  Info,
  Smile,
  Image,
  Paperclip,
  Zap,
  MoreVertical,
  Reply,
  Trash2,
  Send,
  FileText,
  Download,
} from "lucide-react";
import {
  getConversationDetailApi,
  deleteMessageForMeApi,
  markConversationReadApi,
  revokeMessageApi,
  sendMessageApi,
  sendFileMessageApi,
} from "../../../../api/message/conversationApi";
import axiosClient from "../../../../api/axiosClient";
import { ChatInfo } from "./ChatInfo";
import { ChatWindowSkeleton } from "./ChatSkeletonLoading";
import { ChatSearch } from "./ChatSearch";
import type { MessageDto } from "../../types/message/Message";
import { subscribeChatTopic } from "./chatSocket";

type PropsContext = {
  selectedUser: Friend | null;
  onBackToSidebar?: () => void;
};

type MessageUI = {
  id: string;
  sender: "me" | "them";
  kind: "text" | "image" | "file";
  content: string;
  time: string;
  fileUrl?: string;
  fileUrlCandidates?: string[];
  sourceFileUrl?: string;
  fileName?: string;
  mimeType?: string;
  revoked?: boolean;
};

const MESSAGE_TEXT_TYPE = "TEXT";
const API_BASE_URL = "http://14.225.254.174:9000";
const DEFAULT_FILE_DOWNLOAD_BASE_URL = "http://localhost:9000";

const getFileDownloadBaseUrl = () => {
  const envBaseUrl =
    import.meta.env.VITE_FILE_BASE_URL?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim();

  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href);
    currentUrl.port = "9000";
    currentUrl.pathname = "/";
    currentUrl.search = "";
    currentUrl.hash = "";
    return currentUrl.origin;
  }

  return DEFAULT_FILE_DOWNLOAD_BASE_URL;
};

const getCurrentUserId = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    if (typeof parsedUser?.id === "string") {
      const trimmed = parsedUser.id.trim();
      return trimmed || null;
    }

    if (typeof parsedUser?.id === "number" && Number.isFinite(parsedUser.id)) {
      return String(parsedUser.id);
    }

    return null;
  } catch {
    return null;
  }
};

const IMAGE_EXT_REGEX = /\.(png|jpe?g|gif|bmp|webp|svg)$/i;

const toAbsoluteMediaUrl = (url: string) => {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

const toPublicFileDownloadUrl = (url: string) => {
  if (!url) {
    return "";
  }

  if (/^(blob:|data:)/i.test(url)) {
    return url;
  }

  try {
    const resolvedUrl = new URL(url, API_BASE_URL);
    const publicBaseUrl = new URL(getFileDownloadBaseUrl());

    resolvedUrl.protocol = publicBaseUrl.protocol;
    resolvedUrl.hostname = publicBaseUrl.hostname;
    resolvedUrl.port = publicBaseUrl.port;

    return resolvedUrl.toString();
  } catch {
    return `${getFileDownloadBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
  }
};

const normalizeCandidateUrls = (
  rawUrls: Array<string | undefined>,
  fileName?: string,
): string[] => {
  const candidates = new Set<string>();

  const addCandidate = (candidate: string) => {
    const value = candidate.trim();
    if (!value) {
      return;
    }
    candidates.add(toAbsoluteMediaUrl(value));
  };

  rawUrls.forEach((rawUrl) => {
    const normalizedRaw = rawUrl?.trim() || "";

    if (!normalizedRaw) {
      return;
    }

    addCandidate(normalizedRaw);

    if (!normalizedRaw.startsWith("/uploads/")) {
      const normalizedPath = normalizedRaw.replace(/^\/+/, "");
      addCandidate(`/uploads/${normalizedPath}`);
    }
  });

  if (fileName) {
    addCandidate(`/uploads/${fileName}`);
  }

  return [...candidates];
};

const isImageMessage = (message: MessageDto) => {
  const mimeType = message.attachment?.mimeType?.toLowerCase() || "";
  const messageType = message.type?.toLowerCase() || "";
  const fileName = message.attachment?.fileName || "";

  return (
    mimeType.startsWith("image/") ||
    messageType.includes("image") ||
    IMAGE_EXT_REGEX.test(fileName)
  );
};

const mapMessageToUI = (
  message: MessageDto,
  currentUserId: string | null,
): MessageUI => ({
  id: message.id,
  sender:
    message.displayPosition === "RIGHT" ||
    (currentUserId ? message.senderId === currentUserId : false)
      ? "me"
      : "them",
  kind: message.revoked
    ? "text"
    : isImageMessage(message)
      ? "image"
      : message.attachment?.fileName || message.attachment?.fileUrl
        ? "file"
        : "text",
  content: message.revoked
    ? "Tin nhắn đã được thu hồi"
    : message.content || message.attachment?.fileName || "[File]",
  time: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  fileUrl: (() => {
    const thumbnailAttachmentUrl =
      message.attachment?.thumbnailUrl || message.attachment?.fileUrl;

    return thumbnailAttachmentUrl
      ? toAbsoluteMediaUrl(thumbnailAttachmentUrl)
      : undefined;
  })(),
  sourceFileUrl: (() => {
    const originalAttachmentUrl =
      message.attachment?.fileUrl || message.attachment?.thumbnailUrl;

    return originalAttachmentUrl
      ? toAbsoluteMediaUrl(originalAttachmentUrl)
      : undefined;
  })(),
  fileUrlCandidates: (() => {
    const thumbnailAttachmentUrl = message.attachment?.thumbnailUrl;
    const originalAttachmentUrl = message.attachment?.fileUrl;

    return normalizeCandidateUrls(
      [thumbnailAttachmentUrl, originalAttachmentUrl],
      message.attachment?.fileName,
    );
  })(),
  fileName: message.attachment?.fileName || undefined,
  mimeType: message.attachment?.mimeType || undefined,
  revoked: message.revoked,
});

const resolveAttachmentUrl = async (message: MessageUI): Promise<MessageUI> => {
  if (message.kind !== "image" && message.kind !== "file") {
    return message;
  }

  const candidates = message.fileUrlCandidates?.length
    ? message.fileUrlCandidates
    : message.fileUrl
      ? [message.fileUrl]
      : [];

  if (candidates.length === 0) {
    return message;
  }

  for (const candidateUrl of candidates) {
    try {
      const res = await axiosClient.get(candidateUrl, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);

      return {
        ...message,
        fileUrl: blobUrl,
        sourceFileUrl: message.sourceFileUrl || candidateUrl,
      };
    } catch {
      // Try next URL candidate when backend path format is inconsistent.
    }
  }

  return {
    ...message,
    fileUrl: candidates[0],
    sourceFileUrl: message.sourceFileUrl || candidates[0],
  };
};

const uniqueMessagesById = (messages: MessageUI[]) => {
  const seen = new Map<string, MessageUI>();

  messages.forEach((message) => {
    if (!seen.has(message.id)) {
      seen.set(message.id, message);
      return;
    }

    // Keep the latest resolved version when the backend returns the same id twice.
    seen.set(message.id, message);
  });

  return Array.from(seen.values());
};

const renderMessageContent = (
  message: MessageUI,
  onDownloadFile: (message: MessageUI) => void,
): ReactNode => {
  const displayUrl = message.fileUrl;

  if (message.kind === "image" && displayUrl) {
    return (
      <>
        <a
          href={displayUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.imageLink}
        >
          <img
            src={displayUrl}
            alt={message.fileName || "image-message"}
            className={styles.imageMessage}
          />
        </a>
        <div className={styles.time}>{message.time}</div>
      </>
    );
  }

  if (message.kind === "file") {
    return (
      <>
        <div
          className={styles.fileRow}
          onClick={() => onDownloadFile(message)}
          style={{ cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onDownloadFile(message);
            }
          }}
        >
          <FileText size={16} />
          <div className={styles.fileMeta}>
            <div className={styles.fileName}>
              {message.fileName || message.content}
            </div>
            {message.mimeType && (
              <div className={styles.fileType}>{message.mimeType}</div>
            )}
          </div>
          <button
            type="button"
            className={styles.fileDownloadBtn}
            aria-label={`Tải xuống ${message.fileName || "attachment"}`}
            onClick={(e) => {
              e.stopPropagation();
              onDownloadFile(message);
            }}
          >
            <Download size={16} />
          </button>
        </div>
        <div className={styles.time}>{message.time}</div>
      </>
    );
  }

  return (
    <>
      {message.content}
      <div className={styles.time}>{message.time}</div>
    </>
  );
};

export const ChatWindow = () => {
  const { selectedUser, onBackToSidebar } = useOutletContext<PropsContext>();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const lastMessageIdRef = useRef<string>("");
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  // click outside
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  const clearObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  };

  const loadConversationDetail = useCallback(
    async (conversationId: string, silent = false) => {
      if (!conversationId) {
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const currentUserId = getCurrentUserId();
        const data = await getConversationDetailApi(conversationId);

        clearObjectUrls();

        const mapped = data.messages.map((m) => mapMessageToUI(m, currentUserId));
        const resolved = await Promise.all(
          mapped.map(async (message) => {
            const resolvedMessage = await resolveAttachmentUrl(message);

            if (
              resolvedMessage.fileUrl &&
              resolvedMessage.fileUrl.startsWith("blob:")
            ) {
              objectUrlsRef.current.push(resolvedMessage.fileUrl);
            }

            return resolvedMessage;
          }),
        );

        try {
          await markConversationReadApi(conversationId);
          window.dispatchEvent(
            new CustomEvent("conversation-read", {
              detail: { conversationId },
            }),
          );
        } catch (error) {
          console.error("Mark conversation read failed:", error);
        }

        setMessages(uniqueMessagesById(resolved));
      } catch (error) {
        console.error("Load messages failed:", error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  // only append new messages without scrolling or resetting scroll position
  const loadNewMessagesOnly = useCallback(
    async (conversationId: string) => {
      if (!conversationId) {
        return;
      }

      try {
        const currentUserId = getCurrentUserId();
        const data = await getConversationDetailApi(conversationId);

        const mapped = data.messages.map((m) => mapMessageToUI(m, currentUserId));
        const resolved = await Promise.all(
          mapped.map(async (message) => {
            const resolvedMessage = await resolveAttachmentUrl(message);

            if (
              resolvedMessage.fileUrl &&
              resolvedMessage.fileUrl.startsWith("blob:")
            ) {
              objectUrlsRef.current.push(resolvedMessage.fileUrl);
            }

            return resolvedMessage;
          }),
        );

        // only add messages that don't exist yet
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = uniqueMessagesById(
            resolved.filter((m) => !existingIds.has(m.id)),
          );

          if (newMessages.length === 0) {
            return prev;
          }

          // update lastMessageId ref for next polling
          if (resolved.length > 0) {
            lastMessageIdRef.current = resolved[resolved.length - 1].id;
          }

          return [...prev, ...newMessages];
        });
      } catch (error) {
        console.error("Load new messages failed:", error);
      }
    },
    [],
  );

  // fetch messages
  useEffect(() => {
    const conversationId = selectedUser?.id ?? "";
    if (!conversationId) {
      return;
    }

    void loadConversationDetail(conversationId);
    setMessageText("");
  }, [selectedUser?.id, loadConversationDetail]);

  // socket realtime messages for the current conversation
  useEffect(() => {
    const conversationId = selectedUser?.id ?? "";
    if (!conversationId) {
      return;
    }

    const unsubscribe = subscribeChatTopic(
      `/topic/conversations/${conversationId}`,
      () => {
        void loadNewMessagesOnly(conversationId);
      },
    );

    return unsubscribe;
  }, [selectedUser?.id, loadNewMessagesOnly]);

  // fallback polling when socket is unavailable or misses a push event
  useEffect(() => {
    const conversationId = selectedUser?.id ?? "";
    if (!conversationId) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        void loadNewMessagesOnly(conversationId);
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [selectedUser?.id, loadNewMessagesOnly]);

  const handleSendMessage = async () => {
    const conversationId = selectedUser?.id;
    const currentUserId = getCurrentUserId();
    const content = messageText.trim();

    if (!conversationId || !currentUserId || !content || sending) {
      return;
    }

    setSending(true);
    try {
      const sentMessage = await sendMessageApi({
        conversationId,
        senderId: currentUserId,
        type: MESSAGE_TEXT_TYPE,
        content,
      });
      const mappedMessage = mapMessageToUI(sentMessage, currentUserId);

      setMessages((prev) => [...prev, mappedMessage]);
      setMessageText("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleSendFile = async (file: File) => {
    const conversationId = selectedUser?.id;

    if (!conversationId || sendingFile) {
      return;
    }

    setSendingFile(true);
    try {
      const sentMessage = await sendFileMessageApi(conversationId, file);
      const currentUserId = getCurrentUserId();
      const mappedMessage = mapMessageToUI(sentMessage, currentUserId);
      const resolvedMessage = await resolveAttachmentUrl(mappedMessage);

      if (
        resolvedMessage.fileUrl &&
        resolvedMessage.fileUrl.startsWith("blob:")
      ) {
        objectUrlsRef.current.push(resolvedMessage.fileUrl);
      }

      setMessages((prev) => [...prev, resolvedMessage]);
    } catch (error) {
      console.error("Send file error:", error);
    } finally {
      setSendingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadFile = (message: MessageUI) => {
    const downloadUrl = toPublicFileDownloadUrl(
      message.sourceFileUrl ||
        (message.fileName ? `/uploads/${message.fileName}` : message.fileUrl || ""),
    );

    if (!downloadUrl) {
      return;
    }

    const download = async () => {
      try {
        const response = await fetch(downloadUrl, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`Download failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = message.fileName || "attachment";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (error) {
        console.error("Download file error:", error);
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      }
    };

    void download();
  };

  const getLastMessageText = (messageList: MessageUI[]): string => {
    // Find last non-revoked message
    for (let i = messageList.length - 1; i >= 0; i--) {
      const msg = messageList[i];
      if (!msg.revoked) {
        return msg.content;
      }
    }
    return "";
  };

  const handleMessageClick = () => {};

  const handleRevokeMessage = async (messageId: string) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return;
    }

    try {
      await revokeMessageApi({
        messageId,
        userId: currentUserId,
      });

      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                revoked: true,
                kind: "text" as const,
                content: "Tin nhắn đã được thu hồi",
              }
            : msg,
        );

        // Emit event to update ChatSidebar's lastMessage
        const lastMessageText = getLastMessageText(updated);
        const event = new CustomEvent("conversation-message-updated", {
          detail: {
            conversationId: selectedUser?.id,
            lastMessage: lastMessageText,
          },
        });
        window.dispatchEvent(event);

        return updated;
      });
      setOpenMenuId(null);
    } catch (error) {
      console.error("Revoke message error:", error);
    }
  };

  const handleDeleteMessageForMe = async (messageId: string) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      console.error("Delete message failed: missing current user id");
      return;
    }

    try {
      await deleteMessageForMeApi({
        messageId,
        userId: currentUserId,
      });

      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.id !== messageId);

        // Emit event to update ChatSidebar's lastMessage
        const lastMessageText = getLastMessageText(updated);
        const event = new CustomEvent("conversation-message-updated", {
          detail: {
            conversationId: selectedUser?.id,
            lastMessage: lastMessageText,
          },
        });
        window.dispatchEvent(event);

        return updated;
      });
      setOpenMenuId(null);
    } catch (error: unknown) {
      console.error("Delete message failed:", error);

      if (typeof error === "object" && error && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown };
        };

        console.error("Delete message error response:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
    }
  };

  if (!selectedUser) {
    return <div className={styles.empty}>Chọn người để chat</div>;
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.chat} ${
          showInfo || showSearch ? styles.chatWithPanel : ""
        }`}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.user}>
            <button className={styles.backButton} onClick={onBackToSidebar}>
              <ChevronLeft size={20} />
            </button>

            <img src={selectedUser.avatar} className={styles.avatar} />

            <div>
              <div className={styles.name}>{selectedUser.name}</div>
              <div className={styles.status}>Online</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Phone size={18} />
            <Video size={18} />

            <Search
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                setShowSearch(true);
                setShowInfo(false);
              }}
              style={{ cursor: "pointer" }}
            />

            <Info
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo((prev) => !prev);
                setShowSearch(false);
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body} ref={bodyRef}>
          {loading ? (
            <ChatWindowSkeleton />
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "me" ? styles.messageRight : styles.messageLeft
                }
              >
                {m.sender === "them" && (
                  <img src={selectedUser.avatar} className={styles.avatar} />
                )}

                <div className={styles.messageBox}>
                  {m.sender === "me" && (
                    <div
                      className={styles.moreBtn}
                      onClick={(e) => {
                        e.stopPropagation();

                        const rect = e.currentTarget.getBoundingClientRect();

                        setMenuPos({
                          x: rect.left - 190,
                          y: rect.top,
                        });

                        setOpenMenuId(openMenuId === m.id ? null : m.id);
                      }}
                    >
                      <MoreVertical size={16} />
                    </div>
                  )}

                  {openMenuId === m.id && (
                    <div
                      className={styles.menu}
                      style={{
                        left: menuPos.x,
                        top: menuPos.y,
                      }}
                    >
                      <div
                        className={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleRevokeMessage(m.id);
                        }}
                      >
                        <Reply size={14} />
                        Thu hồi
                      </div>
                      <div
                        className={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteMessageForMe(m.id);
                        }}
                      >
                        <Trash2 size={14} />
                        Xóa chỉ mình tôi
                      </div>
                    </div>
                  )}

                  <div
                    className={`${
                      m.kind === "image"
                        ? styles.imageBubble
                        : m.kind === "file"
                          ? styles.fileBubble
                          : styles.bubble
                    } ${m.revoked ? styles.revoked : ""}`}
                    onClick={handleMessageClick}
                  >
                    {renderMessageContent(m, handleDownloadFile)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <Smile size={18} />
          <Image
            size={18}
            onClick={handlePickFile}
            style={{ cursor: "pointer", opacity: sendingFile ? 0.6 : 1 }}
          />
          <Paperclip
            size={18}
            onClick={handlePickFile}
            style={{ cursor: "pointer", opacity: sendingFile ? 0.6 : 1 }}
          />
          <Zap size={18} />
        </div>

        {/* INPUT */}
        <div className={styles.input}>
          <input
            placeholder="Nhập tin nhắn..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
          />

          <button
            className={styles.sendBtn}
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={sending || !messageText.trim()}
          >
            <Send size={18} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleSendFile(file);
            }
          }}
        />
      </div>

      {/* RIGHT PANEL */}
      {showInfo && selectedUser && (
        <ChatInfo
          user={selectedUser}
          conversationId={selectedUser.id}
          onConversationCleared={() => setMessages([])}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showSearch && <ChatSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
};


