import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthContext.jsx";

const NOTIF_BASE = import.meta.env.VITE_NOTIF_BASE || "http://localhost:7002";

export default function NotificationsList() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // paging
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  async function fetchNotifications(newSkip = skip) {
    try {
      setLoading(true);

      const res = await axios.get(
        `${NOTIF_BASE}/notifications?limit=${limit}&skip=${newSkip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(res.data.notifications || []);
      setTotal(res.data.paging?.total ?? 0);
      setSkip(newSkip);
    } catch (e) {
      alert(e?.response?.data?.message || "Fetching notifications failed");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
  // 1. remove immediately from UI
  setItems(prev => prev.filter(n => n._id !== id));
  setTotal(prev => Math.max(prev - 1, 0));

  try {
    await axios.patch(
      `${NOTIF_BASE}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (e) {
    alert(e?.response?.data?.message || "Mark read failed");

    // rollback if server failed
    fetchNotifications(skip);
  }
}


  useEffect(() => {
    fetchNotifications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + limit, total);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3 style={{ marginTop: 0 }}>Notifications</h3>

      {loading ? (
        <div>Loading notifications...</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#777" }}>No notifications.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((n) => (
            <div key={n._id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <b>{n.title || "Notification"}</b>
                <span style={{ color: n.status === "READ" ? "#777" : "green" }}>
                  {n.status}
                </span>
              </div>

              <div style={{ color: "#555" }}>{n.message}</div>

              <div style={{ color: "#777", fontFamily: "monospace", fontSize: 12 }}>
                {n.createdAt}
              </div>

              {n.status !== "READ" && (
                <button style={{ marginTop: 8 }} onClick={() => markRead(n._id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button onClick={() => fetchNotifications(Math.max(0, skip - limit))} disabled={skip === 0}>
          Prev
        </button>
        <button onClick={() => fetchNotifications(skip + limit)} disabled={skip + limit >= total}>
          Next
        </button>

        <div style={{ color: "#777" }}>
          {total > 0 ? `${start}-${end} / ${total}` : `Showing ${items.length}`}
        </div>

        <div style={{ flex: 1 }} />
        <button onClick={() => fetchNotifications(skip)}>Refresh</button>
      </div>
    </div>
  );
}
