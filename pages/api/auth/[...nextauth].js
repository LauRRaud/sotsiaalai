// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import { authConfig } from "@/auth";

export default NextAuth(authConfig);
