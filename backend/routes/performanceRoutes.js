const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/performanceController");

router.get("/", ctrl.getAll);
router.get("/player/:player_id", ctrl.getByPlayer);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
