import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminDashboard from "./components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/"); // Not authorized
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: { select: { registrations: true, matchResponses: true } },
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/settings/password" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            Change Password
          </Link>
          <Link href="/admin/users" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            Manage Users →
          </Link>
        </div>
      </div>
      <AdminDashboard initialEvents={events} />
    </div>
  );
}
