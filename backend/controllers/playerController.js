const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM players", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  db.query("SELECT * FROM players WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Player not found" });
    res.json(results[0]);
  });
};

exports.create = (req, res) => {
  const { id, name, age, position } = req.body;
  if (!id || !name || !age || !position)
    return res.status(400).json({ error: "id, name, age and position are required" });
  db.query(
    "INSERT INTO players (id, name, age, position) VALUES (?, ?, ?, ?)",
    [id, name, age, position],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, name, age, position });
    }
  );
};

exports.update = (req, res) => {
  const { name, age, position } = req.body;
  db.query(
    "UPDATE players SET name = ?, age = ?, position = ? WHERE id = ?",
    [name, age, position, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Player not found" });
      res.json({ message: "Player updated successfully" });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM players WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Player not found" });
    res.json({ message: "Player deleted successfully" });
  });
};
