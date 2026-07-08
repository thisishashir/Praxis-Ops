export async function triggerN8nWebhook(leadRecord, config) {
  if (!config.n8nWebhookUrl) {
    return {
      attempted: false,
      reason: "N8N_WEBHOOK_URL is not configured.",
    };
  }

  const payload = {
    event: "new_lead",
    lead_id: leadRecord.leadId,
    name: leadRecord.name,
    phone: leadRecord.phone,
    email: leadRecord.email,
    company: leadRecord.company,
    industry: leadRecord.industry,
    currentProcess: leadRecord.process,
    desiredOutcome: leadRecord.goal,
    notes: leadRecord.notes,
    form_type: leadRecord.formType,
  };

  const response = await fetch(config.n8nWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`n8n webhook failed (${response.status}): ${details}`);
  }

  return {
    attempted: true,
    delivered: true,
  };
}
