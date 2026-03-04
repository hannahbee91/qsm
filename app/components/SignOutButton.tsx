"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })} 
      className="btn btn-outline" 
      style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
    >
      Sign Out
    </button>
  );
}
