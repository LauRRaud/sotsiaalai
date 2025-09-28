export function isAdmin(principal) {
  if (!principal) return false;
  const user = principal.user ? principal.user : principal;
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.isAdmin === true) return true;
  return false;
}
