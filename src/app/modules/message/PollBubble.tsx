import { AlignLeft } from "lucide-react";
import styles from "../../styles/message/Poll.module.css";
import type { PollResponse, PollSettings } from "../../types/message/Message";

type Props = {
  messageId: string;
  poll: PollResponse;
  time: string;
  settings?: PollSettings;
  onVoteClick: (messageId: string) => void;
};

export const PollBubble = ({
  messageId,
  poll,
  time,
  settings,
  onVoteClick,
}: Props) => {
  const currentUserId =
    JSON.parse(localStorage.getItem("user") || "{}")?.id || "";
  const totalVotes = poll.options.reduce((acc, o) => acc + o.voters.length, 0);

  const hasVoted = poll.options.some((o) =>
    o.voters.some((v) => v.id === currentUserId),
  );

  const hideResult = settings?.hideResultBeforeVote && !hasVoted;

  return (
    <div className={styles.pollBubble}>
      <div className={styles.pollTitle}>{poll.title}</div>
      <div className={styles.pollSubtitle}>
        <AlignLeft size={13} />
        {settings && !settings.allowMultiple
          ? "Chọn một phương án"
          : "Chọn nhiều phương án"}
        {poll.closed && (
          <span className={styles.pollClosedBadge}>Đã đóng</span>
        )}
      </div>

      {poll.options.map((opt) => (
        <div key={opt.id} className={styles.pollOptionPreview}>
          <span>{opt.content}</span>
          <span className={styles.pollOptionCount}>
            {hideResult ? "?" : opt.voters.length}
          </span>
        </div>
      ))}

      {!poll.closed && (
        <button
          className={styles.voteBtn}
          onClick={() => onVoteClick(messageId)}
        >
          Bình chọn
        </button>
      )}

      <div className={styles.pollTime}>
        {hideResult ? "? lượt bình chọn" : `${totalVotes} lượt bình chọn`} ·{" "}
        {time}
      </div>
    </div>
  );
};
