import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SetupForm from "./components/SetupForm";

export default async function SetupPage() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  
  if (adminCount > 0) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="card rainbow-border" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-2 text-center">Initial Setup</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: '0.95rem' }}>
          Welcome to Queer Speed Meet! Create the first Administrator account to get started.
        </p>
        <SetupForm />
      </div>
    </div>
  );
}
