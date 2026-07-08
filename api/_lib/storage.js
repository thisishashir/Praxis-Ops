function toAirtableFields(record) {
  return {
    Name: record.name,
    Phone: record.phone,
    Email: record.email,
    Company: record.company,
    Industry: record.industry,
    "Current Process": record.process,
    "Desired Outcome": record.goal,
    Notes: record.notes,
    Status: record.status,
    "Lead Score": 0,
    "Call Status": record.callStatus,
    "CRM Assigned": record.crmAssigned,
    "n8n Triggered": String(record.n8nTriggered),
  };
}

function toGoogleSheetsPayload(record, config) {
  return {
    event: "store_lead",
    mode: "google_sheets",
    sheet_id: config.googleSheets.sheetId,
    row: {
      Timestamp: record.createdAt,
      "Lead ID": record.leadId,
      Name: record.name,
      Phone: record.phone,
      Email: record.email,
      Company: record.company,
      Industry: record.industry,
      Goal: record.goal,
      Status: record.status,
      Score: record.leadScore,
      Booked: record.appointment,
      Advisor: record.crmAssigned,
      Notes: record.notes,
      "Form Type": record.formType,
    },
  };
}

async function saveToAirtable(record, config) {
  const url = `https://api.airtable.com/v0/${config.airtable.baseId}/${encodeURIComponent(config.airtable.table)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.airtable.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [{ fields: toAirtableFields(record) }],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Airtable save failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  return {
    provider: "airtable",
    id: data?.records?.[0]?.id || null,
  };
}

async function saveToGoogleSheetsViaN8n(record, config) {
  const response = await fetch(config.n8nWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toGoogleSheetsPayload(record, config)),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Sheets storage bridge failed (${response.status}): ${details}`);
  }

  return {
    provider: "google_sheets",
    id: record.leadId,
  };
}

export async function saveLeadRecord(record, config) {
  if (config.storageMode === "airtable") {
    return saveToAirtable(record, config);
  }

  if (config.storageMode === "google_sheets") {
    return saveToGoogleSheetsViaN8n(record, config);
  }

  throw new Error("Storage is not configured. Set Airtable or Google Sheets environment variables.");
}

function toStatusPayload(record) {
  const fields = record?.fields || {};
  return {
    leadId: fields["Lead ID"] || "",
    status: fields.Status || "NEW",
    callStatus: fields["Call Status"] || "PENDING",
    score: fields["Lead Score"] || "",
    appointment: fields.Appointment || "",
    advisor: fields["CRM Assigned"] || "",
    crm: fields.CRM || "",
  };
}

export async function getLeadStatus(leadId, config) {
  if (config.storageMode !== "airtable") {
    return {
      supported: false,
      message: "Lead status lookup is supported in Airtable mode. In Google Sheets mode, status is managed by n8n updates.",
    };
  }

  const escapedLeadId = leadId.replace(/'/g, "\\'");
  const url = `https://api.airtable.com/v0/${config.airtable.baseId}/${encodeURIComponent(config.airtable.table)}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Lead ID}='${escapedLeadId}'`)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.airtable.apiKey}`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Airtable status lookup failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  const record = data?.records?.[0];

  if (!record) {
    return {
      supported: true,
      found: false,
      leadId,
    };
  }

  return {
    supported: true,
    found: true,
    ...toStatusPayload(record),
  };
}
