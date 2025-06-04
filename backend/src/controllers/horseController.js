// File: backend/src/controllers/horseController.js

const Horse = require("../models/horse");

exports.getAllHorses = async (req, res) => {
  try {
    const horses = await Horse.find();
    res.json(horses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHorseById = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    res.json(horse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHorse = async (req, res) => {
  try {
    const newHorse = new Horse(req.body);
    await newHorse.save();
    res.status(201).json(newHorse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateHorse = async (req, res) => {
  try {
    const updatedHorse = await Horse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedHorse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteHorse = async (req, res) => {
  try {
    await Horse.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
