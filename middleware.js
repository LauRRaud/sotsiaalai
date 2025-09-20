// middleware.js
export { default as middleware } from "next-auth/middleware";

export const config = {
  matcher: ["/profiil/:path*", "/vestlus/:path*"],
};
