"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, AtSign, Loader2 } from "lucide-react";
import EmojiPicker, { QUICK_EMOJIS } from "./emoji-picker";
import MentionPopup, { InternProfile } from "./mention-popup";

type Props = {
  interns: InternProfile[];
  onSendMessage: (content: string, mentions: string[]) => Promise<boolean>;
  disabled?: boolean;
};

export default function ChatInput({ interns, onSendMessage, disabled }: Props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Mention state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtered interns for mention
  const filteredInterns = interns.filter((i) =>
    i.nama.toLowerCase().includes(mentionFilter.toLowerCase().trim())
  );

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
    }
  }, [content]);

  // Insert text at current cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + textToInsert);
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const newContent = content.slice(0, start) + textToInsert + content.slice(end);

    setContent(newContent);

    setTimeout(() => {
      el.focus();
      const nextPos = start + textToInsert.length;
      el.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  // Handle textarea change & detect @mention
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(val);

    // Cek apakah ada '@' sebelum cursor
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      // Pastikan '@' berada di awal teks atau setelah spasi/enter
      const charBeforeAt = lastAtPos > 0 ? textBeforeCursor[lastAtPos - 1] : " ";
      if (charBeforeAt === " " || charBeforeAt === "\n" || lastAtPos === 0) {
        const query = textBeforeCursor.slice(lastAtPos + 1);
        if (!query.includes("\n") && query.length <= 25) {
          setMentionOpen(true);
          setMentionFilter(query);
          setMentionStartPos(lastAtPos);
          setMentionIndex(0);
          return;
        }
      }
    }

    setMentionOpen(false);
    setMentionStartPos(null);
  };

  // Select intern from mention list
  const handleSelectMention = (intern: InternProfile) => {
    const el = textareaRef.current;
    const cursorPos = el?.selectionStart ?? content.length;
    const start = mentionStartPos !== null ? mentionStartPos : cursorPos;

    const mentionTag = `@${intern.nama} `;
    const newContent = content.slice(0, start) + mentionTag + content.slice(cursorPos);

    setContent(newContent);
    setMentionOpen(false);
    setMentionStartPos(null);

    setTimeout(() => {
      if (el) {
        el.focus();
        const nextPos = start + mentionTag.length;
        el.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  // Extract all @mentions from content
  const extractMentions = (text: string): string[] => {
    const mentions: string[] = [];
    interns.forEach((intern) => {
      if (text.includes(`@${intern.nama}`)) {
        mentions.push(intern.nama);
      }
    });
    return mentions;
  };

  // Submit message
  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;

    setSending(true);
    const text = content.trim();
    const mentions = extractMentions(text);

    const success = await onSendMessage(text, mentions);
    setSending(false);

    if (success) {
      setContent("");
      setMentionOpen(false);
      setShowEmojiPicker(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    }
  };

  // Key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && filteredInterns.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredInterns.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredInterns.length) % filteredInterns.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectMention(filteredInterns[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }

    // Enter to send on desktop (Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative border-t border-brand-primary/25 bg-paper/95 backdrop-blur-sm p-2.5 sm:p-3.5 shrink-0">
      {/* Mention Popup */}
      <MentionPopup
        interns={interns}
        filter={mentionFilter}
        selectedIndex={mentionIndex}
        onSelect={handleSelectMention}
        open={mentionOpen}
      />

      {/* Emoji Picker Popover */}
      <EmojiPicker
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={(emoji) => insertTextAtCursor(emoji)}
      />

      {/* Quick Emojis Strip */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 text-base select-none scrollbar-none">
        <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40 mr-1 shrink-0">
          Cepat:
        </span>
        {QUICK_EMOJIS.map((em) => (
          <button
            key={em}
            type="button"
            onClick={() => insertTextAtCursor(em)}
            className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-brand-primary/10 active:scale-125 hover:scale-125 transition-transform rounded shrink-0"
            title={`Kirim emot ${em}`}
          >
            {em}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-1.5 sm:gap-2 bg-white/80 border border-brand-primary/25 focus-within:border-brand-primary transition-colors p-1.5 sm:p-2">
        {/* Buttons: Emot & Tag */}
        <div className="flex items-center gap-0.5 shrink-0 pb-0.5">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 sm:p-2 hover:bg-brand-primary/10 transition-colors rounded ${
              showEmojiPicker ? "text-brand-primary bg-brand-primary/10" : "text-ink/60 hover:text-ink"
            }`}
            title="Pilih emot"
            aria-label="Pilih emot"
          >
            <Smile size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              insertTextAtCursor("@");
              setMentionOpen(true);
              setMentionFilter("");
              setMentionIndex(0);
            }}
            className="p-1.5 sm:p-2 text-ink/60 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors rounded"
            title="Tag anak intern (@)"
            aria-label="Tag anak intern"
          >
            <AtSign size={18} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder="Tulis pesan... (ketik @ untuk tag teman)"
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-xs sm:text-sm text-ink placeholder:text-ink/35 max-h-32 py-1 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          className="flex items-center justify-center gap-1.5 bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-40 transition-colors px-3 py-2 sm:px-4 sm:py-2 mono text-[10px] sm:text-[11px] uppercase tracking-[0.15em] shrink-0"
          aria-label="Kirim pesan"
        >
          {sending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden sm:inline">Kirim...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span className="hidden sm:inline">Kirim</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 px-0.5">
        <p className="mono text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-ink/40">
          <span className="hidden sm:inline">
            Tekan <span className="text-ink/60 font-medium">Enter</span> kirim ·{" "}
            <span className="text-ink/60 font-medium">Shift + Enter</span> baris baru
          </span>
          <span className="sm:hidden">
            Ketik <span className="text-brand-primary font-bold">@</span> untuk tag
          </span>
        </p>
        <span className="mono text-[8px] sm:text-[9px] text-ink/40">
          {content.length > 0 ? `${content.length}/2000` : ""}
        </span>
      </div>
    </div>
  );
}
