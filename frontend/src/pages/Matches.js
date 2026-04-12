import { useEffect, useState } from "react";
import API from "../api/api";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({ opponent: "", match_date: "", intensity: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const fetchMatches = async () => {
    const res = await API.get("/matches");
    setMatches(res.data);
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await API.put(`/matches/${editing}`, form);
        setMsg("✅ Match modifié !");
        setEditing(null);
      } else {
        await API.post("/matches", form);
        setMsg("✅ Match ajouté !");
      }
      setForm({ opponent: "", match_date: "", intensity: "" });
      fetchMatches();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (m) => {
    setForm({ opponent: m.opponent, match_date: m.match_date?.split("T")[0], intensity: m.intensity });
    setEditing(m.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce match ?")) return;
    await API.delete(`/matches/${id}`);
    fetchMatches();
  };

  const intensityColor = { low: "#00ff88", medium: "#ff9900", high: "#ff4444" };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚽ Gestion des Matchs</h1>

      <div style={styles.form}>
        <h3 style={styles.formTitle}>{editing ? "✏️ Modifier Match" : "➕ Ajouter Match"}</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.inputs}>
          <input style={styles.input} placeholder="Adversaire" value={form.opponent}
            onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
          <input style={styles.input} type="date" value={form.match_date}
            onChange={(e) => setForm({ ...form, match_date: e.target.value })} />
          <select style={styles.input} value={form.intensity}
            onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
            <option value="">-- Intensité --</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.btn} onClick={handleSubmit}>
            {editing ? "💾 Sauvegarder" : "➕ Ajouter"}
          </button>
          {editing && (
            <button style={{ ...styles.btn, background: "#666" }}
              onClick={() => { setEditing(null); setForm({ opponent: "", match_date: "", intensity: "" }); }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Adversaire</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Intensité</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id} style={styles.tr}>
              <td style={styles.td}>#{m.id}</td>
              <td style={styles.td}>{m.opponent}</td>
              <td style={styles.td}>{m.match_date?.split("T")[0]}</td>
              <td style={styles.td}>
                <span style={{ color: intensityColor[m.intensity], fontWeight: "bold" }}>
                  {m.intensity?.toUpperCase()}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.editBtn} onClick={() => handleEdit(m)}>✏️</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(m.id)}>🗑️</button>
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
  inputs: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "20px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#16213e" },
  th: { color: "#00d4ff", padding: "12px", textAlign: "left", borderBottom: "2px solid #333" },
  tr: { borderBottom: "1px solid #222" },
  td: { color: "#ccc", padding: "12px" },
  editBtn: { background: "#ff9900", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "8px" },
  deleteBtn: { background: "#ff4444", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
};

export default Matches;
