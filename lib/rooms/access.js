export function hasRoomBillingAccess({ userRole, membership, hasActiveSubscription }) {
  if (userRole === "ADMIN") {
    return {
      ok: true,
      billingSource: "ADMIN"
    }
  }

  if (!membership) {
    return {
      ok: false,
      billingSource: null
    }
  }

  if (hasActiveSubscription) {
    return {
      ok: true,
      billingSource: "SELF"
    }
  }

  return {
    ok: false,
    billingSource: String(membership?.billingSource || "").toUpperCase() || null
  }
}
