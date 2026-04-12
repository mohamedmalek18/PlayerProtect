const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/injuryController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, ctrl.getAll);
router.get("/player/:player_id", auth, ctrl.getByPlayer);
router.post("/", auth, ctrl.create);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;
