import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { transporter } from "@/lib/email";
import { matchResultsEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { eventId } = await req.json();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: { include: { user: true } },
      matchResponses: true,
    },
  });

  if (!event || event.status !== "CLOSED") {
    return NextResponse.json({ error: "Event not found or not closed" }, { status: 400 });
  }

  const participants = event.registrations.map(r => r.user);
  const responses = event.matchResponses;

  const matchResults: Record<string, any[]> = {};
  
  participants.forEach(p => {
    matchResults[p.id] = [];
  });

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];

      const p1ToP2 = responses.find(r => r.sourceUserId === p1.id && r.targetUserId === p2.id);
      const p2ToP1 = responses.find(r => r.sourceUserId === p2.id && r.targetUserId === p1.id);

      if (p1ToP2 && p2ToP1) {
        const mutualCategories = [];
        if (p1ToP2.platonic && p2ToP1.platonic) mutualCategories.push("Platonic Friendship");
        if (p1ToP2.fwb && p2ToP1.fwb) mutualCategories.push("Friends with Benefits");
        if (p1ToP2.monogamous && p2ToP1.monogamous) mutualCategories.push("Monogamous Dating");
        if (p1ToP2.nonmonogamous && p2ToP1.nonmonogamous) mutualCategories.push("Nonmonagamous Dating");

        if (mutualCategories.length > 0) {
          const p1ContactInfo = [
            p1.discord && `Discord: ${p1.discord}`,
            p1.instagram && `Instagram: ${p1.instagram}`,
            p1.phoneNumber && `Phone: ${p1.phoneNumber}`,
            p1.contactEmail && `Email: ${p1.contactEmail}`
          ].filter(Boolean).join(" · ");

          const p2ContactInfo = [
            p2.discord && `Discord: ${p2.discord}`,
            p2.instagram && `Instagram: ${p2.instagram}`,
            p2.phoneNumber && `Phone: ${p2.phoneNumber}`,
            p2.contactEmail && `Email: ${p2.contactEmail}`
          ].filter(Boolean).join(" · ");

          matchResults[p1.id].push({
            name: p2.name,
            pronouns: p2.pronouns || "Ask",
            categories: mutualCategories,
            contact: p2ContactInfo || "No contact info provided"
          });

          matchResults[p2.id].push({
            name: p1.name,
            pronouns: p1.pronouns || "Ask",
            categories: mutualCategories,
            contact: p1ContactInfo || "No contact info provided"
          });
        }
      }
    }
  }

  try {
    for (const p of participants) {
      if (!p.email) continue;
      
      const matches = matchResults[p.id];
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: p.email,
        subject: `Your Matches for ${event.title}`,
        html: matchResultsEmail(event, matches),
      });
    }

    return NextResponse.json({ message: "Match emails sent successfully" });
  } catch (error) {
    console.error("Match email error:", error);
    return NextResponse.json({ error: "Failed to send match emails" }, { status: 500 });
  }
}

