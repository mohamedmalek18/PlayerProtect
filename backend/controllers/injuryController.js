const db = require("../db");

exports.getAll = (req, res) => {
  const sql = `
    SELECT ih.*, p.name AS player_name
    FROM injury_history ih
    JOIN players p ON ih.player_id = p.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getByPlayer = (req, res) => {
  db.query(
    "SELECT * FROM injury_history WHERE player_id = ?",
    [req.params.player_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.create = (req, res) => {
  const { player_id, injury_type, severity, recovery_days } = req.body;
  if (!player_id || !injury_type || !severity)
    return res.status(400).json({ error: "player_id, injury_type and severity are required" });
  db.query(
    "INSERT INTO injury_history (player_id, injury_type, severity, recovery_days) VALUES (?, ?, ?, ?)",
    [player_id, injury_type, severity, recovery_days],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...req.body });
    }
  );
};

exports.update = (req, res) => {
  const { player_id, injury_type, severity, recovery_days } = req.body;
  db.query(
    "UPDATE injury_history SET player_id=?, injury_type=?, severity=?, recovery_days=? WHERE id=?",
    [player_id, injury_type, severity, recovery_days, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Injury not found" });
      res.json({ message: "Injury updated successfully" });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM injury_history WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Injury not found" });
    res.json({ message: "Injury deleted successfully" });
  });
};
