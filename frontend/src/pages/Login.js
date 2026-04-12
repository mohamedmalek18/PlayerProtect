import { useState } from "react";
import API from "../api/api";

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isRegister) {
        await API.post("/auth/register", form);
        setMsg("✅ Compte créé ! Connectez-vous.");
        setIsRegister(false);
        setForm({ username: "", email: "", password: "" });
      } else {
        const res = await API.post("/auth/login", form);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      }
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LOGO */}
        <div style={styles.logo}>⚽ PlayerProtect</div>
        <p style={styles.subtitle}>Système de gestion des blessures</p>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(! isRegister ? styles.activeTab : {}) }}
            onClick={() => setIsRegister(false)}>
            🔐 Connexion
          </button>
          <button
            style={{ ...styles.tab, ...(isRegister ? styles.activeTab : {}) }}
            onClick={() => setIsRegister(true)}>
            📝 Inscription
          </button>
        </div>

        {/* MESSAGE */}
        {msg && <div style={styles.msg}>{msg}</div>}

        {/* FORM */}
        <div style={styles.form}>
          {isRegister && (
            <input
              style={styles.input}
              placeholder="👤 Nom d'utilisateur"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          )}
          <input
            style={styles.input}
            placeholder="📧 Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="🔒 Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "⏳ Chargement..." : isRegister ? "📝 S'inscrire" : "🔐 Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#1a1a2e",
    borderRadius: "16px",
    padding: "40px",
    width: "400px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  logo: { color: "#00d4ff", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
  subtitle: { color: "#666", marginBottom: "30px", fontSize: "14px" },
  tabs: { display: "flex", marginBottom: "25px", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" },
  tab: { flex: 1, padding: "10px", background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "14px" },
  activeTab: { background: "#00d4ff", color: "#000", fontWeight: "bold" },
  msg: { background: "#1e3a2e", color: "#00ff88", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "12px 15px", borderRadius: "8px", fontSize: "14px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
};

export default Login;
