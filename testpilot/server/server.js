const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const db = require('./db');
const { generateTestCases, PROMPT_STRATEGIES } = require('./llmEngine');
const { executeSingleTestCase, executeBatchTestCases } = require('./testRunner');

const app = express();
const PORT = process.env.TESTPILOT_PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve screenshots and client static files
app.use('/screenshots', express.static(path.join(__dirname, '..', 'screenshots')));
app.use(express.static(path.join(__dirname, '..', 'client')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'TestPilot AI QA Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Prompt strategies metadata
app.get('/api/prompt-strategies', (req, res) => {
  res.json(PROMPT_STRATEGIES);
});

// User Stories endpoints
app.get('/api/user-stories', (req, res) => {
  const stories = db.getUserStories();
  res.json(stories);
});

app.get('/api/user-stories/:id', (req, res) => {
  const story = db.getUserStoryById(req.params.id);
  if (!story) return res.status(404).json({ error: 'User story not found' });
  res.json(story);
});

app.post('/api/user-stories', (req, res) => {
  try {
    const created = db.createUserStory(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Prompt Engineering & Test Case Generation
app.post('/api/generate', async (req, res) => {
  try {
    const { userStoryId, customUserStory, strategyKey = 'chain-of-thought', settings = {} } = req.body;
    let story = null;
    if (userStoryId) {
      story = db.getUserStoryById(userStoryId);
    } else if (customUserStory) {
      story = customUserStory;
    }

    if (!story) {
      return res.status(400).json({ error: 'Valid user story or userStoryId is required' });
    }

    const currentSettings = { ...db.getSettings(), ...settings };
    const generationResult = await generateTestCases({
      userStory: story,
      strategyKey,
      settings: currentSettings
    });

    // Save generated test cases into database
    const savedCases = db.createMultipleTestCases(generationResult.testCases);

    // Automatically record this experiment run in the Prompt Engineering log
    const experiment = db.createPromptExperiment({
      targetStoryId: story.id || "US-CUSTOM",
      targetStoryTitle: story.title || "Custom Story",
      role: story.role || "patient",
      promptStrategy: generationResult.strategyName,
      model: currentSettings.selectedModel || "builtin-engine",
      temperature: currentSettings.temperature || 0.3,
      systemPrompt: generationResult.systemPrompt,
      userPrompt: generationResult.userPrompt,
      rawResponse: generationResult.rawOutput,
      parsedTestCasesCount: savedCases.length,
      ratings: generationResult.ratings,
      whatChanged: generationResult.whatChanged,
      whyItChanged: generationResult.whyItChanged,
      keyFindings: `Generated ${savedCases.length} test cases with rating ${generationResult.ratings.overallScore}/5 using ${generationResult.strategyName}.`
    });

    res.json({
      success: true,
      testCases: savedCases,
      experiment,
      generationDetails: {
        strategyName: generationResult.strategyName,
        ratings: generationResult.ratings,
        systemPrompt: generationResult.systemPrompt,
        userPrompt: generationResult.userPrompt,
        rawOutput: generationResult.rawOutput
      }
    });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test Cases CRUD & Review
app.get('/api/test-cases', (req, res) => {
  const { status, role, scenarioType, userStoryId } = req.query;
  const cases = db.getTestCases({ status, role, scenarioType, userStoryId });
  res.json(cases);
});

app.get('/api/test-cases/:id', (req, res) => {
  const tc = db.getTestCaseById(req.params.id);
  if (!tc) return res.status(404).json({ error: 'Test case not found' });
  res.json(tc);
});

app.post('/api/test-cases', (req, res) => {
  try {
    const created = db.createTestCase(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/test-cases/:id', (req, res) => {
  try {
    const updated = db.updateTestCase(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Test case not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Human Review Action (Approve / Reject / Flag Gaps / Edit)
app.post('/api/test-cases/:id/review', (req, res) => {
  try {
    const { action, reviewNotes, flaggedGaps, edits } = req.body;
    const existing = db.getTestCaseById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Test case not found' });

    const updates = {};
    if (action === 'approve') {
      updates.status = 'approved';
    } else if (action === 'reject') {
      updates.status = 'rejected';
    } else if (action === 'flag_gap') {
      updates.status = 'pending_review';
    } else if (action === 'edit') {
      updates.status = 'edited';
    }

    if (reviewNotes !== undefined) updates.reviewNotes = reviewNotes;
    if (flaggedGaps !== undefined) updates.flaggedGaps = flaggedGaps;
    if (edits) {
      Object.assign(updates, edits);
    }

    const updated = db.updateTestCase(req.params.id, updates);
    res.json({ success: true, testCase: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Batch approval
app.post('/api/test-cases/batch-approve', (req, res) => {
  try {
    const { ids } = req.body;
    const testCases = db.getTestCases();
    const approved = [];
    testCases.forEach(tc => {
      if (!ids || ids.includes(tc.id)) {
        if (tc.status !== 'rejected') {
          const updated = db.updateTestCase(tc.id, { status: 'approved' });
          approved.push(updated);
        }
      }
    });
    res.json({ success: true, count: approved.length, testCases: approved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/test-cases/:id', (req, res) => {
  const success = db.deleteTestCase(req.params.id);
  if (!success) return res.status(404).json({ error: 'Test case not found' });
  res.json({ success: true });
});

// Prompt Engineering Experiments Log (Required Deliverable)
app.get('/api/experiments', (req, res) => {
  const exps = db.getPromptExperiments();
  res.json(exps);
});

app.post('/api/experiments', (req, res) => {
  try {
    const created = db.createPromptExperiment(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Test Execution via Playwright
app.get('/api/execution-runs', (req, res) => {
  const runs = db.getExecutionRuns();
  res.json(runs);
});

app.post('/api/execute', async (req, res) => {
  try {
    const { testCaseIds, targetUrl } = req.body;
    const settings = db.getSettings();
    const url = targetUrl || settings.targetAutFrontendUrl || 'http://localhost:3000';

    let casesToRun = [];
    if (Array.isArray(testCaseIds) && testCaseIds.length > 0) {
      casesToRun = testCaseIds.map(id => db.getTestCaseById(id)).filter(Boolean);
    } else {
      // Default: run all approved cases
      casesToRun = db.getTestCases({ status: 'approved' });
      if (casesToRun.length === 0) {
        casesToRun = db.getTestCases().slice(0, 4); // fallback to top 4 if none approved
      }
    }

    if (casesToRun.length === 0) {
      return res.status(400).json({ error: 'No test cases available for execution' });
    }

    const runReport = await executeBatchTestCases(casesToRun, {
      targetUrl: url,
      headless: settings.headless !== false
    });

    db.createExecutionRun(runReport);

    res.json({
      success: true,
      runReport
    });
  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Settings & AUT Health Checks
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Healthcare AUT Status Check
app.get('/api/aut-status', async (req, res) => {
  const settings = db.getSettings();
  const frontendUrl = settings.targetAutFrontendUrl || 'http://localhost:3000';
  const backendUrl = settings.targetAutBackendUrl || 'http://localhost:5000';

  const checkUrl = (target) => {
    return new Promise((resolve) => {
      try {
        const u = new URL(target);
        const request = http.request({
          host: u.hostname,
          port: u.port || 80,
          path: u.pathname || '/',
          method: 'GET',
          timeout: 2000
        }, (response) => {
          resolve({ online: true, statusCode: response.statusCode });
        });
        request.on('error', () => resolve({ online: false, statusCode: null }));
        request.on('timeout', () => { request.destroy(); resolve({ online: false, statusCode: null }); });
        request.end();
      } catch (e) {
        resolve({ online: false, statusCode: null });
      }
    });
  };

  const [feStatus, beStatus] = await Promise.all([
    checkUrl(frontendUrl),
    checkUrl(backendUrl)
  ]);

  res.json({
    frontend: { url: frontendUrl, ...feStatus },
    backend: { url: backendUrl, ...beStatus }
  });
});

// Reset data
app.post('/api/reset-data', (req, res) => {
  const data = db.resetToDefaults();
  res.json({ success: true, message: 'Database reset to default seeds' });
});

// Export Playwright Spec File
app.get('/api/export/playwright', (req, res) => {
  const testCases = db.getTestCases({ status: 'approved' });
  let code = `import { test, expect } from '@playwright/test';\n\n`;
  code += `test.describe('TestPilot Automated Healthcare Test Suite', () => {\n`;
  code += `  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';\n\n`;

  testCases.forEach(tc => {
    code += `  // ${tc.id}: ${tc.title} (${tc.scenarioType})\n`;
    code += `  test('${tc.id} - ${tc.title.replace(/'/g, "\\'")}', async ({ page }) => {\n`;
    if (tc.role === 'doctor') {
      code += `    await page.goto(\`\${BASE_URL}/doctorlogin\`);\n`;
      code += `    await page.fill('input[name="username"]', 'test');\n`;
      code += `    await page.fill('input[name="password"]', 'test');\n`;
      code += `    await page.click('button[type="submit"]');\n`;
    } else {
      code += `    await page.goto(BASE_URL);\n`;
    }
    code += `    // Steps:\n`;
    tc.steps.forEach(s => {
      code += `    // Step ${s.stepNumber}: ${s.action} -> Expected: ${s.expectedResult}\n`;
    });
    code += `  });\n\n`;
  });

  code += `});\n`;

  res.setHeader('Content-Type', 'text/javascript');
  res.setHeader('Content-Disposition', 'attachment; filename="healthcare-testpilot.spec.js"');
  res.send(code);
});

// Fallback to client index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`TestPilot AI Test Generation Platform is RUNNING`);
  console.log(`Web Interface & API: http://localhost:${PORT}`);
  console.log(`Target Healthcare AUT: http://localhost:3000`);
  console.log(`=======================================================`);
});

module.exports = app;
