import React from "react";
import { ExternalLink } from "lucide-react";
import { formatDateTime } from "../../utils/GlobalFunction.js";

export default function NewsCard({ item }) {
  const image = item?.image || "/icon.png";

  return (
    <a
      href={item?.url || "#"}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-borderColor bg-white/5 hover:bg-white/10 transition overflow-hidden block"
    >
      <div className="h-48 w-full overflow-hidden bg-black/20">
        <img
          src={image}
          alt={item?.title || "News"}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/icon.png";
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-semibold leading-snug line-clamp-2">
            {item?.title || "Untitled"}
          </h3>
          <span className="text-gray-400 group-hover:text-white transition mt-0.5">
            <ExternalLink size={16} />
          </span>
        </div>

        {item?.description ? (
          <p className="text-gray-300 text-sm mt-2 line-clamp-3">
            {item.description}
          </p>
        ) : (
          <p className="text-gray-400 text-sm mt-2 italic">
            No description available.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-200 border border-borderColor">
            {item?.source || "news"}
          </span>
          <span className="text-xs text-gray-400">
            {formatDateTime(item?.publishedAt)}
          </span>
        </div>
      </div>
    </a>
  );
}

