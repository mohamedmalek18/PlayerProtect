const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "playerprotect_secret";

// ─────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("Au moins 8 caractères");
  if (!/[A-Z]/.test(password)) errors.push("Au moins 1 majuscule");
  if (!/[0-9]/.test(password)) errors.push("Au moins 1 chiffre");
  return errors;
};

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
exports.register = async (req, res) => {
  const { username, email, password, first_name, last_name, club } = req.body;

  // Required fields
  if (!username || !email || !password)
    return res.status(400).json({ error: "username, email et password sont requis" });

  // Email validation
  if (!validateEmail(email))
    return res.status(400).json({ error: "Format d'email invalide" });

  // Password validation
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0)
    return res.status(400).json({ error: "Mot de passe invalide : " + passwordErrors.join(", ") });

  // Username min length
  if (username.length < 3)
    return res.status(400).json({ error: "Le nom d'utilisateur doit avoir au moins 3 caractères" });

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      const existing = results[0];
      if (existing.email === email)
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      if (existing.username === username)
        return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, email, password, first_name, last_name, club) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, first_name, last_name, club],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: "Compte créé avec succès !" });
      }
    );
  });
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis" });

  if (!validateEmail(email))
    return res.status(400).json({ error: "Format d'email invalide" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie !",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        club: user.club,
        photo: user.photo,
        role: user.role
      }
    });
  });
};

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
exports.profile = (req, res) => {
  db.query(
    "SELECT id, username, email, first_name, last_name, club, photo, role FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });
      res.json(results[0]);
    }
  );
};

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
exports.updateProfile = (req, res) => {
  const { first_name, last_name, club, username } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  if (username && username.length < 3)
    return res.status(400).json({ error: "Le nom d'utilisateur doit avoir au moins 3 caractères" });

  const sql = photo
    ? "UPDATE users SET first_name=?, last_name=?, club=?, username=?, photo=? WHERE id=?"
    : "UPDATE users SET first_name=?, last_name=?, club=?, username=? WHERE id=?";

  const params = photo
    ? [first_name, last_name, club, username, photo, req.user.id]
    : [first_name, last_name, club, username, req.user.id];

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(
      "SELECT id, username, email, first_name, last_name, club, photo, role FROM users WHERE id=?",
      [req.user.id],
      (err2, results) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Profil mis à jour !", user: results[0] });
      }
    );
  });
};
