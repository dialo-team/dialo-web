import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import {
  callInviteApi,
  callAcceptApi,
  callDeclineApi,
  callEndApi,
} from "../../../../api/video/videoApi";

const VIDEO_SERVICE_URL = "https://dialo-video-service-production.up.railway.app";

export type IncomingCall = {
  conversationId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
};

type CallContextValue = {
  incomingCall: IncomingCall | null;
  activeCallConvId: string | null;
  sendCallInvite: (params: {
    conversationId: string;
    callerName: string;
    callerAvatar?: string;
    recipientIds: string[];
  }) => void;
  acceptCall: () => void;
  declineCall: () => void;
  startCall: (conversationId: string) => void;
  endCall: (recipientIds: string[]) => void;
};

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCallConvId, setActiveCallConvId] = useState<string | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Socket.IO — chỉ dùng để NHẬN events
  useEffect(() => {
    if (!userId) return;

    const socket = io(VIDEO_SERVICE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("register", userId));

    socket.on("incoming-call", (data: IncomingCall) => {
      setIncomingCall(data);
      ringtoneRef.current?.play().catch(() => {});
    });

    socket.on("call-accepted", () => {
      // caller nhận được accept — VideoCallModal đã mở rồi, không cần làm gì thêm
    });

    socket.on("call-declined", () => {
      setActiveCallConvId(null);
    });

    socket.on("call-ended", () => {
      setIncomingCall(null);
      setActiveCallConvId(null);
      ringtoneRef.current?.pause();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Gửi — dùng REST API
  const sendCallInvite = ({
    conversationId,
    callerName,
    callerAvatar,
    recipientIds,
  }: {
    conversationId: string;
    callerName: string;
    callerAvatar?: string;
    recipientIds: string[];
  }) => {
    if (!userId) return;
    callInviteApi({ conversationId, callerId: userId, callerName, callerAvatar, recipientIds }).catch(() => {});
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    callAcceptApi(incomingCall.conversationId, incomingCall.callerId).catch(() => {});
    ringtoneRef.current?.pause();
    setActiveCallConvId(incomingCall.conversationId);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (!incomingCall) return;
    callDeclineApi(incomingCall.conversationId, incomingCall.callerId).catch(() => {});
    ringtoneRef.current?.pause();
    setIncomingCall(null);
  };

  const startCall = (conversationId: string) => {
    setActiveCallConvId(conversationId);
  };

  const endCall = (recipientIds: string[]) => {
    if (activeCallConvId) {
      callEndApi(activeCallConvId, recipientIds).catch(() => {});
    }
    setActiveCallConvId(null);
  };

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        activeCallConvId,
        sendCallInvite,
        acceptCall,
        declineCall,
        startCall,
        endCall,
      }}
    >
      <audio ref={ringtoneRef} loop src="/ringtone.mp3" />
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside CallProvider");
  return ctx;
}
