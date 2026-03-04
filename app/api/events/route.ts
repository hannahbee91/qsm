import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admins see all events, Registrants see upcoming events and events they are registered for
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: {
        _count: { select: { registrations: true, matchResponses: true } }
      }
    });
    return NextResponse.json(events);
  } else {
    // Registrants can see UPCOMING events and events they registered for
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { status: "UPCOMING" },
          { registrations: { some: { userId: session.user.id } } }
        ]
      },
      orderBy: { date: "asc" },
      include: {
        registrations: { where: { userId: session.user.id } }
      }
    });
    return NextResponse.json(events);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, date, address } = await req.json();
    
    if (!title || !date) {
      return NextResponse.json({ error: "Title and Date are required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        address: address || null,
      }
    });

    // Auto-notify all non-suspended registrants about the new event
    try {
      const { transporter } = await import("@/lib/email");
      const { generateMagicLink } = await import("@/lib/magic-link");
      const { newEventAnnouncementEmail } = await import("@/lib/email-templates");

      const registrants = await prisma.user.findMany({
        where: { role: "REGISTRANT", suspended: false, notifyNewEvents: true, email: { not: null } }
      });

      for (const user of registrants) {
        if (!user.email) continue;
        const magicLink = await generateMagicLink(user.email, "/registrant");
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `New Event: ${event.title}`,
          html: newEventAnnouncementEmail(event, magicLink),
        });
      }
    } catch (emailError) {
      console.error("Failed to send new event notifications:", emailError);
      // Don't fail the event creation if emails fail
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, title, date, status, address } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (date) dataToUpdate.date = new Date(date);
    if (status) dataToUpdate.status = status; // UPCOMING, CANCELLED, CLOSED
    if (address !== undefined) dataToUpdate.address = address || null;

    const event = await prisma.event.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
