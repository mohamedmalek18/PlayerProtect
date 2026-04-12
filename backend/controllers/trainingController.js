const db = require("../db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM trainings WHERE coach_id = ? ORDER BY training_date DESC", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  db.query("SELECT * FROM trainings WHERE id = ? AND coach_id = ?", [req.params.id, req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Training not found" });
    res.json(results[0]);
  });
};

exports.create = (req, res) => {
  const { training_date, type, intensity } = req.body;
  if (!training_date || !type || !intensity)
    return res.status(400).json({ error: "training_date, type and intensity are required" });
  db.query(
    "INSERT INTO trainings (training_date, type, intensity, coach_id) VALUES (?, ?, ?, ?)",
    [training_date, type, intensity, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, training_date, type, intensity, coach_id: req.user.id });
    }
  );
};

exports.update = (req, res) => {
  const { training_date, type, intensity } = req.body;
  db.query(
    "UPDATE trainings SET training_date=?, type=?, intensity=? WHERE id=? AND coach_id=?",
    [training_date, type, intensity, req.params.id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Training not found" });
      res.json({ message: "Training updated successfully" });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM trainings WHERE id = ? AND coach_id = ?", [req.params.id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Training not found" });
    res.json({ message: "Training deleted successfully" });
  });
};
