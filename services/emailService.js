const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendResetPasswordEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`

  console.log('📨 Tentando enviar e-mail para:', email)
  console.log('🔗 Link:', resetLink)

  const response = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: [email], // ✅ ARRAY
    subject: 'Redefinição de senha - Clazower',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este link expira em 1 hora.</p>
    `
  })

  console.log('✅ Resposta da Resend:', response)
}

module.exports = { sendResetPasswordEmail }
