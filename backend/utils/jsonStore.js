const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'local_db.json');

const ensureDir = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const generateId = () => crypto.randomBytes(12).toString('hex');

const loadStore = () => {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [],
      accounts: [],
      categories: [],
      transactions: [],
      budgets: [],
      goals: [],
      notifications: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return {
      users: [],
      accounts: [],
      categories: [],
      transactions: [],
      budgets: [],
      goals: [],
      notifications: [],
    };
  }
};

const saveStore = (data) => {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
  loadStore,
  saveStore,
  generateId,
  DB_FILE,
};
