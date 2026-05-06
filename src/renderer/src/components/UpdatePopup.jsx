import React, { memo } from "react";

const UpdatePopup = ({
  updateAvailable,
  updateProgress,
  updateReady,
  showUpdatePrompt,
  onUpdateNow,
  onLater,
  onInstall,
}) => {
  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "#111",
        color: "#fff",
        padding: "16px",
        borderRadius: "10px",
        zIndex: 9999,
        width: "320px",
      }}
    >
      <h4>🚀 New Update Available</h4>

      {/* ASK USER FIRST */}
      {showUpdatePrompt && updateProgress === null && !updateReady && (
        <>
          <p>A new version is available.</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onUpdateNow}>
              Update Now
            </button>

            <button onClick={onLater}>
              Later
            </button>
          </div>
        </>
      )}

      {/* DOWNLOADING */}
      {updateProgress !== null && !updateReady && (
        <>
          <p>Downloading... {Math.round(updateProgress)}%</p>

          <div
            style={{
              height: "6px",
              background: "#333",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${updateProgress}%`,
                height: "100%",
                background: "#4caf50",
              }}
            />
          </div>
        </>
      )}

      {/* READY */}
      {updateReady && (
        <>
          <p>✅ Update ready to install</p>

          <button onClick={onInstall}>
            Restart & Install
          </button>
        </>
      )}
    </div>
  );
};

export default memo(UpdatePopup);