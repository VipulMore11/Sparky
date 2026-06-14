import { motion } from "motion/react";

interface MascotProps {
  message?: string;
  mood?: "happy" | "thinking" | "cheer" | "wow";
  size?: number;
}

/**
 * A friendly blob-fox mascot. Pure SVG so it scales crisply and stays light.
 */
export function Mascot({ message, mood = "happy", size = 110 }: MascotProps) {
  const eyeY = mood === "thinking" ? 44 : 46;
  const mouth =
    mood === "wow"
      ? "M 45 64 Q 60 78 75 64"
      : mood === "cheer"
      ? "M 42 60 Q 60 80 78 60"
      : mood === "thinking"
      ? "M 48 66 Q 60 62 72 66"
      : "M 46 62 Q 60 74 74 62";

  return (
    <div className="flex items-end gap-3">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg viewBox="0 0 120 120" width={size} height={size}>
          {/* body */}
          <ellipse cx="60" cy="78" rx="44" ry="36" fill="var(--color-primary)" />
          {/* tummy */}
          <ellipse cx="60" cy="86" rx="28" ry="22" fill="oklch(0.97 0.04 142)" />
          {/* ears */}
          <path d="M 22 50 L 32 22 L 46 42 Z" fill="var(--color-primary)" />
          <path d="M 98 50 L 88 22 L 74 42 Z" fill="var(--color-primary)" />
          <path d="M 28 44 L 33 30 L 41 42 Z" fill="var(--color-accent)" />
          <path d="M 92 44 L 87 30 L 79 42 Z" fill="var(--color-accent)" />
          {/* eyes */}
          <circle cx="46" cy={eyeY} r="6" fill="#1b1b2a" />
          <circle cx="74" cy={eyeY} r="6" fill="#1b1b2a" />
          <circle cx="48" cy={eyeY - 2} r="2" fill="white" />
          <circle cx="76" cy={eyeY - 2} r="2" fill="white" />
          {/* cheeks */}
          <circle cx="36" cy="60" r="5" fill="var(--color-accent)" opacity="0.5" />
          <circle cx="84" cy="60" r="5" fill="var(--color-accent)" opacity="0.5" />
          {/* mouth */}
          <path d={mouth} stroke="#1b1b2a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={message}
          className="relative max-w-xs rounded-2xl border-2 border-border bg-card px-4 py-3 text-base font-bold text-foreground shadow-[0_4px_0_0_var(--color-border)]"
        >
          <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-border bg-card" />
          {message}
        </motion.div>
      )}
    </div>
  );
}
