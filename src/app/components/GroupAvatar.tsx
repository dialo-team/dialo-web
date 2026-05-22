


import React from "react";
import styles from "../styles/components/GroupAvatar.module.css";

type Props = {
    avatars: string[];
    size?: number;
};

const DEFAULT =
    "https://tse2.mm.bing.net/th/id/OIP.vg41yG82qw84ziz5nS-CWQHaHa";

export const GroupAvatar: React.FC<Props> = ({ avatars = [], size = 48 }) => {
    const list = avatars.filter(Boolean);
    const count = list.length;

    const src = (i: number) => list[i] || DEFAULT;

    // =====================
    // 1 NGƯỜI -> CIRCLE
    // =====================
    if (count <= 1) {
        return (
            <img
                src={src(0)}
                className={styles.single}
                style={{ width: size, height: size }}
            />
        );
    }

    // =====================
    // GROUP (>=2)
    // =====================
    return (
        <div
            className={styles.wrapper}
            style={{ width: size, height: size }}
        >
            {/* 2 người */}
            {count === 2 && (
                <>
                    <img src={src(0)} className={`${styles.avatar} ${styles.two_1}`} />
                    <img src={src(1)} className={`${styles.avatar} ${styles.two_2}`} />
                </>
            )}

            {/* 3 người */}
            {count === 3 && (
                <>
                    <img src={src(0)} className={`${styles.avatar} ${styles.three_1}`} />
                    <img src={src(1)} className={`${styles.avatar} ${styles.three_2}`} />
                    <img src={src(2)} className={`${styles.avatar} ${styles.three_3}`} />
                </>
            )}

            {/* 4 người */}
            {count === 4 && (
                <>
                    <img src={src(0)} className={`${styles.avatar} ${styles.four} ${styles.four_1}`} />
                    <img src={src(1)} className={`${styles.avatar} ${styles.four} ${styles.four_2}`} />
                    <img src={src(2)} className={`${styles.avatar} ${styles.four} ${styles.four_3}`} />
                    <img src={src(3)} className={`${styles.avatar} ${styles.four} ${styles.four_4}`} />
                </>
            )}

            {/* >4 người */}
            {count > 4 && (
                <>
                    <img src={src(0)} className={`${styles.avatar} ${styles.four_1}`} />
                    <img src={src(1)} className={`${styles.avatar} ${styles.four_2}`} />
                    <img src={src(2)} className={`${styles.avatar} ${styles.four_3}`} />

                    {/* SLOT 4 = DIV (KHÔNG PHẢI IMG) */}
                    <div className={styles.moreOverlay}>
                        +{count - 3}
                    </div>
                </>
            )}
        </div>
    );
};