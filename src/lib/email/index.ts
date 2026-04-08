import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@letzwelcome.lu";
const FROM_NAME = "Letzwelcome";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/en/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "Verify your email — Letzwelcome",
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B3A5C; font-family: 'DM Serif Display', serif;">Welcome to Letzwelcome</h1>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6;">
          Thank you for joining our community! Please verify your email address by clicking the button below.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #1B3A5C; color: #FAF7F0; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link: ${verifyUrl}
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/en/forgot-password?token=${token}`;

  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "Reset your password — Letzwelcome",
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B3A5C; font-family: 'DM Serif Display', serif;">Password Reset</h1>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6;">
          You requested a password reset. Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1B3A5C; color: #FAF7F0; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendMatchNotification(email: string, matcherName: string) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `New connection request — Letzwelcome`,
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B3A5C; font-family: 'DM Serif Display', serif;">New Connection Request</h1>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6;">
          <strong>${matcherName}</strong> would like to connect with you on Letzwelcome.
        </p>
        <a href="${APP_URL}/en/matching" style="display: inline-block; background-color: #D4A843; color: #1B3A5C; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          View Request
        </a>
      </div>
    `,
  });
}

export async function sendBadgeNotification(email: string, badgeName: string) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `You earned a badge! — Letzwelcome`,
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1B3A5C; font-family: 'DM Serif Display', serif;">Congratulations!</h1>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6;">
          You've earned the <strong>"${badgeName}"</strong> badge on Letzwelcome. Keep up the great work!
        </p>
        <a href="${APP_URL}/en/profile" style="display: inline-block; background-color: #4A7A5B; color: #FAF7F0; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          View Profile
        </a>
      </div>
    `,
  });
}
