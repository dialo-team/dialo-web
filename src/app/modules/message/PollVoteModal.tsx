import { useState } from "react";
import { X, AlignLeft, Settings, Check } from "lucide-react";
import styles from "../../styles/message/Poll.module.css";
import type { PollResponse, PollSettings } from "../../types/message/Message";
import { votePollApi, addPollOptionApi } from "../../../../api/message/pollApi";

const DEFAULT_AVATAR =
  "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

type Props = {
  open: boolean;
  messageId: string;
  poll: PollResponse;
  senderName: string;
  createdAt: string;
  settings?: PollSettings;
  onClose: () => void;
  onVoted: (messageId: string) => void;
};

export const PollVoteModal = ({
  open,
  messageId,
  poll,
  senderName,
  createdAt,
  settings,
  onClose,
  onVoted,
}: Props) => {
  const currentUserId =
    JSON.parse(localStorage.getItem("user") || "{}")?.id || "";

  const initialSelected = poll.options
    .filter((o) => o.voters.some((v) => v.id === currentUserId))
    .map((o) => o.id);

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [loading, setLoading] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [addingOption, setAddingOption] = useState(false);

  if (!open) return null;

  const allowMultiple = settings?.allowMultiple ?? true;
  const allowAddOption = settings?.allowAddOption ?? true;
  const hideVoters = settings?.hideVoters ?? false;

  const dateLabel = (() => {
    const d = new Date(createdAt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Hôm nay";
    return d.toLocaleDateString("vi-VN");
  })();

  const toggleOption = (id: string) => {
    if (poll.closed) return;
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelected((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const handleConfirm = async () => {
    if (loading || poll.closed) return;
    setLoading(true);
    try {
      await votePollApi(messageId, selected);
      onVoted(messageId);
      onClose();
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim() || addingOption) return;
    setAddingOption(true);
    try {
      await addPollOptionApi(messageId, newOption.trim());
      onVoted(messageId);
      setNewOption("");
      setShowAddInput(false);
    } catch (err) {
      console.error("Add option error:", err);
    } finally {
      setAddingOption(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.voteModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span>Bình chọn</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.pollTitle}>
            {poll.title}
            {poll.closed && (
              <span className={styles.pollClosedBadge}>Đã đóng</span>
            )}
          </div>
          <div className={styles.voteMeta}>
            Tạo bởi {senderName} · {dateLabel}
          </div>

          <div className={styles.voteMultiHint}>
            <AlignLeft size={14} />
            {allowMultiple ? "Chọn nhiều phương án" : "Chọn một phương án"}
          </div>
          <div className={styles.voteDivider} />

          <div className={styles.voteOptions}>
            {poll.options.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className={`${styles.voteOptionRow} ${isSelected ? styles.voteOptionRowSelected : ""}`}
                  onClick={() => toggleOption(opt.id)}
                >
                  <div
                    className={`${styles.voteCheckbox} ${isSelected ? styles.voteCheckboxSelected : ""}`}
                  >
                    {isSelected && (
                      <Check size={12} color="#fff" strokeWidth={3} />
                    )}
                  </div>

                  <span className={styles.voteOptionText}>{opt.content}</span>

                  {!hideVoters && (
                    <div className={styles.voteVoters}>
                      {opt.voters.slice(0, 3).map((v) => (
                        <img
                          key={v.id}
                          src={v.avatar || DEFAULT_AVATAR}
                          alt={v.userName}
                          className={styles.voterAvatar}
                          title={v.userName}
                        />
                      ))}
                    </div>
                  )}

                  <span className={styles.voteCount}>
                    {hideVoters ? "" : opt.voters.length}
                  </span>
                </div>
              );
            })}
          </div>

          {!poll.closed && allowAddOption && (
            <>
              {!showAddInput ? (
                <button
                  className={styles.addOptionLink}
                  onClick={() => setShowAddInput(true)}
                  type="button"
                >
                  + Thêm lựa chọn
                </button>
              ) : (
                <div className={styles.addOptionInputRow}>
                  <input
                    className={styles.addOptionInput}
                    placeholder="Nhập lựa chọn mới"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                    autoFocus
                  />
                  <button
                    className={styles.addOptionConfirmBtn}
                    onClick={handleAddOption}
                    disabled={addingOption || !newOption.trim()}
                    type="button"
                  >
                    {addingOption ? "..." : "Thêm"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.settingsBtn} type="button">
            <Settings size={18} />
          </button>
          <div className={styles.spacer} />
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            Hủy
          </button>
          {!poll.closed && (
            <button
              className={styles.submitBtn}
              onClick={handleConfirm}
              disabled={loading}
              type="button"
            >
              {loading ? "Đang gửi..." : "Xác nhận"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
