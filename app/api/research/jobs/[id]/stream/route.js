import { NextResponse } from "next/server";
import { requireResearchAuth } from "@/lib/research/auth";
import {
  assertResearchAccess,
  getResearchJob,
  getResearchJobSnapshot,
  markResearchFailed,
  subscribeResearchJob,
} from "@/lib/research/jobStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function toSse(event, payload) {
  return `event: ${event}\ndata: ${JSON.stringify(payload || {})}\n\n`;
}

export async function GET(req, { params }) {
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

  const jobId = String(params?.id || "").trim();
  const job = getResearchJob(jobId);
  const jobSnapshot = job || await getResearchJobSnapshot(jobId);
  if (!jobSnapshot) {
    return NextResponse.json(
      { ok: false, messageKey: "research.error.not_found", message: "research.error.not_found" },
      { status: 404 }
    );
  }
  if (!assertResearchAccess(jobSnapshot, auth.userId)) {
    return NextResponse.json(
      { ok: false, messageKey: "api.common.forbidden", message: "api.common.forbidden" },
      { status: 403 }
    );
  }

  const encoder = new TextEncoder();
  let unsub = null;
  let closed = false;
  let heartbeat = null;

  const stream = new ReadableStream({
    start(controller) {
      const closeStream = () => {
        if (closed) return;
        closed = true;
        try {
          if (heartbeat) {
            clearInterval(heartbeat);
            heartbeat = null;
          }
          unsub?.();
        } catch {}
        try {
          controller.close();
        } catch {}
      };

      const emit = evt => {
        if (closed) return;
        const eventType = String(evt?.type || "message");
        try {
          controller.enqueue(encoder.encode(toSse(eventType, evt)));
        } catch {
          closeStream();
          return;
        }
        if (
          eventType === "done" ||
          (eventType === "status" &&
            (evt?.status === "done" || evt?.status === "error" || evt?.status === "cancelled"))
        ) {
          closeStream();
        }
      };

      if (!job) {
        const status = String(jobSnapshot.status || "").trim();
        if (status === "done") {
          emit({ type: "result", result: jobSnapshot.result || null, metrics: jobSnapshot.metrics || null });
          emit({ type: "status", status: "done" });
          emit({ type: "done" });
          return;
        }
        if (status === "error" || status === "cancelled") {
          emit({ type: "error", message: jobSnapshot.error || "research.error.failed", metrics: jobSnapshot.metrics || null });
          emit({ type: "status", status });
          emit({ type: "done" });
          return;
        }
        markResearchFailed(jobSnapshot, "research.error.interrupted").finally(() => {
          emit({ type: "error", message: "research.error.interrupted" });
          emit({ type: "status", status: "error" });
          emit({ type: "done" });
        });
        return;
      }

      unsub = subscribeResearchJob(jobId, emit);
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          closeStream();
        }
      }, 15_000);

      try {
        req.signal?.addEventListener(
          "abort",
          () => {
            closeStream();
          },
          { once: true }
        );
      } catch {}

      if (job.status === "done" || job.status === "error" || job.status === "cancelled") {
        emit({ type: "done" });
      }
    },
    cancel() {
      try {
        if (heartbeat) clearInterval(heartbeat);
        unsub?.();
      } catch {}
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
