const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const file = path.join(__dirname, 'db.json');
const adapter = new FileSync(file);
const db = low(adapter);

async function initDB() {
  db.defaults({ candidates: [], sessions: [] }).write();
}

initDB();

module.exports = db;