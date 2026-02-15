import React , {useEffect, useState} from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import axios from "axios";
import FilesList from "../components/FilesList.jsx";
import NotificationList from "../components/NotificationList.jsx";
import UploadBox from "../components/uploadBox.jsx";
import { useGatewaySocket } from "../socket/useGatewaySocket.js";
import CountersCards from "../components/CountersCards.jsx";
import EventStream from "../components/EventStream.jsx";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
const ANALYTICS_BASE = import.meta.env.VITE_ANALYTICS_BASE || "http://localhost:7001";

export default function Dashboard() {
  const { user, token } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit] = useState(10);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const isAdmin = user?.role === "admin";

    const [events, setEvents] = useState([]);
    const [userCounters, setUserCounters] = useState(null);
    const [globalCounters, setGlobalCounters] = useState(null);
   
    const { status: socketStatus } = useGatewaySocket(token, {
                                            onFileEvent: (evt) => {
                                            setEvents((prev) => [evt, ...prev].slice(0, 50));
                                        },
  onAnalyticsUpdate: (u) => {
    if (u.scope === "user" && u.userId === user?.id) {
      setUserCounters(u.counters);
    }
    if (u.scope === "global" && isAdmin) {
      setGlobalCounters(u.counters);
    }
  },
});


    async function fetchFiles(newSkip = skip) {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/files?limit=${limit}&skip=${newSkip}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = response.data.files || [];
            setFiles(list);
            setTotal(response.data.paging?.total || 0);
            setSkip(newSkip);
        } catch (error) {
            console.error("Error fetching files:", error);
            alert("Failed to load files. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchUserCounters() {
        if (!user?.id || !token) return;
        const res = await axios.get(`${ANALYTICS_BASE}/analytics/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserCounters(res.data.analytics || null);
    }

    async function fetchGlobalCounters() {
        if (!token || !isAdmin) return;
        const res = await axios.get(`${ANALYTICS_BASE}/analytics/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setGlobalCounters(res.data.summary || null);
    }

    useEffect(() => {
        fetchFiles(0); // load first page on mount
        fetchUserCounters();
        fetchGlobalCounters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?.id, isAdmin]);

    function prevPage() {
        fetchFiles(Math.max(skip - limit, 0));
    }
    function nextPage() {
        fetchFiles(skip + limit);
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Welcome, {user?.email}</h1>
            <h2>Your Files</h2>
            {loading ? (
                <p>Loading files...</p>
            ) : (
                <>
                    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
  <h2 style={{ marginTop: 0 }}>Dashboard</h2>
  <div>Welcome <b>{user?.email}</b> ({user?.role})</div>
  <div>Socket: <b>{socketStatus}</b></div>
</div>

<CountersCards title="Your Counters" counters={userCounters} />

{isAdmin && <CountersCards title="Global Counters (admin)" counters={globalCounters} />}

<EventStream events={events} isAdmin={isAdmin} />

                    <UploadBox onUploadDone={fetchFiles} />
                    <FilesList 
                        files={files} 
                        refreshFiles={() => fetchFiles(skip)}
                        paging={{ total, limit, skip }}
                        onPrev={prevPage}
                        onNext={nextPage}
                    />
                    <NotificationList />
                </>
            )}
        </div>
    );
}
