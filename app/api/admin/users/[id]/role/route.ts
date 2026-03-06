import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { role } = await req.json();

    if (!role || (role !== "ADMIN" && role !== "REGISTRANT")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Don't allow an admin to change their own role to prevent lockout
    if (id === session.user.id) {
       return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
