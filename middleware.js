import NextAuthMiddleware from "next-auth/middleware";

export default NextAuthMiddleware;
export const middleware = NextAuthMiddleware;

export const config = {
  matcher: ["/profiil/:path*", "/vestlus/:path*"],
};
