import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
})

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || 'GB Realengo <noreply@gbrealengo.com>'

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  })
}

/**
 * Envia e-mail de OTP
 */
export async function sendOtpEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥋 GB Realengo</h1>
          </div>
          <div class="content">
            <h2>Link de Acesso</h2>
            <p>Olá! Você solicitou acesso à plataforma GB Realengo.</p>
            <p>Clique no botão abaixo para fazer login:</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Acessar Plataforma</a>
            </div>
            <p>Ou copie e cole este link no navegador:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd;">
              ${verifyUrl}
            </p>
            <p><strong>Este link expira em 15 minutos.</strong></p>
            <p>Se você não solicitou este acesso, ignore este e-mail.</p>
          </div>
          <div class="footer">
            <p>GB Realengo - Check-in App</p>
            <p>Este é um e-mail automático, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Seu link de acesso - GB Realengo',
    html,
  })
}

/**
 * Envia e-mail de troca de e-mail
 */
export async function sendEmailChangeConfirmation(email: string, token: string, newEmail: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/profile/email/confirm?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥋 GB Realengo</h1>
          </div>
          <div class="content">
            <h2>Confirmação de Troca de E-mail</h2>
            <p>Você solicitou a troca do seu e-mail para: <strong>${newEmail}</strong></p>
            <p>Clique no botão abaixo para confirmar a alteração:</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Confirmar Troca de E-mail</a>
            </div>
            <p>Ou copie e cole este link no navegador:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd;">
              ${verifyUrl}
            </p>
            <p><strong>Este link expira em 15 minutos.</strong></p>
            <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
          </div>
          <div class="footer">
            <p>GB Realengo - Check-in App</p>
            <p>Este é um e-mail automático, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Confirme a troca de e-mail - GB Realengo',
    html,
  })
}
