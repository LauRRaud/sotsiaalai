import { NextResponse } from "next/server";
import { runCareerAgentRequestBody } from "../../../../lib/career-agent/api/runCareerAgent.js";

export async function POST(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON body.",
      },
      { status: 400 }
    );
  }

  const result = await runCareerAgentRequestBody(payload);

  return NextResponse.json(result.body, {
    status: result.status,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Method not allowed. Use POST.",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}
