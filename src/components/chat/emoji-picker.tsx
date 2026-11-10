"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJI_CATEGORIES = [
  {
    name: "Populer",
    emojis: ["🔥", "😂", "👍", "❤️", "🎉", "🚀", "👏", "🙏", "🥳", "😎", "🤔", "💡", "⚡", "☕", "👀", "💯", "🙌", "✨"],
  },
  {
    name: "Ekspresi",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗",
      "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "😌", "😔", "😪", "😴", "😷", "🤒", "🤕", "🤢", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐",
    ],
  },
  {
    name: "Gestur",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "✋", "🤚",
      "🖐", "👋", "🤙", "💪", "🙏", "👏", "🤝", "🙌", "👐", "🤲",
    ],
  },
  {
    name: "Simbol & Benda",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "✨", "⭐️", "🌟", "🔥", "⚡", "💡", "📌",
      "📝", "📅", "⏰", "🎯", "🚀", "💻", "📱", "☕", "🍕", "🍔", "🍿", "🎉", "🏆", "🥇", "💯",
    ],
  },
];

export const QUICK_EMOJIS = ["😀", "😂", "🔥", "👍", "🎉", "🚀", "❤️", "👏", "💡", "⚡", "👀", "✨"];

type Props = {
  onSelect: (emoji: string) => void;
  open: boolean;
  onClose: () => void;
};

export default function EmojiPicker({ onSelect, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, onClose]);

  const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  const filteredEmojis = search.trim()
    ? allEmojis.filter((emoji) => emoji.includes(search.trim()))
    : EMOJI_CATEGORIES[activeTab].emojis;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full mb-3 left-0 sm:left-auto right-0 sm:right-auto z-50 w-72 sm:w-80 bg-paper border border-brand-primary/25 shadow-2xl p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-primary/20">
            <div className="flex items-center gap-1.5">
              <Smile size={14} className="text-brand-primary" />
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary font-medium">Pilih Emot</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-ink/40 hover:text-ink transition-colors"
              aria-label="Tutup"
            >
              <X size={13} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2.5">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari emot..."
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/70 border border-brand-primary/20 focus:border-brand-primary focus:outline-none placeholder:text-ink/40"
            />
          </div>

          {/* Category Tabs */}
          {!search && (
            <div className="flex border-b border-ink/10 mb-2 gap-1 overflow-x-auto pb-1">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`mono text-[9px] uppercase tracking-[0.1em] px-2 py-1 transition-colors shrink-0 ${
                    activeTab === idx
                      ? "bg-brand-primary text-white"
                      : "text-ink/60 hover:text-ink hover:bg-ink/[0.04]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto p-1">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-brand-primary/10 hover:scale-125 transition-transform rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

