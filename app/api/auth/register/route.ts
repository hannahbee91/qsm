import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePasswordRequirements } from "@/lib/password-utils";

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      age, 
      pronouns, 
      isOver18,
      contactEmail,
      phoneNumber,
      instagram,
      discord
    } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isOver18 || !age || Number(age) < 18) {
      return NextResponse.json({ error: "You must be over 18 to register" }, { status: 400 });
    }

    const hasContactMethod = contactEmail || phoneNumber || instagram || discord;
    if (!hasContactMethod) {
      return NextResponse.json({ error: "Please provide at least one contact method" }, { status: 400 });
    }

    const passwordValidation = validatePasswordRequirements(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: "Password does not meet requirements" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "REGISTRANT",
        age: Number(age),
        pronouns,
        contactEmail,
        phoneNumber,
        instagram,
        discord
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
