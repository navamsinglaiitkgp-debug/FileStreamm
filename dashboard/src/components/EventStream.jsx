import React from "react";

export default function EventStream({ events, isAdmin }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>
        Live Event Stream {isAdmin ? "(all users)" : "(your events)"}
      </h3>

      <div style={{ maxHeight: 280, overflow: "auto", fontFamily: "monospace", fontSize: 13 }}>
        {events.length === 0 ? (
          <div style={{ color: "#777" }}>No events yet. Upload/download/delete to generate.</div>
        ) : (
          events.map((e, idx) => (
            <div key={idx} style={{ padding: "6px 0", borderBottom: "1px dashed #eee" }}>
              <div>
                <b>{e.eventType}</b>{" "}
                <span style={{ color: "#777" }}>{e.occurredAt}</span>
              </div>
              <div style={{ color: "#666" }}>
                user: {e.actor?.userId} | file: {e.data?.originalName || e.data?.fileId || ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
