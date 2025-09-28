import NextAuthImport from "next-auth";
import { authConfig } from "@/auth"; // sinu juurkausta auth.js
const NextAuth = NextAuthImport?.default ?? NextAuthImport;
export const authOptions = authConfig;   // nii saavad vanad importid töötada
export default NextAuth(authOptions);