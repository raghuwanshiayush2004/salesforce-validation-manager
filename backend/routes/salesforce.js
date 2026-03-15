const express = require('express');
const axios = require('axios');
const router = express.Router();

// ─── Middleware: Check if user is authenticated ───────────────────────────
const requireAuth = (req, res, next) => {
  if (!req.session.salesforce) {
    return res.status(401).json({ error: 'Not authenticated. Please login with Salesforce first.' });
  }
  next();
};

// Helper: Create Salesforce API instance
const getSFClient = (session) => {
  return axios.create({
    baseURL: `${session.instanceUrl}/services/data/v59.0`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    }
  });
};

// ─── GET all validation rules for Account object ─────────────────────────
// GET /api/rules
router.get('/rules', requireAuth, async (req, res) => {
  const sf = getSFClient(req.session.salesforce);

  try {
    // Use Tooling API to query ValidationRule
const query = `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinitionId FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'`;

    const response = await sf.get(
      `/tooling/query?q=${encodeURIComponent(query)}`
    );

const rules = response.data.records.map(rule => ({
  id: rule.Id,
  name: rule.ValidationName,
  active: rule.Active,
  description: rule.Description || '',
  errorMessage: rule.ErrorMessage || ''
}));

    res.json({ success: true, rules, totalSize: response.data.totalSize });

  } catch (err) {
    console.error('Error fetching validation rules:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch validation rules',
      details: err.response?.data || err.message
    });
  }
});

// ─── GET single validation rule (with full Metadata) ─────────────────────
// GET /api/rules/:id
router.get('/rules/:id', requireAuth, async (req, res) => {
  const sf = getSFClient(req.session.salesforce);

  try {
    const response = await sf.get(`/tooling/sobjects/ValidationRule/${req.params.id}`);
    res.json({ success: true, rule: response.data });
  } catch (err) {
    console.error('Error fetching rule:', err.response?.data);
    res.status(500).json({ error: 'Failed to fetch rule details' });
  }
});

// ─── TOGGLE a single validation rule (activate/deactivate) ───────────────
// POST /api/rules/:id/toggle
router.post('/rules/:id/toggle', requireAuth, async (req, res) => {
  const sf = getSFClient(req.session.salesforce);
  const { id } = req.params;

  try {
    // Step 1: Fetch current metadata of the rule
    const currentRule = await sf.get(`/tooling/sobjects/ValidationRule/${id}`);
    const metadata = currentRule.data.Metadata;
    const currentActive = metadata.active;

    // Step 2: Patch with toggled active status
    await sf.patch(`/tooling/sobjects/ValidationRule/${id}`, {
      Metadata: {
        ...metadata,
        active: !currentActive
      }
    });

    res.json({
      success: true,
      message: `Validation rule ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      newState: !currentActive
    });

  } catch (err) {
    console.error('Error toggling rule:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to toggle validation rule',
      details: err.response?.data || err.message
    });
  }
});

// ─── SET specific active state for a single rule ─────────────────────────
// POST /api/rules/:id/set-active
router.post('/rules/:id/set-active', requireAuth, async (req, res) => {
  const sf = getSFClient(req.session.salesforce);
  const { id } = req.params;
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: '"active" must be a boolean (true or false)' });
  }

  try {
    const currentRule = await sf.get(`/tooling/sobjects/ValidationRule/${id}`);
    const metadata = currentRule.data.Metadata;

    await sf.patch(`/tooling/sobjects/ValidationRule/${id}`, {
      Metadata: { ...metadata, active }
    });

    res.json({
      success: true,
      message: `Validation rule ${active ? 'activated' : 'deactivated'} successfully`,
      newState: active
    });

  } catch (err) {
    console.error('Error setting rule state:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to update validation rule',
      details: err.response?.data || err.message
    });
  }
});

// ─── TOGGLE ALL validation rules (enable all or disable all) ─────────────
// POST /api/rules/toggle-all
router.post('/rules/toggle-all', requireAuth, async (req, res) => {
  const sf = getSFClient(req.session.salesforce);
  const { active } = req.body; // true = activate all, false = deactivate all

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: '"active" must be boolean' });
  }

  try {
    // Fetch all Account validation rules
    const query = `SELECT Id FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'`;
    const listResponse = await sf.get(`/tooling/query?q=${encodeURIComponent(query)}`);
    const rules = listResponse.data.records;

    if (rules.length === 0) {
      return res.json({ success: true, message: 'No validation rules found', updated: 0 });
    }

    // Update each rule
    const results = await Promise.allSettled(
      rules.map(async (rule) => {
        const currentRule = await sf.get(`/tooling/sobjects/ValidationRule/${rule.Id}`);
        const metadata = currentRule.data.Metadata;
        await sf.patch(`/tooling/sobjects/ValidationRule/${rule.Id}`, {
          Metadata: { ...metadata, active }
        });
        return rule.Id;
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Updated ${successful} rules. ${failed > 0 ? `${failed} failed.` : ''}`,
      updated: successful,
      failed
    });

  } catch (err) {
    console.error('Error toggling all rules:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to toggle all rules' });
  }
});

// ─── DEPLOY — changes are live immediately via Tooling API ───────────────
// POST /api/deploy
router.post('/deploy', requireAuth, async (req, res) => {
  // Since Tooling API PATCH applies changes immediately to the org,
  // "deploy" here means confirming that all pending changes are in effect
  // and returning a summary of current state.
  const sf = getSFClient(req.session.salesforce);

  try {
    const query = `SELECT Id, ValidationName, Active FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'`;
    const response = await sf.get(`/tooling/query?q=${encodeURIComponent(query)}`);

    const summary = response.data.records.map(r => ({
      id: r.Id,
      name: r.ValidationName,
      active: r.Active
    }));

    res.json({
      success: true,
      message: 'All changes are deployed and live in your Salesforce org.',
      timestamp: new Date().toISOString(),
      rules: summary
    });

  } catch (err) {
    res.status(500).json({ error: 'Deploy confirmation failed', details: err.message });
  }
});

module.exports = router;
