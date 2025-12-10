require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

// ADICIONE ESTES DOIS MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware
const allowedOrigins = ['https://clazower.web.app', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // para requests como Postman ou curl
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'O CORS não permite essa origem';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


// Conexão com MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
}

connectDB();


// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Servidor está funcionando' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

