import React, { useMemo, useState } from "react";
import Modal from "../Modal/Modal.jsx";
import CustomButton from "../Buttons/CustomButton.jsx";
import ImageUploader from "./ImageUploader.jsx";

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  uploading = false,
  error = "",
  formData = {},
  setFormData,
}) {

  const canSubmit = useMemo(() => {
    return formData?.title.trim().length >= 3 && Boolean(formData?.thumbnail) && !uploading;
  }, [formData?.title, formData?.thumbnail, uploading]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!canSubmit) return;
  //   await onSubmit({
  //     title: formData?.title.trim(),
  //     description: formData?.description.trim(),
  //     thumbnail: formData?.thumbnail,
  //   });
  // };

  return (
    <Modal
      isOpen={isOpen}
      onClose={uploading ? () => { } : onClose}
      title="Create Post"
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Title</label>
          <input
            value={formData?.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="What’s happening in crypto?"
            className="w-full rounded-xl bg-white/5 border border-borderColor text-white placeholder:text-gray-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Description (optional)</label>
          <textarea
            value={formData?.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Add some context…"
            className="w-full rounded-xl bg-white/5 border border-borderColor text-white placeholder:text-gray-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/10 resize-none"
          />
        </div>

        <ImageUploader
          value={formData?.thumbnail}
          onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e }))}
          disabled={uploading}
          label="Thumbnail"
        />

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <CustomButton
            label="Cancel"
            variant="secondary"
            onClick={onClose}
            disabled={uploading}
            type="button"
          />
          <CustomButton
            label={uploading ? "Posting..." : "Post"}
            variant="primary"
            type="submit"
            disabled={!canSubmit}
          />
        </div>
      </form>
    </Modal>
  );
}

