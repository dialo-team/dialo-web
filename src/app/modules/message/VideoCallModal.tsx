import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { getVideoTokenApi } from "../../../../api/video/videoApi";

type Props = {
  conversationId: string;
  participantName: string;
  onClose: () => void;
};

export function VideoCallModal({ conversationId, participantName, onClose }: Props) {
  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getVideoTokenApi(conversationId, participantName)
      .then((res) => {
        setToken(res.data.token);
        setServerUrl(res.data.url);
      })
      .catch(() => setError("Không thể kết nối video service"));
  }, [conversationId, participantName]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "#0f0f1a",
      display: "flex",
      flexDirection: "column",
    }}>
      {error && (
        <div style={{
          color: "#fff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}>
          <span style={{ fontSize: 16, color: "#f87171" }}>{error}</span>
          <button onClick={onClose} style={btnStyle("#374151")}>Đóng</button>
        </div>
      )}

      {!error && !token && (
        <div style={{
          color: "#9ca3af",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontSize: 15,
        }}>
          <Spinner />
          Đang kết nối...
        </div>
      )}

      {token && serverUrl && (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          onDisconnected={onClose}
          data-lk-theme="default"
          style={{ height: "100%", "--lk-bg": "#0f0f1a" } as React.CSSProperties}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20,
      height: 20,
      border: "2px solid #374151",
      borderTopColor: "#6366f1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  };
}
