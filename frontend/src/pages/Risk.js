import { useEffect, useState } from "react";
import API from "../api/api";

const Risk = () => {
  const [risks, setRisks] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    const [r, p] = await Promise.all([API.get("/risk"), API.get("/players")]);
    setRisks(r.data);
    setPlayers(p.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCalculate = async () => {
    if (!selectedPlayer) return setMsg("❌ Sélectionnez un joueur !");
    setLoading(true);
    try {
      const res = await API.post(`/risk/calculate/${selectedPlayer}`);
      setMsg(`✅ Risque calculé : ${res.data.risk_level.toUpperCase()} (${res.data.risk_score}/100)`);
      fetchAll();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 5000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    await API.delete(`/risk/${id}`);
    fetchAll();
  };

  const riskColor = { low: "#00ff88", medium: "#ff9900", high: "#ff4444" };
  const riskBg = { low: "#0a2e1a", medium: "#2e1a00", high: "#2e0a0a" };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚠️ Évaluation du Risque de Blessure</h1>

      {/* CALCULATE */}
      <div style={styles.form}>
        <h3 style={styles.formTitle}>🧮 Calculer le Risque</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.inputs}>
          <select style={styles.input} value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}>
            <option value="">-- Sélectionner un joueur --</option>
            {players.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.name}</option>)}
          </select>
          <button style={styles.btn} onClick={handleCalculate} disabled={loading}>
            {loading ? "⏳ Calcul..." : "🧮 Calculer"}
          </button>
        </div>
        <p style={styles.hint}>
          L'algorithme analyse les 5 derniers matchs du joueur (fatigue, minutes, distance, intensité) + historique blessures.
        </p>
      </div>

      {/* RESULTS */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Joueur</th>
            <th style={styles.th}>Score</th>
            <th style={styles.th}>Niveau</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.id} style={{ ...styles.tr, background: riskBg[r.risk_level] }}>
              <td style={styles.td}>{r.player_name}</td>
              <td style={styles.td}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progress, width: `${r.risk_score}%`, background: riskColor[r.risk_level] }} />
                </div>
                <span style={{ color: "#fff" }}>{r.risk_score}/100</span>
              </td>
              <td style={styles.td}>
                <span style={{ color: riskColor[r.risk_level], fontWeight: "bold", fontSize: "16px" }}>
                  {r.risk_level === "high" ? "🔴" : r.risk_level === "medium" ? "🟡" : "🟢"} {r.risk_level?.toUpperCase()}
                </span>
              </td>
              <td style={styles.td}>{new Date(r.calculated_at).toLocaleString()}</td>
              <td style={styles.td}>
                <button style={styles.deleteBtn} onClick={() => handleDelete(r.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  page: { padding: "40px", background: "#0f0f1a", minHeight: "100vh" },
  title: { color: "#fff", fontSize: "28px", marginBottom: "30px" },
  form: { background: "#1a1a2e", borderRadius: "12px", padding: "25px", marginBottom: "30px" },
  formTitle: { color: "#00d4ff", marginBottom: "20px" },
  msg: { background: "#1e3a2e", color: "#00ff88", padding: "10px", borderRadius: "8px", marginBottom: "15px" },
  inputs: { display: "flex", gap: "15px", marginBottom: "15px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px", flex: 1 },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  hint: { color: "#666", fontSize: "13px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#16213e" },
  th: { color: "#00d4ff", padding: "12px", textAlign: "left", borderBottom: "2px solid #333" },
  tr: { borderBottom: "1px solid #222" },
  td: { color: "#ccc", padding: "12px" },
  deleteBtn: { background: "#ff4444", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
  progressBar: { background: "#333", borderRadius: "4px", height: "8px", marginBottom: "5px" },
  progress: { height: "8px", borderRadius: "4px", transition: "width 0.3s" },
};

export default Risk;
