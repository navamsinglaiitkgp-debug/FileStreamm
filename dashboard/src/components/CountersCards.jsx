import React from "react";

function Card({ label, value }) {
  return (
    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 10, minWidth: 170 }}>
      <div style={{ color: "#666" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value ?? 0}</div>
    </div>
  );
}
function formatBytes(bytes) {
  const n = typeof bytes === "number" ? bytes : Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  let value = n;
  do {
    value /= 1024;
    i += 1;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(value < 10 ? 2 : value < 100 ? 1 : 0)} ${units[i]}`;
}
export default function CountersCards({ title, counters }) {
  const totalUploadBytes = counters?.totalUploadBytes ?? counters?.totalBytesUploaded;
   const totalUploadBytesLabel = formatBytes(totalUploadBytes ?? 0);
 
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card label="Uploads" value={counters?.totalUploads} />
        <Card label="Bytes Uploaded" value={totalUploadBytesLabel} />
        <Card label="Downloads" value={counters?.totalDownloads} />
        <Card label="Files Deleted" value={counters?.filesDeleted} />
      </div>
    </div>
  );
}
