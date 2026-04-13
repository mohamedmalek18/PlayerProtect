import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ players: 0, matches: 0, injuries: 0, highRisk: 0, mediumRisk: 0 });
  const [highRiskPlayers, setHighRiskPlayers] = useState([]);
  const [recentInjuries, setRecentInjuries] = useState([]);
  const [recentPerformances, setRecentPerformances] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [playersRes, matchesRes, injuriesRes, risksRes, perfRes] = await Promise.all([
          API.get("/players"),
          API.get("/matches"),
          API.get("/injuries"),
          API.get("/risk"),
          API.get("/performance"),
        ]);

        const latestRisks = {};
        risksRes.data.forEach((r) => {
          if (!latestRisks[r.player_id]) latestRisks[r.player_id] = r;
        });

        const highRiskUnique = Object.values(latestRisks).filter((r) => r.risk_level === "high");
        const mediumRiskUnique = Object.values(latestRisks).filter((r) => r.risk_level === "medium");

        setStats({
          players: playersRes.data.length,
          matches: matchesRes.data.length,
          injuries: injuriesRes.data.length,
          highRisk: highRiskUnique.length,
          mediumRisk: mediumRiskUnique.length,
        });

        setPlayers(playersRes.data);
        setHighRiskPlayers(highRiskUnique.slice(0, 5));
        setRecentInjuries(injuriesRes.data.slice(0, 5));
        setRecentPerformances(perfRes.data.slice(0, 6));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={{ fontSize: "50px" }}>⚽</div>
      <p style={{ color: "#666" }}>Chargement...</p>
    </div>
  );

  // ── CHART 1: Risk Distribution (Doughnut) ──
  const riskData = {
    labels: ["Risque Élevé", "Risque Moyen", "Risque Faible"],
    datasets: [{
      data: [
        stats.highRisk,
        stats.mediumRisk,
        stats.players - stats.highRisk - stats.mediumRisk
      ],
      backgroundColor: ["#ff4444", "#ffcc00", "#00ff88"],
      borderColor: ["#ff2222", "#ffaa00", "#00cc66"],
      borderWidth: 2,
    }],
  };

  // ── CHART 2: Fatigue per Player (Bar) ──
  const fatigueByPlayer = {};
  const countByPlayer = {};
  recentPerformances.forEach((p) => {
    if (!fatigueByPlayer[p.player_name]) {
      fatigueByPlayer[p.player_name] = 0;
      countByPlayer[p.player_name] = 0;
    }
    fatigueByPlayer[p.player_name] += p.fatigue_level;
    countByPlayer[p.player_name]++;
  });

  const fatigueLabels = Object.keys(fatigueByPlayer);
  const fatigueValues = fatigueLabels.map(name =>
    (fatigueByPlayer[name] / countByPlayer[name]).toFixed(1)
  );

  const fatigueData = {
    labels: fatigueLabels.map(n => n.split(" ")[0]),
    datasets: [{
      label: "Fatigue Moyenne",
      data: fatigueValues,
      backgroundColor: fatigueValues.map(v =>
        v >= 7 ? "#ff4444" : v >= 4 ? "#ff9900" : "#00ff88"
      ),
      borderRadius: 6,
    }],
  };

  // ── CHART 3: Injuries by Type (Bar) ──
  const injuryBySeverity = { légère: 0, modérée: 0, grave: 0 };
  recentInjuries.forEach(i => {
    if (injuryBySeverity[i.severity] !== undefined)
      injuryBySeverity[i.severity]++;
  });

  const injuryData = {
    labels: ["Légère", "Modérée", "Grave"],
    datasets: [{
      label: "Blessures",
      data: [injuryBySeverity.légère, injuryBySeverity.modérée, injuryBySeverity.grave],
      backgroundColor: ["#00ff88", "#ff9900", "#ff4444"],
      borderRadius: 6,
    }],
  };

  // ── CHART 4: Risk Scores (Bar) ──
  const riskScoreData = {
    labels: highRiskPlayers.map(r => r.player_name?.split(" ")[0]),
    datasets: [{
      label: "Score de Risque",
      data: highRiskPlayers.map(r => r.risk_score),
      backgroundColor: "#ff4444",
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#ccc", font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: "#888" }, grid: { color: "#222" } },
      y: { ticks: { color: "#888" }, grid: { color: "#222" } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#ccc", font: { size: 11 } } },
    },
  };

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

      {/* ALERT */}
      {stats.highRisk > 0 && (
        <div style={styles.alert}>
          ⚠️ <strong>{stats.highRisk} joueur(s)</strong> en risque élevé de blessure !
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

      {/* CHARTS ROW 1 */}
      <div style={styles.chartsRow}>
        {/* Doughnut - Risk Distribution */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>🎯 Distribution des Risques</h3>
          {stats.players > 0 ? (
            <div style={{ width: "250px", margin: "0 auto" }}>
              <Doughnut data={riskData} options={doughnutOptions} />
            </div>
          ) : <p style={styles.empty}>Pas de données</p>}
        </div>

        {/* Bar - Fatigue per Player */}
        <div style={{ ...styles.chartBox, flex: 2 }}>
          <h3 style={styles.chartTitle}>😓 Fatigue Moyenne par Joueur</h3>
          {fatigueLabels.length > 0 ? (
            <Bar data={fatigueData} options={chartOptions} />
          ) : <p style={styles.empty}>Pas de données</p>}
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div style={styles.chartsRow}>
        {/* Bar - Injuries by Severity */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>🤕 Blessures par Gravité</h3>
          {recentInjuries.length > 0 ? (
            <Bar data={injuryData} options={chartOptions} />
          ) : <p style={styles.empty}>Aucune blessure</p>}
        </div>

        {/* Bar - Risk Scores */}
        <div style={{ ...styles.chartBox, flex: 2 }}>
          <h3 style={styles.chartTitle}>🔴 Scores de Risque (Joueurs Élevés)</h3>
          {highRiskPlayers.length > 0 ? (
            <Bar data={riskScoreData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: { ...chartOptions.scales.y, min: 0, max: 100 }
              }
            }} />
          ) : <p style={styles.empty}>✅ Aucun joueur en risque élevé</p>}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={styles.bottom}>
        {/* HIGH RISK PLAYERS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔴 Joueurs en Risque Élevé</h3>
          {highRiskPlayers.length === 0 ? (
            <p style={styles.empty}>✅ Aucun joueur en risque élevé</p>
          ) : highRiskPlayers.map((r) => (
            <div key={r.id} style={{ ...styles.riskItem, background: riskBg[r.risk_level] }}>
              <div style={styles.riskLeft}>
                <span style={styles.riskName}>👤 {r.player_name}</span>
                <span style={{ color: riskColor[r.risk_level], fontWeight: "bold", fontSize: "12px" }}>
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
          ))}
        </div>

        {/* RECENT INJURIES */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🤕 Blessures Récentes</h3>
          {recentInjuries.length === 0 ? (
            <p style={styles.empty}>✅ Aucune blessure</p>
          ) : recentInjuries.map((inj) => (
            <div key={inj.id} style={styles.injuryItem}>
              <div>
                <span style={styles.injuryName}>👤 {inj.player_name}</span>
                <span style={styles.injuryType}>{inj.injury_type}</span>
              </div>
              <div>
                <span style={{
                  color: inj.severity === "grave" ? "#ff4444" : inj.severity === "modérée" ? "#ff9900" : "#00ff88",
                  fontWeight: "bold", fontSize: "12px"
                }}>{inj.severity}</span>
                <span style={styles.recoveryDays}>🕐 {inj.recovery_days}j</span>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT PERFORMANCES */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Dernières Performances</h3>
          {recentPerformances.length === 0 ? (
            <p style={styles.empty}>Aucune performance</p>
          ) : recentPerformances.map((p) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: "30px 40px", background: "#0f0f1a", minHeight: "100vh" },
  loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f0f1a" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { color: "#fff", fontSize: "26px", marginBottom: "5px" },
  subtitle: { color: "#888", fontSize: "14px" },
  date: { color: "#666", fontSize: "13px" },
  alert: { background: "#2e0a0a", border: "1px solid #ff4444", borderRadius: "10px", padding: "12px 20px", color: "#ff9999", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" },
  alertBtn: { background: "#ff4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", marginLeft: "auto" },
  grid5: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", marginBottom: "25px" },
  card: { background: "#1a1a2e", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" },
  cardIcon: { fontSize: "28px", marginBottom: "8px" },
  cardValue: { fontSize: "36px", fontWeight: "bold", marginBottom: "5px" },
  cardLabel: { color: "#888", fontSize: "12px" },
  chartsRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  chartBox: { flex: 1, background: "#1a1a2e", borderRadius: "12px", padding: "20px" },
  chartTitle: { color: "#00d4ff", marginBottom: "15px", fontSize: "14px" },
  bottom: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  section: { background: "#1a1a2e", borderRadius: "12px", padding: "20px" },
  sectionTitle: { color: "#00d4ff", marginBottom: "15px", fontSize: "14px" },
  empty: { color: "#666", fontSize: "13px", textAlign: "center", padding: "20px 0" },
  riskItem: { borderRadius: "8px", padding: "10px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  riskLeft: { display: "flex", flexDirection: "column", gap: "3px" },
  riskName: { color: "#fff", fontSize: "13px" },
  riskRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", minWidth: "100px" },
  progressBar: { background: "#333", borderRadius: "4px", height: "6px", width: "100px" },
  progress: { height: "6px", borderRadius: "4px" },
  injuryItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #222" },
  injuryName: { color: "#fff", fontSize: "13px", display: "block" },
  injuryType: { color: "#888", fontSize: "11px" },
  recoveryDays: { color: "#666", fontSize: "11px", display: "block", textAlign: "right" },
  perfItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #222" },
  perfName: { color: "#fff", fontSize: "13px", display: "block" },
  perfMatch: { color: "#888", fontSize: "11px" },
};

export default Dashboard;
