// middleware.js (NextAuth v4)
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/profiil/:path*", "/vestlus/:path*"],
};
