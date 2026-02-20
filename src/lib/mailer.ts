import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

type MailParams = {
  to: string;
  subject: string;
  html: string;
};

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM || process.env.SMTP_USER)
  );
}

export function getTransporter() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(getRequiredEnv("SMTP_PORT"));
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // fail fast on bad SMTP settings
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  });
}

export async function sendMail(params: MailParams) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  if (!from) throw new Error("Missing env SMTP_FROM (or SMTP_USER)");

  let transporter: Transporter;
  try {
    transporter = getTransporter();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("cannot find module") && msg.toLowerCase().includes("nodemailer")) {
      throw new Error('Email service missing. Run "npm i nodemailer" and set SMTP env vars.');
    }
    throw e;
  }

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
