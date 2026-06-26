/**
 * Arqtype — Klaviyo subscribe endpoint (Cloudflare Pages Function)
 *
 * Lives at: /api/subscribe  (POST)
 * Receives { email, username } from the landing-page modal, creates/updates the
 * profile (storing username as a custom property), then subscribes it to a
 * Klaviyo list. The private API key never reaches the browser — it is read from
 * the Pages environment at runtime.
 *
 * Required environment variables (Cloudflare Pages → Settings →
 * Variables and Secrets, as encrypted Secrets, on the Production env):
 *   KLAVIYO_PRIVATE_KEY   e.g. pk_xxxxxxxxxxxxxxxxxxxx
 *   KLAVIYO_LIST_ID       e.g. XxXxXx
 *
 * NOTE: secrets only bind to deployments created AFTER they are saved.
 */

const KLAVIYO_REVISION = "2024-10-15";
const KLAVIYO_BASE = "https://a.klaviyo.com/api";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.KLAVIYO_PRIVATE_KEY || !env.KLAVIYO_LIST_ID) {
    return json(
      {
        error: "config_missing",
        message:
          "KLAVIYO_PRIVATE_KEY and/or KLAVIYO_LIST_ID are not set on this deployment.",
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

  const headers = {
    Authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_KEY}`,
    accept: "application/json",
    "content-type": "application/json",
    revision: KLAVIYO_REVISION,
  };

  try {
    // 1) Create or update the profile, storing username as a custom property.
    //    properties belongs inside the profile's attributes object.
    const profilePayload = {
      data: {
        type: "profile",
        attributes: {
          email,
          properties: { username },
        },
      },
    };

    const importRes = await fetch(`${KLAVIYO_BASE}/profile-import`, {
      method: "POST",
      headers,
      body: JSON.stringify(profilePayload),
    });

    if (importRes.status < 200 || importRes.status >= 300) {
      const detail = await importRes.text();
      return json({ error: "klaviyo_profile_error", status: importRes.status, detail }, 502);
    }

    const imported = await importRes.json();
    const profileId = imported?.data?.id;
    if (!profileId) {
      return json({ error: "no_profile_id", detail: imported }, 502);
    }

    // 2) Subscribe that profile to the list (bulk subscribe job).
    const subPayload = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                id: profileId,
                attributes: {
                  email,
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

    const subRes = await fetch(
      `${KLAVIYO_BASE}/profile-subscription-bulk-create-jobs`,
      { method: "POST", headers, body: JSON.stringify(subPayload) }
    );

    if (subRes.status >= 200 && subRes.status < 300) {
      return json({ ok: true }, 200);
    }

    const detail = await subRes.text();
    return json({ error: "klaviyo_subscribe_error", status: subRes.status, detail }, 502);
  } catch (err) {
    return json(
      { error: "exception", message: String(err && err.message ? err.message : err) },
      502
    );
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
