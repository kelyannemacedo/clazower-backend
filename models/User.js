// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

  isSubscriber: {
    type: Boolean,
    default: false,
  },
  
  subscriptionId: {
    type: String,
    default: null,
  },
  
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  
  name: {
    type: String,
    default: function() {
      return this.email ? this.email.split('@')[0] : '';
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
  projects: [{
    id: String,
    name: String,
    description: String,
    status: String,
    priority: String,
    category: String,
    createdAt: { type: Date, default: Date.now }
  }],
  categories: Array,
  customCategories: Array,
  moods: Array,
  activities: Array,
  humor: Array,
  start: Array,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Atualizar updatedAt e/ou hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
// models/User.js



