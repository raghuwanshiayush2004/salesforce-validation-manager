const express = require('express');
const axios = require('axios');
const router = express.Router();

const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_REDIRECT_URI,
  SALESFORCE_LOGIN_URL,
  FRONTEND_URL
} = process.env;

// ─── Step 1: Redirect user to Salesforce login page ──────────────────────
// GET /auth/login
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SALESFORCE_CLIENT_ID,
    redirect_uri: SALESFORCE_REDIRECT_URI,
    scope: 'api refresh_token offline_access'
  });

  const authUrl = `${SALESFORCE_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

// ─── Step 2: Salesforce redirects here with auth code ────────────────────
// GET /auth/callback
router.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(error_description || error)}`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `${SALESFORCE_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SALESFORCE_CLIENT_ID,
        client_secret: SALESFORCE_CLIENT_SECRET,
        redirect_uri: SALESFORCE_REDIRECT_URI,
        code: code
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, instance_url, id } = tokenResponse.data;

    // Fetch user info
    const userInfo = await axios.get(id, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Store in session
    req.session.salesforce = {
      accessToken: access_token,
      refreshToken: refresh_token,
      instanceUrl: instance_url,
      username: userInfo.data.username,
      displayName: userInfo.data.display_name,
      orgId: userInfo.data.organization_id
    };

    // Redirect to frontend dashboard
    res.redirect(`${FRONTEND_URL}/dashboard`);

  } catch (err) {
    console.error('OAuth callback error:', err.response?.data || err.message);
    const msg = err.response?.data?.error_description || 'Authentication failed';
    res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(msg)}`);
  }
});

// ─── Get current session/user status ─────────────────────────────────────
// GET /auth/status
router.get('/status', (req, res) => {
  if (req.session.salesforce) {
    res.json({
      isLoggedIn: true,
      username: req.session.salesforce.username,
      displayName: req.session.salesforce.displayName,
      instanceUrl: req.session.salesforce.instanceUrl
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────
// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    // Revoke Salesforce token
    if (req.session.salesforce?.accessToken) {
      await axios.post(
        `${SALESFORCE_LOGIN_URL}/services/oauth2/revoke`,
        new URLSearchParams({ token: req.session.salesforce.accessToken }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    }
  } catch (err) {
    console.error('Token revoke error (non-fatal):', err.message);
  }

  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
