import { prisma } from './prisma';
import crypto from 'crypto';

/**
 * Generate a magic sign-in link that redirects to a specific page after authentication.
 * Uses NextAuth's VerificationToken model to create a valid token.
 * Uses the NEXTAUTH_URL environment variable as the base URL.
 */
export async function generateMagicLink(
  email: string,
  redirectPath: string,
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const callbackUrl = encodeURIComponent(`${baseUrl}${redirectPath}`);
  return `${baseUrl}/api/auth/callback/nodemailer?callbackUrl=${callbackUrl}&token=${token}&email=${encodeURIComponent(email)}`;
}
