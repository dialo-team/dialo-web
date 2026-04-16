import { useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatWindow.module.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { ChatSearch } from "./ChatSearch";
import type { MessageDto } from "../../types/message/Message";

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

const getCurrentUserId = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    return typeof parsedUser?.id === "string" ? parsedUser.id : null;
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

const resolveAttachmentUrl = async (
  message: MessageUI,
): Promise<MessageUI> => {
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
        <div className={styles.fileRow}>
          <FileText size={16} />
          <div className={styles.fileMeta}>
            <div className={styles.fileName}>{message.fileName || message.content}</div>
            {message.mimeType && (
              <div className={styles.fileType}>{message.mimeType}</div>
            )}
          </div>
        </div>
        {displayUrl && (
          <div className={styles.fileActions}>
            <a
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.fileLink}
            >
              Xem
            </a>
            <button
              type="button"
              className={styles.fileDownloadBtn}
              onClick={() => onDownloadFile(message)}
            >
              Tải xuống
            </button>
          </div>
        )}
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

const logMessageIds = (messages: MessageUI[]) => {
  const ids = messages.map((message) => message.id);
  console.log("messageIds:", ids.join(", "));
};

export const ChatWindow = () => {
  const { selectedUser, onBackToSidebar } =
    useOutletContext<PropsContext>();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [conversationId, setConversationId] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const loadConversation = useCallback(async () => {
    if (!selectedUser?.id) return;

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

  // fetch messages
  useEffect(() => {
    const load = async () => {
      const conversationId = selectedUser?.id ?? "";

      if (!conversationId) return;

      setLoading(true);
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

        setMessages(resolved);
        logMessageIds(resolved);
        setMessageText("");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedUser?.id]);

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

      setMessages((prev) => [
        ...prev,
        mappedMessage,
      ]);
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

      if (resolvedMessage.fileUrl && resolvedMessage.fileUrl.startsWith("blob:")) {
        objectUrlsRef.current.push(resolvedMessage.fileUrl);
      }

      setMessages((prev) => [
        ...prev,
        resolvedMessage,
      ]);
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
    const downloadUrl = message.sourceFileUrl || message.fileUrl;

    if (!downloadUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = message.fileName || "attachment";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMessageClick = (message: MessageUI) => {
    console.log("messageId:", message.id);
  };

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

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                revoked: true,
                kind: "text",
                content: "Tin nhắn đã được thu hồi",
              }
            : msg,
        ),
      );
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

    console.log("Delete message request:", {
      messageId,
      userId: currentUserId,
    });

    try {
      await deleteMessageForMeApi({
        messageId,
        userId: currentUserId,
      });

      console.log("Delete message success:", messageId);

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
      <div className={styles.chat}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.user}>
            <button
              className={styles.backButton}
              onClick={onBackToSidebar}
            >
              <ChevronLeft size={20} />
            </button>

            <img src={selectedUser.avatar} />

            <div>
              <div className={styles.name}>
                {selectedUser.name}
              </div>
              <div className={styles.status}>Online</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Phone size={18} />
            <Video size={18} />

            <Search
              size={18}
              onClick={() => {
                setShowSearch(true);
                setShowInfo(false);
              }}
              style={{ cursor: "pointer" }}
            />

            <Info
              size={18}
              onClick={() => {
                setShowInfo((p) => !p);
                setShowSearch(false);
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body} ref={bodyRef}>
          {loading && <div>Loading...</div>}

          {!loading &&
            messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "me"
                    ? styles.messageRight
                    : styles.messageLeft
                }
              >
                {m.sender === "them" && (
                  <img
                    src={selectedUser.avatar}
                    className={styles.avatar}
                  />
                )}

                <div className={styles.messageBox}>
                  {m.sender === "me" && (
                    <div
                      className={styles.moreBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect =
                          e.currentTarget.getBoundingClientRect();

                        setMenuPos({
                          x: rect.left - 190,
                          y: rect.top,
                        });

                        setOpenMenuId(
                          openMenuId === m.id ? null : m.id
                        );
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
                    onClick={() => handleMessageClick(m)}
                  >
                    {renderMessageContent(m, handleDownloadFile)}
                  </div>
                </div>
              </div>
            ))}
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

      {showInfo && (
        <ChatInfo
          user={selectedUser}
          conversationId={conversationId}
          onClose={() => setShowInfo(false)}
          onReload={loadConversation}
        />
      )}

      {showSearch && (
        <ChatSearch onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
};