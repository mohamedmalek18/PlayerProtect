const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/profile", auth, ctrl.profile);

module.exports = router;
