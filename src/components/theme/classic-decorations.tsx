"use client";

import { motion } from "framer-motion";

export default function ClassicDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Blueprint corner marks — top-left */}
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-0 left-0 w-16 h-16"
        style={{
          borderRight: "1px solid rgba(27,79,138,0.3)",
          borderBottom: "1px solid rgba(27,79,138,0.3)",
        }}
      />
      {/* Blueprint corner marks — bottom-right */}
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        className="absolute bottom-0 right-0 w-16 h-16"
        style={{
          borderLeft: "1px solid rgba(27,79,138,0.3)",
          borderTop: "1px solid rgba(27,79,138,0.3)",
        }}
      />
      {/* Top-right */}
      <motion.div
        animate={{ opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute top-0 right-0 w-12 h-12"
        style={{
          borderLeft: "1px solid rgba(27,79,138,0.25)",
          borderBottom: "1px solid rgba(27,79,138,0.25)",
        }}
      />
      {/* Bottom-left */}
      <motion.div
        animate={{ opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        className="absolute bottom-0 left-0 w-12 h-12"
        style={{
          borderRight: "1px solid rgba(27,79,138,0.25)",
          borderTop: "1px solid rgba(27,79,138,0.25)",
        }}
      />
    </div>
  );
}

