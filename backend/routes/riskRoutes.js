const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/riskController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, ctrl.getAll);
router.get("/player/:player_id", auth, ctrl.getByPlayer);
router.post("/calculate/:player_id", auth, ctrl.calculate);
router.post("/", auth, ctrl.create);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;
