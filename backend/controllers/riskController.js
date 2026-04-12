const db = require("../db");

// ─────────────────────────────────────────
// GET all risk assessments
// ─────────────────────────────────────────
exports.getAll = (req, res) => {
  const sql = `
    SELECT ra.*, p.name AS player_name
    FROM risk_assessment ra
    JOIN players p ON ra.player_id = p.id
    ORDER BY ra.calculated_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ─────────────────────────────────────────
// GET risk by player
// ─────────────────────────────────────────
exports.getByPlayer = (req, res) => {
  db.query(
    "SELECT * FROM risk_assessment WHERE player_id = ? ORDER BY calculated_at DESC",
    [req.params.player_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// ─────────────────────────────────────────
// CALCULATE RISK for a player
// POST /api/risk/calculate/:player_id
// ─────────────────────────────────────────
exports.calculate = (req, res) => {
  const player_id = req.params.player_id;

  // STEP 1 — Get last 5 performances of the player
  const perfSQL = `
    SELECT p.fatigue_level, p.minutes_played, p.distance_run, m.intensity
    FROM performance p
    JOIN matches m ON p.match_id = m.id
    WHERE p.player_id = ?
    ORDER BY m.match_date DESC
    LIMIT 5
  `;

  // STEP 2 — Get injury history count
  const injurySQL = `
    SELECT COUNT(*) AS injury_count
    FROM injury_history
    WHERE player_id = ?
  `;

  db.query(perfSQL, [player_id], (err, performances) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(injurySQL, [player_id], (err2, injuryResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const injury_count = injuryResult[0].injury_count;

      // ─────────────────────────────────────
      // ALGORITHM CALCULATION
      // ─────────────────────────────────────

      let fatigueScore = 0;
      let minutesScore = 0;
      let distanceScore = 0;
      let intensityScore = 0;

      if (performances.length === 0) {
        // No performance data — low risk by default
        return saveRisk(player_id, 10, "low", res);
      }

      // Calculate averages from last 5 matches
      const avg = performances.reduce(
        (acc, p) => {
          acc.fatigue += p.fatigue_level || 0;
          acc.minutes += p.minutes_played || 0;
          acc.distance += p.distance_run || 0;
          // intensity: low=1, medium=2, high=3
          acc.intensity += p.intensity === "high" ? 3 : p.intensity === "medium" ? 2 : 1;
          return acc;
        },
        { fatigue: 0, minutes: 0, distance: 0, intensity: 0 }
      );

      const n = performances.length;
      avg.fatigue /= n;    // 1-10
      avg.minutes /= n;    // 0-120
      avg.distance /= n;   // 0-15000 (meters)
      avg.intensity /= n;  // 1-3

      // ── FATIGUE SCORE (35%) ──────────────
      // fatigue_level is 1-10
      // 1-3 = low, 4-6 = medium, 7-10 = high
      fatigueScore = (avg.fatigue / 10) * 35;

      // ── MINUTES SCORE (25%) ──────────────
      // 90+ minutes = maximum risk
      minutesScore = Math.min(avg.minutes / 90, 1) * 25;

      // ── DISTANCE SCORE (10%) ─────────────
      // 12000m+ = maximum risk
      distanceScore = Math.min(avg.distance / 12000, 1) * 10;

      // ── INTENSITY SCORE (15%) ────────────
      // intensity avg: 1=low, 2=medium, 3=high
      intensityScore = ((avg.intensity - 1) / 2) * 15;

      // ── INJURY HISTORY SCORE (15%) ───────
      // Each past injury adds risk, max 15 points
      const injuryScore = Math.min(injury_count * 5, 15);

      // ── TOTAL SCORE ──────────────────────
      let total = fatigueScore + minutesScore + distanceScore + intensityScore + injuryScore;
      total = Math.round(Math.min(total, 100)); // cap at 100

      // ── RISK LEVEL ───────────────────────
      let risk_level;
      if (total < 40) risk_level = "low";
      else if (total < 70) risk_level = "medium";
      else risk_level = "high";

      // ── DEBUG INFO (optional) ─────────────
      const breakdown = {
        avg_fatigue: avg.fatigue.toFixed(2),
        avg_minutes: avg.minutes.toFixed(2),
        avg_distance: avg.distance.toFixed(2),
        avg_intensity: avg.intensity.toFixed(2),
        injury_count,
        scores: {
          fatigue: fatigueScore.toFixed(2),
          minutes: minutesScore.toFixed(2),
          distance: distanceScore.toFixed(2),
          intensity: intensityScore.toFixed(2),
          injury: injuryScore,
        },
        total_score: total,
        risk_level,
      };

      saveRisk(player_id, total, risk_level, res, breakdown);
    });
  });
};

// ─────────────────────────────────────────
// SAVE risk result to DB
// ─────────────────────────────────────────
function saveRisk(player_id, risk_score, risk_level, res, breakdown = null) {
  db.query(
    "INSERT INTO risk_assessment (player_id, risk_score, risk_level) VALUES (?, ?, ?)",
    [player_id, risk_score, risk_level],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Risk calculated and saved",
        player_id,
        risk_score,
        risk_level,
        breakdown,
      });
    }
  );
}

// ─────────────────────────────────────────
// MANUAL create risk assessment
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// DELETE risk assessment
// ─────────────────────────────────────────
exports.remove = (req, res) => {
  db.query("DELETE FROM risk_assessment WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Risk not found" });
    res.json({ message: "Risk assessment deleted successfully" });
  });
};
