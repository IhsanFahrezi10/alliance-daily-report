"use client";

import { motion } from "framer-motion";

export default function SunsetDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Warm gradient sweep top */}
      <motion.div
        animate={{ opacity: [0.04, 0.1, 0.04], x: [-20, 20, -20] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, rgba(239,68,68,0.08) 50%, transparent 70%)" }}
      />
      {/* Warm glow bottom */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03], x: [10, -10, 10] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -bottom-24 -left-16 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, rgba(249,115,22,0.08) 50%, transparent 70%)" }}
      />

      {/* Floating emojis */}
      {[
        { emoji: "🌅", top: "8%", right: "6%", delay: 0, duration: 10, size: 22 },
        { emoji: "☀️", top: "20%", left: "5%", delay: 2, duration: 14, size: 18 },
        { emoji: "🔥", bottom: "20%", right: "5%", delay: 1, duration: 12, size: 16 },
      ].map((f, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.35, 0], y: [0, -30, -60] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "easeOut" }}
          style={{ position: "absolute", top: f.top, left: f.left, right: f.right, bottom: f.bottom, fontSize: f.size, lineHeight: 1 }}
        >
          {f.emoji}
        </motion.div>
      ))}
    </div>
  );
}

