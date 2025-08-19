"use server"

import nodemailer from "nodemailer"
import { createOTPEmailTemplate } from "@/lib/templates/emailTemplates" // ✅ moved

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: "premium257.web-hosting.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@dotlabs.ai",
    pass: "Yx(2r.?4Q*NY",
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Check if we're in a preview/development environment
  // const isPreview = process.env.NODE_ENV === "development" || !process.env.SMTP_EMAIL
  const isPreview = false;


  if (isPreview) {
    // Fallback for preview environment - log email to console
    console.log(`
====== DEV MAILER (Preview Environment) ======
To: ${options.to}
Subject: ${options.subject}
HTML: ${options.html}
===============================================
  `)
    return true
  }

  // Real email sending for production
  const mailOptions = {
    from: '"WEB SEED" <no-reply@dotlabs.ai>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  }

  try {
    const emailResultOutput = await transporter.sendMail(mailOptions)
    console.log("Email sent:", emailResultOutput)
    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

export async function sendOTPEmail(
  userEmail: string,
  userName: string,
  otp: string,
  purpose: string,
): Promise<boolean> {
  console.log("Sending OTP email to:", userEmail, "with OTP:", otp)
  const subject = purpose === "login" ? "WebSeed Login OTP" : "WebSeed Password Reset OTP"
  const html = createOTPEmailTemplate(userName, otp, purpose)

  return await sendEmail({
    to: userEmail,
    subject,
    html,
  })
}
