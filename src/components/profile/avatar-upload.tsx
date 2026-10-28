"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { getCroppedImg, readFileAsDataURL, type CropArea } from "@/lib/crop-image";

type Props = {
  userId: string;
  currentAvatarUrl: string | null;
  userName: string;
};

export default function AvatarUpload({ userId, currentAvatarUrl, userName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [uploading, setUploading] = useState(false);

  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  const onCropComplete = useCallback((_: any, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maks 5MB");
      return;
    }

    const dataUrl = await readFileAsDataURL(file);
    setImageSrc(dataUrl);
    setOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    setOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 400);

      const filename = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filename, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filename);

      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Foto profil berhasil diupdate!");
      handleClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal upload: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Avatar preview */}
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-brand-primary text-white flex items-center justify-center text-4xl md:text-5xl font-light">
            {currentAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAvatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera size={24} />
          </button>
        </div>

        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 mono text-[11px] uppercase tracking-[0.15em] text-brand-primary hover:text-brand-hover transition-colors">
          <Upload size={12} />
          {currentAvatarUrl ? "Ganti Foto" : "Upload Foto"}
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Crop dialog */}
      {open && imageSrc && (
        <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/15 max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/15">
              <div>
                <p className="text-sm font-medium">Atur Foto Profil</p>
                <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/70 mt-0.5">Geser & zoom untuk atur</p>
              </div>
              <button type="button" onClick={handleClose} disabled={uploading} className="p-1.5 hover:bg-ink/[0.05] transition-colors disabled:opacity-50">
                <X size={16} />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full h-[320px] md:h-[400px] bg-ink">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="rect" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>

            {/* Zoom slider */}
            <div className="px-5 py-4 border-t border-ink/15">
              <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/70 block mb-2">Zoom</label>
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
            </div>

            {/* Actions */}
            <div className="flex border-t border-ink/15 divide-x divide-ink/10">
              <button type="button" onClick={handleClose} disabled={uploading} className="flex-1 py-3.5 mono text-[11px] uppercase tracking-[0.15em] text-ink/60 hover:bg-ink/[0.03] transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-3.5 mono text-[11px] uppercase tracking-[0.15em] bg-brand-primary text-white hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
