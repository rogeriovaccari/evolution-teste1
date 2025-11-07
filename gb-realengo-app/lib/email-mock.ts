/**
 * Mock de e-mail para desenvolvimento SEM Docker
 * Os e-mails são exibidos no console
 */

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  console.log('\n📧 ==================== E-MAIL ENVIADO ====================')
  console.log(`Para: ${to}`)
  console.log(`Assunto: ${subject}`)
  console.log('─────────────────────────────────────────────────────────')
  
  // Extrai o link do HTML
  const linkMatch = html.match(/href="([^"]+)"/)
  if (linkMatch) {
    console.log('\n🔗 LINK DE ACESSO:')
    console.log(linkMatch[1])
  }
  
  console.log('=========================================================\n')
  
  return Promise.resolve()
}

export async function sendOtpEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  const html = `
    <h1>🥋 GB Realengo</h1>
    <h2>Link de Acesso</h2>
    <p>Clique no link abaixo para fazer login:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p><strong>Este link expira em 15 minutos.</strong></p>
  `

  await sendEmail({
    to: email,
    subject: 'Seu link de acesso - GB Realengo',
    html,
  })
}

export async function sendEmailChangeConfirmation(email: string, token: string, newEmail: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/profile/email/confirm?token=${token}`

  const html = `
    <h1>🥋 GB Realengo</h1>
    <h2>Confirmação de Troca de E-mail</h2>
    <p>Você solicitou a troca do seu e-mail para: <strong>${newEmail}</strong></p>
    <a href="${verifyUrl}">${verifyUrl}</a>
  `

  await sendEmail({
    to: email,
    subject: 'Confirme a troca de e-mail - GB Realengo',
    html,
  })
}
