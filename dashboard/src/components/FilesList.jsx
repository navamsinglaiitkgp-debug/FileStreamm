import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function FilesList({ files, refreshFiles, paging, onPrev, onNext }) {
    const { token } = useAuth();
    const [busyId, setBusyId] = useState("");

    async function handleDelete(fileId) {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            setBusyId(fileId);
            await axios.delete(`${API_BASE}/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("File deleted successfully");
            await refreshFiles();
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Please try again.");
        } finally {
            setBusyId("");
        }
    }

    async function handleDownload(fileId) {
      try {
        setBusyId(fileId);
        const res = await axios.get(`${API_BASE}/files/${fileId}/download-url`, {
                    headers: { Authorization: `Bearer ${token}` },
                    });
        const url = res.data.url;
        if (!url) return alert("No url returned");
        window.open(url, "_blank");
      } catch (e) {
        alert(e?.response?.data?.message || "Download failed");
      } finally {
        setBusyId("");
      }
    }
    
    const limit = paging?.limit || 10;
    const skip = paging?.skip || 0;
    const total = paging?.total || 0;

    const start = total === 0 ? 0 : skip + 1;
    const end = Math.min(skip + limit, total);
   return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>Your Files</h3>

      {files.length === 0 ? (
        <div style={{ color: "#777" }}>No files found.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {files.map((f) => (
            <div key={f._id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 10 }}>
              <div><b>{f.originalName}</b></div>
              <div style={{ color: "#666", fontFamily: "monospace", fontSize: 12 }}>
                sizeBytes: {f.sizeBytes} | fileId: {f._id}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button disabled={busyId === f._id} onClick={() => handleDownload(f._id)}>
                  {busyId === f._id ? "..." : "Download"}
                </button>

                <button disabled={busyId === f._id} onClick={() => handleDelete(f._id)}>
                  {busyId === f._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button onClick={onPrev} disabled={skip === 0}>Prev</button>
        <button onClick={onNext} disabled={skip + limit >= total}>Next</button>

        <div style={{ color: "#777" }}>
          {total > 0 ? `${start}-${end} / ${total}` : `Showing ${files.length}`}
        </div>

        <div style={{ flex: 1 }} />
        <button onClick={refreshFiles}>Refresh</button>
      </div>
    </div>
  );

}

        
