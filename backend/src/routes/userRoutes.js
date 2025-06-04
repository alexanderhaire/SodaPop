// File: backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.get("/:id", userController.getUserById);
router.put("/kyc/:id", userController.approveKyc);

module.exports = router;
