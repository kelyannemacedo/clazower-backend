const nodemailer = require('nodemailer');

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Gmail usa STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"Clazower" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Redefinição de senha',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <p>
        <a href="${resetLink}">Redefinir senha</a>
      </p>
      <p>Este link expira em 1 hora.</p>
      <br />
      <p>Se você não solicitou essa redefinição, ignore este e-mail.</p>
    `
  });
};

module.exports = { sendResetPasswordEmail };
