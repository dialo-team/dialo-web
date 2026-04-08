import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/module.myAccount/EditAccountModal.module.css";
import { useState } from "react";
import { Calendar } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EditAccountModal = ({ open, onClose }: Props) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

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

  // Chỉ cho nhập số & tối đa 10 ký tự
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      validateField("phone", value);
    }
  };

  const handleSave = () => {
    validateField("name", name);
    validateField("dob", dob);
    validateField("phone", phone);

    if (name.trim() && dob && dob <= today && phone.length === 10) {
      onClose();
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
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
              {/* Tên */}
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
              <select>
                <option>Nữ</option>
                <option>Nam</option>
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
                  type="text"
                  value={formatDate(dob)}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={styles.dateInput}
                  onClick={() =>
                    (
                      document.getElementById("dobPicker") as HTMLInputElement
                    )?.showPicker()
                  }
                />

                {/* icon lịch */}
                <span
                  className={styles.calendarIcon}
                  onClick={() =>
                    (
                      document.getElementById("dobPicker") as HTMLInputElement
                    )?.showPicker()
                  }
                >
                  <Calendar size={18} />
                </span>

                <input
                  id="dobPicker"
                  type="date"
                  value={dob}
                  max={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDob(value);
                    validateField("dob", value);
                  }}
                  className={styles.hiddenDate}
                />
              </div>

              {/* SĐT */}
              <label>
                Điện thoại
                {errors.phone && (
                  <span className={styles.error}> {errors.phone}</span>
                )}
              </label>
              <input type="text" value={phone} onChange={handlePhoneChange} />

              <button className={styles.saveBtn} onClick={handleSave}>
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
