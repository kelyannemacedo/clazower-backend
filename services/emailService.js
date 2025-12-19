const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendResetPasswordEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`

  console.log('📨 Tentando enviar e-mail para:', to)
  console.log('🔗 Link:', resetLink)

  const response = await resend.emails.send({
    from: 'Clazower <onboarding@resend.dev>',
    to: [to],
    subject: 'Redefinição de senha',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">${resetLink}</a>
    `
  })

  console.log('✅ Resposta da Resend:', response)
  console.log('📨 ENVIANDO EMAIL PARA:', email)
  console.log('🔑 TOKEN:', token)
  console.log('🌍 FRONTEND_URL:', process.env.FRONTEND_URL)
  console.log('✉️ FROM_EMAIL:', process.env.FROM_EMAIL)

}

module.exports = { sendResetPasswordEmail }
