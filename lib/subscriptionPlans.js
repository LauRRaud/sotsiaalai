const DEFAULT_GENERAL_AMOUNT = 7.99;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeSubscriptionRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "SOCIAL_WORKER") return "SOCIAL_WORKER";
  return "CLIENT";
}

export function getRolePlanKey(role) {
  return normalizeSubscriptionRole(role) === "SOCIAL_WORKER"
    ? "social_worker_monthly"
    : "client_monthly";
}

export function getRoleMonthlyAmount(role) {
  const generalFallback = toNumber(
    process.env.SUBSCRIPTION_MONTHLY_AMOUNT,
    DEFAULT_GENERAL_AMOUNT
  );

  if (normalizeSubscriptionRole(role) === "SOCIAL_WORKER") {
    return toNumber(
      process.env.SUBSCRIPTION_MONTHLY_AMOUNT_SOCIAL_WORKER,
      generalFallback
    );
  }

  return toNumber(
    process.env.SUBSCRIPTION_MONTHLY_AMOUNT_CLIENT,
    generalFallback
  );
}

export function getRolePlanDescription(role, locale = "et") {
  const effectiveRole = normalizeSubscriptionRole(role);

  switch (locale) {
    case "et":
      return effectiveRole === "SOCIAL_WORKER"
        ? "SotsiaalAI sotsiaaltöö spetsialisti kuutellimus"
        : "SotsiaalAI eluküsimusega pöörduja kuutellimus";
    case "ru":
      return effectiveRole === "SOCIAL_WORKER"
        ? "SotsiaalAI: ежемесячная подписка для специалиста по социальной работе"
        : "SotsiaalAI: ежемесячная подписка для человека, ищущего помощь";
    default:
      return effectiveRole === "SOCIAL_WORKER"
        ? "SotsiaalAI monthly subscription for social work specialists"
        : "SotsiaalAI monthly subscription for people seeking help";
  }
}

export function formatEuroAmount(amount, locale = "et") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${Number(amount || 0).toFixed(2)} EUR`;
  }
}
