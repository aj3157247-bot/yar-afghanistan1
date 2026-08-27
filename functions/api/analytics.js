/**
 * Yar Afghanistan — Live Analytics API
 * Cloudflare Pages Functions + D1
 *
 * Required binding:
 *   DB = Cloudflare D1 database
 *
 * POST /api/analytics
 * Body: { device_id, device_type, event }
 *
 * GET /api/analytics?summary=1
 * Returns aggregate live statistics.
 */

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value) {
  return String(value ?? "").trim();
}

function validDeviceType(value) {
  return value === "mobile" || value === "desktop" ? value : "desktop";
}

function validEvent(value) {
  const allowed = new Set(["visit", "heartbeat", "active"]);
  return allowed.has(value) ? value : "heartbeat";
}

function db(env) {
  return env?.DB;
}

async function ensureSchema(database) {
  await database.batch([
    database.prepare(`
      CREATE TABLE IF NOT EXISTS yar_devices (
        device_id TEXT PRIMARY KEY,
        device_type TEXT NOT NULL DEFAULT 'desktop',
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        visits INTEGER NOT NULL DEFAULT 0,
        events INTEGER NOT NULL DEFAULT 0
      )
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS yar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        device_type TEXT NOT NULL,
        event TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_yar_devices_last_seen
      ON yar_devices(last_seen)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_yar_events_created_at
      ON yar_events(created_at)
    `)
  ]);
}

function adminAllowed(request, env) {
  // For production, set ADMIN_ANALYTICS_KEY as a Cloudflare secret.
  // If it is not configured, summary remains available so the panel works
  // immediately; add the secret to make the endpoint private.
  const configured = clean(env?.ADMIN_ANALYTICS_KEY);
  if (!configured) return true;
  return clean(request.headers.get("X-Admin-Key")) === configured;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (new URL(request.url).searchParams.get("summary") !== "1") {
    return json({ success: true, service: "Yar Afghanistan Live Analytics", status: "online" });
  }

  if (!adminAllowed(request, env)) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  const database = db(env);
  if (!database) {
    return json({
      success: false,
      code: "D1_BINDING_MISSING",
      error: "Cloudflare D1 binding DB is not configured."
    }, 503);
  }

  try {
    await ensureSchema(database);

    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();

    const result = await database.batch([
      database.prepare(`SELECT COUNT(*) AS count FROM yar_devices`),
      database.prepare(`SELECT COUNT(*) AS count FROM yar_devices WHERE last_seen >= ?`).bind(fiveMinutesAgo),
      database.prepare(`SELECT COUNT(*) AS count FROM yar_devices WHERE device_type = 'mobile'`),
      database.prepare(`SELECT COUNT(*) AS count FROM yar_devices WHERE device_type = 'desktop'`),
      database.prepare(`SELECT COUNT(*) AS count FROM yar_events WHERE created_at >= ?`).bind(dayStartMs),
      database.prepare(`SELECT COUNT(DISTINCT device_id) AS count FROM yar_events WHERE created_at >= ?`).bind(dayStartMs),
      database.prepare(`SELECT COUNT(*) AS count FROM yar_events WHERE event = 'visit' AND created_at >= ?`).bind(dayStartMs)
    ]);

    const value = (i, key = "count") => Number(result[i]?.results?.[0]?.[key] ?? 0);

    return json({
      success: true,
      total_devices: value(0),
      active_devices: value(1),
      mobile_devices: value(2),
      desktop_devices: value(3),
      today_events: value(4),
      today_devices: value(5),
      today_visits: value(6),
      generated_at: now
    });
  } catch (error) {
    console.error("[YAR] analytics summary:", error);
    return json({
      success: false,
      code: "ANALYTICS_QUERY_FAILED",
      error: "Analytics database query failed."
    }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const database = db(env);

  if (!database) {
    return json({
      success: false,
      code: "D1_BINDING_MISSING",
      error: "Cloudflare D1 binding DB is not configured."
    }, 503);
  }

  try {
    const body = await request.json();
    const deviceId = clean(body?.device_id).slice(0, 120);
    const deviceType = validDeviceType(clean(body?.device_type));
    const event = validEvent(clean(body?.event));

    if (!deviceId || deviceId.length < 8) {
      return json({ success: false, code: "INVALID_DEVICE_ID" }, 400);
    }

    await ensureSchema(database);

    const now = Date.now();

    await database.batch([
      database.prepare(`
        INSERT INTO yar_devices (device_id, device_type, first_seen, last_seen, visits, events)
        VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(device_id) DO UPDATE SET
          device_type = excluded.device_type,
          last_seen = excluded.last_seen,
          visits = yar_devices.visits + CASE WHEN ? = 'visit' THEN 1 ELSE 0 END,
          events = yar_devices.events + 1
      `).bind(deviceId, deviceType, now, now, event === "visit" ? 1 : 0, event),
      database.prepare(`
        INSERT INTO yar_events (device_id, device_type, event, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(deviceId, deviceType, event, now)
    ]);

    return json({ success: true, recorded: true });
  } catch (error) {
    console.error("[YAR] analytics event:", error);
    return json({ success: false, code: "ANALYTICS_WRITE_FAILED" }, 500);
  }
}
