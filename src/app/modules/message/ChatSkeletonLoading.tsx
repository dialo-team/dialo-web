import styles from "../../styles/message/ChatSkeletonLoading.module.css";

type ChatSkeletonRow = {
  side: "left" | "right";
  widthClass: string;
  heightClass: string;
};

const chatRows: ChatSkeletonRow[] = [
  { side: "left", widthClass: styles.w64, heightClass: styles.h12 },
  { side: "right", widthClass: styles.w48, heightClass: styles.h10 },
  { side: "left", widthClass: styles.w32, heightClass: styles.h10 },
  { side: "right", widthClass: styles.w64, heightClass: styles.h12 },
  { side: "left", widthClass: styles.w48, heightClass: styles.h10 },
  { side: "right", widthClass: styles.w40, heightClass: styles.h10 },
  { side: "left", widthClass: styles.w56, heightClass: styles.h11 },
];

type ChatWindowSkeletonProps = {
  rows?: ChatSkeletonRow[];
};

export const ChatWindowSkeleton = ({
  rows = chatRows,
}: ChatWindowSkeletonProps) => {
  return (
    <section
      className={styles.chatWindowSkeleton}
      aria-label="Dang tai tin nhan"
      aria-busy="true"
    >
      <div className={styles.chatRows}>
        {rows.map((row, index) => {
          const isReceived = row.side === "left";

          return (
            <div
              key={`${row.side}-${row.widthClass}-${index}`}
              className={isReceived ? styles.leftRow : styles.rightRow}
            >
              <div
                className={`${styles.messageRow} ${isReceived ? "" : styles.reverseRow}`}
              >
                <div className={`${styles.avatar} ${styles.shimmer}`} />
                <div
                  className={[
                    styles.bubble,
                    styles.shimmer,
                    isReceived ? styles.receivedBubble : styles.sentBubble,
                    row.widthClass,
                    row.heightClass,
                  ].join(" ")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const ChatInfoSkeleton = () => {
  return (
    <section
      className={styles.chatInfoSkeleton}
      aria-label="Dang tai thong tin hoi thoai"
      aria-busy="true"
    >
      <div className={styles.panelGroup}>
        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.shimmer} ${styles.sectionTitle}`}></div>
            <div className={`${styles.shimmer} ${styles.sectionIcon}`}></div>
          </div>

          <div className={styles.imageGrid}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`media-${idx}`}
                className={`${styles.shimmer} ${styles.mediaSquare}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div
              className={`${styles.shimmer} ${styles.sectionTitleSmall}`}
            ></div>
            <div className={`${styles.shimmer} ${styles.sectionIcon}`}></div>
          </div>

          <div className={styles.fileList}>
            <div className={`${styles.shimmer} ${styles.fileLineWide}`} />
            <div
              className={`${styles.shimmer} ${styles.fileLineMedium} ${styles.sentTint}`}
            />
            <div className={`${styles.shimmer} ${styles.fileLineShort}`} />
          </div>
        </div>
      </div>
    </section>
  );
};
