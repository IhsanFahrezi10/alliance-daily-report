"use client";

import { motion } from "framer-motion";

const STARS = [
  { emoji: "✦", top: "8%", left: "12%", delay: 0, duration: 4, size: 14 },
  { emoji: "⭐", top: "15%", right: "15%", delay: 1, duration: 6, size: 12 },
  { emoji: "✦", top: "40%", left: "6%", delay: 2, duration: 5, size: 10 },
  { emoji: "🌙", top: "12%", right: "6%", delay: 0.5, duration: 8, size: 20 },
  { emoji: "✦", bottom: "30%", right: "12%", delay: 1.5, duration: 4.5, size: 12 },
  { emoji: "⭐", bottom: "15%", left: "8%", delay: 3, duration: 5.5, size: 10 },
  { emoji: "✦", top: "60%", right: "8%", delay: 2.5, duration: 3.5, size: 8 },
  { emoji: "✦", top: "75%", left: "15%", delay: 0.8, duration: 6, size: 10 },
];

export default function MidnightDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.1, 0.6, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            fontSize: s.size,
            lineHeight: 1,
          }}
        >
          {s.emoji}
        </motion.div>
      ))}

      {/* Glow orb top-right */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      />
      {/* Glow orb bottom-left */}
      <motion.div
        animate={{ opacity: [0.03, 0.07, 0.03], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)" }}
      />
    </div>
  );
}

