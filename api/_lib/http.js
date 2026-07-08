export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export function rejectMethod(req, res, method) {
  if (req.method !== method) {
    sendJson(res, 405, {
      ok: false,
      error: `Method ${req.method} not allowed. Use ${method}.`,
    });
    return true;
  }

  return false;
}
