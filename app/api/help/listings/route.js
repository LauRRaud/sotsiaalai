import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import {
  listHelpOfferListingViews,
  listHelpOffers,
  listHelpRequestListingViews,
  listHelpRequests
} from "@/lib/help";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

function json(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: NO_STORE_HEADERS
  });
}

async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return null;
    return {
      userId: session.user.id,
      role: session.user.role
    };
  } catch {
    return null;
  }
}

function normalizeKind(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "offer" ? "offer" : normalized === "request" ? "request" : "";
}

export async function GET(request) {
  const auth = await requireUser();
  if (!auth) {
    return json({ ok: false, message: "api.common.unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const kind = normalizeKind(url.searchParams.get("kind"));
  const scope = String(url.searchParams.get("scope") || "global").trim().toLowerCase() === "mine" ? "mine" : "global";
  const locale = String(url.searchParams.get("locale") || "et").trim();
  const status = String(url.searchParams.get("status") || "").trim();
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 10));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

  if (!kind) {
    return json({ ok: false, message: "HELP_LISTING_KIND_REQUIRED" }, 400);
  }

  const baseFilters = {
    limit: limit + 1,
    offset,
    ...(status ? { status } : {}),
    ...(scope === "mine" ? { userId: auth.userId } : {})
  };

  if (kind === "request") {
    const [items, records] = await Promise.all([
      listHelpRequestListingViews(baseFilters, { locale }),
      listHelpRequests(baseFilters)
    ]);
    const hasMore = items.length > limit;
    const slicedItems = items.slice(0, limit);
    const slicedRecords = records.slice(0, limit);

    return json({
      ok: true,
      kind,
      scope,
      items: slicedItems.map((item, index) => ({
        ...item,
        isOwn: slicedRecords[index]?.userId === auth.userId
      })),
      nextOffset: hasMore ? offset + limit : null
    });
  }

  const [items, records] = await Promise.all([
    listHelpOfferListingViews(baseFilters, { locale }),
    listHelpOffers(baseFilters)
  ]);
  const hasMore = items.length > limit;
  const slicedItems = items.slice(0, limit);
  const slicedRecords = records.slice(0, limit);

  return json({
    ok: true,
    kind,
    scope,
    items: slicedItems.map((item, index) => ({
      ...item,
      isOwn: slicedRecords[index]?.userId === auth.userId
    })),
    nextOffset: hasMore ? offset + limit : null
  });
}
