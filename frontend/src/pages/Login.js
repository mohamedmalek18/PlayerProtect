import { useState } from "react";
import API from "../api/api";

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    first_name: "", last_name: "", club: ""
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── CLIENT-SIDE VALIDATION ──
  const validate = () => {
    const newErrors = {};

    if (isRegister) {
      if (!form.first_name) newErrors.first_name = "Prénom requis";
      if (!form.last_name) newErrors.last_name = "Nom requis";
      if (!form.username || form.username.length < 3)
        newErrors.username = "Min 3 caractères";
      if (!form.club) newErrors.club = "Club requis";
    }

    if (!form.email) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format invalide (ex: coach@club.com)";
    }

    if (!form.password) {
      newErrors.password = "Mot de passe requis";
    } else if (isRegister) {
      if (form.password.length < 8) newErrors.password = "Min 8 caractères";
      else if (!/[A-Z]/.test(form.password)) newErrors.password = "Au moins 1 majuscule";
      else if (!/[0-9]/.test(form.password)) newErrors.password = "Au moins 1 chiffre";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isRegister) {
        await API.post("/auth/register", form);
        setMsg("✅ Compte créé ! Connectez-vous.");
        setIsRegister(false);
        setForm({ username: "", email: "", password: "", first_name: "", last_name: "", club: "" });
        setErrors({});
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

  const Field = ({ name, placeholder, type = "text" }) => (
    <div style={styles.field}>
      <input
        style={{ ...styles.input, ...(errors[name] ? styles.inputError : {}) }}
        placeholder={placeholder}
        type={type}
        value={form[name]}
        onChange={(e) => {
          setForm({ ...form, [name]: e.target.value });
          if (errors[name]) setErrors({ ...errors, [name]: "" });
        }}
      />
      {errors[name] && <span style={styles.errorText}>⚠️ {errors[name]}</span>}
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⚽ PlayerProtect</div>
        <p style={styles.subtitle}>Système de gestion des blessures</p>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(!isRegister ? styles.activeTab : {}) }}
            onClick={() => { setIsRegister(false); setErrors({}); }}>
            🔐 Connexion
          </button>
          <button style={{ ...styles.tab, ...(isRegister ? styles.activeTab : {}) }}
            onClick={() => { setIsRegister(true); setErrors({}); }}>
            📝 Inscription
          </button>
        </div>

        {msg && <div style={styles.msg}>{msg}</div>}

        <div style={styles.form}>
          {isRegister && (
            <>
              <div style={styles.row}>
                <Field name="first_name" placeholder="👤 Prénom" />
                <Field name="last_name" placeholder="👤 Nom" />
              </div>
              <Field name="club" placeholder="🏟️ Club / Équipe" />
              <Field name="username" placeholder="👤 Nom d'utilisateur" />
            </>
          )}
          <Field name="email" placeholder="📧 Email" type="email" />
          <Field name="password" placeholder="🔒 Mot de passe" type="password" />

          {isRegister && (
            <div style={styles.passwordHint}>
              🔒 Le mot de passe doit contenir : min 8 caractères, 1 majuscule, 1 chiffre
            </div>
          )}

          <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "⏳ Chargement..." : isRegister ? "📝 S'inscrire" : "🔐 Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0f1a, #1a1a2e, #16213e)", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "#1a1a2e", borderRadius: "16px", padding: "40px", width: "420px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", textAlign: "center" },
  logo: { color: "#00d4ff", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
  subtitle: { color: "#666", marginBottom: "30px", fontSize: "14px" },
  tabs: { display: "flex", marginBottom: "25px", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" },
  tab: { flex: 1, padding: "10px", background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "14px" },
  activeTab: { background: "#00d4ff", color: "#000", fontWeight: "bold" },
  msg: { background: "#1e3a2e", color: "#00ff88", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "8px" },
  row: { display: "flex", gap: "10px" },
  field: { display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "12px", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  inputError: { border: "1px solid #ff4444" },
  errorText: { color: "#ff4444", fontSize: "12px" },
  passwordHint: { color: "#666", fontSize: "12px", textAlign: "left", background: "#0f0f1a", padding: "8px", borderRadius: "6px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px", marginTop: "8px" },
};

export default Login;
