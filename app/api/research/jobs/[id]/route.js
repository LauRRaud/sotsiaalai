import { NextResponse } from "next/server";
import { requireResearchAuth } from "@/lib/research/auth";
import {
  assertResearchAccess,
  cancelResearchJob,
  getResearchJob,
  getResearchJobResult,
} from "@/lib/research/jobStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function errorJson(messageKey, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      messageKey,
      message: messageKey,
    },
    { status }
  );
}

function getAndAuthorizeJob(params, userId) {
  const jobId = String(params?.id || "").trim();
  const job = getResearchJob(jobId);
  if (!job) {
    return { ok: false, response: errorJson("research.error.not_found", 404) };
  }
  if (!assertResearchAccess(job, userId)) {
    return { ok: false, response: errorJson("api.common.forbidden", 403) };
  }
  return { ok: true, jobId, job };
}

export async function GET(_req, { params }) {
  const auth = await requireResearchAuth();
  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        messageKey: auth.message,
        message: auth.message,
        requireSubscription: auth.requireSubscription,
        redirect: auth.redirect,
      },
      { status: auth.status }
    );
  }
  const check = getAndAuthorizeJob(params, auth.userId);
  if (!check.ok) return check.response;
  return NextResponse.json({
    ok: true,
    job: getResearchJobResult(check.jobId),
  });
}

export async function DELETE(_req, { params }) {
  const auth = await requireResearchAuth();
  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        messageKey: auth.message,
        message: auth.message,
        requireSubscription: auth.requireSubscription,
        redirect: auth.redirect,
      },
      { status: auth.status }
    );
  }
  const check = getAndAuthorizeJob(params, auth.userId);
  if (!check.ok) return check.response;
  cancelResearchJob(check.job, "research.error.cancelled");
  return NextResponse.json({ ok: true, status: "cancelled" });
}
