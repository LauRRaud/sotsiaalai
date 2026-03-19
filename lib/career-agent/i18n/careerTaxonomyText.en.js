export const careerTaxonomyTextEn = Object.freeze({
  errors: {
    clientRequiresBaseUrl: "The OSKA API client requires a baseUrl value.",
    missingEndpoint: "Missing endpoint for the OSKA resource type.",
    requestFailed: "OSKA API request failed with status",
    invalidJson: "OSKA API did not return JSON.",
    unknownApiError: "Unknown OSKA API error.",
    refreshError: "Unknown taxonomy refresh error.",
    refreshFailed: "Failed to refresh career taxonomy.",
    notReady: "Career taxonomy is not ready. Call ensureReady() first.",
    sharedConfigMismatch:
      "Shared career taxonomy service already exists with different configuration.",
  },
});
