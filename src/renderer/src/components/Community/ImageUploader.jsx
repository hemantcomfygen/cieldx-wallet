import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { uploadImage } from "../../redux/slices/AuthSlice.js";

export default function ImageUploader({
  value,
  onChange,
  disabled = false,
  label = "Thumbnail",
}) {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const hasImage = Boolean(value);

  const helperText = useMemo(() => {
    if (uploading) return "Uploading…";
    if (error) return error;
    return "Upload an image (required).";
  }, [uploading, error]);

  const handlePick = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await dispatch(uploadImage(form)).unwrap();
      const imageUrl = res?.data?.imageUrl || res?.data?.data?.imageUrl;

      if (!imageUrl) throw new Error("Upload failed");
      onChange(imageUrl);
    } catch (e) {
      setError(typeof e === "string" ? e : e?.message || "Upload failed");
      onChange("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-300">{label}</label>

      {hasImage ? (
        <div className="rounded-2xl border border-borderColor bg-white/5 overflow-hidden">
          <div className="relative">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-44 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/icon.png";
              }}
            />
            {uploading ? (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              </div>
            ) : null}
          </div>

          <div className="p-3 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-400 truncate">{value}</div>
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-lg border border-borderColor bg-white/5 hover:bg-white/10 text-gray-100 transition disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-borderColor bg-white/5 p-4">
          <input
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            onChange={(e) => handlePick(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/15 disabled:opacity-60"
          />
          <div
            className={`text-xs mt-2 ${error ? "text-red-400" : "text-gray-500"
              }`}
          >
            {helperText}
          </div>
        </div>
      )}
    </div>
  );
}

