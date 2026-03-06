"use server";

import { prisma } from "@/lib/prisma";

export async function checkEmailExists(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return !!user;
}
