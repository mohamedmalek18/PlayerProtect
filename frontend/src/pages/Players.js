import { useEffect, useState } from "react";
import API from "../api/api";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", age: "", position: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const fetchPlayers = async () => {
    const res = await API.get("/players");
    setPlayers(res.data);
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await API.put(`/players/${editing}`, form);
        setMsg("✅ Joueur modifié !");
        setEditing(null);
      } else {
        await API.post("/players", form);
        setMsg("✅ Joueur ajouté !");
      }
      setForm({ id: "", name: "", age: "", position: "" });
      fetchPlayers();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (p) => {
    setForm({ id: p.id, name: p.name, age: p.age, position: p.position });
    setEditing(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce joueur ?")) return;
    await API.delete(`/players/${id}`);
    fetchPlayers();
  };

  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Right back", "Left back"];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👤 Gestion des Joueurs</h1>

      {/* FORM */}
      <div style={styles.form}>
        <h3 style={styles.formTitle}>{editing ? "✏️ Modifier Joueur" : "➕ Ajouter Joueur"}</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.inputs}>
          <input style={styles.input} placeholder="N° Maillot" value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editing} />
          <input style={styles.input} placeholder="Nom" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={styles.input} placeholder="Âge" type="number" value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <select style={styles.input} value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}>
            <option value="">-- Position --</option>
            {positions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.btn} onClick={handleSubmit}>
            {editing ? "💾 Sauvegarder" : "➕ Ajouter"}
          </button>
          {editing && (
            <button style={{ ...styles.btn, background: "#666" }}
              onClick={() => { setEditing(null); setForm({ id: "", name: "", age: "", position: "" }); }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>N° Maillot</th>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Âge</th>
            <th style={styles.th}>Position</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}>#{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.age} ans</td>
              <td style={styles.td}>{p.position}</td>
              <td style={styles.td}>
                <button style={styles.editBtn} onClick={() => handleEdit(p)}>✏️</button>
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
  inputs: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" },
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

export default Players;
