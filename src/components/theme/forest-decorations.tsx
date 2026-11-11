"use client";

import { motion } from "framer-motion";

const FLOATING = [
  { emoji: "🌿", top: "10%", left: "5%", delay: 0, duration: 14, size: 20 },
  { emoji: "🍃", top: "20%", right: "8%", delay: 2, duration: 12, size: 18 },
  { emoji: "🌱", top: "50%", left: "3%", delay: 1, duration: 16, size: 16 },
  { emoji: "🍀", bottom: "25%", right: "6%", delay: 3, duration: 13, size: 20 },
  { emoji: "🌿", bottom: "10%", left: "10%", delay: 0.5, duration: 15, size: 18 },
  { emoji: "🍃", top: "70%", right: "4%", delay: 2.5, duration: 11, size: 16 },
];

export default function ForestDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {FLOATING.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.4, 0.4, 0],
            y: [0, -20, -50, -80],
            rotate: [0, 10, -5, 3],
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

      {/* Corner leaf accents */}
      <motion.div
        animate={{ opacity: [0.15, 0.4, 0.15], rotate: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-3 left-3 text-xl"
      >
        🌿
      </motion.div>
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        className="absolute bottom-3 right-3 text-xl"
      >
        🍃
      </motion.div>
    </div>
  );
}

