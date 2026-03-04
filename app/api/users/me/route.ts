import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updateData: any = {};
    
    // Only allow updating specific fields
    const safeFields = ['name', 'age', 'pronouns', 'discord', 'instagram', 'phoneNumber', 'contactEmail', 'notifyNewEvents'];
    for (const field of safeFields) {
      if (data[field] !== undefined) {
        if (field === 'age') {
          updateData[field] = data[field] ? parseInt(data[field], 10) : null;
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
