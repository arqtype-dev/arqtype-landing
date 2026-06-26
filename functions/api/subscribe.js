/**
 * Arqtype — Klaviyo subscribe endpoint (Cloudflare Pages Function)
 *
 * Lives at: /api/subscribe  (POST)
 * Receives { email, username } from the landing-page modal and subscribes the
 * profile to a Klaviyo list. The Klaviyo private API key never reaches the
 * browser — it is read from the Pages environment at runtime.
 *
 * Required environment variables (set in Cloudflare Pages → Settings →
 * Environment variables, as encrypted Secrets):
 *   KLAVIYO_PRIVATE_KEY   e.g. pk_xxxxxxxxxxxxxxxxxxxx
 *   KLAVIYO_LIST_ID       e.g. XxXxXx
 */

const KLAVIYO_REVISION = "2024-10-15";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = (body.email || "").trim();
  const username = (body.username || "").trim();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValid || !username) {
    return json({ error: "email and username are required" }, 400);
  }

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
    return json({ ok: true }, 200);
  }

  const detail = await kRes.text();
  return json({ error: "klaviyo_error", status: kRes.status, detail }, 502);
}

// Reject non-POST methods cleanly.
export function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return new Response("Method not allowed", { status: 405 });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
