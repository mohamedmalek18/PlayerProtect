const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/riskController");

router.get("/", ctrl.getAll);
router.get("/player/:player_id", ctrl.getByPlayer);
router.post("/calculate/:player_id", ctrl.calculate);  // AUTO calculation
router.post("/", ctrl.create);                          // MANUAL creation
router.delete("/:id", ctrl.remove);

module.exports = router;
