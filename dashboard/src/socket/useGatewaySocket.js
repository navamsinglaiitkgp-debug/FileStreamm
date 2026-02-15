import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useGatewaySocket(token, { onFileEvent, onAnalyticsUpdate }) {
  const [status, setStatus] = useState("disconnected");
  const socketRef = useRef(null);
  const onFileEventRef = useRef(onFileEvent);
  const onAnalyticsUpdateRef = useRef(onAnalyticsUpdate);

  useEffect(() => {
    onFileEventRef.current = onFileEvent;
    onAnalyticsUpdateRef.current = onAnalyticsUpdate;
  }, [onFileEvent, onAnalyticsUpdate]);

  useEffect(() => {
    if (!token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("connecting");

    const socket = io(import.meta.env.VITE_GATEWAY_WS || "http://localhost:7003", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("error"));

    socket.on("file_event", (evt) => onFileEventRef.current?.(evt));
    socket.on("analytics_update", (u) => onAnalyticsUpdateRef.current?.(u));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return { status };
}
