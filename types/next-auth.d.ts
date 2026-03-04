import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "REGISTRANT";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "REGISTRANT";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "ADMIN" | "REGISTRANT";
  }
}
