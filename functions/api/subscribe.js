/**
 * Arqtype — Klaviyo subscribe endpoint (Cloudflare Pages Function)
 *
 * Lives at: /api/subscribe  (POST)
 * Receives { email, username } from the landing-page modal and subscribes the
 * profile to a Klaviyo list. The Klaviyo private API key never reaches the
 * browser — it is read from the Pages environment at runtime.
 *
 * Required environment variables (Cloudflare Pages → Settings →
 * Variables and Secrets, as encrypted Secrets, on the Production env):
 *   KLAVIYO_PRIVATE_KEY   e.g. pk_xxxxxxxxxxxxxxxxxxxx
 *   KLAVIYO_LIST_ID       e.g. XxXxXx
 *
 * NOTE: secrets only bind to deployments created AFTER they are saved.
 * Trigger a fresh deployment if you added them to an existing build.
 */

const KLAVIYO_REVISION = "2024-10-15";

export async function onRequestPost(context) {
  const { request, env } = context;

  // Surface configuration problems as readable JSON instead of a 502.
  if (!env.KLAVIYO_PRIVATE_KEY || !env.KLAVIYO_LIST_ID) {
    return json(
      {
        error: "config_missing",
        message:
          "KLAVIYO_PRIVATE_KEY and/or KLAVIYO_LIST_ID are not set on this deployment. " +
          "Add them as secrets and redeploy.",
        has_key: Boolean(env.KLAVIYO_PRIVATE_KEY),
        has_list: Boolean(env.KLAVIYO_LIST_ID),
      },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
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

  try {
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

    // Klaviyo responded but rejected the request — pass the detail through
    // so the cause (revision, scope, list id) is visible.
    const detail = await kRes.text();
    return json({ error: "klaviyo_error", status: kRes.status, detail }, 200);
  } catch (err) {
    // Any unexpected runtime failure — report it rather than 502.
    return json(
      { error: "exception", message: String(err && err.message ? err.message : err) },
      200
    );
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
