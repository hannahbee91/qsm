import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId, targetUserId, platonic, fwb, monogamous, nonmonogamous } = await req.json();

    const response = await prisma.matchResponse.upsert({
      where: {
        sourceUserId_targetUserId_eventId: {
          sourceUserId: session.user.id,
          targetUserId,
          eventId
        }
      },
      update: { platonic, fwb, monogamous, nonmonogamous },
      create: {
        sourceUserId: session.user.id,
        targetUserId,
        eventId,
        platonic, fwb, monogamous, nonmonogamous
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
