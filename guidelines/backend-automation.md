# Praxis Ops Simple Backend

This project now includes a minimal serverless backend for:

- Capturing leads from website forms
- Storing leads in Airtable or Google Sheets mode
- Triggering n8n immediately after lead capture
- Exposing a status endpoint

No traditional backend server, database, auth, admin, queue, or microservices are used.

## Added Structure

```text
api/
  lead.js
  status.js
  _lib/
    config.js
    http.js
    lead.js
    storage.js
    webhook.js
.env.example
vercel.json
```

## API Endpoints

### POST /api/lead

Validates and stores lead, retries storage once on failure, then triggers n8n asynchronously.

Required fields:

- name
- phone

Accepted payload:

```json
{
  "name": "",
  "phone": "",
  "email": "",
  "company": "",
  "industry": "",
  "process": "",
  "goal": "",
  "notes": "",
  "formType": "connect_with_praxis"
}
```

Response:

```json
{
  "ok": true,
  "lead_id": "lead_...",
  "message": "Your request has entered the Praxis pipeline. Our support team will contact you shortly.",
  "storage": "airtable",
  "n8n_trigger_queued": true
}
```

### GET /api/status

- Health mode: `GET /api/status`
- Lead mode: `GET /api/status?lead_id=lead_...`

In Airtable mode, lead status lookup returns mapped fields.
In Google Sheets mode, status is expected to be managed by n8n updates.

## Storage Modes

### Airtable Mode

Activated when these variables are set:

- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE

Expected table name: `Leads`

Recommended columns:

- Lead ID
- Created At
- Name
- Phone
- Email
- Company
- Industry
- Current Process
- Desired Outcome
- Status
- Lead Score
- Call Status
- Appointment
- CRM Assigned
- n8n Triggered

Default status written by API: `NEW`

### Google Sheets Mode

Activated when these variables are set:

- GOOGLE_SHEET_ID
- N8N_WEBHOOK_URL

In this mode, storage is sent to n8n as `event: store_lead` and n8n should append into your `Leads` sheet.

Recommended sheet columns:

- Timestamp
- Lead ID
- Name
- Phone
- Email
- Company
- Industry
- Goal
- Status
- Score
- Booked
- Advisor

## n8n Webhook Contract

After successful storage, API triggers webhook asynchronously:

```json
{
  "event": "new_lead",
  "lead_id": "lead_...",
  "name": "...",
  "phone": "...",
  "company": "...",
  "goal": "...",
  "form_type": "connect_with_praxis"
}
```

The API does not wait for workflow completion and responds immediately.

## Environment Variables

Use only:

- NEXT_PUBLIC_SITE_URL
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE
- GOOGLE_SHEET_ID
- N8N_WEBHOOK_URL

## Local Testing

Use Vercel dev to test serverless routes locally:

```bash
npx vercel dev
```

Then test endpoints:

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"John","phone":"+1 (555) 123-4567","email":"john@example.com","company":"Acme","industry":"Real Estate","process":"Manual follow up","goal":"Book more site visits"}'
```

```bash
curl http://localhost:3000/api/status
```

```bash
curl "http://localhost:3000/api/status?lead_id=lead_123"
```

## Deployment (Vercel)

1. Import repository into Vercel.
2. Add environment variables from `.env.example`.
3. Deploy.

Frontend remains static Vite output, and `/api/*` routes run as Vercel serverless functions.
