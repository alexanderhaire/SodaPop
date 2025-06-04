// File: backend/src/routes/horseRoutes.js
const express = require("express");
const router = express.Router();
const horseController = require("../controllers/horseController");

router.get("/", horseController.getAllHorses);
router.get("/:id", horseController.getHorseById);
router.post("/", horseController.createHorse);
router.put("/:id", horseController.updateHorse);
router.delete("/:id", horseController.deleteHorse);

module.exports = router;
