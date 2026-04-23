// import { useRef, useState, useEffect } from "react";
// import styles from "../../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";
// import axiosClient from "../../../../../api/axiosClient";
// import { Camera } from "lucide-react";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   conversationId: string;
//   currentAvatar?: string;
//   onSaved?: (url: string) => void;
// };

// export const ChangeGroupAvatarModal = ({
//   open,
//   onClose,
//   conversationId,
//   currentAvatar,
//   onSaved,
// }: Props) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | undefined>(currentAvatar);
//   const [loading, setLoading] = useState(false);

//   /* cleanup preview */
//   useEffect(() => {
//     return () => {
//       if (preview && preview.startsWith("blob:")) {
//         URL.revokeObjectURL(preview);
//       }
//     };
//   }, [preview]);

//   if (!open) return null;

//   /* ===== CHỌN ẢNH ===== */
//   const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     const previewUrl = URL.createObjectURL(f);

//     setFile(f);
//     setPreview(previewUrl);
//   };

//   /* ===== SAVE ===== */
//   const handleSave = async () => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setLoading(true);

//       const res = await axiosClient.put(
//         `/api/v1/conversations/${conversationId}/avatar`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       const newAvatar = res?.data?.avatar;

//       onSaved?.(newAvatar);

//       window.dispatchEvent(
//         new CustomEvent("conversation-updated", {
//           detail: { conversationId, avatar: newAvatar },
//         })
//       );

//       onClose();
//     } catch (err) {
//       console.error("Lỗi đổi avatar:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div
//         className={styles.modal}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h3 className={styles.title}>Đổi ảnh nhóm</h3>

//         {/* ===== AVATAR + CAMERA ===== */}
//         <div
//           style={{
//             position: "relative",
//             display: "inline-block",
//             margin: "15px 0",
//           }}
//         >
//           <img
//             src={
//               preview ||
//               "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             style={{
//               width: 80,
//               height: 80,
//               borderRadius: "50%",
//               objectFit: "cover",
//             }}
//           />

//           {/* hidden input */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             style={{ display: "none" }}
//             onChange={handleSelectFile}
//             disabled={loading}
//           />

//           {/* camera button */}
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={loading}
//             style={{
//               position: "absolute",
//               bottom: 0,
//               right: 0,
//               width: 36,
//               height: 36,
//               borderRadius: "50%",
//               backgroundColor: loading ? "#6c757d" : "#007bff",
//               border: "3px solid white",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: loading ? "not-allowed" : "pointer",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
//             }}
//           >
//             <Camera size={18} color="white" />
//           </button>
//         </div>

//         {/* NOTE */}
//         <p className={styles.note}>
//           Ảnh mới sẽ hiển thị với tất cả thành viên trong nhóm.
//         </p>

//         {/* ACTIONS */}
//         <div className={styles.actions}>
//           <button
//             className={styles.cancel}
//             onClick={onClose}
//             disabled={loading}
//           >
//             Hủy
//           </button>

//           <button
//             className={styles.confirm}
//             onClick={handleSave}
//             disabled={loading || !file}
//           >
//             {loading ? "Đang tải..." : "Cập nhật"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


import { useRef, useState, useEffect } from "react";
import styles from "../../../styles/module.social/FriendsPage/listFriend/RenameFriendModal.module.css";
import { Camera } from "lucide-react";
import { updateGroupAvatarApi } from "../../../../../api/social/groupFriend/groupApi";

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentAvatar?: string;
  onUpdated?: (url: string) => void;
};

export const ChangeGroupAvatarModal = ({
  open,
  onClose,
  conversationId,
  currentAvatar,
  onUpdated,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const [loading, setLoading] = useState(false);

  /* cleanup preview */
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!open) return null;

  /* ===== convert base64 ===== */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // 👈 trả về data:image/...;base64
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  /* ===== CHỌN ẢNH ===== */
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // validate
    if (!["image/jpeg", "image/png", "image/gif"].includes(f.type)) {
      alert("Chỉ hỗ trợ JPEG, PNG, GIF");
      return;
    }

    const previewUrl = URL.createObjectURL(f);

    setFile(f);
    setPreview(previewUrl);
  };

  /* ===== SAVE ===== */
  const handleSave = async () => {
    if (!file) return;

    try {
      setLoading(true);

      // ✅ convert base64 (LOGIC MỚI)
      const base64 = await fileToBase64(file);

      console.log("Base64 length:", base64.length);

      // ✅ call API
      const res = await updateGroupAvatarApi(conversationId, base64);

      console.log("Update avatar response:", res);

      const newAvatar = res?.data?.groupAvatarUrl || base64;

      // ✅ update UI ngoài
      onUpdated?.(newAvatar);

      // ✅ sync sidebar nếu bạn đang dùng
      window.dispatchEvent(
        new CustomEvent("conversation-updated", {
          detail: { conversationId, avatar: newAvatar },
        })
      );

      onClose();
    } catch (err) {
      console.error("Lỗi đổi avatar:", err);
      alert("Không thể cập nhật ảnh nhóm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Đổi ảnh nhóm</h3>

        {/* ===== AVATAR + CAMERA ===== */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            margin: "15px 0",
          }}
        >
          <img
            src={
              preview ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          {/* hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSelectFile}
            disabled={loading}
          />

          {/* camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              border: "3px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={18} color="white" />
          </button>
        </div>

        {/* NOTE */}
        <p className={styles.note}>
          Ảnh mới sẽ hiển thị với tất cả thành viên trong nhóm.
        </p>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            className={styles.cancel}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className={styles.confirm}
            onClick={handleSave}
            disabled={loading || !file}
          >
            {loading ? "Đang tải..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};