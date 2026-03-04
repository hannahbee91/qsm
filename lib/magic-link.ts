import { prisma } from "./prisma";
import crypto from "crypto";
import { headers } from "next/headers";

/**
 * Generate a magic sign-in link that redirects to a specific page after authentication.
 * Uses NextAuth's VerificationToken model to create a valid token.
 * Derives the base URL from the incoming request headers to preserve the host.
 */
export async function generateMagicLink(email: string, redirectPath: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  // Derive base URL from the request's Host header to preserve tunneled/proxied hosts
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  const callbackUrl = encodeURIComponent(`${baseUrl}${redirectPath}`);
  return `${baseUrl}/api/auth/callback/nodemailer?callbackUrl=${callbackUrl}&token=${token}&email=${encodeURIComponent(email)}`;
}

