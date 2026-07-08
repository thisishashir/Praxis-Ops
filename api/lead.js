import { getRuntimeConfig } from "./_lib/config.js";
import { rejectMethod, sendJson } from "./_lib/http.js";
import {
  createLeadId,
  parseLeadPayload,
  toStorageLeadRecord,
  validateLeadPayload,
} from "./_lib/lead.js";
import { saveLeadRecord } from "./_lib/storage.js";
import { triggerN8nWebhook } from "./_lib/webhook.js";

async function saveWithSingleRetry(record, config) {
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await saveLeadRecord(record, config);
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        continue;
      }
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (rejectMethod(req, res, "POST")) {
    return;
  }

  const config = getRuntimeConfig();

  if (config.storageMode === "unconfigured") {
    sendJson(res, 500, {
      ok: false,
      error: "Storage is not configured. Set Airtable or Google Sheets environment variables.",
    });
    return;
  }

  const payload = parseLeadPayload(req.body || {});
  const validation = validateLeadPayload(payload);

  if (!validation.valid) {
    sendJson(res, 400, {
      ok: false,
      error: "Validation failed.",
      details: validation.errors,
    });
    return;
  }

  const leadId = createLeadId();
  const leadRecord = toStorageLeadRecord(payload, leadId);

  try {
    await saveWithSingleRetry(leadRecord, config);
  } catch (error) {
    sendJson(res, 503, {
      ok: false,
      error: "Failed to save lead after retry.",
      details: error instanceof Error ? error.message : "Unknown storage error",
    });
    return;
  }

  // Keep webhook non-blocking so the lead API responds immediately.
  void triggerN8nWebhook(leadRecord, config).catch((error) => {
    console.error("n8n webhook delivery failed:", error);
  });

  sendJson(res, 200, {
    ok: true,
    lead_id: leadId,
    message: "Your request has entered the Praxis pipeline. Our support team will contact you shortly.",
    storage: config.storageMode,
    n8n_trigger_queued: Boolean(config.n8nWebhookUrl),
  });
}
