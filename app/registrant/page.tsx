import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RegistrantDashboard from "./components/RegistrantDashboard";

export default async function RegistrantPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Reload full user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return <div>User not found.</div>;
  }
  
  if (user.suspended) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-error)' }}>Account Suspended</h2>
        <p>Your account has been suspended from {process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}. Please contact support.</p>
      </div>
    );
  }

  // Fetch events
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { status: "UPCOMING" },
        { registrations: { some: { userId: user.id } } }
      ]
    },
    orderBy: { date: "asc" },
    include: {
      registrations: { where: { userId: user.id } }
    }
  });

  // Find closed events the user attended that still need feedback
  const closedRegistered = events.filter(
    e => e.status === "CLOSED" && e.registrations.length > 0
  );

  // Check which ones already have responses from this user
  const respondedEventIds = closedRegistered.length > 0
    ? (await prisma.matchResponse.findMany({
        where: {
          sourceUserId: user.id,
          eventId: { in: closedRegistered.map(e => e.id) }
        },
        select: { eventId: true },
        distinct: ["eventId"]
      })).map(r => r.eventId)
    : [];

  const pendingFeedback = closedRegistered.map(e => ({
    ...e,
    hasResponded: respondedEventIds.includes(e.id)
  }));

  return (
    <div>
      <h1 className="mb-4">Welcome, <span className="rainbow-text">{user.name || "friend"}</span>!</h1>
      <RegistrantDashboard initialUser={user} initialEvents={events} pendingFeedback={pendingFeedback} />
    </div>
  );
}
