// pages/api/auth/[...nextauth].js
import NextAuthImport from "next-auth";
import { authConfig } from "@/auth"; // sinu juurkausta auth.js

// Fallback, kui NextAuth ekspordib kas default või nimega
const NextAuth = NextAuthImport?.default ?? NextAuthImport;

// Vana ühilduvus (nt serverides, kus kasutatakse import("@/pages/api/auth/[...nextauth]"))
export const authOptions = authConfig;
export const config = { runtime: "nodejs" };

export default NextAuth(authOptions);
