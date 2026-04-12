require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ── ROUTES ──────────────────────────────
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/players",     require("./routes/playerRoutes"));
app.use("/api/matches",     require("./routes/matchRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/trainings",   require("./routes/trainingRoutes"));
app.use("/api/injuries",    require("./routes/injuryRoutes"));
app.use("/api/risk",        require("./routes/riskRoutes"));

// ── TEST ─────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ── START ────────────────────────────────
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
