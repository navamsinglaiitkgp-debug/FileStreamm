import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function UploadBox({ onUploadDone }) {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [doneChunks, setDoneChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  // You can tune chunk size (5MB is common)
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const CONCURRENCY = 3;

  function onPickFile(e) {
    setError("");
    setStatus("");
    setDoneChunks(0);
    setTotalChunks(0);

    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  }

  async function initUploadSession(f, chunksCount) {
    const res = await axios.post(
      `${API_BASE}/uploads/init`,
      {
        originalName: f.name,
        contentType: f.type || "application/octet-stream",
        sizeBytes: f.size,
        totalChunks: chunksCount,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.uploadId;
  }

  async function presignChunk(uploadId, chunkIndex) {
    const res = await axios.post(
      `${API_BASE}/uploads/${uploadId}/chunks/${chunkIndex}/presign`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.url;
  }

  async function confirmChunk(uploadId, chunkIndex, chunkSizeBytes) {
    await axios.post(
      `${API_BASE}/uploads/${uploadId}/chunks/${chunkIndex}/confirm`,
      { chunkSizeBytes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async function completeUpload(uploadId) {
    await axios.post(
      `${API_BASE}/uploads/${uploadId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Upload a single chunk: presign -> PUT to MinIO -> confirm
  async function uploadOneChunk(uploadId, f, chunkIndex) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, f.size);
    const blob = f.slice(start, end);

    // 1) get presigned URL from backend
    const url = await presignChunk(uploadId, chunkIndex);
    if (!url) throw new Error(`No presigned URL for chunk ${chunkIndex}`);

    // 2) PUT chunk bytes directly to MinIO
    await axios.put(url, blob, {
      headers: { "Content-Type": "application/octet-stream" },
      // Important: do NOT attach Authorization header to presigned URL calls
      // The signature is already in the URL.
    });

    // 3) tell backend this chunk is uploaded
    await confirmChunk(uploadId, chunkIndex, blob.size);

    setDoneChunks((x) => x + 1);
  }

  // Concurrency controller: runs tasks in parallel up to CONCURRENCY
  async function runWithConcurrency(tasks, concurrency) {
    let idx = 0;
    const workers = new Array(concurrency).fill(null).map(async () => {
      while (idx < tasks.length) {
        const myIndex = idx++;
        await tasks[myIndex]();
      }
    });
    await Promise.all(workers);
  }

  async function startUpload() {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setStatus("Initializing upload...");
    setDoneChunks(0);

    try {
      const chunksCount = Math.ceil(file.size / CHUNK_SIZE);
      setTotalChunks(chunksCount);

      // 1) create upload session in backend
      const uploadId = await initUploadSession(file, chunksCount);

      setStatus(`Uploading ${chunksCount} chunks (parallel=${CONCURRENCY})...`);

      // 2) create tasks for each chunk
      const tasks = [];
      for (let i = 0; i < chunksCount; i++) {
        tasks.push(() => uploadOneChunk(uploadId, file, i));
      }

      // 3) upload chunks with concurrency
      await runWithConcurrency(tasks, CONCURRENCY);

      setStatus("Finalizing upload (complete)...");
      await completeUpload(uploadId);

      setStatus("✅ Upload completed!");
      if (onUploadDone) await onUploadDone();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Upload failed");
      setStatus("");
    } finally {
      setUploading(false);
    }
  }

  const percent = totalChunks === 0 ? 0 : Math.round((doneChunks / totalChunks) * 100);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>Upload File</h3>

      <input type="file" onChange={onPickFile} disabled={uploading} />

      {file && (
        <div style={{ marginTop: 8, color: "#555" }}>
          Selected: <b>{file.name}</b> ({file.size} bytes)
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={startUpload} disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {uploading && (
        <div style={{ marginTop: 10 }}>
          <div>Progress: {doneChunks}/{totalChunks} ({percent}%)</div>
          <div style={{ height: 8, background: "#eee", borderRadius: 10, overflow: "hidden", marginTop: 6 }}>
            <div style={{ width: `${percent}%`, height: 8, background: "#4caf50" }} />
          </div>
        </div>
      )}

      {status && <div style={{ marginTop: 10, color: "#333" }}>{status}</div>}
      {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}
    </div>
  );
}
