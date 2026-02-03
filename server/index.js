import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.BACKEND_PORT || 8787;
const allowedOrigin = process.env.BACKEND_ALLOWED_ORIGIN || "http://localhost:5173";

const appId = process.env.TIKTOK_APP_ID;
const appSecret = process.env.TIKTOK_APP_SECRET;

if (!appId || !appSecret) {
  console.warn(
    "Missing TIKTOK_APP_ID or TIKTOK_APP_SECRET. OAuth token exchange will fail until set.",
  );
}

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/oauth/token", async (req, res) => {
  const authCode = req.body?.code || req.body?.auth_code;

  if (!authCode) {
    return res.status(400).json({
      code: "missing_auth_code",
      message: "Authorization code is required.",
    });
  }

  if (!appId || !appSecret) {
    return res.status(500).json({
      code: "missing_app_credentials",
      message: "TikTok app credentials are not configured on the server.",
    });
  }

  try {
    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          auth_code: authCode,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      return res.status(response.ok ? 400 : response.status).json({
        code: data.code?.toString() || "token_exchange_failed",
        message: data.message || "Failed to exchange code for tokens.",
        data: data.data,
      });
    }

    return res.json(data.data);
  } catch (error) {
    console.error("Token exchange failed:", error);
    return res.status(500).json({
      code: "server_error",
      message: "Unexpected error during token exchange.",
    });
  }
});

app.listen(port, () => {
  console.log(`OAuth backend listening on http://localhost:${port}`);
});
