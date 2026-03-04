import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePasswordRequirements } from "@/lib/password-utils";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const passwordValidation = validatePasswordRequirements(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: "Password does not meet requirements" }, { status: 400 });
    }

    // Find valid token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: user.email! },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
