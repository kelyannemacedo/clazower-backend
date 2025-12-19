const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, forneça um e-mail válido'
    ]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  name: {
    type: String,
    default: function () {
      return this.email.split('@')[0];
    }
  },

  // 🔐 RESET DE SENHA (APENAS UMA VEZ)
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // =============================
  // CUSTOMIZAÇÕES
  // =============================
  customizations: {
    coverPhoto: { type: String, default: "" },
    customIcon: { type: String, default: "" },
    customTitle: { type: String, default: "Meu Organizador Pessoal" },
    customSubtitle: { type: String, default: "Um sistema dedicado para você organizar todos os seus projetos!" }
  },

  // =============================
  // AGENDA
  // =============================
  agenda: {
    type: Object,
    default: {
      todoDia: [],
      fixa: [],
      remoto: [],
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
      domingo: []
    }
  },

  // =============================
  // OUTRAS CATEGORIAS
  // =============================
  compras: { type: Array, default: [] },
  documentos: { type: Array, default: [] },
  estudos: { type: Array, default: [] },
  financeiro: { type: Array, default: [] },
  livre1: { type: Array, default: [] },
  livre2: { type: Array, default: [] },
  panorama: { type: Array, default: [] },
  saude: { type: Array, default: [] },
  trabalho: { type: Array, default: [] },
  treino: { type: Array, default: [] },

  // =============================
  // PROJETOS
  // =============================
  clazowerProjects: {
    type: [
      {
        id: String,
        name: String,
        description: String,
        status: String,
        priority: String,
        category: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },

  // =============================
  // CATEGORIAS PERSONALIZADAS
  // =============================
  categories: {
    type: [
      {
        name: String,
        description: String,
        sections: [
          {
            name: String,
            items: [
              {
                id: String,
                text: String,
                type: String,
                completed: Boolean,
                link: String
              }
            ]
          }
        ]
      }
    ],
    default: []
  },

  customCategories: {
    type: [
      {
        id: String,
        name: String,
        sections: [
          {
            id: String,
            name: String,
            items: [
              {
                id: String,
                text: String,
                type: String,
                completed: Boolean,
                link: String
              }
            ]
          }
        ]
      }
    ],
    default: []
  },

  // =============================
  // HUMOR E ATIVIDADES
  // =============================
  moods: {
    type: [
      {
        mood: { type: String, required: true },
        reason: { type: String, default: '' },
        date: { type: Date, default: Date.now }
      }
    ],
    default: []
  },

  activities: {
    type: [
      {
        date: Date,
        count: Number
      }
    ],
    default: []
  },

  humor: {
    type: [
      {
        date: Date,
        mood: String
      }
    ],
    default: []
  },

  start_challenges: {
    type: [
      {
        date: Date,
        challenge: String,
        completed: Boolean
      }
    ],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// =============================
// MIDDLEWARE
// =============================
userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =============================
// MÉTODO DE SENHA
// =============================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
