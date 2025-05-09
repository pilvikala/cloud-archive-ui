import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isUserAllowed } from "@/lib/users";

const handler = NextAuth({
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
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      return isUserAllowed(user.email);
    },
  },
});

export { handler as GET, handler as POST }; 