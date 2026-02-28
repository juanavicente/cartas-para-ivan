exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const path = event.queryStringParameters?.path;
    if (!path) {
      return { statusCode: 400, body: "Missing ?path=" };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const BUCKET = process.env.SUPABASE_BUCKET || "fotos";

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${encodeURIComponent(path)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({ expiresIn: 600 }),
      }
    );

    const text = await res.text();
    if (!res.ok) {
      return { statusCode: res.status, body: text };
    }

    const data = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${SUPABASE_URL}${data.signedURL}` }),
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};