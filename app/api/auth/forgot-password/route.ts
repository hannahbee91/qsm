import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { transporter } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't leak whether the user exists or not
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Determine base URL, trying NEXT_PUBLIC_BASE_URL first
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get("origin") || `http://${req.headers.get("host")}`);
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const html = passwordResetEmail(resetUrl);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request - Queer Speed Meet",
      html,
    });

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
