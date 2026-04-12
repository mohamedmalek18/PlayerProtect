import { useEffect, useState } from "react";
import API from "../api/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
    injuries: 0,
    highRisk: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [players, matches, injuries, risks] = await Promise.all([
        API.get("/players"),
        API.get("/matches"),
        API.get("/injuries"),
        API.get("/risk"),
      ]);
      const highRisk = risks.data.filter((r) => r.risk_level === "high").length;
      setStats({
        players: players.data.length,
        matches: matches.data.length,
        injuries: injuries.data.length,
        highRisk,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Joueurs", value: stats.players, icon: "👤", color: "#00d4ff" },
    { label: "Matchs", value: stats.matches, icon: "⚽", color: "#00ff88" },
    { label: "Blessures", value: stats.injuries, icon: "🤕", color: "#ff9900" },
    { label: "Risque Élevé", value: stats.highRisk, icon: "🔴", color: "#ff4444" },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🏆 Dashboard PlayerProtect</h1>
      <p style={styles.subtitle}>Bienvenue — Gérez la santé de vos joueurs</p>
      <div style={styles.grid}>
        {cards.map((c) => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <div style={styles.icon}>{c.icon}</div>
            <div style={{ ...styles.value, color: c.color }}>{c.value}</div>
            <div style={styles.label}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: "40px", background: "#0f0f1a", minHeight: "100vh" },
  title: { color: "#fff", fontSize: "28px", marginBottom: "8px" },
  subtitle: { color: "#888", marginBottom: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  card: {
    background: "#1a1a2e",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  },
  icon: { fontSize: "40px", marginBottom: "15px" },
  value: { fontSize: "48px", fontWeight: "bold", marginBottom: "8px" },
  label: { color: "#888", fontSize: "16px" },
};

export default Dashboard;
