const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

// 🔵 GET /api/data/load
router.get("/load", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna TODOS os dados salvos no user
    const {
      _id,
      password,
      __v,
      email,
      ...appData
    } = user;

    res.status(200).json(appData);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    res.status(500).json({ message: "Erro ao carregar dados do usuário" });
  }
});

// 🔵 POST /api/data/save
router.post("/save", auth, async (req, res) => {
  try {
    const newData = req.body;

    // Carrega dados atuais
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // 🔥 Merge inteligente: atualiza somente o que foi enviado
    Object.keys(newData).forEach((key) => {
      user[key] = newData[key];
    });

    await user.save();

    res.status(200).json({ message: "Dados salvos com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    res.status(500).json({ message: "Erro ao salvar dados do usuário" });
  }
});

module.exports = router;
