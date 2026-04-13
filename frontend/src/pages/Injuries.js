import { useEffect, useState } from "react";
import API from "../api/api";

const Injuries = () => {
  const [injuries, setInjuries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    player_id: "", injury_type: "", severity: "", recovery_days: ""
  });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAll = async () => {
    const [inj, pl] = await Promise.all([API.get("/injuries"), API.get("/players")]);
    setInjuries(inj.data);
    setPlayers(pl.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    try {
      if (!form.player_id || !form.injury_type || !form.severity)
        return setMsg("❌ Joueur, type et gravité sont requis");

      if (editing) {
        await API.put(`/injuries/${editing}`, form);
        setMsg("✅ Blessure modifiée !");
        setEditing(null);
      } else {
        await API.post("/injuries", form);
        setMsg("✅ Blessure enregistrée !");
      }
      setForm({ player_id: "", injury_type: "", severity: "", recovery_days: "" });
      fetchAll();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (inj) => {
    setForm({
      player_id: inj.player_id,
      injury_type: inj.injury_type,
      severity: inj.severity,
      recovery_days: inj.recovery_days
    });
    setEditing(inj.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette blessure ?")) return;
    await API.delete(`/injuries/${id}`);
    fetchAll();
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const severityColor = { légère: "#00ff88", modérée: "#ff9900", grave: "#ff4444" };
  const severityBg = { légère: "#0a2e1a", modérée: "#2e1a00", grave: "#2e0a0a" };

  const injuryTypes = [
    "Entorse cheville", "Entorse genou", "Déchirure musculaire",
    "Fracture", "Contusion", "Élongation", "Tendinite",
    "Luxation", "Commotion cérébrale", "Autre"
  ];

  const filtered = filter === "all" ? injuries : injuries.filter(i => i.severity === filter);

  // Stats
  const stats = {
    total: injuries.length,
    grave: injuries.filter(i => i.severity === "grave").length,
    moderee: injuries.filter(i => i.severity === "modérée").length,
    legere: injuries.filter(i => i.severity === "légère").length,
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🤕 Gestion des Blessures</h1>

      {/* STATS */}
      <div style={styles.statsGrid}>
        {[
          { label: "Total", value: stats.total, color: "#00d4ff" },
          { label: "Graves", value: stats.grave, color: "#ff4444" },
          { label: "Modérées", value: stats.moderee, color: "#ff9900" },
          { label: "Légères", value: stats.legere, color: "#00ff88" },
        ].map((s) => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div style={styles.form}>
        <h3 style={styles.formTitle}>{editing ? "✏️ Modifier Blessure" : "➕ Enregistrer une Blessure"}</h3>
        {msg && <div style={styles.msg}>{msg}</div>}
        <div style={styles.inputs}>
          <div style={styles.field}>
            <label style={styles.label}>👤 Joueur</label>
            <select style={styles.input} value={form.player_id}
              onChange={(e) => handleChange("player_id", e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {players.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.name}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>🩺 Type de blessure</label>
            <select style={styles.input} value={form.injury_type}
              onChange={(e) => handleChange("injury_type", e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {injuryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>⚠️ Gravité</label>
            <select style={styles.input} value={form.severity}
              onChange={(e) => handleChange("severity", e.target.value)}>
              <option value="">-- Sélectionner --</option>
              <option value="légère">🟢 Légère</option>
              <option value="modérée">🟡 Modérée</option>
              <option value="grave">🔴 Grave</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>🕐 Jours de récupération</label>
            <input style={styles.input} type="number" placeholder="ex: 14"
              value={form.recovery_days}
              onChange={(e) => handleChange("recovery_days", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.btn} onClick={handleSubmit}>
            {editing ? "💾 Sauvegarder" : "➕ Enregistrer"}
          </button>
          {editing && (
            <button style={{ ...styles.btn, background: "#666" }}
              onClick={() => { setEditing(null); setForm({ player_id: "", injury_type: "", severity: "", recovery_days: "" }); }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* FILTER */}
      <div style={styles.filters}>
        {["all", "légère", "modérée", "grave"].map((f) => (
          <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            onClick={() => setFilter(f)}>
            {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Joueur</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Gravité</th>
            <th style={styles.th}>Récupération</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#666", padding: "30px" }}>
              Aucune blessure enregistrée
            </td></tr>
          ) : (
            filtered.map((inj) => (
              <tr key={inj.id} style={{ ...styles.tr, background: severityBg[inj.severity] }}>
                <td style={styles.td}>👤 {inj.player_name}</td>
                <td style={styles.td}>🩺 {inj.injury_type}</td>
                <td style={styles.td}>
                  <span style={{ color: severityColor[inj.severity], fontWeight: "bold" }}>
                    {inj.severity === "grave" ? "🔴" : inj.severity === "modérée" ? "🟡" : "🟢"} {inj.severity}
                  </span>
                </td>
                <td style={styles.td}>🕐 {inj.recovery_days} jours</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(inj)}>✏️</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(inj.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  page: { padding: "40px", background: "#0f0f1a", minHeight: "100vh" },
  title: { color: "#fff", fontSize: "28px", marginBottom: "25px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" },
  statCard: { background: "#1a1a2e", borderRadius: "10px", padding: "20px", textAlign: "center" },
  statValue: { fontSize: "36px", fontWeight: "bold" },
  statLabel: { color: "#888", fontSize: "13px", marginTop: "5px" },
  form: { background: "#1a1a2e", borderRadius: "12px", padding: "25px", marginBottom: "20px" },
  formTitle: { color: "#00d4ff", marginBottom: "20px" },
  msg: { background: "#1e3a2e", color: "#00ff88", padding: "10px", borderRadius: "8px", marginBottom: "15px" },
  inputs: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#888", fontSize: "12px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  filters: { display: "flex", gap: "10px", marginBottom: "15px" },
  filterBtn: { background: "#1a1a2e", color: "#888", border: "1px solid #333", padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontSize: "13px" },
  filterActive: { background: "#00d4ff", color: "#000", fontWeight: "bold", border: "1px solid #00d4ff" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#16213e" },
  th: { color: "#00d4ff", padding: "12px", textAlign: "left", borderBottom: "2px solid #333" },
  tr: { borderBottom: "1px solid #222" },
  td: { color: "#ccc", padding: "12px" },
  editBtn: { background: "#ff9900", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "8px" },
  deleteBtn: { background: "#ff4444", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
};

export default Injuries;
