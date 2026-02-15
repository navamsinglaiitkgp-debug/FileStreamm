import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import {Routes, Route, Navigate, Link} from "react-router-dom"; 
import {useAuth} from "./auth/AuthContext.jsx";
import React from "react";

function ProtectedRoute({children}) {
  const {token,loading} = useAuth();
  if(loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if(!token) return <Navigate to="/" replace/>;
  return children;
}

export default function App() {
  const {user, token, logout} = useAuth();
  return (
    <div>
      <div style={{display: "flex", justifyContent: "space-between", padding: 20, backgroundColor: "#f0f0f0"}}>
        <Link to="/" style={{textDecoration: "none"}}>
          <b>FileStreamm</b>
        </Link>
        <div style={{flex: 1}} />
        {token ? (
          <>
            <span style={{marginRight: 20}}>Hello, {user?.email}</span>
            <button onClick={logout} style={{padding: "5px 10px"}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{marginRight: 20}}>Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />}></Route>
      </Routes>
    </div>
      
  )
}
