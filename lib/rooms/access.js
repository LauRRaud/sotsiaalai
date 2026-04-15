export function hasRoomBillingAccess({
  userRole,
  membership,
  hasActiveSubscription,
  room
}) {
  if (userRole === "ADMIN") {
    return {
      ok: true,
      billingSource: "ADMIN"
    };
  }

  if (!membership) {
    return {
      ok: false,
      billingSource: null
    };
  }

  if (room?.helpMatch) {
    return {
      ok: true,
      billingSource: "HELP_MATCH_FREE"
    };
  }

  if (hasActiveSubscription) {
    return {
      ok: true,
      billingSource: "SELF"
    };
  }

  return {
    ok: false,
    billingSource: String(membership?.billingSource || "").toUpperCase() || null
  };
}
