import NextAuth from "next-auth";
import { authConfig } from "@/auth"; // sinu juurkausta auth.js

export const authOptions = authConfig;   // nii saavad vanad importid töötada
export default NextAuth(authOptions);