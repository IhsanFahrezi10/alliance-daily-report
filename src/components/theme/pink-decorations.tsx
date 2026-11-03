"use client";

import { motion } from "framer-motion";

const FLOATING = [
  { emoji: "💕", top: "8%", left: "6%", delay: 0, duration: 12, size: 22 },
  { emoji: "✨", top: "15%", right: "10%", delay: 1.5, duration: 10, size: 18 },
  { emoji: "🌸", top: "45%", left: "4%", delay: 2, duration: 14, size: 20 },
  { emoji: "💗", bottom: "20%", right: "8%", delay: 0.8, duration: 13, size: 24 },
  { emoji: "✨", bottom: "8%", left: "12%", delay: 3, duration: 11, size: 16 },
  { emoji: "🌷", top: "65%", right: "5%", delay: 2.5, duration: 15, size: 20 },
];

export default function PinkDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {FLOATING.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.55, 0.55, 0],
            y: [0, -30, -60, -90],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: f.top,
            left: f.left,
            right: f.right,
            bottom: f.bottom,
            fontSize: f.size,
            lineHeight: 1,
          }}
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* Sparkle corners */}
      <motion.div animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-4 right-4 text-lg">
        ✨
      </motion.div>

      <motion.div animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} className="absolute bottom-4 left-4 text-lg">
        ✨
      </motion.div>
    </div>
  );
}
