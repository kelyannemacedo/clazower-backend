import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";  // <--- ADICIONADO

dotenv.config();

const app = express();

/* -----------------------------
   JSON DO EXPRESS
-------------------------------- */
app.use(express.json());

/* -----------------------------
   CORS
-------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://clazower.web.app",
      "https://clazower.firebaseapp.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -----------------------------
   MONGO
-------------------------------- */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((error) =>
    console.error("❌ Erro ao conectar ao MongoDB:", error)
  );

/* -----------------------------
   ROTAS DA API
-------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);  // <--- ADICIONADO

/* -----------------------------
   HEALTH CHECK
-------------------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Servidor funcionando 🚀" });
});

/* -----------------------------
   ERRORS
-------------------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

/* -----------------------------
   START SERVER
-------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
