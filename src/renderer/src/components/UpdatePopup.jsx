import React, { memo } from "react";

const UpdatePopup = ({
  updateAvailable,
  updateProgress,
  updateReady,
  onInstall,
}) => {
  if (!updateAvailable) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      background: "#111",
      color: "#fff",
      padding: "16px",
      borderRadius: "10px",
      zIndex: 9999,
      width: "300px",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)"
    }}>
      <h4 style={{ marginBottom: "10px" }}>🚀 App Update</h4>

      {!updateReady ? (
        <>
          <p>
            {updateProgress !== null
              ? `Downloading... ${Math.round(updateProgress)}%`
              : "Preparing update..."}
          </p>

          {updateProgress !== null && (
            <div style={{
              height: "6px",
              background: "#333",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${updateProgress}%`,
                height: "100%",
                background: "#4caf50",
                transition: "width 0.3s"
              }} />
            </div>
          )}
        </>
      ) : (
        <>
          <p>✅ Update ready to install</p>

          <button
            onClick={onInstall}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "#4caf50",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Restart & Install
          </button>
        </>
      )}
    </div>
  );
};

// 🔥 Custom comparison (important)
export default memo(UpdatePopup, (prev, next) => {
  return (
    prev.updateAvailable === next.updateAvailable &&
    Math.round(prev.updateProgress) === Math.round(next.updateProgress) && // avoid micro updates
    prev.updateReady === next.updateReady
  );
});