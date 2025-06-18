// File: backend/src/controllers/transactionController.js

const Transaction = require("../models/transaction");

exports.getTransactionsByUser = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).populate("itemId");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTx = new Transaction(req.body);
    await newTx.save();
    res.status(201).json(newTx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
