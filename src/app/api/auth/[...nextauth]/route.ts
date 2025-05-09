import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isUserAllowed } from "@/lib/users";
import type { User } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user.email) {
        return false;
      }
      return isUserAllowed(user.email);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 