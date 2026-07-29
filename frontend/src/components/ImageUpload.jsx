import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { adminService } from "../services/adminService";
import { useToast } from "../context/ToastContext";

/**
 * Drag-and-drop image uploader that sends files directly to Cloudinary via the backend.
 *
 * Props:
 *   value        – current image URL (controlled)
 *   onChange     – called with { url, publicId } on successful upload
 *   onRemove     – called when the user removes the current image (no args)
 *   folder       – Cloudinary folder preset: "image" | "banner" | "avatar" | "general"
 *   label        – optional label text shown above the dropzone
 *   aspectRatio  – optional CSS aspect-ratio value (e.g. "16/9", "1/1", "3/1")
 *   maxSizeMB    – client-side size guard in MB (default 10)
 *   className    – extra classes on the root wrapper
 */
export default function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "image",
  label,
  aspectRatio = "4/3",
  maxSizeMB = 10,
  className = "",
}) {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file) => {
      if (!file) return;

      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif"];
      if (!allowedMimes.includes(file.type)) {
        showToast("Only image files are allowed (jpeg, png, gif, webp, avif)", "info");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        showToast(`Image must be smaller than ${maxSizeMB} MB`, "info");
        return;
      }

      setUploading(true);
      setProgress(10);
      try {
        // Simulate progress ticks while the real XHR runs
        const ticker = setInterval(() => setProgress((p) => Math.min(p + 8, 85)), 300);

        const result = await adminService.uploadImage(file, folder);

        clearInterval(ticker);
        setProgress(100);

        if (result?.url) {
          onChange?.({ url: result.url, publicId: result.publicId });
          showToast("Image uploaded", "success");
        } else {
          showToast("Upload failed — unexpected response", "info");
        }
      } catch (err) {
        showToast(err?.response?.data?.message || "Upload failed", "info");
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 600);
      }
    },
    [folder, maxSizeMB, onChange, showToast]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      upload(file);
    },
    [upload]
  );

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleRemove = async () => {
    onRemove?.();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}

      {value ? (
        /* ── Preview ── */
        <div
          className="relative group rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          style={{ aspectRatio }}
        >
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-stone-800 text-sm font-medium hover:bg-stone-50 transition-colors shadow"
            >
              <Upload className="w-4 h-4" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 rounded-lg text-white text-sm font-medium hover:bg-red-700 transition-colors shadow"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-stone-900/70 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <div className="w-32 h-1.5 bg-stone-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-xs">{progress}%</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          className={[
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer select-none transition-all duration-200",
            dragging
              ? "border-amber-500 bg-amber-50 scale-[1.01]"
              : "border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/50",
          ].join(" ")}
          style={{ aspectRatio }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <div className="w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-stone-500">Uploading… {progress}%</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-amber-600" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-stone-700">
                  Drag & drop or{" "}
                  <span className="text-amber-600 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  JPG, PNG, WEBP, GIF — max {maxSizeMB} MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={(e) => upload(e.target.files[0])}
      />
    </div>
  );
}

// ── Multi-image variant ────────────────────────────────────────────────────────
/**
 * Upload multiple images (e.g., product gallery).
 *
 * Props:
 *   values      – array of { url, publicId }
 *   onChange    – called with updated array
 *   max         – maximum number of images (default 8)
 *   folder      – Cloudinary folder preset
 */
export function MultiImageUpload({ values = [], onChange, max = 8, folder = "image" }) {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files) => {
      const remaining = max - values.length;
      if (remaining <= 0) {
        showToast(`Maximum ${max} images allowed`, "info");
        return;
      }
      const batch = Array.from(files).slice(0, remaining);
      setUploading(true);
      try {
        const result = await adminService.uploadImages(batch);
        const uploaded = result.images || [];
        onChange?.([...values, ...uploaded.map((i) => ({ url: i.url, publicId: i.publicId }))]);
        showToast(`${uploaded.length} image(s) uploaded`, "success");
      } catch (err) {
        showToast(err?.response?.data?.message || "Upload failed", "info");
      } finally {
        setUploading(false);
      }
    },
    [max, values, onChange, showToast, folder]
  );

  const remove = (idx) => {
    const next = values.filter((_, i) => i !== idx);
    onChange?.(next);
  };

  const move = (from, to) => {
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {values.map((img, idx) => (
          <div
            key={img.publicId || img.url || idx}
            className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-50"
          >
            <img src={img.url} alt={`img-${idx}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => move(idx, idx - 1)}
                  className="w-7 h-7 rounded bg-white/80 flex items-center justify-center text-stone-700 hover:bg-white text-xs font-bold"
                  title="Move left"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white hover:bg-red-700"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx < values.length - 1 && (
                <button
                  type="button"
                  onClick={() => move(idx, idx + 1)}
                  className="w-7 h-7 rounded bg-white/80 flex items-center justify-center text-stone-700 hover:bg-white text-xs font-bold"
                  title="Move right"
                >
                  →
                </button>
              )}
            </div>
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                Main
              </span>
            )}
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={[
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all",
              uploading
                ? "border-amber-300 bg-amber-50 cursor-wait"
                : "border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer",
            ].join(" ")}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="text-[11px] text-stone-400">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      {values.length > 0 && (
        <p className="text-xs text-stone-400">
          {values.length}/{max} images · First image is the main cover
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
