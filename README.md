# Clazower Backend

Backend do aplicativo Clazower com autenticação, persistência de dados e gerenciamento de usuários.

## Requisitos

- Node.js 14+
- MongoDB 4.4+
- npm ou yarn

## Instalação

1. Clone o repositório ou extraia os arquivos do backend

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clazower
JWT_SECRET=seu_segredo_jwt_super_secreto_aqui_12345
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_google
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Executar o servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

## Endpoints da API

### Autenticação

**POST /api/auth/register**
- Registrar novo usuário
- Body: `{ email, password, confirmPassword }`
- Response: `{ token, user }`

**POST /api/auth/login**
- Fazer login
- Body: `{ email, password }`
- Response: `{ token, user }`

**GET /api/auth/me**
- Obter dados do usuário logado
- Headers: `Authorization: Bearer {token}`
- Response: `{ user }`

**PUT /api/auth/me**
- Atualizar dados do usuário
- Headers: `Authorization: Bearer {token}`
- Body: `{ customizations, projects, categories, moods }`
- Response: `{ user }`

**POST /api/auth/forgot-password**
- Solicitar recuperação de senha
- Body: `{ email }`
- Response: `{ message, resetToken }`

**POST /api/auth/reset-password**
- Redefinir senha
- Body: `{ resetToken, newPassword, confirmPassword }`
- Response: `{ message }`

## Estrutura do Projeto

```
clazower_backend/
├── models/
│   └── User.js          # Modelo de usuário
├── middleware/
│   └── auth.js          # Middleware de autenticação JWT
├── routes/
│   └── auth.js          # Rotas de autenticação
├── server.js            # Arquivo principal do servidor
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências do projeto
└── README.md            # Este arquivo
```

## Dependências

- **express**: Framework web
- **cors**: Middleware para CORS
- **dotenv**: Gerenciamento de variáveis de ambiente
- **bcryptjs**: Criptografia de senhas
- **jsonwebtoken**: Autenticação JWT
- **mongoose**: ODM para MongoDB
- **nodemailer**: Envio de e-mails

## Notas Importantes

1. **MongoDB**: Certifique-se de que o MongoDB está rodando antes de iniciar o servidor
2. **JWT Secret**: Mude o `JWT_SECRET` em produção para um valor seguro
3. **SMTP**: Configure as credenciais do Gmail ou outro serviço de e-mail para recuperação de senha
4. **CORS**: O CORS está configurado para aceitar requisições do frontend em `http://localhost:5173`

## Troubleshooting

**Erro: "Cannot connect to MongoDB"**
- Verifique se o MongoDB está rodando
- Verifique a URI do MongoDB no arquivo `.env`

**Erro: "E-mail já está registrado"**
- O e-mail já existe no banco de dados
- Tente com outro e-mail

**Erro: "Token inválido ou expirado"**
- O token JWT expirou
- Faça login novamente para obter um novo token

## Suporte

Para problemas ou dúvidas, entre em contato com o time de desenvolvimento.

