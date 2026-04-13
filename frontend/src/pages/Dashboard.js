import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ players: 0, matches: 0, injuries: 0, highRisk: 0, mediumRisk: 0 });
  const [highRiskPlayers, setHighRiskPlayers] = useState([]);
  const [recentInjuries, setRecentInjuries] = useState([]);
  const [recentPerformances, setRecentPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [players, matches, injuries, risks, performances] = await Promise.all([
          API.get("/players"),
          API.get("/matches"),
          API.get("/injuries"),
          API.get("/risk"),
          API.get("/performance"),
        ]);

        const highRisk = risks.data.filter((r) => r.risk_level === "high");
        const mediumRisk = risks.data.filter((r) => r.risk_level === "medium");

        // Get unique latest risk per player
        const latestRisks = {};
        risks.data.forEach((r) => {
          if (!latestRisks[r.player_id]) latestRisks[r.player_id] = r;
        });
        const highRiskUnique = Object.values(latestRisks).filter((r) => r.risk_level === "high");

        setStats({
          players: players.data.length,
          matches: matches.data.length,
          injuries: injuries.data.length,
          highRisk: highRiskUnique.length,
          mediumRisk: Object.values(latestRisks).filter((r) => r.risk_level === "medium").length,
        });

        setHighRiskPlayers(highRiskUnique.slice(0, 5));
        setRecentInjuries(injuries.data.slice(0, 5));
        setRecentPerformances(performances.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner}>⚽</div>
      <p style={{ color: "#666" }}>Chargement...</p>
    </div>
  );

  const statCards = [
    { label: "Joueurs", value: stats.players, icon: "👤", color: "#00d4ff", path: "/players" },
    { label: "Matchs", value: stats.matches, icon: "⚽", color: "#00ff88", path: "/matches" },
    { label: "Blessures", value: stats.injuries, icon: "🤕", color: "#ff9900", path: "/injuries" },
    { label: "Risque Élevé", value: stats.highRisk, icon: "🔴", color: "#ff4444", path: "/risk" },
    { label: "Risque Moyen", value: stats.mediumRisk, icon: "🟡", color: "#ffcc00", path: "/risk" },
  ];

  const riskColor = { low: "#00ff88", medium: "#ffcc00", high: "#ff4444" };
  const riskBg = { low: "#0a2e1a", medium: "#2e2a00", high: "#2e0a0a" };
  const fatigueColor = (f) => f >= 7 ? "#ff4444" : f >= 4 ? "#ff9900" : "#00ff88";

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏆 Dashboard PlayerProtect</h1>
          <p style={styles.subtitle}>Bienvenue — Gérez la santé de vos joueurs</p>
        </div>
        <div style={styles.date}>
          📅 {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ALERTS */}
      {stats.highRisk > 0 && (
        <div style={styles.alert}>
          ⚠️ <strong>{stats.highRisk} joueur(s)</strong> en risque élevé de blessure ! Consultez la page Risque.
          <button style={styles.alertBtn} onClick={() => navigate("/risk")}>Voir →</button>
        </div>
      )}

      {/* STAT CARDS */}
      <div style={styles.grid5}>
        {statCards.map((c) => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}`, cursor: "pointer" }}
            onClick={() => navigate(c.path)}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <div style={{ ...styles.cardValue, color: c.color }}>{c.value}</div>
            <div style={styles.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* BOTTOM SECTION */}
      <div style={styles.bottom}>

        {/* HIGH RISK PLAYERS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔴 Joueurs en Risque Élevé</h3>
          {highRiskPlayers.length === 0 ? (
            <p style={styles.empty}>✅ Aucun joueur en risque élevé</p>
          ) : (
            highRiskPlayers.map((r) => (
              <div key={r.id} style={{ ...styles.riskItem, background: riskBg[r.risk_level] }}>
                <div style={styles.riskLeft}>
                  <span style={styles.riskName}>👤 {r.player_name}</span>
                  <span style={{ color: riskColor[r.risk_level], fontWeight: "bold" }}>
                    {r.risk_level.toUpperCase()}
                  </span>
                </div>
                <div style={styles.riskRight}>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progress, width: `${r.risk_score}%`, background: riskColor[r.risk_level] }} />
                  </div>
                  <span style={{ color: "#fff", fontSize: "13px" }}>{r.risk_score}/100</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RECENT INJURIES */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🤕 Blessures Récentes</h3>
          {recentInjuries.length === 0 ? (
            <p style={styles.empty}>✅ Aucune blessure enregistrée</p>
          ) : (
            recentInjuries.map((inj) => (
              <div key={inj.id} style={styles.injuryItem}>
                <div>
                  <span style={styles.injuryName}>👤 {inj.player_name}</span>
                  <span style={styles.injuryType}>{inj.injury_type}</span>
                </div>
                <div>
                  <span style={{
                    color: inj.severity === "grave" ? "#ff4444" : inj.severity === "modérée" ? "#ff9900" : "#00ff88",
                    fontWeight: "bold", fontSize: "13px"
                  }}>
                    {inj.severity}
                  </span>
                  <span style={styles.recoveryDays}>🕐 {inj.recovery_days} jours</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RECENT PERFORMANCES */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Dernières Performances</h3>
          {recentPerformances.length === 0 ? (
            <p style={styles.empty}>Aucune performance enregistrée</p>
          ) : (
            recentPerformances.map((p) => (
              <div key={p.id} style={styles.perfItem}>
                <div>
                  <span style={styles.perfName}>👤 {p.player_name}</span>
                  <span style={styles.perfMatch}>vs {p.opponent}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "#888", fontSize: "12px" }}>⏱ {p.minutes_played}min</span>
                  <span style={{ color: fatigueColor(p.fatigue_level), fontWeight: "bold", fontSize: "13px" }}>
                    😓 {p.fatigue_level}/10
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: { padding: "30px 40px", background: "#0f0f1a", minHeight: "100vh" },
  loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f0f1a" },
  spinner: { fontSize: "50px", animation: "spin 1s linear infinite" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { color: "#fff", fontSize: "26px", marginBottom: "5px" },
  subtitle: { color: "#888", fontSize: "14px" },
  date: { color: "#666", fontSize: "13px" },
  alert: { background: "#2e0a0a", border: "1px solid #ff4444", borderRadius: "10px", padding: "12px 20px", color: "#ff9999", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" },
  alertBtn: { background: "#ff4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", marginLeft: "auto" },
  grid5: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", marginBottom: "30px" },
  card: { background: "#1a1a2e", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)", transition: "transform 0.2s" },
  cardIcon: { fontSize: "30px", marginBottom: "10px" },
  cardValue: { fontSize: "40px", fontWeight: "bold", marginBottom: "5px" },
  cardLabel: { color: "#888", fontSize: "13px" },
  bottom: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  section: { background: "#1a1a2e", borderRadius: "12px", padding: "20px" },
  sectionTitle: { color: "#00d4ff", marginBottom: "15px", fontSize: "15px" },
  empty: { color: "#666", fontSize: "13px", textAlign: "center", padding: "20px 0" },
  riskItem: { borderRadius: "8px", padding: "12px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  riskLeft: { display: "flex", flexDirection: "column", gap: "4px" },
  riskName: { color: "#fff", fontSize: "14px" },
  riskRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", minWidth: "100px" },
  progressBar: { background: "#333", borderRadius: "4px", height: "6px", width: "100px" },
  progress: { height: "6px", borderRadius: "4px" },
  injuryItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222" },
  injuryName: { color: "#fff", fontSize: "13px", display: "block" },
  injuryType: { color: "#888", fontSize: "12px" },
  recoveryDays: { color: "#666", fontSize: "12px", display: "block", textAlign: "right" },
  perfItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222" },
  perfName: { color: "#fff", fontSize: "13px", display: "block" },
  perfMatch: { color: "#888", fontSize: "12px" },
};

export default Dashboard;
