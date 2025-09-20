// middleware.js
export { auth as middleware } from "./auth.js";

export const config = {
  matcher: ["/profiil/:path*", "/vestlus/:path*"],
};
