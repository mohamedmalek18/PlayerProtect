const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const SECRET = process.env.JWT_SECRET || "playerprotect_secret";

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
exports.register = async (req, res) => {
  const { username, email, password, first_name, last_name, club } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "username, email and password are required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, email, password, first_name, last_name, club) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, first_name, last_name, club],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: "User registered successfully" });
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
    return res.status(400).json({ error: "email and password are required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
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
  db.query("SELECT id, username, email, first_name, last_name, club, photo, role FROM users WHERE id = ?",
    [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    });
};

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
exports.updateProfile = (req, res) => {
  const { first_name, last_name, club, username } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = photo
    ? "UPDATE users SET first_name=?, last_name=?, club=?, username=?, photo=? WHERE id=?"
    : "UPDATE users SET first_name=?, last_name=?, club=?, username=? WHERE id=?";

  const params = photo
    ? [first_name, last_name, club, username, photo, req.user.id]
    : [first_name, last_name, club, username, req.user.id];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("SELECT id, username, email, first_name, last_name, club, photo, role FROM users WHERE id=?",
      [req.user.id], (err2, results) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Profile updated", user: results[0] });
      });
  });
};
