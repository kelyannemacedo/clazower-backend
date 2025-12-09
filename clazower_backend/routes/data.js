import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /data/load
 * carrega todos os dados do usuário logado
 */
router.get('/load', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    res.status(200).json({
      agenda: user.agenda || [],
      compras: user.compras || [],
      financeiro: user.financeiro || {},
      categories: user.categories || [],
      customCategories: user.customCategories || [],
      moods: user.moods || [],
      activities: user.activities || [],
      humor: user.humor || [],
      start: user.start || []
    });

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    res.status(500).json({ message: "Erro ao carregar dados" });
  }
});

/**
 * POST /data/save
 * salva TODOS os dados do usuário
 */
router.post('/save', auth, async (req, res) => {
  try {
    const updates = {};

    // qualquer campo enviado será salvo
    Object.keys(req.body).forEach(key => {
      updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    );

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    res.status(500).json({ message: "Erro ao salvar dados" });
  }
});

export default router;
