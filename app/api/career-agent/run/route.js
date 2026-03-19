import { NextResponse } from "next/server";
import { runCareerAgentRequestBody } from "../../../../lib/career-agent/api/runCareerAgent.js";
import { persistCareerGeneratedDocument } from "../../../../lib/career-agent/documents/careerDocumentPersistence.js";

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

  if (result?.ok && result?.body?.ok && result?.body?.result?.generatedDocument) {
    try {
      const persistedArtifact = await persistCareerGeneratedDocument(
        result.body.result.generatedDocument,
        {
          cookieSource: request.cookies,
        }
      );

      if (persistedArtifact) {
        result.body.result.generatedDocument = {
          ...result.body.result.generatedDocument,
          persistedArtifact,
        };
      }
    } catch (error) {
      console.error("career-agent document persistence error:", error);
      result.body.meta = {
        ...(result.body.meta || {}),
        documentPersistenceWarning:
          error instanceof Error ? error.message : "Document persistence failed.",
      };
    }
  }

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
