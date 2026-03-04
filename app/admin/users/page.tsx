import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminUsersManager from "./components/AdminUsersManager";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    where: { role: "REGISTRANT" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      pronouns: true,
      suspended: true,
      contactEmail: true,
      phoneNumber: true,
      instagram: true,
      discord: true,
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-4">Manage Users</h1>
      <AdminUsersManager initialUsers={users} />
    </div>
  );
}
