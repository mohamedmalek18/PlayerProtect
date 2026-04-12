import { useEffect, useState } from "react";
import API from "../api/api";

const Performance = () => {
  const [performances, setPerformances] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({ player_id: "", match_id: "", minutes_played: "", distance_run: "", fatigue_level: "" });
  const [msg, setMsg] = useState("");

  const fetchAll = async () => {
    const [perf, pl, ma] = await Promise.all([
      API.get("/performance"),
      API.get("/players"),
      API.get("/matches"),
    ]);
    setPerformances(perf.data);
    setPlayers(pl.data);
    setMatches(ma.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    try {
      await API.post("/performance", form);
      setMsg("✅ Performance ajoutée !");
      setForm({ player_id: "", match_id: "", minutes_played: "", distance_run: "", fatigue_level: "" });
      fetchAll();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    await API.delete(`/performance/${id}`);
    fetchAll();
  };

  const fatigueColor = (f) => f >= 7 ? "#ff4444" : f >= 4 ? "#ff9900" : "#00ff88";

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 Performance des Joueurs</h1>

      <div style={styles.form}>
        <h3 style={styles.formTitle}>➕ Ajouter Performance</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.inputs}>
          <select style={styles.input} value={form.player_id}
            onChange={(e) => setForm({ ...form, player_id: e.target.value })}>
            <option value="">-- Joueur --</option>
            {players.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.name}</option>)}
          </select>
          <select style={styles.input} value={form.match_id}
            onChange={(e) => setForm({ ...form, match_id: e.target.value })}>
            <option value="">-- Match --</option>
            {matches.map((m) => <option key={m.id} value={m.id}>vs {m.opponent} ({m.match_date?.split("T")[0]})</option>)}
          </select>
          <input style={styles.input} placeholder="Minutes jouées" type="number" value={form.minutes_played}
            onChange={(e) => setForm({ ...form, minutes_played: e.target.value })} />
          <input style={styles.input} placeholder="Distance (m)" type="number" value={form.distance_run}
            onChange={(e) => setForm({ ...form, distance_run: e.target.value })} />
          <input style={styles.input} placeholder="Fatigue (1-10)" type="number" min="1" max="10" value={form.fatigue_level}
            onChange={(e) => setForm({ ...form, fatigue_level: e.target.value })} />
        </div>
        <button style={styles.btn} onClick={handleSubmit}>➕ Ajouter</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Joueur</th>
            <th style={styles.th}>Match</th>
            <th style={styles.th}>Minutes</th>
            <th style={styles.th}>Distance</th>
            <th style={styles.th}>Fatigue</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {performances.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}>{p.player_name}</td>
              <td style={styles.td}>vs {p.opponent}</td>
              <td style={styles.td}>{p.minutes_played} min</td>
              <td style={styles.td}>{p.distance_run} m</td>
              <td style={styles.td}>
                <span style={{ color: fatigueColor(p.fatigue_level), fontWeight: "bold" }}>
                  {p.fatigue_level}/10
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>🗑️</button>
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
  inputs: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", marginBottom: "20px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#16213e" },
  th: { color: "#00d4ff", padding: "12px", textAlign: "left", borderBottom: "2px solid #333" },
  tr: { borderBottom: "1px solid #222" },
  td: { color: "#ccc", padding: "12px" },
  deleteBtn: { background: "#ff4444", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
};

export default Performance;
