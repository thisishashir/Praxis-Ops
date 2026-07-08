import { getRuntimeConfig } from "./_lib/config.js";
import { getLeadStatus } from "./_lib/storage.js";
import { rejectMethod, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (rejectMethod(req, res, "GET")) {
    return;
  }

  const config = getRuntimeConfig();
  const leadId = String(req.query?.lead_id || "").trim();

  if (!leadId) {
    sendJson(res, 200, {
      ok: true,
      service: "praxis-ops-lead-api",
      storage_mode: config.storageMode,
      n8n_configured: Boolean(config.n8nWebhookUrl),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const status = await getLeadStatus(leadId, config);
    sendJson(res, 200, {
      ok: true,
      lead_id: leadId,
      status,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Failed to fetch lead status.",
      details: error instanceof Error ? error.message : "Unknown status error",
    });
  }
}
