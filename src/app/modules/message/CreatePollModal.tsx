import { useState } from "react";
import { X, Minus } from "lucide-react";
import styles from "../../styles/message/Poll.module.css";
import { createPollApi } from "../../../../api/message/pollApi";
import type { PollSettings } from "../../types/message/Message";

type Props = {
  open: boolean;
  conversationId: string;
  onClose: () => void;
  onCreated: (message: any, settings: PollSettings) => void;
};

const DEFAULT_SETTINGS: PollSettings = {
  allowMultiple: true,
  allowAddOption: true,
  hideResultBeforeVote: false,
  hideVoters: false,
};

export const CreatePollModal = ({
  open,
  conversationId,
  onClose,
  onCreated,
}: Props) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [settings] = useState<PollSettings>(DEFAULT_SETTINGS);

  if (!open) return null;

  const handleOptionChange = (idx: number, val: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const handleAddOption = () => {
    if (options.length < 10) setOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const validOptions = options.filter((o) => o.trim());

  const duplicateIndices = new Set<number>();
  const seen = new Map<string, number>();
  options.forEach((opt, idx) => {
    const key = opt.trim().toLowerCase();
    if (!key) return;
    if (seen.has(key)) {
      duplicateIndices.add(seen.get(key)!);
      duplicateIndices.add(idx);
    } else {
      seen.set(key, idx);
    }
  });
  const hasDuplicates = duplicateIndices.size > 0;

  const canSubmit =
    title.trim().length > 0 &&
    validOptions.length >= 2 &&
    !hasDuplicates &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await createPollApi({
        conversationId,
        title: title.trim(),
        options: validOptions,
      });
      onCreated(res.data, settings);
      setTitle("");
      setOptions(["", ""]);
      onClose();
    } catch (err) {
      console.error("Create poll error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.createModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span>Tạo bình chọn</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBodyWrap}>
          {/* Left: title + options */}
          <div className={styles.modalBodyLeft}>
            <div>
              <div className={styles.fieldLabel}>Chủ đề bình chọn</div>
              <textarea
                className={styles.titleTextarea}
                placeholder="Đặt câu hỏi bình chọn"
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className={styles.charCount}>{title.length}/200</div>
            </div>

            <div>
              <div className={styles.fieldLabel}>Các lựa chọn</div>
              {options.map((opt, idx) => (
                <div key={idx} className={styles.optionRow}>
                  <input
                    className={`${styles.optionInput} ${duplicateIndices.has(idx) ? styles.optionInputError : ""}`}
                    placeholder={`Lựa chọn ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      className={styles.removeOptionBtn}
                      onClick={() => handleRemoveOption(idx)}
                      type="button"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
              {hasDuplicates && (
                <div className={styles.duplicateError}>
                  Các lựa chọn không được trùng nhau
                </div>
              )}
              {options.length < 10 && (
                <button
                  className={styles.addOptionBtn}
                  onClick={handleAddOption}
                  type="button"
                >
                  + Thêm lựa chọn
                </button>
              )}
            </div>
          </div>

        </div>

        <div className={styles.modalFooter}>
          <div className={styles.spacer} />
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            Hủy
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit}
            type="button"
          >
            {loading ? "Đang tạo..." : "Tạo bình chọn"}
          </button>
        </div>
      </div>
    </div>
  );
};
