import { useState, useEffect } from "react";
import API from "../api/api";

const Profile = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    club: user?.club || "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.photo ? `http://localhost:5000${user.photo}` : null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("club", form.club);
      if (photo) formData.append("photo", photo);

      const token = localStorage.getItem("token");
      const res = await API.put("/auth/profile", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      onUpdate(res.data.user);
      setMsg("✅ Profil mis à jour !");
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Erreur"));
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👤 Mon Profil</h1>

      <div style={styles.container}>
        {/* LEFT - Photo */}
        <div style={styles.photoSection}>
          <div style={styles.photoWrapper}>
            {preview ? (
              <img src={preview} alt="Coach" style={styles.photo} />
            ) : (
              <div style={styles.photoPlaceholder}>
                <span style={{ fontSize: "60px" }}>👤</span>
              </div>
            )}
          </div>
          <label style={styles.photoBtn}>
            📷 Changer photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>
          <div style={styles.infoCard}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Rôle</span>
              <span style={styles.infoValue}>🏆 {user?.role || "Coach"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Club</span>
              <span style={styles.infoValue}>🏟️ {user?.club || "—"}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>📧 {user?.email}</span>
            </div>
          </div>
        </div>

        {/* RIGHT - Form */}
        <div style={styles.formSection}>
          <h3 style={styles.formTitle}>✏️ Modifier mes informations</h3>
          {msg && <div style={styles.msg}>{msg}</div>}

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Prénom</label>
              <input style={styles.input} value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nom</label>
              <input style={styles.input} value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nom d'utilisateur</label>
              <input style={styles.input} value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Club / Équipe</label>
              <input style={styles.input} value={form.club}
                onChange={(e) => setForm({ ...form, club: e.target.value })} />
            </div>
          </div>

          <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: "40px", background: "#0f0f1a", minHeight: "100vh" },
  title: { color: "#fff", fontSize: "28px", marginBottom: "30px" },
  container: { display: "flex", gap: "30px" },
  photoSection: { width: "280px", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" },
  photoWrapper: { width: "180px", height: "180px", borderRadius: "50%", overflow: "hidden", border: "3px solid #00d4ff" },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { width: "100%", height: "100%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" },
  photoBtn: { background: "#1a1a2e", color: "#00d4ff", border: "1px solid #00d4ff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  infoCard: { background: "#1a1a2e", borderRadius: "12px", padding: "20px", width: "100%" },
  infoItem: { display: "flex", flexDirection: "column", marginBottom: "12px" },
  infoLabel: { color: "#666", fontSize: "12px", marginBottom: "4px" },
  infoValue: { color: "#fff", fontSize: "14px" },
  formSection: { flex: 1, background: "#1a1a2e", borderRadius: "12px", padding: "30px" },
  formTitle: { color: "#00d4ff", marginBottom: "25px" },
  msg: { background: "#1e3a2e", color: "#00ff88", padding: "10px", borderRadius: "8px", marginBottom: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#888", fontSize: "13px" },
  input: { background: "#0f0f1a", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px" },
  btn: { background: "#00d4ff", color: "#000", border: "none", padding: "12px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
};

export default Profile;
