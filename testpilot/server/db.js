const fs = require('fs');
const path = require('path');
const { userStories, testCases, promptExperiments, defaultSettings } = require('./seedData');

let MongoClient;
try {
  MongoClient = require('mongodb').MongoClient;
} catch (e) {
  MongoClient = null;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'testpilot.json');

let dbCache = null;
let mongoClient = null;
let mongoDb = null;
let isConnectedToMongo = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadInitialFromFile() {
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
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {}
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
    console.error("Error reading database file, using defaults:", err.message);
    return {
      userStories,
      testCases,
      promptExperiments,
      executionRuns: [],
      settings: defaultSettings
    };
  }
}

function loadDatabase() {
  if (!dbCache) {
    dbCache = loadInitialFromFile();
  }
  return dbCache;
}

function saveDatabase(data) {
  dbCache = data;
  try {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Warning: Could not write local testpilot.json:", err.message);
  }
}

// ==========================================
// MONGODB ATLAS SYNCHRONIZATION HELPERS
// ==========================================

function syncStoryToMongo(story) {
  if (!isConnectedToMongo || !mongoDb) return;
  const { _id, ...cleanDoc } = story;
  mongoDb.collection('testpilot_user_stories').updateOne(
    { id: cleanDoc.id },
    { $set: cleanDoc },
    { upsert: true }
  ).catch(err => console.error('[Mongo Sync Story Error]', err.message));
}

function deleteStoryFromMongo(id) {
  if (!isConnectedToMongo || !mongoDb) return;
  mongoDb.collection('testpilot_user_stories').deleteOne({ id })
    .catch(err => console.error('[Mongo Delete Story Error]', err.message));
}

function syncTestCaseToMongo(tc) {
  if (!isConnectedToMongo || !mongoDb) return;
  const { _id, ...cleanDoc } = tc;
  mongoDb.collection('testpilot_test_cases').updateOne(
    { id: cleanDoc.id },
    { $set: cleanDoc },
    { upsert: true }
  ).catch(err => console.error('[Mongo Sync TC Error]', err.message));
}

function syncMultipleTestCasesToMongo(cases) {
  if (!isConnectedToMongo || !mongoDb || !cases?.length) return;
  const ops = cases.map(c => {
    const { _id, ...cleanDoc } = c;
    return {
      updateOne: {
        filter: { id: cleanDoc.id },
        update: { $set: cleanDoc },
        upsert: true
      }
    };
  });
  mongoDb.collection('testpilot_test_cases').bulkWrite(ops)
    .catch(err => console.error('[Mongo Bulk Sync TC Error]', err.message));
}

function deleteTestCaseFromMongo(id) {
  if (!isConnectedToMongo || !mongoDb) return;
  mongoDb.collection('testpilot_test_cases').deleteOne({ id })
    .catch(err => console.error('[Mongo Delete TC Error]', err.message));
}

function syncExperimentToMongo(exp) {
  if (!isConnectedToMongo || !mongoDb) return;
  const { _id, ...cleanDoc } = exp;
  mongoDb.collection('testpilot_experiments').updateOne(
    { id: cleanDoc.id },
    { $set: cleanDoc },
    { upsert: true }
  ).catch(err => console.error('[Mongo Sync Exp Error]', err.message));
}

function syncExecutionRunToMongo(run) {
  if (!isConnectedToMongo || !mongoDb) return;
  const { _id, ...cleanDoc } = run;
  mongoDb.collection('testpilot_execution_runs').updateOne(
    { id: cleanDoc.id },
    { $set: cleanDoc },
    { upsert: true }
  ).catch(err => console.error('[Mongo Sync Run Error]', err.message));
}

function syncSettingsToMongo(settings) {
  if (!isConnectedToMongo || !mongoDb) return;
  mongoDb.collection('testpilot_settings').updateOne(
    { _id: 'main' },
    { $set: { settings } },
    { upsert: true }
  ).catch(err => console.error('[Mongo Sync Settings Error]', err.message));
}

function resetMongoCollections(initialData) {
  if (!isConnectedToMongo || !mongoDb) return;
  (async () => {
    try {
      await mongoDb.collection('testpilot_user_stories').deleteMany({});
      await mongoDb.collection('testpilot_test_cases').deleteMany({});
      await mongoDb.collection('testpilot_experiments').deleteMany({});
      await mongoDb.collection('testpilot_execution_runs').deleteMany({});
      if (initialData.userStories?.length) await mongoDb.collection('testpilot_user_stories').insertMany(initialData.userStories.map(s => { const { _id, ...d } = s; return d; }));
      if (initialData.testCases?.length) await mongoDb.collection('testpilot_test_cases').insertMany(initialData.testCases.map(c => { const { _id, ...d } = c; return d; }));
      if (initialData.promptExperiments?.length) await mongoDb.collection('testpilot_experiments').insertMany(initialData.promptExperiments.map(e => { const { _id, ...d } = e; return d; }));
      await mongoDb.collection('testpilot_settings').updateOne({ _id: 'main' }, { $set: { settings: initialData.settings } }, { upsert: true });
      console.log('[TestPilot DB] MongoDB Atlas collections reset to default seeds.');
    } catch (err) {
      console.error('[Mongo Reset Error]', err.message);
    }
  })();
}

// Background MongoDB Initialization
async function initDatabase() {
  loadDatabase();

  const mongoUri = process.env.MONGODB_URI || process.env.ATLAS_URI;
  if (!mongoUri || !MongoClient) {
    console.log('[TestPilot DB] Running in Local File Mode (testpilot/data/testpilot.json).');
    return;
  }

  try {
    console.log('[TestPilot DB] Connecting to MongoDB Atlas for persistent storage...');
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isConnectedToMongo = true;
    console.log(`[TestPilot DB] Connected to MongoDB Atlas database "${mongoDb.databaseName}"!`);

    const colStories = mongoDb.collection('testpilot_user_stories');
    const colCases = mongoDb.collection('testpilot_test_cases');
    const colExps = mongoDb.collection('testpilot_experiments');
    const colRuns = mongoDb.collection('testpilot_execution_runs');
    const colSettings = mongoDb.collection('testpilot_settings');

    const tcCount = await colCases.countDocuments();
    if (tcCount === 0) {
      console.log('[TestPilot DB] Seeding MongoDB Atlas from initial project state...');
      if (dbCache.userStories?.length) {
        await colStories.insertMany(dbCache.userStories.map(s => { const { _id, ...doc } = s; return doc; }));
      }
      if (dbCache.testCases?.length) {
        await colCases.insertMany(dbCache.testCases.map(tc => { const { _id, ...doc } = tc; return doc; }));
      }
      if (dbCache.promptExperiments?.length) {
        await colExps.insertMany(dbCache.promptExperiments.map(e => { const { _id, ...doc } = e; return doc; }));
      }
      if (dbCache.executionRuns?.length) {
        await colRuns.insertMany(dbCache.executionRuns.map(r => { const { _id, ...doc } = r; return doc; }));
      }
      if (dbCache.settings) {
        await colSettings.updateOne({ _id: 'main' }, { $set: { settings: dbCache.settings } }, { upsert: true });
      }
      console.log(`[TestPilot DB] Seeded ${dbCache.testCases.length} test cases and ${dbCache.userStories.length} stories into MongoDB Atlas.`);
    } else {
      console.log('[TestPilot DB] Restoring persistent state from MongoDB Atlas...');
      const remoteStories = await colStories.find().toArray();
      const remoteCases = await colCases.find().toArray();
      const remoteExps = await colExps.find().toArray();
      const remoteRuns = await colRuns.find().sort({ timestamp: -1 }).toArray();
      const remoteSettings = await colSettings.findOne({ _id: 'main' });

      if (remoteStories.length) dbCache.userStories = remoteStories.map(s => { const { _id, ...doc } = s; return doc; });
      if (remoteCases.length) dbCache.testCases = remoteCases.map(c => { const { _id, ...doc } = c; return doc; });
      if (remoteExps.length) dbCache.promptExperiments = remoteExps.map(e => { const { _id, ...doc } = e; return doc; });
      if (remoteRuns.length) dbCache.executionRuns = remoteRuns.map(r => { const { _id, ...doc } = r; return doc; });
      if (remoteSettings?.settings) dbCache.settings = remoteSettings.settings;

      saveDatabase(dbCache);
      console.log(`[TestPilot DB] State successfully synchronized! (${dbCache.testCases.length} test cases, ${dbCache.userStories.length} user stories, ${dbCache.executionRuns.length} execution runs).`);
    }
  } catch (err) {
    console.error('[TestPilot DB] MongoDB connection failed, using local file mode:', err.message);
    isConnectedToMongo = false;
  }
}

// Trigger initial async connection
initDatabase().catch(err => console.error('[TestPilot DB] Init error:', err.message));

// ==========================================
// USER STORY OPERATIONS
// ==========================================
function getUserStories() {
  const db = loadDatabase();
  return db.userStories;
}

function getUserStoryById(id) {
  const db = loadDatabase();
  return db.userStories.find(s => s.id === id) || null;
}

function deleteUserStory(id) {
  const db = loadDatabase();
  const initialLength = db.userStories.length;
  db.userStories = db.userStories.filter(s => s.id !== id);
  if (db.userStories.length < initialLength) {
    saveDatabase(db);
    deleteStoryFromMongo(id);
    return true;
  }
  return false;
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
  syncStoryToMongo(newStory);
  return newStory;
}

// ==========================================
// TEST CASE OPERATIONS
// ==========================================
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
  syncTestCaseToMongo(newCase);
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
  syncMultipleTestCasesToMongo(created);
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
  syncTestCaseToMongo(db.testCases[index]);
  return db.testCases[index];
}

function deleteTestCase(id) {
  const db = loadDatabase();
  const index = db.testCases.findIndex(tc => tc.id === id);
  if (index === -1) return false;
  db.testCases.splice(index, 1);
  saveDatabase(db);
  deleteTestCaseFromMongo(id);
  return true;
}

// ==========================================
// PROMPT EXPERIMENT OPERATIONS
// ==========================================
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
  syncExperimentToMongo(newExp);
  return newExp;
}

// ==========================================
// EXECUTION RUNS
// ==========================================
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
  syncExecutionRunToMongo(newRun);
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
  syncExecutionRunToMongo(db.executionRuns[index]);
  return db.executionRuns[index];
}

function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url.replace(/\/+$/, '');
}

// ==========================================
// SETTINGS OPERATIONS
// ==========================================
function getSettings() {
  const db = loadDatabase();
  const settings = { ...db.settings };

  // If user configured a valid custom non-localhost URL, respect and sanitize it
  const hasUserCustomFe = settings.targetAutFrontendUrl &&
    !settings.targetAutFrontendUrl.includes('localhost') &&
    !settings.targetAutFrontendUrl.includes('127.0.0.1');

  if (hasUserCustomFe) {
    settings.targetAutFrontendUrl = sanitizeUrl(settings.targetAutFrontendUrl);
  } else if (process.env.AUT_FRONTEND_URL) {
    settings.targetAutFrontendUrl = sanitizeUrl(process.env.AUT_FRONTEND_URL);
  } else {
    settings.targetAutFrontendUrl = sanitizeUrl(settings.targetAutFrontendUrl) || 'http://localhost:3000';
  }

  const hasUserCustomBe = settings.targetAutBackendUrl &&
    !settings.targetAutBackendUrl.includes('localhost') &&
    !settings.targetAutBackendUrl.includes('127.0.0.1');

  if (hasUserCustomBe) {
    settings.targetAutBackendUrl = sanitizeUrl(settings.targetAutBackendUrl);
  } else if (process.env.AUT_BACKEND_URL) {
    settings.targetAutBackendUrl = sanitizeUrl(process.env.AUT_BACKEND_URL);
  } else {
    settings.targetAutBackendUrl = sanitizeUrl(settings.targetAutBackendUrl) || 'http://localhost:5000';
  }

  return settings;
}

function updateSettings(updates) {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...updates };
  saveDatabase(db);
  syncSettingsToMongo(db.settings);
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
  resetMongoCollections(initialData);
  return initialData;
}

module.exports = {
  initDatabase,
  getUserStories,
  getUserStoryById,
  createUserStory,
  deleteUserStory,
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
