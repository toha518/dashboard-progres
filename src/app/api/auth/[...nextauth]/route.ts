import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username },
          });

          if (!admin) {
            console.error("Admin not found:", credentials.username);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isValid) {
            console.error("Invalid password for:", credentials.username);
            return null;
          }

          return { id: String(admin.id), name: admin.username };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
