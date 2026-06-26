/**
 * Arqtype — Klaviyo subscribe proxy (Cloudflare Worker)
 *
 * Receives { email, username } from the landing page and subscribes the
 * profile to a Klaviyo list. The Klaviyo private API key never reaches the
 * browser — it lives only in the Worker's encrypted environment.
 *
 * Required environment variables (set via `wrangler secret put`):
 *   KLAVIYO_PRIVATE_KEY   e.g. pk_xxxxxxxxxxxxxxxxxxxx
 *   KLAVIYO_LIST_ID       e.g. XxXxXx
 *
 * Optional:
 *   ALLOWED_ORIGIN        e.g. https://arqtype.io  (defaults to "*")
 */

const KLAVIYO_REVISION = "2024-10-15";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const cors = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    const email = (body.email || "").trim();
    const username = (body.username || "").trim();

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid || !username) {
      return json({ error: "email and username are required" }, 400, cors);
    }

    // Klaviyo: subscribe a profile to a list.
    const payload = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  properties: { username },
                  subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                },
              },
            ],
          },
        },
        relationships: {
          list: { data: { type: "list", id: env.KLAVIYO_LIST_ID } },
        },
      },
    };

    const kRes = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_KEY}`,
          accept: "application/json",
          "content-type": "application/json",
          revision: KLAVIYO_REVISION,
        },
        body: JSON.stringify(payload),
      }
    );

    if (kRes.status >= 200 && kRes.status < 300) {
      return json({ ok: true }, 200, cors);
    }

    const detail = await kRes.text();
    return json({ error: "klaviyo_error", status: kRes.status, detail }, 502, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
