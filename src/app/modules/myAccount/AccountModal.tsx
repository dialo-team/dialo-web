import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/AccountModal.module.css";
import { EditAccountModal } from "./EditAccountModal";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../../../store/authStore";
import { Camera } from "lucide-react";
import { updateAvatarApi } from "../../../../api/social/me/updateAvatarApi";
import { updateBackgroundApi } from "../../../../api/social/me/updateBackgroundApi";
import { ErrorModal } from "@/app/components/ErrorModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AccountModal = ({ open, onClose }: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (backgroundPreview) {
        URL.revokeObjectURL(backgroundPreview);
      }
    };
  }, [avatarPreview, backgroundPreview]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previousAvatar = user?.avatar || null;
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return previewUrl;
      });

      // Realtime: update avatar on the outer layout immediately after file select.
      if (user) {
        setUser({ ...user, avatar: previewUrl });
      }

      try {
        setLoading(true);
        setError("");
        const res = await updateAvatarApi(file);
        if (res.data?.data && user) {
          const updatedUser = { ...user, avatar: res.data.data.avatar };
          setUser(updatedUser);
          console.log("updateAvatarApi success:", res.data);
          setError("Cập nhật avatar thành công!");
          setTimeout(() => setError(""), 2000);
        }
      } catch (err: any) {
        console.error("updateAvatarApi error:", err);
        setAvatarPreview((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });

        // Rollback to the previous avatar when upload fails.
        if (user) {
          setUser({ ...user, avatar: previousAvatar });
        }
        setError(err?.response?.data?.message || "Cập nhật avatar thất bại");
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleBackgroundChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBackgroundPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return previewUrl;
      });

      try {
        setLoading(true);
        setError("");
        const res = await updateBackgroundApi(file);
        if (res.data?.data && user) {
          const updatedUser = { ...user, background: res.data.data.background };
          setUser(updatedUser);
          console.log("updateBackgroundApi success:", res.data);
          setError("Cập nhật background thành công!");
          setTimeout(() => setError(""), 2000);
        }
      } catch (err: any) {
        console.error("updateBackgroundApi error:", err);
        setBackgroundPreview((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
        setError(
          err?.response?.data?.message || "Cập nhật background thất bại",
        );
      } finally {
        setLoading(false);
        if (backgroundFileInputRef.current) {
          backgroundFileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className={styles.overlay} onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.header}>
                <h3>Thông tin tài khoản</h3>
                <button onClick={onClose} className={styles.closeBtn}>
                  ✕
                </button>
              </div>

              {/* Cover */}
              <div
                className={styles.cover}
                style={{
                  backgroundImage:
                    backgroundPreview || user?.background
                      ? `url(${backgroundPreview || user?.background})`
                      : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={() =>
                  !loading && backgroundFileInputRef.current?.click()
                }
                title="Nhấp để đổi background"
              ></div>
              <input
                ref={backgroundFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleBackgroundChange}
                disabled={loading}
              />

              {/*Avatar + Name */}
              <div className={styles.profileSection}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div className={styles.avatar}>
                    <img
                      src={
                        avatarPreview ||
                        user?.avatar ||
                        "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180"
                      }
                      alt="avatar"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                    disabled={loading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: loading ? "#6c757d" : "#007bff",
                      border: "3px solid white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                    title="Đổi avatar"
                  >
                    <Camera size={20} color="white" />
                  </button>
                </div>
                <div className={styles.name}>{user?.userName || "User"}</div>
              </div>

              {/* Info */}
              <div className={styles.infoSection}>
                <h4>Thông tin cá nhân</h4>

                <div className={styles.row}>
                  <span>Giới tính</span>
                  <span>
                    {user?.gender === "MALE"
                      ? "Nam"
                      : user?.gender === "FEMALE"
                        ? "Nữ"
                        : user?.gender || "Chưa cập nhật"}
                  </span>
                </div>

                <div className={styles.row}>
                  <span>Ngày sinh</span>
                  <span>{user?.dob || "Chưa cập nhật"}</span>
                </div>

                <div className={styles.row}>
                  <span>Điện thoại</span>
                  <span>
                    {user?.phone ||
                      localStorage.getItem("phone") ||
                      "Chưa cập nhật"}
                  </span>
                </div>

                <button
                  className={styles.updateBtn}
                  onClick={() => {
                    setOpenEdit(true);
                    onClose(); // đóng AccountModal
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditAccountModal open={openEdit} onClose={() => setOpenEdit(false)} />
      <ErrorModal message={error} onClose={() => setError("")} />
    </>
  );
};
