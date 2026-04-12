import { Link, useLocation } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const links = [
    { path: "/", label: "🏠 Dashboard" },
    { path: "/players", label: "👤 Joueurs" },
    { path: "/matches", label: "⚽ Matchs" },
    { path: "/performance", label: "📊 Performance" },
    { path: "/risk", label: "⚠️ Risque" },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>⚽ PlayerProtect</div>
      <div style={styles.links}>
        {links.map((l) => (
          <Link
            key={l.path}
            to={l.path}
            style={{
              ...styles.link,
              ...(location.pathname === l.path ? styles.active : {}),
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.userSection}>
        <span style={styles.username}>👋 {user?.username}</span>
        <button style={styles.logoutBtn} onClick={onLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    padding: "15px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  logo: { color: "#00d4ff", fontSize: "22px", fontWeight: "bold" },
  links: { display: "flex", gap: "10px" },
  link: { color: "#ccc", textDecoration: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "14px" },
  active: { background: "#00d4ff", color: "#000", fontWeight: "bold" },
  userSection: { display: "flex", alignItems: "center", gap: "15px" },
  username: { color: "#00ff88", fontSize: "14px" },
  logoutBtn: { background: "#ff4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
};

export default Navbar;
