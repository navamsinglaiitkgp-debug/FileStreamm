import { useState } from "react";
import {useAuth} from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  // form fields
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
        await signup(email, password);
        //alert(`Signup successful! You can now login with your credentials.`);
        navigate("/", { replace: true });
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Signup failed");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>Signup</h2>

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

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}