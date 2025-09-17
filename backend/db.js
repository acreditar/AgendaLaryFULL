import { join, dirname } from 'path';
import fs from 'fs-extra';

// Allow overriding DB file location via env (useful for mounted volumes in deploys)
const envFile = process.env.DB_FILE || process.env.DB_PATH;
const file = envFile ? envFile : join(process.cwd(), 'backend-db.json');

async function init() {
  // Ensure parent dir exists when using a custom path
  try { await fs.ensureDir(dirname(file)); } catch { }
  await fs.ensureFile(file);
  const stat = await fs.stat(file);
  if (stat.size === 0) {
    await fs.writeJson(file, { patients: [], appointments: [] });
  }
}

async function readDb() {
  await init();
  const data = await fs.readJson(file);
  data.patients = data.patients || [];
  data.appointments = data.appointments || [];
  return data;
}

async function writeDb(data) {
  // use writeJson which overwrites the file in place; avoid atomic rename to reduce OneDrive EPERM issues
  await fs.writeJson(file, data, { spaces: 2 });
}

export { readDb as dbRead, writeDb as dbWrite, init };

