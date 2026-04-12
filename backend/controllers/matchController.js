const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM matches ORDER BY match_date DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  db.query("SELECT * FROM matches WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Match not found" });
    res.json(results[0]);
  });
};

exports.create = (req, res) => {
  const { opponent, match_date, intensity } = req.body;
  if (!opponent || !match_date || !intensity)
    return res.status(400).json({ error: "opponent, match_date and intensity are required" });
  db.query(
    "INSERT INTO matches (opponent, match_date, intensity) VALUES (?, ?, ?)",
    [opponent, match_date, intensity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, opponent, match_date, intensity });
    }
  );
};

exports.update = (req, res) => {
  const { opponent, match_date, intensity } = req.body;
  db.query(
    "UPDATE matches SET opponent = ?, match_date = ?, intensity = ? WHERE id = ?",
    [opponent, match_date, intensity, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Match not found" });
      res.json({ message: "Match updated successfully" });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM matches WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Match not found" });
    res.json({ message: "Match deleted successfully" });
  });
};
