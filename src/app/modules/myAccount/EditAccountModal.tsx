import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/EditAccountModal.module.css";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { updateBasicInfoApi } from "../../../../api/social/me/updateBasicInfoApi";
import { updateBioApi } from "../../../../api/social/me/updateBioApi";
import { ErrorModal } from "@/app/components/ErrorModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EditAccountModal = ({ open, onClose }: Props) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("FEMALE");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const dobInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(user?.userName || "");
      setDob(user?.dob || "");
      setPhone(user?.phone || localStorage.getItem("phone") || "");
      const normalizedGender =
        user?.gender === "Nam" ? "MALE"
        : user?.gender === "Nữ" ? "FEMALE"
        : user?.gender || "FEMALE";
      setGender(normalizedGender);
      setBio(user?.bio || "");
    }
  }, [open, user]);

  const [errors, setErrors] = useState({
    name: "",
    dob: "",
    phone: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // Validate từng field realtime
  const validateField = (field: string, value: string) => {
    let message = "";

    if (field === "name") {
      if (!value.trim()) {
        message = "Tên không được rỗng";
      }
    }

    if (field === "dob") {
      if (!value) {
        message = "Ngày sinh không được rỗng";
      } else if (value > today) {
        message = "Ngày sinh không hợp lệ";
      }
    }

    if (field === "phone") {
      if (!value) {
        message = "Số điện thoại không được rỗng";
      } else if (value.length !== 10) {
        message = "Số điện thoại phải đủ 10 số";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleSave = () => {
    validateField("name", name);
    validateField("dob", dob);

    if (name.trim() && dob && dob <= today) {
      handleSaveProfile();
    }
  };

  const handleSaveProfile = async () => {
    let basicInfoSaved = false;
    let bioSaved = false;
    let basicInfoErrorMessage = "";
    let bioErrorMessage = "";

    try {
      setLoading(true);
      setError("");
      const basicInfoPayload = { userName: name, dob, gender };
      console.log("updateBasicInfoApi payload:", basicInfoPayload);
      try {
        const basicInfoRes = await updateBasicInfoApi(basicInfoPayload);
        basicInfoSaved = true;
        console.log("updateBasicInfoApi success:", basicInfoRes.data);
      } catch (err: any) {
        console.error("updateBasicInfoApi error:", err);
        basicInfoErrorMessage =
          err?.response?.data?.message || "Lưu thông tin cơ bản thất bại";
      }

      const shouldUpdateBio = bio.trim() !== (user?.bio || "").trim();
      if (!shouldUpdateBio) {
        bioSaved = true;
      } else {
        try {
          const bioRes = await updateBioApi({ bio });
          bioSaved = true;
          console.log("updateBioApi success:", bioRes.data);
        } catch (err: any) {
          console.error("updateBioApi error:", err);
          bioErrorMessage = err?.response?.data?.message || "Lưu bio thất bại";
        }
      }

      if (user) {
        const updatedUser = {
          ...user,
          userName: basicInfoSaved ? name : user.userName,
          dob: basicInfoSaved ? dob : user.dob,
          gender: basicInfoSaved ? gender : user.gender,
          bio: bioSaved ? bio : user.bio,
          phone,
        };
        setUser(updatedUser);
        localStorage.setItem("phone", phone);
      }

      if (basicInfoSaved && bioSaved) {
        setError("Cập nhật thành công!");
        setTimeout(() => {
          setError("");
          onClose();
        }, 1000);
        return;
      }

      if (basicInfoSaved && !bioSaved) {
        setError(`Đã lưu thông tin cơ bản, nhưng bio lỗi: ${bioErrorMessage}`);
        return;
      }

      if (!basicInfoSaved && bioSaved) {
        setError(`Đã lưu bio, nhưng thông tin cơ bản lỗi: ${basicInfoErrorMessage}`);
        return;
      }

      setError(basicInfoErrorMessage || bioErrorMessage || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = () => {
    const dateInput = dobInputRef.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.focus();
    dateInput.click();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className={styles.overlay} onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.header}>
                <h3>Cập nhật thông tin</h3>
                <button onClick={onClose}>✕</button>
              </div>

              <div className={styles.form}>
              <label>
                Tên hiển thị
                {errors.name && (
                  <span className={styles.error}> {errors.name}</span>
                )}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  setName(value);
                  validateField("name", value);
                }}
              />

              {/* Giới tính */}
              <label>Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="FEMALE">Nữ</option>
                <option value="MALE">Nam</option>
              </select>

              {/* Ngày sinh */}
              <label>
                Ngày sinh
                {errors.dob && (
                  <span className={styles.error}> {errors.dob}</span>
                )}
              </label>
              <div className={styles.dateWrapper}>
                <input
                  id="dobPicker"
                  ref={dobInputRef}
                  type="date"
                  value={dob}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDob(value);
                    validateField("dob", value);
                  }}
                  className={styles.dateInput}
                />

                <span className={styles.calendarIcon} onClick={openDatePicker}>
                  <Calendar size={18} />
                </span>
              </div>

              {/* SĐT */}
              <label>
                Điện thoại
                {errors.phone && (
                  <span className={styles.error}> {errors.phone}</span>
                )}
              </label>
              <input
                type="text"
                value={phone}
                readOnly
                disabled
                style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
              />

              {/* Bio */}
              <label>Bio</label>
              <textarea
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontFamily: "inherit",
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 80,
                }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Nhập bio của bạn..."
              />

              <button className={styles.saveBtn} onClick={handleSave}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <ErrorModal message={error} onClose={() => setError("")} />
  </>
);
};
