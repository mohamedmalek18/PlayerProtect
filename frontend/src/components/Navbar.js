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
          <Link key={l.path} to={l.path} style={{ ...styles.link, ...(location.pathname === l.path ? styles.active : {}) }}>
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.userSection}>
        <Link to="/profile" style={styles.profileLink}>
          {user?.photo ? (
            <img src={`http://localhost:5000${user.photo}`} alt="coach" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>👤</div>
          )}
          <span style={styles.username}>{user?.first_name || user?.username}</span>
        </Link>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "12px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" },
  logo: { color: "#00d4ff", fontSize: "20px", fontWeight: "bold" },
  links: { display: "flex", gap: "8px" },
  link: { color: "#ccc", textDecoration: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px" },
  active: { background: "#00d4ff", color: "#000", fontWeight: "bold" },
  userSection: { display: "flex", alignItems: "center", gap: "10px" },
  profileLink: { display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" },
  avatar: { width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "2px solid #00d4ff" },
  avatarPlaceholder: { width: "35px", height: "35px", borderRadius: "50%", background: "#1a1a2e", border: "2px solid #00d4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  username: { color: "#00ff88", fontSize: "14px" },
  logoutBtn: { background: "#ff4444", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
};

export default Navbar;
