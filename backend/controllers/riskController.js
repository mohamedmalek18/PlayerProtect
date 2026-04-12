const db = require("../db");

exports.getAll = (req, res) => {
  const sql = `
    SELECT ra.*, p.name AS player_name
    FROM risk_assessment ra
    JOIN players p ON ra.player_id = p.id
    WHERE p.coach_id = ?
    ORDER BY ra.calculated_at DESC
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getByPlayer = (req, res) => {
  db.query(
    "SELECT ra.* FROM risk_assessment ra JOIN players p ON ra.player_id = p.id WHERE ra.player_id = ? AND p.coach_id = ? ORDER BY ra.calculated_at DESC",
    [req.params.player_id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.calculate = (req, res) => {
  const player_id = req.params.player_id;

  const perfSQL = `
    SELECT p.fatigue_level, p.minutes_played, p.distance_run, m.intensity
    FROM performance p
    JOIN matches m ON p.match_id = m.id
    JOIN players pl ON p.player_id = pl.id
    WHERE p.player_id = ? AND pl.coach_id = ?
    ORDER BY m.match_date DESC
    LIMIT 5
  `;

  const injurySQL = `
    SELECT COUNT(*) AS injury_count FROM injury_history ih
    JOIN players p ON ih.player_id = p.id
    WHERE ih.player_id = ? AND p.coach_id = ?
  `;

  db.query(perfSQL, [player_id, req.user.id], (err, performances) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(injurySQL, [player_id, req.user.id], (err2, injuryResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const injury_count = injuryResult[0].injury_count;

      if (performances.length === 0)
        return saveRisk(player_id, 10, "low", res);

      const avg = performances.reduce(
        (acc, p) => {
          acc.fatigue += p.fatigue_level || 0;
          acc.minutes += p.minutes_played || 0;
          acc.distance += p.distance_run || 0;
          acc.intensity += p.intensity === "high" ? 3 : p.intensity === "medium" ? 2 : 1;
          return acc;
        },
        { fatigue: 0, minutes: 0, distance: 0, intensity: 0 }
      );

      const n = performances.length;
      avg.fatigue /= n;
      avg.minutes /= n;
      avg.distance /= n;
      avg.intensity /= n;

      const fatigueScore = (avg.fatigue / 10) * 35;
      const minutesScore = Math.min(avg.minutes / 90, 1) * 25;
      const distanceScore = Math.min(avg.distance / 12000, 1) * 10;
      const intensityScore = ((avg.intensity - 1) / 2) * 15;
      const injuryScore = Math.min(injury_count * 5, 15);

      let total = Math.round(Math.min(fatigueScore + minutesScore + distanceScore + intensityScore + injuryScore, 100));
      const risk_level = total < 40 ? "low" : total < 70 ? "medium" : "high";

      const breakdown = {
        avg_fatigue: avg.fatigue.toFixed(2),
        avg_minutes: avg.minutes.toFixed(2),
        avg_distance: avg.distance.toFixed(2),
        avg_intensity: avg.intensity.toFixed(2),
        injury_count,
        scores: { fatigue: fatigueScore.toFixed(2), minutes: minutesScore.toFixed(2), distance: distanceScore.toFixed(2), intensity: intensityScore.toFixed(2), injury: injuryScore },
        total_score: total,
        risk_level,
      };

      saveRisk(player_id, total, risk_level, res, breakdown);
    });
  });
};

function saveRisk(player_id, risk_score, risk_level, res, breakdown = null) {
  db.query(
    "INSERT INTO risk_assessment (player_id, risk_score, risk_level) VALUES (?, ?, ?)",
    [player_id, risk_score, risk_level],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Risk calculated and saved", player_id, risk_score, risk_level, breakdown });
    }
  );
}

exports.create = (req, res) => {
  const { player_id, risk_score, risk_level } = req.body;
  if (!player_id || risk_score === undefined || !risk_level)
    return res.status(400).json({ error: "player_id, risk_score and risk_level are required" });
  db.query(
    "INSERT INTO risk_assessment (player_id, risk_score, risk_level) VALUES (?, ?, ?)",
    [player_id, risk_score, risk_level],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...req.body });
    }
  );
};

exports.remove = (req, res) => {
  db.query("DELETE FROM risk_assessment WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Risk not found" });
    res.json({ message: "Risk assessment deleted successfully" });
  });
};
