import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supportEmail = process.env.SUPPORT_EMAIL;

    if (!supportEmail) {
      console.error("SUPPORT_EMAIL is not defined in the environment variables.");
      return NextResponse.json({ error: "Support email is not configured." }, { status: 500 });
    }

    // Configure nodemailer with environment variables (using existing SMTP config if available)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"QSM Support Form" <noreply@example.com>',
      to: supportEmail,
      replyTo: email,
      subject: `[Support Request] from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee;">New Support Request</h2>
          <div style="margin-bottom: 16px;">
            <p style="margin: 0; color: #555;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 4px 0 0 0; color: #555;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #A66CFF;">${email}</a></p>
          </div>
          <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px;">
            <p style="margin: 0; color: #666; font-size: 0.9em; text-transform: uppercase;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; margin: 8px 0 0 0; color: #333; font-size: 1.05em; line-height: 1.5;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
