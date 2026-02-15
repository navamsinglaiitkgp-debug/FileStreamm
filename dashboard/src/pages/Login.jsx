import { useState } from "react";
import {useAuth} from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";



export default function Login() {
  // form fields
  const navigate = useNavigate();
  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // prevents page refresh

    setError("");

    // simple validation
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      //alert(`Login successful! You can now access the dashboard.`);
      navigate("/", { replace: true });
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Login failed");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

      </form>
    </div>
  );
}
