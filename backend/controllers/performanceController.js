const db = require("../db");

exports.getAll = (req, res) => {
  const sql = `
    SELECT p.*, pl.name AS player_name, m.opponent, m.match_date
    FROM performance p
    JOIN players pl ON p.player_id = pl.id
    JOIN matches m ON p.match_id = m.id
    WHERE pl.coach_id = ?
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getByPlayer = (req, res) => {
  const sql = `
    SELECT p.*, m.opponent, m.match_date
    FROM performance p
    JOIN matches m ON p.match_id = m.id
    JOIN players pl ON p.player_id = pl.id
    WHERE p.player_id = ? AND pl.coach_id = ?
  `;
  db.query(sql, [req.params.player_id, req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const { player_id, match_id, minutes_played, distance_run, fatigue_level } = req.body;
  if (!player_id || !match_id)
    return res.status(400).json({ error: "player_id and match_id are required" });
  db.query(
    "INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES (?, ?, ?, ?, ?)",
    [player_id, match_id, minutes_played, distance_run, fatigue_level],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...req.body });
    }
  );
};

exports.update = (req, res) => {
  const { player_id, match_id, minutes_played, distance_run, fatigue_level } = req.body;
  db.query(
    "UPDATE performance SET player_id=?, match_id=?, minutes_played=?, distance_run=?, fatigue_level=? WHERE id=?",
    [player_id, match_id, minutes_played, distance_run, fatigue_level, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Performance not found" });
      res.json({ message: "Performance updated successfully" });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM performance WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Performance not found" });
    res.json({ message: "Performance deleted successfully" });
  });
};
