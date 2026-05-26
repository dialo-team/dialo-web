import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";
import styles from "../../styles/message/VoiceMessage.module.css";

type Props = {
  src: string;
  time: string;
  isMine: boolean;
};

const formatDuration = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const VoiceMessage = ({ src, time, isMine }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTimeUpdate = () => { if (!dragging) setCurrentTime(audio.currentTime); };
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [dragging]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekTo = (clientX: number) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleProgressClick = (e: React.MouseEvent) => seekTo(e.clientX);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    seekTo(e.clientX);
    const onMove = (ev: MouseEvent) => seekTo(ev.clientX);
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Fake waveform bars (static decoration)
  const BARS = [3, 5, 8, 6, 10, 7, 4, 9, 6, 5, 8, 4, 7, 9, 5, 6, 8, 10, 6, 4, 7, 5, 9, 6, 8];

  return (
    <div className={`${styles.wrap} ${isMine ? styles.mine : styles.theirs}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause button */}
      <button className={styles.playBtn} onClick={togglePlay} aria-label={isPlaying ? "Dừng" : "Phát"}>
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>

      {/* Waveform + progress */}
      <div className={styles.middle}>
        {/* Waveform visual */}
        <div
          className={styles.waveform}
          ref={progressRef}
          onClick={handleProgressClick}
          onMouseDown={handleMouseDown}
        >
          {BARS.map((h, i) => {
            const barProgress = i / BARS.length;
            const filled = barProgress <= progress;
            return (
              <div
                key={i}
                className={`${styles.bar} ${filled ? styles.barFilled : styles.barEmpty}`}
                style={{ height: `${h * 3}px` }}
              />
            );
          })}
          {/* Thumb dot */}
          <div
            className={styles.thumb}
            style={{ left: `calc(${progress * 100}% - 6px)` }}
          />
        </div>

        {/* Time row */}
        <div className={styles.timeRow}>
          <span className={styles.duration}>
            {isPlaying || currentTime > 0 ? formatDuration(currentTime) : formatDuration(duration)}
          </span>
          <span className={styles.msgTime}>{time}</span>
        </div>
      </div>

      {/* Mic icon */}
      <div className={styles.micIcon}>
        <Mic size={14} />
      </div>
    </div>
  );
};
