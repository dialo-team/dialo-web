import { useState } from "react";
import styles from "../../styles/message/ChatSearch.module.css";
import { X, Search } from "lucide-react";

type ChatSearchProps = {
  onClose: () => void;
};

export const ChatSearch = ({ onClose }: ChatSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const [filterBy, setFilterBy] = useState<"sender" | "date">("sender");

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h3>Tìm kiếm trong trò chuyện</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Input tìm kiếm */}
      <div className={styles.searchBox}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Nhập từ khóa để tìm kiếm"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Bộ lọc */}
      <div className={styles.filters}>
        <label>
          Lọc theo:
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
          >
            <option value="sender">Người gửi</option>
            <option value="date">Ngày gửi</option>
          </select>
        </label>
      </div>

      {/* Placeholder khi chưa tìm kiếm */}
      {keyword.trim() === "" && (
        <div className={styles.empty}>
          <Search size={64} />
          <p>Hãy nhập từ khóa để bắt đầu tìm kiếm tin nhắn và file trong trò chuyện</p>
        </div>
      )}

      {/* TODO: kết quả tìm kiếm */}
      {keyword.trim() !== "" && (
        <div className={styles.results}>
          {/* Kết quả tìm kiếm hiện ở đây */}
          <p>Kết quả tìm kiếm cho: "{keyword}"</p>
        </div>
      )}
    </div>
  );
};