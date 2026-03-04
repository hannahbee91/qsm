import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { suspended } = await req.json();

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { suspended: !!suspended }
    });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user suspension status" }, { status: 500 });
  }
}
