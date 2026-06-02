import { Phone, PhoneOff } from "lucide-react";
import { useCall } from "./CallContext";

export function IncomingCallModal() {
  const { incomingCall, acceptCall, declineCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: "#1a1a2e",
        borderRadius: 24,
        padding: "40px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        minWidth: 300,
      }}>
        {/* Avatar với ring animation */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "2px solid rgba(34,197,94,0.4)",
            animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
          }} />
          <div style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: "2px solid rgba(34,197,94,0.25)",
            animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite 0.3s",
          }} />
          {incomingCall.callerAvatar ? (
            <img
              src={incomingCall.callerAvatar}
              alt={incomingCall.callerName}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#fff",
              fontWeight: 700,
            }}>
              {incomingCall.callerName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#a0a0b0", fontSize: 13, marginBottom: 4 }}>Cuộc gọi video đến</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{incomingCall.callerName}</div>
        </div>

        <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
          <button
            onClick={declineCall}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#ef4444",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <PhoneOff size={24} color="#fff" />
          </button>

          <button
            onClick={acceptCall}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#22c55e",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Phone size={24} color="#fff" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
