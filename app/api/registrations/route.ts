import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { transporter } from "@/lib/email";
import { generateICS } from "@/lib/calendar";
import { inviteEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== "UPCOMING") {
      return NextResponse.json({ error: "Cannot register for this event" }, { status: 400 });
    }

    const registration = await prisma.registration.create({
      data: {
        userId: session.user.id,
        eventId: event.id
      }
    });

    // Send invite email with calendar attachment (fire-and-forget)
    const userEmail = session.user.email;
    if (userEmail) {
      const icsData = generateICS(event);
      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `Your Invite: ${event.title}`,
        html: inviteEmail(event),
        icalEvent: {
          filename: "invite.ics",
          method: "request",
          content: icsData,
        },
      }).catch((err: unknown) => console.error("Failed to send invite email:", err));
    }

    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    // Unique constraint failed = already registered
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
