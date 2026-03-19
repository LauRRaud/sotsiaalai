// Compatibility wrapper for legacy pages/api callers.
// The main career-agent run logic lives in the shared handler under lib/career-agent/run.js.
import { runCareerAgentRequestBody } from "../../../lib/career-agent/api/runCareerAgent.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

// Compatibility wrapper for legacy pages/api callers.
// Main logic lives in lib/career-agent/api/runCareerAgent.js.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  const result = await runCareerAgentRequestBody(req.body);
  return res.status(result.status).json(result.body);
}
