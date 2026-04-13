const db = require("../db");

// ─────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────

// Weighted average (recent matches have more weight)
const weightedAverage = (values) => {
  if (values.length === 0) return 0;
  const weights = values.map((_, i) => values.length - i); // most recent = highest weight
  const total = weights.reduce((a, b) => a + b, 0);
  return values.reduce((sum, val, i) => sum + val * weights[i], 0) / total;
};

// Standard deviation (instability)
const standardDeviation = (values) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

// ─────────────────────────────────────────
// GET ALL RISKS
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// GET RISK BY PLAYER
// ─────────────────────────────────────────
exports.getByPlayer = (req, res) => {
  db.query(
    `SELECT ra.* FROM risk_assessment ra 
     JOIN players p ON ra.player_id = p.id 
     WHERE ra.player_id = ? AND p.coach_id = ? 
     ORDER BY ra.calculated_at DESC`,
    [req.params.player_id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// ─────────────────────────────────────────
// CALCULATE RISK — ADVANCED ALGORITHM
// ─────────────────────────────────────────
exports.calculate = (req, res) => {
  const player_id = req.params.player_id;

  // Get last 10 performances ordered by date (most recent first)
  const perfSQL = `
    SELECT p.fatigue_level, p.minutes_played, p.distance_run, 
           m.intensity, m.match_date
    FROM performance p
    JOIN matches m ON p.match_id = m.id
    JOIN players pl ON p.player_id = pl.id
    WHERE p.player_id = ? AND pl.coach_id = ?
    ORDER BY m.match_date DESC
    LIMIT 10
  `;

  const injurySQL = `
    SELECT COUNT(*) AS injury_count, 
           SUM(CASE WHEN severity = 'grave' THEN 3 
                    WHEN severity = 'modérée' THEN 2 
                    ELSE 1 END) AS severity_score
    FROM injury_history ih
    JOIN players p ON ih.player_id = p.id
    WHERE ih.player_id = ? AND p.coach_id = ?
  `;

  db.query(perfSQL, [player_id, req.user.id], (err, performances) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(injurySQL, [player_id, req.user.id], (err2, injuryResult) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const injury_count = injuryResult[0].injury_count || 0;
      const severity_score = injuryResult[0].severity_score || 0;

      // No performance data
      if (performances.length === 0) {
        return saveRisk(player_id, 10, "low", res, { reason: "Aucune performance enregistrée" });
      }

      // ── EXTRACT DATA ──────────────────────
      const fatigueValues = performances.map(p => p.fatigue_level || 0);
      const minutesValues = performances.map(p => p.minutes_played || 0);
      const distanceValues = performances.map(p => p.distance_run || 0);
      const intensityValues = performances.map(p =>
        p.intensity === "high" ? 3 : p.intensity === "medium" ? 2 : 1
      );

      // ─────────────────────────────────────
      // 1. ÉTAT GÉNÉRAL (40%)
      // Weighted average — recent matches matter more
      // ─────────────────────────────────────
      const avgFatigue = weightedAverage(fatigueValues);       // 1-10
      const avgMinutes = weightedAverage(minutesValues);       // 0-120
      const avgDistance = weightedAverage(distanceValues);     // 0-15000
      const avgIntensity = weightedAverage(intensityValues);   // 1-3

      const generalScore =
        (avgFatigue / 10) * 18 +
        Math.min(avgMinutes / 90, 1) * 10 +
        Math.min(avgDistance / 12000, 1) * 6 +
        ((avgIntensity - 1) / 2) * 6;
      // Max = 40

      // ─────────────────────────────────────
      // 2. INSTABILITÉ (25%)
      // High variation = more injury risk
      // ─────────────────────────────────────
      const stdFatigue = standardDeviation(fatigueValues);     // 0-9
      const stdMinutes = standardDeviation(minutesValues);     // 0-120
      const stdIntensity = standardDeviation(intensityValues); // 0-2

      const instabilityScore =
        Math.min(stdFatigue / 4, 1) * 12 +
        Math.min(stdMinutes / 40, 1) * 8 +
        Math.min(stdIntensity / 1.5, 1) * 5;
      // Max = 25

      // ─────────────────────────────────────
      // 3. RÉCENCE (25%)
      // Last 3 matches weighted more than older ones
      // ─────────────────────────────────────
      const recentPerfs = performances.slice(0, 3); // last 3 matches
      const recentFatigue = recentPerfs.reduce((sum, p) => sum + (p.fatigue_level || 0), 0) / recentPerfs.length;
      const recentMinutes = recentPerfs.reduce((sum, p) => sum + (p.minutes_played || 0), 0) / recentPerfs.length;
      const recentIntensity = recentPerfs.reduce((sum, p) =>
        sum + (p.intensity === "high" ? 3 : p.intensity === "medium" ? 2 : 1), 0) / recentPerfs.length;

      const recencyScore =
        (recentFatigue / 10) * 13 +
        Math.min(recentMinutes / 90, 1) * 7 +
        ((recentIntensity - 1) / 2) * 5;
      // Max = 25

      // ─────────────────────────────────────
      // 4. HISTORIQUE BLESSURES (10%)
      // Past injuries increase future risk
      // ─────────────────────────────────────
      const injuryScore = Math.min(severity_score * 1.5, 10);
      // Max = 10

      // ─────────────────────────────────────
      // SEUIL CRITIQUE — BONUS
      // If fatigue = 10 in last match → +20 bonus
      // ─────────────────────────────────────
      const lastFatigue = fatigueValues[0]; // most recent
      const criticalBonus = lastFatigue === 10 ? 20 : lastFatigue >= 9 ? 10 : 0;

      // ── TOTAL ────────────────────────────
      let total = generalScore + instabilityScore + recencyScore + injuryScore + criticalBonus;
      total = Math.round(Math.min(total, 100));

      // ── RISK LEVEL ───────────────────────
      const risk_level = total < 40 ? "low" : total < 70 ? "medium" : "high";

      // ── BREAKDOWN ────────────────────────
      const breakdown = {
        performances_analyzed: performances.length,

        general: {
          avg_fatigue: avgFatigue.toFixed(2),
          avg_minutes: avgMinutes.toFixed(2),
          avg_distance: avgDistance.toFixed(2),
          avg_intensity: avgIntensity.toFixed(2),
          score: generalScore.toFixed(2) + "/40",
        },

        instability: {
          std_fatigue: stdFatigue.toFixed(2),
          std_minutes: stdMinutes.toFixed(2),
          std_intensity: stdIntensity.toFixed(2),
          score: instabilityScore.toFixed(2) + "/25",
          note: stdFatigue > 3 ? "⚠️ Performances très instables !" : "✅ Performances stables",
        },

        recency: {
          recent_matches: recentPerfs.length,
          recent_avg_fatigue: recentFatigue.toFixed(2),
          recent_avg_minutes: recentMinutes.toFixed(2),
          score: recencyScore.toFixed(2) + "/25",
        },

        injury_history: {
          total_injuries: injury_count,
          severity_score,
          score: injuryScore.toFixed(2) + "/10",
        },

        critical_bonus: {
          last_fatigue: lastFatigue,
          bonus: criticalBonus,
          note: criticalBonus > 0 ? "🚨 Fatigue critique détectée !" : "✅ Pas de fatigue critique",
        },

        total_score: total,
        risk_level,
      };

      saveRisk(player_id, total, risk_level, res, breakdown);
    });
  });
};

// ─────────────────────────────────────────
// SAVE RISK TO DB
// ─────────────────────────────────────────
function saveRisk(player_id, risk_score, risk_level, res, breakdown = null) {
  db.query(
    "INSERT INTO risk_assessment (player_id, risk_score, risk_level) VALUES (?, ?, ?)",
    [player_id, risk_score, risk_level],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "✅ Risque calculé et sauvegardé",
        player_id,
        risk_score,
        risk_level,
        breakdown,
      });
    }
  );
}

// ─────────────────────────────────────────
// MANUAL CREATE
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
// DELETE
// ─────────────────────────────────────────
exports.remove = (req, res) => {
  db.query("DELETE FROM risk_assessment WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Risk not found" });
    res.json({ message: "Risk assessment deleted successfully" });
  });
};
