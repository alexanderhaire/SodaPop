import express from "express";
const router = express.Router();

let horses: any[] = [];

router.post("/horses", (req, res) => {
  const { name, age, trainer, record, earnings } = req.body;

  const newHorse = {
    id: horses.length.toString(),
    name,
    age,
    trainer,
    record,
    earnings,
    image: "/horse.png"
  };

  horses.push(newHorse);
  res.status(201).json(newHorse);
});

router.get("/horses", (req, res) => {
  res.json(horses);
});

export default router;
