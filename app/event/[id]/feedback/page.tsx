import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FeedbackForm from "./components/FeedbackForm";

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;

  // Verify the user is registered for this event
  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId: id } }
  });

  if (!registration) {
    return (
      <div className="card text-center mt-4">
        <h2>Not Authorized</h2>
        <p>You did not register for this event.</p>
      </div>
    );
  }

  // Get the event to verify it's closed
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: true }
      }
    }
  });

  if (!event || event.status !== "CLOSED") {
    return (
      <div className="card text-center mt-4">
        <h2>Feedback Unavailable</h2>
        <p>This event is not closed yet or does not exist.</p>
      </div>
    );
  }

  // Reload user to get contact info
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Get other participants
  const otherParticipants = event.registrations
    .map(r => r.user)
    .filter(u => u.id !== session.user.id);

  // Get existing responses from this user for this event
  const existingResponses = await prisma.matchResponse.findMany({
    where: { sourceUserId: session.user.id, eventId: id }
  });

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="rainbow-text mb-2 text-center">{event.title} Feedback</h1>
      <p className="text-center mb-4 text-muted">
        Select the categories you'd be interested in for each person you met. 
        Matches are mutually calculated and contact info is only shared on a match.
      </p>
      <FeedbackForm 
        eventId={event.id}
        participants={otherParticipants} 
        existingResponses={existingResponses}
        userContact={{
          discord: user?.discord || "",
          instagram: user?.instagram || "",
          phoneNumber: user?.phoneNumber || "",
          contactEmail: user?.contactEmail || ""
        }}
      />
    </div>
  );
}
