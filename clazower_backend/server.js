import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

/* -----------------------------
   ⚠️  STRIPE WEBHOOK (DEVE VIR ANTES DO JSON)
-------------------------------- */
import stripeWebhook from "./routes/stripeWebhook.js";
app.use("/stripe", express.raw({ type: "application/json" }));
app.use("/stripe", stripeWebhook);

/* -----------------------------
   JSON NORMAL DO EXPRESS
-------------------------------- */
app.use(express.json());

/* -----------------------------
   CORS
-------------------------------- */
app.use(cors({
  origin: [
    "https://clazower.web.app",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* -----------------------------
   MONGO
-------------------------------- */
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((error) => console.error('❌ Erro ao conectar ao MongoDB:', error));

/* -----------------------------
   ROTAS NORMAIS DO API
-------------------------------- */
app.use('/api/auth', authRoutes);

import paymentsRoutes from "./routes/payments.js";
app.use("/payments", paymentsRoutes);

/* -----------------------------
   HEALTH CHECK
-------------------------------- */
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Servidor está funcionando ✅' });
});

/* -----------------------------
   ERRORS
-------------------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

/* -----------------------------
   START SERVER — Última linha
-------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
