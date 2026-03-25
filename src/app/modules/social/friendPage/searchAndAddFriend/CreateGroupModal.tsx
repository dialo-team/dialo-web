import { useState } from "react";
import styles from "../../../../styles/module.social/FriendsPage/searchAndAddFriend/CreateGroupModal.module.css";
import { X, Search, Camera } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function CreateGroupModal({ onClose }: Props) {
  const friends = [
    {
      id: 1,
      name: "Như",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 2,
      name: "Trúc",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 3,
      name: "My",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 4,
      name: "Hoa",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
    {
      id: 5,
      name: "Mai",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
     {
      id: 6,
      name: "Lệ",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },

     {
      id: 7,
      name: "A",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
     {
      id: 8,
      name: "B",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa?pid=Api&P=0&h=180",
    },
  ];

  const [selected, setSelected] = useState<number[]>([]);

  // chọn người vào nhóm
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length >= 100
          ? prev
          : [...prev, id]
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <span>Tạo nhóm</span>
          <X size={20} onClick={onClose} className={styles.close} />
        </div>

        {/* TÊN NHÓM */}
        <div className={styles.groupInfo}>
          <div className={styles.avatarUpload}>
            <Camera size={18} />
          </div>
          <input
            className={styles.inputBottom}
            placeholder="Nhập tên nhóm..."
          />
        </div>

        {/* SEARCH */}
        <div className={styles.searchBox}>
          <Search size={16} />
          <input placeholder="Nhập tên, số điện thoại..." />
        </div>

        {/* DANH SÁCH */}
        <div className={styles.content}>
          {/* LEFT - danh sách bạn */}
          <div className={styles.list}>
            {friends.map((f) => {
              const isChecked = selected.includes(f.id);

              return (
                <div
                  key={f.id}
                  className={styles.item}
                  onClick={() => toggleSelect(f.id)}
                >
                  <div
                    className={`${styles.checkbox} ${isChecked ? styles.checked : ""
                      }`}
                  />

                  <img src={f.avatar} className={styles.avatar} />
                  <span>{f.name}</span>
                </div>
              );
            })}
          </div>

          {/* RIGHT - danh sách đã chọn */}
          {selected.length > 0 && (
            <div className={styles.selectedPanel}>
              <div className={styles.selectedHeader}>
                Đã chọn {selected.length}/100
              </div>

              <div className={styles.selectedList}>
                {friends
                  .filter((f) => selected.includes(f.id))
                  .map((f) => (
                    <div key={f.id} className={styles.selectedItem}>
                      <img src={f.avatar} className={styles.avatar2} />
                      <span>{f.name}</span>

                      <span
                        className={styles.remove}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(f.id);
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Hủy
          </button>
          <button className={styles.confirm}>Tạo nhóm</button>
        </div>
      </div>
    </div>
  );
}