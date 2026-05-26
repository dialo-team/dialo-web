import { useOutletContext } from "react-router-dom";
import type { Friend } from "../../types/message/Friend";
import styles from "../../styles/message/ChatWindow.module.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  BarChart2,
  Share2,
  Mic,
  MicOff,
  Pencil,
  SmilePlus,
  X,
  Check,
  Pin,
  PinOff,
} from "lucide-react";
import {
  getConversationDetailApi,
  deleteMessageForMeApi,
  markConversationReadApi,
  revokeMessageApi,
  sendMessageApi,
  sendFileMessageApi,
  reactMessageApi,
  editMessageApi,
  pinMessageApi,
  unpinMessageApi,
  getPinnedMessagesApi,
} from "../../../../api/message/conversationApi";
// import axiosClient from "../../../../api/axiosClient";
import { ChatInfo } from "./ChatInfo";
import { ChatGroupInfo } from "./group/ChatGroupInfo";
import { ChatWindowSkeleton } from "./ChatSkeletonLoading";
import { ChatSearch } from "./ChatSearch";
import { CreatePollModal } from "./CreatePollModal";
import { PollBubble } from "./PollBubble";
import { PollVoteModal } from "./PollVoteModal";
import { ForwardModal } from "./ForwardModal";
import type { MessageDto, PollResponse, PollSettings } from "../../types/message/Message";
import { subscribeChatTopic } from "./chatSocket";
import { getBlockedUsersApi, unblockUserApi } from "../../../../api/social/listFriend/ListFriendApi";
import { getUserInfoApi } from "../../../../api/social/searchAndAddFriend/userApi";
import { VoiceMessage } from "./VoiceMessage";

type PropsContext = {
  selectedUser: Friend | null;
  onBackToSidebar?: () => void;
};

type MessageUI = {
  id: string;
  sender: "me" | "them";
  kind: "text" | "image" | "file" | "audio";
  content: string;
  time: string;
  fileUrl?: string;
  fileUrlCandidates?: string[];
  sourceFileUrl?: string;
  fileName?: string;
  mimeType?: string;
  revoked?: boolean;
  edited?: boolean;
  type?: string;
  senderId?: string;
  senderName?: string;
  createdAt?: string;
  poll?: PollResponse;
  reactions?: { emoji: string; count: number }[];
  durationSeconds?: number;
};

// Thêm type
type PinnedMessage = {
  message: {
    id: string;
    content: string;
    attachment?: {
      fileUrl: string;
    };
    type?: string;
  };
  messageId: string;
  pinnedAt: string;
  pinnedByUserId: string;
  pinnedByName?: string;
};

const MESSAGE_TEXT_TYPE = "TEXT";
// const FILE_PROXY_PREFIX = "/api-files";
const FILE_BASE_URL = "http://14.225.192.37:8085";
const POLLING_INTERVAL_MS = 5000;
const REALTIME_GRACE_PERIOD_MS = 15000;
const COMMON_EMOJIS = [
  "😊", "😂", "❤️", "👍", "😍", "🎉", "🔥", "😢", "😡", "🥺",
  "😎", "🤔", "👋", "🙏", "💪", "😅", "🤣", "😭", "😤", "🥳",
  "😇", "🤩", "😏", "😒", "😔", "😨", "😱", "🤯", "🥴", "😴",
  "😋", "🤗", "😐", "🙄", "😬", "😯", "👏", "🫡", "💯", "🫶",
];
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];


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
const MEDIA_BASE_URL = "http://14.225.192.37:8085";

const toAbsoluteMediaUrl = (url: string) => {
  if (!url) return "";

  // đã là full url
  if (/^https?:\/\//i.test(url)) {
    return encodeURI(url);
  }

  // backend trả /uploads/xxx
  if (url.startsWith("/uploads")) {
    return encodeURI(`${MEDIA_BASE_URL}${url}`);
  }

  // fallback
  return encodeURI(`${MEDIA_BASE_URL}/${url.replace(/^\/+/, "")}`);
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
): MessageUI => {
  const reactionGroups: { emoji: string; count: number }[] = [];
  if (message.reactions?.length) {
    const emojiMap = new Map<string, number>();
    message.reactions.forEach((r) => {
      emojiMap.set(r.emoji, (emojiMap.get(r.emoji) || 0) + 1);
    });
    emojiMap.forEach((count, emoji) => reactionGroups.push({ emoji, count }));
  }

  return {
    id: message.id,
    senderId: message.senderId || undefined,

    sender:
      message.displayPosition === "RIGHT" ||
        (currentUserId ? message.senderId === currentUserId : false)
        ? "me"
        : "them",

    kind: message.revoked
      ? "text"
      : message.type === "VOICE"
        ? "audio"
        : message.type === "GIF"
          ? "image"
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
      if (message.type === "GIF") return message.content || undefined;
      const thumbnailAttachmentUrl =
        message.attachment?.thumbnailUrl || message.attachment?.fileUrl;
      return thumbnailAttachmentUrl
        ? toAbsoluteMediaUrl(thumbnailAttachmentUrl)
        : undefined;
    })(),

    durationSeconds: message.durationSeconds,

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
    edited: message.edited,
    type: message.type,
    senderName: message.senderName,
    createdAt: message.createdAt,
    poll: message.poll,
    reactions: reactionGroups.length ? reactionGroups : undefined,
  };
};

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
      // Dùng fetch để relative path đi qua proxy
      const res = await fetch(candidateUrl);
      if (!res.ok) continue;
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return {
        ...message,
        fileUrl: blobUrl,
        sourceFileUrl: message.sourceFileUrl || candidateUrl,
      };
    } catch {
      // thử candidate tiếp theo
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

  if (message.kind === "audio") {
    const audioSrc = message.fileUrl || message.sourceFileUrl || message.content;
    return (
      <VoiceMessage
        src={audioSrc}
        time={message.time}
        isMine={message.sender === "me"}
      />
    );
  }


  if (message.kind === "image" && displayUrl) {
    const linkUrl = message.sourceFileUrl || displayUrl;
    return (
      <>
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.imageLink}
        >
          <img
            src={displayUrl}
            alt={message.fileName || "image-message"}
            className={message.type === "GIF" ? styles.imageMessage : styles.imageMessage}
            style={message.type === "GIF" ? { maxWidth: 220, borderRadius: 8 } : undefined}
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
          style={{ cursor: "pointer" }}
          onClick={() => onDownloadFile(message)}
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
  const currentUserId = getCurrentUserId();

  if (!selectedUser) {
    return <div className={styles.empty}>Chọn người để chat</div>;
  }

  const [userCache, setUserCache] = useState<Record<string, any>>({});

  const isGroupChat =
    selectedUser?.id === (selectedUser as any)?.counterpartId;

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<MessageUI[]>([]);
  const objectUrlsRef = useRef<string[]>([]);
  const lastMessageIdRef = useRef<string>("");
  const lastRealtimeEventAtRef = useRef<number>(0);
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingBlock, setCheckingBlock] = useState(false);
  const [isGroupDissolved, setIsGroupDissolved] = useState(false);

  const [showPollModal, setShowPollModal] = useState(false);
  const [voteTarget, setVoteTarget] = useState<{ messageId: string; poll: PollResponse; senderName: string; createdAt: string; settings?: PollSettings } | null>(null);
  const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
  const pollSettingsRef = useRef<Map<string, PollSettings>>(new Map());

  // ── Voice recording ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // ── Emoji picker ──
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ── GIF picker ──
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<string[]>([]);
  const gifSearchTimerRef = useRef<number | null>(null);

  // ── Reaction picker ──
  const [openReactionId, setOpenReactionId] = useState<string | null>(null);

  // ── Edit message ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [chatUser, setChatUser] = useState<Friend | null>(selectedUser);

  // =========== GHIMMMMM ===================
  // ── Pinned Messages ──
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [pinnedExpanded, setPinnedExpanded] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [pinMenu, setPinMenu] = useState<{
    messageId: string | null;
    type: "bar" | "item" | null;
    x: number;
    y: number;
  } | null>(null);


  const loadPinnedMessages = useCallback(async () => {
    const conversationId = selectedUser?.id;
    if (!conversationId) return;

    try {
      const res = await getPinnedMessagesApi(conversationId);
      let data: PinnedMessage[] = res.data || [];
      data = data.slice(0, 5); // giới hạn 5

      // Enrich pinnedByName
      const enriched = await Promise.all(
        data.map(async (p) => {
          try {
            const userRes = await getUserInfoApi(p.pinnedByUserId);
            return { ...p, pinnedByName: userRes.data.data.userName };
          } catch {
            return p;
          }
        })
      );

      setPinnedMessages(enriched);
    } catch (err) {
      console.error("Load pinned messages error:", err);
    }
  }, [selectedUser?.id]);

  const handlePinMessage = async (messageId: string) => {
    const conversationId = selectedUser?.id;
    if (!conversationId) return;

    if (pinnedMessages.length >= 5) {
      alert("Không thể ghim quá 5 tin nhắn!");
      return;
    }

    try {
      await pinMessageApi(conversationId, messageId);
      await loadPinnedMessages();
    } catch (err) {
      console.error("Pin message error:", err);
      alert("Không thể ghim tin nhắn");
    }
  };

  const handleUnpinMessage = async (messageId?: string | null) => {
    const conversationId = selectedUser?.id;
    if (!conversationId || !messageId) return;

    try {
      await unpinMessageApi(conversationId, messageId);
      await loadPinnedMessages();
    } catch (err) {
      console.error("Unpin message error:", err);
    }
  };

  const isMessagePinned = (messageId: string) => {
    return pinnedMessages.some((p) => p.messageId === messageId);
  };

  const isPinnedImage = (p: PinnedMessage) => {
    return p.message?.type === "IMAGE" && p.message?.attachment?.fileUrl;
  };

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightMessageId(messageId);

    setTimeout(() => {
      setHighlightMessageId((prev) => (prev === messageId ? null : prev));
    }, 2500);
  };

  // Load pinned messages khi đổi conversation
  useEffect(() => {
    void loadPinnedMessages();
  }, [selectedUser?.id, loadPinnedMessages]);

  // Click outside để đóng pin menu
  useEffect(() => {
    const handleClick = () => setPinMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);


  // =======================================-


  useEffect(() => {
    setChatUser(selectedUser);
  }, [selectedUser]);

  // truyền từ chatsidebar
  useEffect(() => {
    const handler = (e: any) => {
      const { conversationId, name, avatar } = e.detail;

      if (!chatUser || chatUser.id !== conversationId) return;

      setChatUser((prev) =>
        prev
          ? {
            ...prev,
            name: name ?? prev.name,
            avatar: avatar ?? prev.avatar,
          }
          : prev
      );
    };

    window.addEventListener("conversation-updated", handler);

    return () => {
      window.removeEventListener("conversation-updated", handler);
    };
  }, [chatUser]);

  useEffect(() => {
    const checkBlocked = async () => {
      const userId = (selectedUser as any)?.counterpartId;
      if (!userId) return;

      setCheckingBlock(true);

      try {
        const res = await getBlockedUsersApi();

        const blockedList =
          res?.data?.data?.blocks ||
          res?.data?.blocks ||
          [];

        const isBlockedUser = blockedList.some(
          (b: any) => b.blockedUserId === userId
        );

        setIsBlocked(isBlockedUser);
      } catch (err) {
        console.error("Check block error:", err);
      } finally {
        setCheckingBlock(false);
      }
    };

    checkBlocked();
  }, [selectedUser?.id]);

  // click outside - đóng menu, emoji picker, gif picker, reaction picker
  useEffect(() => {
    const close = () => {
      setOpenMenuId(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      setOpenReactionId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
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
        // const currentUserId = getCurrentUserId();
        const data = await getConversationDetailApi(conversationId);

        clearObjectUrls();

        const mapped = data.messages.map((m) =>
          mapMessageToUI(m, currentUserId),
        );
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
  const loadNewMessagesOnly = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      return;
    }

    try {
      const currentUserId = getCurrentUserId();
      const data = await getConversationDetailApi(conversationId);

      const mapped = data.messages.map((m) => mapMessageToUI(m, currentUserId));
      const existingIds = new Set(messagesRef.current.map((m) => m.id));
      const unresolvedNewMessages = uniqueMessagesById(
        mapped.filter((m) => !existingIds.has(m.id)),
      );

      if (mapped.length > 0) {
        lastMessageIdRef.current = mapped[mapped.length - 1].id;
      }

      if (unresolvedNewMessages.length === 0) {
        return;
      }

      const resolvedNewMessages = await Promise.all(
        unresolvedNewMessages.map(async (message) => {
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

      setMessages((prev) => {
        const existingInState = new Set(prev.map((m) => m.id));
        const trulyNew = resolvedNewMessages.filter(
          (m) => !existingInState.has(m.id),
        );
        if (trulyNew.length === 0) return prev;
        return [...prev, ...trulyNew];
      });
    } catch (error) {
      console.error("Load new messages failed:", error);
    }
  }, []);

  // reset dissolved khi đổi conversation
  useEffect(() => {
    setIsGroupDissolved(false);
  }, [selectedUser?.id]);

  // detect dissolution từ SYSTEM message BE gửi — chỉ check message cuối
  useEffect(() => {
    if (!isGroupChat || isGroupDissolved || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.type === "SYSTEM" && last.content === "Nhóm đã được giải tán") {
      setIsGroupDissolved(true);
    }
  }, [messages, isGroupChat, isGroupDissolved]);

  // lắng nghe group-dissolved từ members khác qua socket
  useEffect(() => {
    const conversationId = selectedUser?.id ?? "";
    const handler = (e: any) => {
      if (e.detail?.conversationId === conversationId) {
        setIsGroupDissolved(true);
        setMessages([]);
      }
    };
    window.addEventListener("group-dissolved", handler);
    return () => window.removeEventListener("group-dissolved", handler);
  }, [selectedUser?.id]);

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
        lastRealtimeEventAtRef.current = Date.now();
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
      if (document.hidden) {
        return;
      }

      const elapsedSinceRealtimeEvent =
        Date.now() - lastRealtimeEventAtRef.current;

      // Skip fallback polling shortly after realtime events to avoid duplicate work.
      if (elapsedSinceRealtimeEvent < REALTIME_GRACE_PERIOD_MS) {
        return;
      }

      void loadNewMessagesOnly(conversationId);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [selectedUser?.id, loadNewMessagesOnly]);

  const handleSendMessage = async () => {
    const conversationId = selectedUser?.id;
    const currentUserId = getCurrentUserId();
    const content = messageText.trim();

    if (!conversationId || !currentUserId || !content || sending || isBlocked) {
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
      setMessages((prev) => {
        // Nếu đã có id này thì không append nữa (tránh double khi socket cũng đẩy về)
        if (prev.some((msg) => msg.id === mappedMessage.id)) return prev;
        return [...prev, mappedMessage];
      });
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

    if (!conversationId || sendingFile || isBlocked) {
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
    const downloadUrl =
      message.sourceFileUrl ||
      message.fileUrl ||
      "";

    if (!downloadUrl) return;

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = message.fileName || "attachment";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleMessageClick = () => { };

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



  // ── Voice recording ──
  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        const convId = selectedUser?.id;
        if (!convId) return;
        try {
          const sent = await sendFileMessageApi(convId, file);
          const mapped = mapMessageToUI(sent, currentUserId);
          setMessages((prev) => prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]);
        } catch (e) { console.error("Send voice error:", e); }
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (e) { console.error("Mic error:", e); }
  };

  // ── GIF ──
  const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPzJnC0qUQnV3seh";
  const handleGifSearch = (q: string) => {
    setGifSearch(q);
    if (gifSearchTimerRef.current) clearTimeout(gifSearchTimerRef.current);
    if (!q.trim()) { setGifResults([]); return; }
    gifSearchTimerRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12&media_filter=gif`);
        const data = await res.json();
        const urls: string[] = (data.results || []).map((r: any) =>
          r.media_formats?.gif?.url || r.media_formats?.tinygif?.url || ""
        ).filter(Boolean);
        setGifResults(urls);
      } catch (e) { console.error(e); }
    }, 500);
  };

  const handleSendGif = async (gifUrl: string) => {
    const convId = selectedUser?.id;
    const senderId = currentUserId;
    if (!convId || !senderId) return;
    setShowGifPicker(false);
    setGifSearch("");
    setGifResults([]);
    try {
      const sent = await sendMessageApi({ conversationId: convId, senderId, type: "GIF", content: gifUrl });
      const mapped = mapMessageToUI(sent, currentUserId);
      setMessages((prev) => prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]);
    } catch (e) { console.error("Send GIF error:", e); }
  };

  // ── React (thả cảm xúc) ──
  const handleReact = async (messageId: string, emoji: string) => {
    setOpenReactionId(null);
    try {
      const updated = await reactMessageApi(messageId, emoji);
      const mapped = mapMessageToUI(updated, currentUserId);
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions: mapped.reactions } : m));
    } catch (e) { console.error("React error:", e); }
  };

  // ── Edit message ──
  const handleEditSave = async (messageId: string) => {
    const content = editContent.trim();
    if (!content) return;
    try {
      const updated = await editMessageApi(messageId, content);
      const mapped = mapMessageToUI(updated, currentUserId);
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...mapped, reactions: m.reactions } : m));
      setEditingId(null);
      setEditContent("");
    } catch (e) { console.error("Edit error:", e); }
  };

  // Hàm load user theo senderId
  const fetchUserInfo = useCallback(async (userId: string) => {
    if (!userId) return null;

    if (userCache[userId]) return userCache[userId];

    try {
      const res = await getUserInfoApi(userId);
      const user = res.data.data;

      setUserCache((prev) => ({
        ...prev,
        [userId]: user,
      }));

      return user;
    } catch {
      return null;
    }
  }, [userCache]);

  useEffect(() => {
    if (!isGroupChat) return;
    if (!messages.length) return;

    const senderIds = [
      ...new Set(
        messages
          .map((m) => m.senderId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    senderIds.forEach((id) => {
      fetchUserInfo(id);
    });
  }, [messages, isGroupChat, fetchUserInfo]);

  return (
    <div className={styles.container}>
      {/* <div
        className={`${styles.chat} ${
          showInfo || showSearch ? styles.chatWithPanel : ""
        }`}
      > */}
      <div
        className={`${styles.chat} ${showInfo || showSearch ? styles.chatWithPanel : ""
          }`}
      >
        {/* {isBlocked && (
          <div className={styles.blockOverlay}>
            <div className={styles.blockBox}>
              <div className={styles.blockTitle}>
                Bạn đã bị chặn
              </div>

              <div className={styles.blockDesc}>
                Bạn không thể nhắn tin cho người này.
              </div>

              <button
                className={styles.unblockBtn}
                onClick={async () => {
                  try {
                    await unblockUserApi((selectedUser as any).counterpartId);

                    // cập nhật lại trạng thái
                    setIsBlocked(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Bỏ chặn
              </button>
            </div>
          </div>
        )} */}

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.user}>
            <button className={styles.backButton} onClick={onBackToSidebar}>
              <ChevronLeft size={20} />
            </button>

            {/* <img src={selectedUser.avatar} className={styles.avatar} /> */}
            <img src={chatUser?.avatar} className={styles.avatar} />

            <div>
              <div className={styles.name}>{chatUser?.name}</div>
              {/* <div className={styles.name}>{selectedUser.name}</div> */}
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
          {/* PINNED BAR */}
          {pinnedMessages.length > 0 && !pinnedExpanded && (
            <div className={styles.pinnedBar}>
              <div
                className={styles.pinnedContent}
                onClick={() => scrollToMessage(pinnedMessages[0].messageId)}
              >
                {isPinnedImage(pinnedMessages[0]) ? (
                  <img
                    src={toAbsoluteMediaUrl(pinnedMessages[0].message.attachment!.fileUrl)}
                    style={{ maxWidth: 60, maxHeight: 60, borderRadius: 6, objectFit: "cover" }}
                  />
                ) : (
                  <div className={styles.pinnedText}>
                    {pinnedMessages[0].message.content}
                  </div>
                )}
              </div>

              {pinnedMessages.length > 1 && (
                <span className={styles.more} onClick={() => setPinnedExpanded(true)}>
                  +{pinnedMessages.length - 1} ghim
                </span>
              )}

              <div
                className={styles.menuWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPinMenu({
                    messageId: pinnedMessages[0].messageId,
                    type: "bar",
                    x: rect.right,
                    y: rect.bottom,
                  });
                }}
              >
                ⋯
              </div>
            </div>
          )}

          {/* Expanded Pinned List */}
          {pinnedMessages.length > 0 && pinnedExpanded && (
            <div className={styles.pinnedExpanded}>
              <div className={styles.pinnedHeader}>
                <span>Tin nhắn đã ghim</span>
                <button onClick={() => setPinnedExpanded(false)}>✕</button>
              </div>
              {pinnedMessages.map((p) => (
                <div
                  key={p.messageId}
                  className={styles.pinnedItem}
                  onClick={() => {
                    setPinnedExpanded(false);
                    setTimeout(() => scrollToMessage(p.messageId), 100);
                  }}
                >
                  <div className={styles.pinnedMain}>
                    <div className={styles.pinnedContentText}>
                      <div className={styles.sender}>{p.pinnedByName}</div>
                      {isPinnedImage(p) ? (
                        <img
                          src={toAbsoluteMediaUrl(p.message.attachment!.fileUrl)}
                          style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }}
                        />
                      ) : (
                        <div>{p.message.content}</div>
                      )}
                    </div>

                    <div
                      className={styles.menuWrapper}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPinMenu({
                          messageId: p.messageId,
                          type: "item",
                          x: rect.right,
                          y: rect.bottom,
                        });
                      }}
                    >
                      ⋯
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isGroupDissolved ? (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontSize: 15,
              fontStyle: "italic",
              padding: "40px 0",
            }}>
              Nhóm đã được giải tán
            </div>
          ) : loading ? (
            <ChatWindowSkeleton />
          ) : (
            messages.map((m) => {
              if (m.type === "SYSTEM") {
                return (
                  <div key={m.id} className={styles.systemMessage}>
                    {m.content}
                  </div>
                );
              }


              if (m.type === "POLL" && m.poll) {
                return (
                  <div
                    key={m.id}
                    className={m.sender === "me" ? styles.messageRight : styles.messageLeft}
                  >
                    {m.sender === "them" && (
                      <img
                        src={isGroupChat ? userCache[m.senderId || ""]?.avatar || selectedUser.avatar : selectedUser.avatar}
                        className={styles.avatar}
                      />
                    )}
                    <div className={styles.messageBox}>
                      <PollBubble
                        messageId={m.id}
                        poll={m.poll}
                        time={m.time}
                        settings={pollSettingsRef.current.get(m.id)}
                        onVoteClick={(msgId) =>
                          setVoteTarget({
                            messageId: msgId,
                            poll: m.poll!,
                            senderName: m.senderName || "Người dùng",
                            createdAt: m.createdAt || new Date().toISOString(),
                            settings: pollSettingsRef.current.get(msgId),
                          })
                        }
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  ref={(el) => { messageRefs.current[m.id] = el; }}
                  className={`${m.sender === "me" ? styles.messageRight : styles.messageLeft}
                 ${highlightMessageId === m.id ? styles.highlight : ""}`}
                >
                  {m.sender === "them" && (
                    <img
                      src={
                        isGroupChat
                          ? userCache[m.senderId || ""]?.avatar || selectedUser.avatar
                          : selectedUser.avatar
                      }
                      className={styles.avatar}
                    />
                  )}

                  <div className={styles.messageBox}>

                    {/* ── Hover action bar (hiện khi rờ vào tin nhắn) ── */}
                    {!m.revoked && (
                      <div className={`${styles.hoverActions} ${m.sender === 'me' ? styles.hoverActionsRight : styles.hoverActionsLeft}`}>
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            className={styles.hoverReactBtn}
                            onClick={(e) => { e.stopPropagation(); void handleReact(m.id, emoji); }}
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                        <span className={styles.hoverDivider} />
                        <button
                          className={styles.hoverMoreBtn}
                          title="Thêm tùy chọn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ x: rect.left - 180, y: rect.bottom + 4 });
                            setOpenMenuId(openMenuId === m.id ? null : m.id);
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    )}

                    {/* ── Dropdown menu (chỉnh sửa / thu hồi / xóa / chuyển tiếp) ── */}
                    {openMenuId === m.id && (
                      <div
                        className={styles.menu}
                        style={{ left: menuPos.x, top: menuPos.y }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {m.sender === 'me' && !m.revoked && m.kind === 'text' && (
                          <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setEditingId(m.id); setEditContent(m.content); setOpenMenuId(null); }}>
                            <Pencil size={14} /> Chỉnh sửa
                          </div>
                        )}
                        {m.sender === 'me' && (
                          <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); void handleRevokeMessage(m.id); }}>
                            <Reply size={14} /> Thu hồi
                          </div>
                        )}
                        <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); void handleDeleteMessageForMe(m.id); }}>
                          <Trash2 size={14} /> Xóa chỉ mình tôi
                        </div>
                        <div
                          className={styles.menuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMessagePinned(m.id)) {
                              void handleUnpinMessage(m.id);
                            } else {
                              void handlePinMessage(m.id);
                            }
                            setOpenMenuId(null);
                          }}
                        >
                          {isMessagePinned(m.id) ? <PinOff size={14} /> : <Pin size={14} />}
                          {isMessagePinned(m.id) ? "Bỏ ghim" : "Ghim tin nhắn"}
                        </div>
                        <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setForwardMsgId(m.id); }}>
                          <Share2 size={14} /> Chuyển tiếp
                        </div>
                      </div>
                    )}

                    <div
                      className={`${m.kind === 'image'
                        ? styles.imageBubble
                        : m.kind === 'file'
                          ? styles.fileBubble
                          : m.kind === 'audio'
                            ? styles.audioBubble
                            : styles.bubble
                        } ${m.revoked ? styles.revoked : ''}`}
                      onClick={handleMessageClick}
                    >
                      {isGroupChat && m.sender === 'them' && (
                        <div className={styles.senderNameInside}>
                          {userCache[m.senderId || '']?.userName || 'Đang tải...'}
                        </div>
                      )}
                      {/* Inline edit form */}
                      {editingId === m.id ? (
                        <div className={styles.editInputWrap}>
                          <textarea
                            className={styles.editInput}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleEditSave(m.id); }
                              if (e.key === 'Escape') { setEditingId(null); }
                            }}
                            autoFocus
                          />
                          <div className={styles.editActions}>
                            <button className={styles.editCancelBtn} onClick={() => setEditingId(null)}><X size={12} />Hủy</button>
                            <button className={styles.editSaveBtn} onClick={() => void handleEditSave(m.id)}><Check size={12} />Lưu</button>
                          </div>
                        </div>
                      ) : (
                        renderMessageContent(m, handleDownloadFile)
                      )}
                      {m.edited && !m.revoked && editingId !== m.id && (
                        <span className={styles.editedLabel}>đã chỉnh sửa</span>
                      )}
                    </div>

                    {m.reactions && m.reactions.length > 0 && (
                      <div className={styles.reactionsBar}>
                        {m.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            className={styles.reactionPill}
                            onClick={() => void handleReact(m.id, r.emoji)}
                            title={`${r.count} người react — bấm để đổi/xóa`}
                          >
                            {r.emoji} {r.count > 1 && <span>{r.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* TOOLBAR + INPUT — ẩn khi nhóm đã giải tán */}
        {isGroupDissolved ? null : isBlocked ? (
          <div className={styles.blockInlineBar}>
            <div className={styles.blockInlineText}>
              Bạn đang chặn người này
            </div>

            <button
              className={styles.unblockInlineBtn}
              onClick={async () => {
                try {
                  await unblockUserApi((selectedUser as any).counterpartId);
                  setIsBlocked(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Bỏ chặn
            </button>
          </div>
        ) : (<>
          {/* TOOLBAR */}
          <div className={styles.toolbar}>
            {/* Emoji picker */}
            <div className={styles.toolbarWrap}>
              <button
                className={styles.toolbarItem}
                title="Emoji"
                onClick={(e) => { e.stopPropagation(); setShowEmojiPicker((p) => !p); setShowGifPicker(false); }}
              >
                <Smile size={18} />
              </button>
              {showEmojiPicker && (
                <div className={styles.emojiPickerWrap} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.emojiGrid}>
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        className={styles.emojiBtn}
                        onClick={() => { setMessageText((prev) => prev + emoji); setShowEmojiPicker(false); }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GIF picker */}
            <div className={styles.toolbarWrap}>
              <button
                className={styles.toolbarItem}
                title="GIF"
                style={{ fontSize: 11, fontWeight: 700, padding: '1px 5px', border: '1.5px solid #0ea5e9', borderRadius: 5, color: '#0ea5e9', background: 'none', cursor: 'pointer', lineHeight: 1.4 }}
                onClick={(e) => { e.stopPropagation(); setShowGifPicker((p) => !p); setShowEmojiPicker(false); }}
              >
                GIF
              </button>
              {showGifPicker && (
                <div className={styles.emojiPickerWrap} style={{ width: 320 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 8, fontSize: 13, boxSizing: 'border-box' }}
                    placeholder="Tìm GIF..."
                    value={gifSearch}
                    onChange={(e) => handleGifSearch(e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                    {gifResults.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="gif"
                        style={{ width: '100%', borderRadius: 6, cursor: 'pointer', objectFit: 'cover', height: 80 }}
                        onClick={() => void handleSendGif(url)}
                      />
                    ))}
                    {gifResults.length === 0 && gifSearch && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 12, padding: 12 }}>Đang tìm...</div>
                    )}
                    {gifResults.length === 0 && !gifSearch && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', fontSize: 12, padding: 12 }}>Nhập để tìm GIF</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image / File */}
            <Image
              size={18}
              className={styles.toolbarItem}
              onClick={handlePickFile}
              style={{ cursor: 'pointer', opacity: sendingFile ? 0.6 : 1 }}
            />
            <Paperclip
              size={18}
              className={styles.toolbarItem}
              onClick={handlePickFile}
              style={{ cursor: 'pointer', opacity: sendingFile ? 0.6 : 1 }}
            />

            {/* Voice recording */}
            <button
              className={`${styles.toolbarItem} ${isRecording ? styles.recordingBtn : ''}`}
              title={isRecording ? 'Dừng ghi âm' : 'Ghi âm tin nhắn thoại'}
              onClick={() => void handleToggleRecording()}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {isRecording ? <><MicOff size={18} /><span style={{ fontSize: 11, color: '#ef4444' }}>{recordingSeconds}s</span></> : <Mic size={18} />}
            </button>

            {isGroupChat && (
              <BarChart2
                size={18}
                className={styles.toolbarItem}
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPollModal(true)}
              // title="Tạo bình chọn"
              />
            )}
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
        </>)}
      </div>

      {/* RIGHT PANEL */}
      {showInfo && selectedUser && (
        isGroupChat ? (
          <ChatGroupInfo
            conversationId={selectedUser.id}
            groupName={selectedUser.name}
            members={(selectedUser as any).members || []}
            onClose={() => setShowInfo(false)}
            counterpartAvatarUrl={(selectedUser as any)?.avatar}
            onConversationCleared={() => setMessages([])}
            onGroupDissolved={() => { setIsGroupDissolved(true); setMessages([]); setShowInfo(false); }}
            onLeaveGroup={() => { setShowInfo(false); onBackToSidebar?.(); }}
          />
        ) : (
          <ChatInfo
            user={selectedUser}
            conversationId={selectedUser.id}
            onConversationCleared={() => setMessages([])}
            onClose={() => setShowInfo(false)}
          />
        )
      )}

      {showSearch && <ChatSearch onClose={() => setShowSearch(false)} />}

      <CreatePollModal
        open={showPollModal}
        conversationId={selectedUser.id}
        onClose={() => setShowPollModal(false)}
        onCreated={(msg, settings) => {
          if (msg?.id) pollSettingsRef.current.set(msg.id, settings);
          setShowPollModal(false);
          void loadConversationDetail(selectedUser.id, true);
        }}
      />

      {voteTarget && (
        <PollVoteModal
          open={true}
          messageId={voteTarget.messageId}
          poll={voteTarget.poll}
          senderName={voteTarget.senderName}
          createdAt={voteTarget.createdAt}
          settings={voteTarget.settings}
          onClose={() => setVoteTarget(null)}
          onVoted={() => {
            setVoteTarget(null);
            void loadConversationDetail(selectedUser.id, true);
          }}
        />
      )}

      <ForwardModal
        open={forwardMsgId !== null}
        sourceMessageId={forwardMsgId ?? ""}
        onClose={() => setForwardMsgId(null)}
        onForwarded={() => setForwardMsgId(null)}
      />

      {pinMenu && (
        <div
          className={styles.pinDropdown}
          style={{ position: "fixed", top: pinMenu.y, left: pinMenu.x, zIndex: 9999 }}
        >
          <div
            className={styles.pinDropdownItem}
            onClick={() => {
              setPinnedExpanded(true);
              setPinMenu(null);
            }}
          >
            Mở bảng ghim
          </div>
          <div
            className={styles.pinDropdownItem}
            onClick={() => {
              void handleUnpinMessage(pinMenu.messageId);
              setPinMenu(null);
            }}
          >
            Bỏ ghim
          </div>
        </div>
      )}
    </div>
  );
};


