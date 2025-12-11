const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Este e-mail já está registrado' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      customizations: {
        coverPhoto: '',
        customIcon: '',
        customTitle: 'Meu Organizador Pessoal',
        customSubtitle: 'Um sistema dedicado para você organizar todos os seus projetos!'
      }
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        customizations: user.customizations
      }
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        customizations: user.customizations
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Obter dados do usuário
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        customizations: user.customizations,
        projetos: user.projetos,                 // <-- corrigido
        categories: user.categories,
        customCategories: user.customCategories,
        moods: user.moods,
        activities: user.activities,
        humor: user.humor,
        start_challenges: user.start_challenges  // <-- corrigido
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ message: 'Erro ao obter dados do usuário' });
  }
});

// Atualizar dados de customização
router.put('/me', auth, async (req, res) => {
  try {
    const { customizations } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        customizations: customizations || undefined,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Dados de customização atualizados com sucesso',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        customizations: user.customizations,
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar dados de customização:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados de customização' });
  }
});

// Recuperar senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Por favor, forneça um e-mail' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    res.status(200).json({
      message: 'E-mail de recuperação enviado',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ message: 'Erro ao recuperar senha' });
  }
});

// Resetar senha
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== resetToken) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ message: 'Erro ao resetar senha' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Auth funcionando!' });
});

module.exports = router;
