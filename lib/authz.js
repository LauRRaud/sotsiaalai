// lib/authz.js

/**
 * Kontrollib, kas antud kasutaja on admin.
 * Võtab vastu kas sessiooni (session.user) või otse user-objekti.
 *
 * @param {object} principal - sessioon või user objekt
 * @returns {boolean} true kui kasutajal on admini õigused
 */
export function isAdmin(principal) {
  if (!principal) return false;

  const user = principal.user ?? principal;
  if (!user) return false;

  return user.role === "ADMIN" || user.isAdmin === true;
}
