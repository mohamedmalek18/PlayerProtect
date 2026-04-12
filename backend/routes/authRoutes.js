const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/profile", auth, ctrl.profile);
router.put("/profile", auth, upload.single("photo"), ctrl.updateProfile);

module.exports = router;
