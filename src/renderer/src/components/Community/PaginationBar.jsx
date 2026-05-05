import React from "react";

export default function PaginationBar({
  loading,
  error,
  count,
  isFiltered,
  pageIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
      {/* <div className="text-sm text-gray-400">
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : loading ? (
          "Loading news…"
        ) : (
          <>
            Showing <span className="text-gray-200">{count}</span> item(s)
            {isFiltered ? " (filtered)" : ""}.
          </>
        )}
      </div> */}

      <div className="flex items-center justify-end gap-2 w-full">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev || loading}
          className="px-3 py-2 rounded-xl border border-borderColor bg-white/5 hover:bg-white/10 text-gray-100 transition disabled:opacity-50 disabled:hover:bg-white/5"
        >
          Prev
        </button>
        <div className="px-3 py-2 rounded-xl border border-borderColor bg-white/5 text-gray-300 text-sm">
          Page <span className="text-white">{pageIndex + 1}</span>
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || loading}
          className="px-3 py-2 rounded-xl border border-borderColor bg-white/5 hover:bg-white/10 text-gray-100 transition disabled:opacity-50 disabled:hover:bg-white/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}

