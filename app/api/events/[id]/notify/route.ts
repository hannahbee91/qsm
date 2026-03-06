import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { transporter } from "@/lib/email";
import { generateICS } from "@/lib/calendar";
import { inviteEmail, cancellationEmail, feedbackFormEmail } from "@/lib/email-templates";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { type } = await req.json(); // "INVITE", "CANCEL", "FORM"

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const emails = event.registrations
    .map((reg) => reg.user.email)
    .filter((email): email is string => !!email);

  if (emails.length === 0) {
    return NextResponse.json({ message: "No registered users to email" });
  }

  try {
    if (type === "INVITE") {
      const icsData = generateICS(event);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: "Undisclosed recipients",
        bcc: emails,
        subject: `Your Invite: ${event.title}`,
        html: inviteEmail(event),
        icalEvent: {
          filename: "invite.ics",
          method: "request",
          content: icsData,
        },
      });
    } else if (type === "CANCEL") {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: "Undisclosed recipients",
        bcc: emails,
        subject: `Cancelled: ${event.title}`,
        html: cancellationEmail(event),
      });
    } else if (type === "FORM") {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
      for (const reg of event.registrations) {
        if (!reg.user.email) continue;
        const linkUrl = `${baseUrl}/event/${event.id}/feedback`;
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: reg.user.email,
          subject: `Feedback Form: ${event.title}`,
          html: feedbackFormEmail(event, linkUrl),
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid email type expected 'INVITE', 'CANCEL' or 'FORM'" }, { status: 400 });
    }

    return NextResponse.json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}

