const fs = require('fs');
const path = require('path');
const { userStories, testCases, promptExperiments, defaultSettings } = require('./seedData');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'testpilot.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      userStories: userStories,
      testCases: testCases,
      promptExperiments: promptExperiments,
      executionRuns: [],
      settings: defaultSettings,
      metadata: {
        createdAt: new Date().toISOString(),
        version: "1.0.0",
        appName: "TestPilot AI QA Platform"
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(content);
    // Merge any missing seed keys
    if (!data.userStories || data.userStories.length === 0) data.userStories = userStories;
    if (!data.testCases || data.testCases.length === 0) data.testCases = testCases;
    if (!data.promptExperiments || data.promptExperiments.length === 0) data.promptExperiments = promptExperiments;
    if (!data.settings) data.settings = defaultSettings;
    if (!data.executionRuns) data.executionRuns = [];
    return data;
  } catch (err) {
    console.error("Error reading database file, restoring backup:", err);
    return {
      userStories,
      testCases,
      promptExperiments,
      executionRuns: [],
      settings: defaultSettings
    };
  }
}

function saveDatabase(data) {
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// User Story operations
function getUserStories() {
  const db = loadDatabase();
  return db.userStories;
}

function getUserStoryById(id) {
  const db = loadDatabase();
  return db.userStories.find(s => s.id === id) || null;
}

function createUserStory(story) {
  const db = loadDatabase();
  const newStory = {
    ...story,
    id: story.id || `US-CUSTOM-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString()
  };
  db.userStories.unshift(newStory);
  saveDatabase(db);
  return newStory;
}

// Test Case operations
function getTestCases(filters = {}) {
  const db = loadDatabase();
  let list = db.testCases;
  if (filters.status) list = list.filter(tc => tc.status === filters.status);
  if (filters.role) list = list.filter(tc => tc.role === filters.role);
  if (filters.scenarioType) list = list.filter(tc => tc.scenarioType === filters.scenarioType);
  if (filters.userStoryId) list = list.filter(tc => tc.userStoryId === filters.userStoryId);
  return list;
}

function getTestCaseById(id) {
  const db = loadDatabase();
  return db.testCases.find(tc => tc.id === id) || null;
}

function createTestCase(testCase) {
  const db = loadDatabase();
  const newCase = {
    ...testCase,
    id: testCase.id || `TP-TC-${(db.testCases.length + 1).toString().padStart(3, '0')}`,
    status: testCase.status || 'pending_review',
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.testCases.unshift(newCase);
  saveDatabase(db);
  return newCase;
}

function createMultipleTestCases(cases) {
  const db = loadDatabase();
  const created = [];
  cases.forEach((tc, idx) => {
    const newCase = {
      ...tc,
      id: tc.id || `TP-TC-${(db.testCases.length + 1 + idx).toString().padStart(3, '0')}`,
      status: tc.status || 'pending_review',
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.testCases.unshift(newCase);
    created.push(newCase);
  });
  saveDatabase(db);
  return created;
}

function updateTestCase(id, updates) {
  const db = loadDatabase();
  const index = db.testCases.findIndex(tc => tc.id === id);
  if (index === -1) return null;
  db.testCases[index] = {
    ...db.testCases[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveDatabase(db);
  return db.testCases[index];
}

function deleteTestCase(id) {
  const db = loadDatabase();
  const index = db.testCases.findIndex(tc => tc.id === id);
  if (index === -1) return false;
  db.testCases.splice(index, 1);
  saveDatabase(db);
  return true;
}

// Prompt Experiment Operations
function getPromptExperiments() {
  const db = loadDatabase();
  return db.promptExperiments;
}

function createPromptExperiment(exp) {
  const db = loadDatabase();
  const newExp = {
    ...exp,
    id: exp.id || `PE-EXP-${(db.promptExperiments.length + 1).toString().padStart(3, '0')}`,
    iterationNumber: exp.iterationNumber || (db.promptExperiments.length + 1),
    createdAt: new Date().toISOString()
  };
  db.promptExperiments.push(newExp);
  saveDatabase(db);
  return newExp;
}

// Execution Runs
function getExecutionRuns() {
  const db = loadDatabase();
  return db.executionRuns;
}

function createExecutionRun(run) {
  const db = loadDatabase();
  const newRun = {
    ...run,
    id: run.id || `RUN-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  db.executionRuns.unshift(newRun);
  saveDatabase(db);
  return newRun;
}

function updateExecutionRun(id, updates) {
  const db = loadDatabase();
  const index = db.executionRuns.findIndex(r => r.id === id);
  if (index === -1) return null;
  db.executionRuns[index] = {
    ...db.executionRuns[index],
    ...updates
  };
  saveDatabase(db);
  return db.executionRuns[index];
}

// Settings
function getSettings() {
  const db = loadDatabase();
  return db.settings;
}

function updateSettings(updates) {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...updates };
  saveDatabase(db);
  return db.settings;
}

function resetToDefaults() {
  const initialData = {
    userStories: userStories,
    testCases: testCases,
    promptExperiments: promptExperiments,
    executionRuns: [],
    settings: defaultSettings,
    metadata: {
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      appName: "TestPilot AI QA Platform"
    }
  };
  saveDatabase(initialData);
  return initialData;
}

module.exports = {
  getUserStories,
  getUserStoryById,
  createUserStory,
  getTestCases,
  getTestCaseById,
  createTestCase,
  createMultipleTestCases,
  updateTestCase,
  deleteTestCase,
  getPromptExperiments,
  createPromptExperiment,
  getExecutionRuns,
  createExecutionRun,
  updateExecutionRun,
  getSettings,
  updateSettings,
  resetToDefaults
};
