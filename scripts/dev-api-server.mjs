import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';

import leadHandler from '../api/lead.js';
import statusHandler from '../api/status.js';

const port = Number(process.env.API_PORT || 3000);
const host = process.env.API_HOST || '127.0.0.1';
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(rootDir, '.env'));

function createResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      const rawBody = Buffer.concat(chunks).toString('utf8');

      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);
  const route = requestUrl.pathname || '';
  const response = createResponse(res);

  try {
    if (route === '/api/lead') {
      req.body = req.method === 'POST' ? await readBody(req) : {};
      req.query = Object.fromEntries(requestUrl.searchParams.entries());
      await leadHandler(req, response);
      return;
    }

    if (route === '/api/status') {
      req.body = {};
      req.query = Object.fromEntries(requestUrl.searchParams.entries());
      await statusHandler(req, response);
      return;
    }

    response.status(404).json({ ok: false, error: 'Not found.' });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: 'Local API server error.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, host, () => {
  console.log(`Local API server listening on http://${host}:${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);