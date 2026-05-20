import {
  applyKovWebSourcesCheck,
  checkKovWebSourcesFromWeb,
  getKovWebSourcesStatus
} from "@/lib/admin/rag/kovSourceMonitor/service";
import { errorJson, json, requireKovAdminSession } from "@/lib/admin/rag/kov/api";
import { safeError } from "@/lib/privacy/safeError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const auth = await requireKovAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    return json(await getKovWebSourcesStatus());
  } catch (error) {
    console.error("[kov-source-monitor] status failed", safeError(error));
    return errorJson("api.admin.kov.update_failed", 500, auth.locale);
  }
}

export async function POST(request) {
  const auth = await requireKovAdminSession(request);
  if (!auth.ok) return auth.response;

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const action = String(body?.action || "web-check");
    const result = action === "apply-check"
      ? await applyKovWebSourcesCheck()
      : await checkKovWebSourcesFromWeb({
          maxUrls: Number(body?.maxUrls || 0) || 0,
          slug: String(body?.slug || "").trim().toLowerCase()
        });
    const status = await getKovWebSourcesStatus();
    return json({
      ok: true,
      action,
      result,
      status
    });
  } catch (error) {
    console.error("[kov-source-monitor] action failed", safeError(error));
    return errorJson("api.admin.kov.update_failed", 500, auth.locale);
  }
}
