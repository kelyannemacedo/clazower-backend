const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, forneça um e-mail válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    default: function() {
      return this.email.split('@')[0];
    }
  },
  customizations: {
    coverPhoto: String,
    customIcon: String,
    customTitle: {
      type: String,
      default: 'Meu Organizador Pessoal'
    },
    customSubtitle: {
      type: String,
      default: 'Um sistema dedicado para você organizar todos os seus projetos!'
    }
  },
  agenda: Array,
  compras: Array,
  documentos: Array,
  estudos: Array,
  financeiro: Array,
  livre1: Array,
  livre2: Array,
  panorama: Array,
  saude: Array,
  trabalho: Array,
  treino: Array,
  projetos: [{ // <--- CORRIGIDO
    id: String,
    name: String,
    description: String,
    status: String,
    priority: String,
    category: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  categories: [{
    name: String,
    description: String,
    sections: [{
      name: String,
      items: [{
        id: String,
        text: String,
        type: String,
        completed: Boolean,
        link: String
      }]
    }]
  }],
  customCategories: [{
    id: String,
    name: String,
    sections: [{
      id: String,
      name: String,
      items: [{
        id: String,
        text: String,
        type: String,
        completed: Boolean,
        link: String
      }]
    }]
  }],
  moods: [{
    date: Date,
    mood: String,
    reason: String
  }],
  activities: [{
    date: Date,
    count: Number
  }],
  humor: [{
    date: Date,
    mood: String
  }],
  start_challenges: [{ // <--- CORRIGIDO
    date: Date,
    challenge: String,
    completed: Boolean
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar updatedAt antes de salvar
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
