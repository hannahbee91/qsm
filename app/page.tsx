import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    redirect("/setup");
  }

  const session = await auth();

  // If already logged in, redirect to the appropriate dashboard
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/registrant");
    }
  }

  return (
    <HomeClient appName={process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"} />
  );
}
