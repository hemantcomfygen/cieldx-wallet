import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "../../utils/GlobalFunction.js";

export default function UserPostCard({ post, isMyPost, onEdit, onDelete }) {
  const thumb = post?.thumbnail || "/icon.png";

  return (
    <div
      className="group relative rounded-2xl border border-borderColor bg-white/5 hover:bg-white/10 transition overflow-hidden block"
    >

      {isMyPost && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">

          <button
            onClick={() => onEdit(post)}
            className="p-2 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(post)}
            className="p-2 rounded-full bg-red-600/70 hover:bg-red-600 text-white transition cursor-pointer"
          >
            <Trash2 size={16} />
          </button>

        </div>
      )}


      <div className="h-48 w-full overflow-hidden bg-black/20">
        <img
          src={thumb}
          alt={post?.title || "Post"}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/icon.png";
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-semibold leading-snug line-clamp-2 capitalize">
            {post?.title || "Untitled"}
          </h3>
        </div>

        {post?.description ? (
          <p className="text-gray-300 text-sm mt-2 line-clamp-3 first-letter:capitalize">
            {post.description}
          </p>
        ) : (
          <p className="text-gray-400 text-sm mt-2 italic">
            No description available.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-200 border border-borderColor">
            @{post?.userName || "user"}
          </span>
          <span className="text-xs text-gray-400">
            {formatDateTime(post?.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

