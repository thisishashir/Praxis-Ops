function toSafeString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

export function normalizePhone(rawPhone) {
  const input = toSafeString(rawPhone);
  const startsWithPlus = input.startsWith("+");
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return `${startsWithPlus ? "+" : ""}${digits}`;
}

export function createLeadId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `lead_${Date.now()}_${random}`;
}

export function parseLeadPayload(body = {}) {
  const lead = {
    name: toSafeString(body.name),
    phone: normalizePhone(body.phone),
    email: toSafeString(body.email),
    company: toSafeString(body.company),
    industry: toSafeString(body.industry),
    process: toSafeString(body.process || body.currentProcess),
    goal: toSafeString(body.goal || body.desiredOutcome),
    notes: toSafeString(body.notes || body.additionalNotes || body.message),
    formType: toSafeString(body.formType || "connect_with_praxis"),
  };

  return lead;
}

export function validateLeadPayload(lead) {
  const errors = [];

  if (!lead.name) {
    errors.push("name is required");
  }

  if (lead.formType !== "support" && !lead.phone) {
    errors.push("phone is required");
  }

  if (lead.phone && lead.phone.replace(/\D/g, "").length < 8) {
    errors.push("phone must have at least 8 digits");
  }

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.push("email is invalid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function toStorageLeadRecord(lead, leadId) {
  const nowIso = new Date().toISOString();

  return {
    leadId,
    createdAt: nowIso,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    company: lead.company,
    industry: lead.industry,
    process: lead.process,
    goal: lead.goal,
    notes: lead.notes,
    formType: lead.formType,
    status: "NEW",
    leadScore: "",
    callStatus: "PENDING",
    appointment: "",
    crmAssigned: "",
    n8nTriggered: false,
  };
}
