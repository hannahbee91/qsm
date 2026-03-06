import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "./components/SignOutButton";
import { ModalProvider } from "./components/ModalProvider";

import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}- Speed Meeting`,
  description: `${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"} Speed Meeting Service - Make new connections.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <ModalProvider>
            <nav className="navbar">
            <Link href="/" className="navbar-brand">
              <span className="rainbow-text">{process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}</span>
            </Link>
            <div className="navbar-menu">
              {session?.user ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="nav-link">Admin Dashboard</Link>
                  )}
                  <Link href="/registrant" className="nav-link">My Dashboard</Link>
                  <SignOutButton />
                </>
              ) : (
                <div className="flex gap-2 items-center">
                  <Link href="/auth/signin" className="btn btn-outline">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
          <main>
            {children}
          </main>
          <Footer />
          </ModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
