function hasAirtableConfig(env) {
  return Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID && env.AIRTABLE_TABLE);
}

function hasGoogleSheetsConfig(env) {
  return Boolean(env.GOOGLE_SHEET_ID && env.N8N_WEBHOOK_URL);
}

export function getRuntimeConfig(env = process.env) {
  const storageMode = hasAirtableConfig(env)
    ? "airtable"
    : hasGoogleSheetsConfig(env)
    ? "google_sheets"
    : "unconfigured";

  return {
    siteUrl: env.NEXT_PUBLIC_SITE_URL || "",
    storageMode,
    airtable: {
      apiKey: env.AIRTABLE_API_KEY || "",
      baseId: env.AIRTABLE_BASE_ID || "",
      table: env.AIRTABLE_TABLE || "Leads",
    },
    googleSheets: {
      sheetId: env.GOOGLE_SHEET_ID || "",
    },
    n8nWebhookUrl: env.N8N_WEBHOOK_URL || "",
  };
}
