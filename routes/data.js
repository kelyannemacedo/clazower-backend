const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Rota para carregar todos os dados do usuário
// GET /api/data/load
router.get('/load', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Retorna todos os campos de dados que o frontend espera
        const appData = {
            agenda: user.agenda,
            compras: user.compras,
            documentos: user.documentos,
            estudos: user.estudos,
            financeiro: user.financeiro,
            livre1: user.livre1,
            livre2: user.livre2,
            panorama: user.panorama,
            projetos: user.projects, // Mapeamento de projects para projetos
            saude: user.saude,
            start_challenges: user.start, // Mapeamento de start para start_challenges
            trabalho: user.trabalho,
            treino: user.treino,
            moods: user.moods,
            activities: user.activities,
            humor: user.humor,
            // Adicione outros campos conforme o Schema do User
        };

        res.status(200).json(appData);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        res.status(500).json({ message: 'Erro ao carregar dados do usuário' });
    }
});

// Rota para salvar todos os dados do usuário
// POST /api/data/save
router.post('/save', auth, async (req, res) => {
    try {
        const data = req.body;

        // Mapeamento dos campos do frontend para o Schema do Mongoose
        const updateFields = {
            agenda: data.agenda,
            compras: data.compras,
            documentos: data.documentos,
            estudos: data.estudos,
            financeiro: data.financeiro,
            livre1: data.livre1,
            livre2: data.livre2,
            panorama: data.panorama,
            projects: data.projetos, // Mapeamento de projetos para projects
            saude: data.saude,
            start: data.start_challenges, // Mapeamento de start_challenges para start
            trabalho: data.trabalho,
            treino: data.treino,
            moods: data.moods,
            activities: data.activities,
            humor: data.humor,
            // Adicione outros campos conforme o Schema do User
        };

        // Remove campos undefined para não sobrescrever com valor nulo
        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({ message: 'Dados salvos com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        res.status(500).json({ message: 'Erro ao salvar dados do usuário' });
    }
});

module.exports = router;
