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
    default: function () {
      return this.email.split('@')[0];
    }
  },

  // ---------------------------
  // PERSONALIZAÇÕES
  // ---------------------------
  customizations: {
    coverPhoto: { type: String, default: "" },
    customIcon: { type: String, default: "" },
    customTitle: { type: String, default: "Meu Organizador Pessoal" },
    customSubtitle: {
      type: String,
      default: "Um sistema dedicado para você organizar todos os seus projetos!"
    }
  },

  // ---------------------------
  // AGENDA (corrigido!)
  // ---------------------------
  agenda: {
    todoDia: { type: Array, default: [] },
    fixa: { type: Array, default: [] },
    remoto: { type: Array, default: [] },
    segunda: { type: Array, default: [] },
    terca: { type: Array, default: [] },
    quarta: { type: Array, default: [] },
    quinta: { type: Array, default: [] },
    sexta: { type: Array, default: [] },
    sabado: { type: Array, default: [] },
    domingo: { type: Array, default: [] }
  },

  // ---------------------------
  // DEMAIS MÓDULOS
  // ---------------------------
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

  // ---------------------------
  // PROJECTS (padronizado)
  // ---------------------------
  projects: [
    {
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
    }
  ],

  // ---------------------------
  // CATEGORIAS DO PAINEL
  // ---------------------------
  categories: [
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

  customCategories: [
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

  // ---------------------------
  // HUMOR, MOODS, ATIVIDADES
  // ---------------------------
  moods: [
    {
      date: Date,
      mood: String,
      reason: String
    }
  ],

  activities: [
    {
      date: Date,
      count: Number
    }
  ],

  humor: [
    {
      date: Date,
      mood: String
    }
  ],

  // ---------------------------
  // START CHALLENGES
  // ---------------------------
  start_challenges: [
    {
      date: Date,
      challenge: String,
      completed: Boolean
    }
  ],

  // ---------------------------
  // SISTEMA
  // ---------------------------
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
userSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Comparar senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
