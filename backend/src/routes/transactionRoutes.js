// File: backend/src/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/user/:userId", transactionController.getTransactionsByUser);
router.post("/", transactionController.createTransaction);

module.exports = router;
