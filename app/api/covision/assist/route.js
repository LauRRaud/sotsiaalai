import { json } from "@/lib/documents/server";
import {
  buildCovisionAssist,
  getVisibleCovisionCase,
  serializeCovisionCase
} from "@/lib/covision";
import {
  covisionErrorResponse,
  covisionLocale,
  requireCovisionAuth
} from "@/lib/covisionApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  const locale = covisionLocale(request);
  try {
    const auth = await requireCovisionAuth();
    const body = await request.json().catch(() => ({}));
    let covisionCase = body?.case || {};
    if (body?.caseId) {
      const record = await getVisibleCovisionCase(auth, String(body.caseId));
      if (!record) {
        return covisionErrorResponse({ message: "api.common.not_found", status: 404 }, locale);
      }
      covisionCase = serializeCovisionCase(record, auth);
    }
    const result = buildCovisionAssist({
      action: body?.action,
      covisionCase,
      description: body?.description,
      messages: body?.messages
    });
    return json({
      ok: true,
      ...result
    });
  } catch (error) {
    return covisionErrorResponse(error, locale, "[covision] assist failed", "covision.errors.assist_failed");
  }
}
