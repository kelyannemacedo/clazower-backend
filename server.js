require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

/* =============================
   🔵 1. CORS CORRIGIDO (Render + Firebase)
   ============================= */
  const allowedOrigins = [
    'https://clazower.web.app',
    'http://localhost:5173',
    'https://clazower-backend.onrender.com',
    'https://localhost',
    'capacitor://localhost'
  ];

// CORS seguro, porém sem quebrar quando a origem for "undefined" (como no Render)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Requisições internas / server-2-server

      if (!allowedOrigins.includes(origin)) {
        console.log("❌ Origem bloqueada pelo CORS:", origin);
        return callback(null, false); // NÃO gerar erro aqui (Render não aceita)
      }

      console.log("✔ Origem permitida:", origin);
      return callback(null, true);
    },

    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

/* =============================
   🔵 2. BODY PARSER (depois do CORS)
   ============================= */
   app.use(express.json({ limit: '10mb' }))
   app.use(express.urlencoded({ limit: '10mb', extended: true }))
   

/* =============================
   🔵 3. CONEXÃO COM MONGODB
   ============================= */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
  }
}
connectDB();

/* =============================
   🔵 4. ROTAS
   ============================= */
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Servidor está funcionando!' });
});

/* =============================
   🔴 5. TRATAMENTO DE ERROS
   ============================= */
app.use((err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL:", err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

/* =============================
   🚀 6. INICIAR SERVIDOR
   ============================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
