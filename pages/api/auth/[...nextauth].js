import NextAuth from "next-auth";
import { authConfig } from "@/auth";

const handler = NextAuth(authConfig);

export default handler;
