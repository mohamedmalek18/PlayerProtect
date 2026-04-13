USE injury_db;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Vider les tables
DELETE FROM risk_assessment;
DELETE FROM injury_history;
DELETE FROM performance;
DELETE FROM trainings;
DELETE FROM matches;
DELETE FROM players WHERE coach_id = 7;

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ─────────────────────────────────────────
-- JOUEURS REAL MADRID (coach_id = 7)
-- ─────────────────────────────────────────
INSERT INTO players (id, name, age, position, coach_id) VALUES
(1,  'Thibaut Courtois',     32, 'Goalkeeper', 7),
(2,  'Dani Carvajal',        32, 'Right back', 7),
(3,  'Antonio Rudiger',      31, 'Defender',   7),
(14, 'Federico Valverde',    26, 'Midfielder', 7),
(66, 'Trent Arnold',         26, 'Right back', 7),
(5,  'Jude Bellingham',      21, 'Midfielder', 7),
(18, 'Aurelien Tchouameni',  24, 'Midfielder', 7),
(7,  'Vinicius Junior',      24, 'Forward',    7),
(9,  'Kylian Mbappe',        26, 'Forward',    7),
(24, 'Arda Guler',           20, 'Midfielder', 7);

-- ─────────────────────────────────────────
-- MATCHS (coach_id = 7)
-- ─────────────────────────────────────────
INSERT INTO matches (opponent, match_date, intensity, coach_id) VALUES
('FC Barcelona',     '2026-03-01', 'high',   7),
('Manchester City',  '2026-03-08', 'high',   7),
('Atletico Madrid',  '2026-03-15', 'high',   7),
('Sevilla FC',       '2026-03-22', 'medium', 7),
('Valencia CF',      '2026-03-29', 'medium', 7),
('Bayern Munich',    '2026-04-05', 'high',   7);

-- ─────────────────────────────────────────
-- PERFORMANCES
-- ─────────────────────────────────────────

-- Courtois (id=1) - stable, faible risque
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(1, 1, 90, 5500, 3),
(1, 2, 90, 5800, 4),
(1, 3, 90, 5600, 3),
(1, 4, 90, 5400, 3),
(1, 5, 90, 5700, 4),
(1, 6, 90, 5500, 3);

-- Carvajal (id=2) - risque moyen, 2 blessures graves
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(2, 1, 90, 10500, 6),
(2, 2, 90, 11000, 7),
(2, 3, 75, 8500, 5),
(2, 4, 90, 10800, 7),
(2, 5, 90, 11200, 8),
(2, 6, 90, 11500, 8);

-- Rudiger (id=3) - défenseur solide, faible risque
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(3, 1, 90, 9800, 4),
(3, 2, 90, 10000, 4),
(3, 3, 90, 9500, 5),
(3, 4, 90, 9800, 4),
(3, 5, 90, 10200, 5),
(3, 6, 90, 10500, 5);

-- Valverde (id=14) - stable, très en forme
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(14, 1, 90, 12000, 4),
(14, 2, 90, 12500, 5),
(14, 3, 90, 11800, 4),
(14, 4, 85, 11500, 4),
(14, 5, 90, 12200, 5),
(14, 6, 90, 12800, 5);

-- Arnold (id=66) - risque moyen, instable
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(66, 1, 90, 11000, 4),
(66, 2, 45, 5500, 8),
(66, 3, 90, 11500, 4),
(66, 4, 60, 7000, 7),
(66, 5, 90, 11000, 4),
(66, 6, 90, 11800, 8);

-- Bellingham (id=5) - risque élevé, fatigue croissante
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(5, 1, 90, 11500, 7),
(5, 2, 90, 12000, 8),
(5, 3, 90, 11800, 8),
(5, 4, 90, 12200, 9),
(5, 5, 90, 11900, 9),
(5, 6, 90, 12500, 10);

-- Tchouameni (id=18) - très instable
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(18, 1, 90, 11000, 3),
(18, 2, 45, 5500, 9),
(18, 3, 90, 11500, 4),
(18, 4, 60, 7000, 9),
(18, 5, 90, 11000, 3),
(18, 6, 90, 11800, 9);

-- Vinicius (id=7) - explosif, instable
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(7, 1, 90, 12500, 4),
(7, 2, 90, 13000, 9),
(7, 3, 75, 10000, 5),
(7, 4, 90, 13500, 9),
(7, 5, 60, 8500, 3),
(7, 6, 90, 13000, 10);

-- Mbappe (id=9) - fatigue croissante, risque élevé
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(9, 1, 90, 13000, 5),
(9, 2, 90, 13500, 6),
(9, 3, 90, 12800, 7),
(9, 4, 90, 13200, 8),
(9, 5, 90, 13000, 9),
(9, 6, 90, 13500, 10);

-- Arda Guler (id=24) - jeune, forme variable
INSERT INTO performance (player_id, match_id, minutes_played, distance_run, fatigue_level) VALUES
(24, 1, 60, 7500, 4),
(24, 2, 90, 11000, 6),
(24, 3, 45, 5500, 3),
(24, 4, 90, 11500, 7),
(24, 5, 60, 7000, 4),
(24, 6, 90, 12000, 7);

-- ─────────────────────────────────────────
-- BLESSURES
-- ─────────────────────────────────────────
INSERT INTO injury_history (player_id, injury_type, severity, recovery_days) VALUES
(5,  'Entorse genou',         'modérée', 21),
(5,  'Contusion',             'légère',   5),
(9,  'Élongation',            'modérée', 10),
(7,  'Contusion',             'légère',   3),
(7,  'Entorse cheville',      'modérée', 14),
(2,  'Déchirure musculaire',  'grave',   40),
(2,  'Fracture',              'grave',   60),
(18, 'Élongation',            'légère',   7),
(66, 'Entorse cheville',      'légère',   5),
(24, 'Contusion',             'légère',   3);

-- ─────────────────────────────────────────
-- ENTRAÎNEMENTS
-- ─────────────────────────────────────────
INSERT INTO trainings (training_date, type, intensity, coach_id) VALUES
('2026-03-02', 'endurance', 'medium', 7),
('2026-03-04', 'technique', 'low',    7),
('2026-03-06', 'physique',  'high',   7),
('2026-03-09', 'endurance', 'medium', 7),
('2026-03-11', 'technique', 'low',    7),
('2026-03-13', 'physique',  'high',   7),
('2026-03-16', 'endurance', 'medium', 7),
('2026-03-18', 'technique', 'low',    7),
('2026-03-23', 'physique',  'high',   7),
('2026-03-25', 'endurance', 'medium', 7),
('2026-03-30', 'technique', 'low',    7),
('2026-04-01', 'physique',  'high',   7),
('2026-04-06', 'endurance', 'medium', 7);

