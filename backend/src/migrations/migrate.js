import { prepare } from '../database.js';

export async function runMigrations() {
  const db = prepare('SELECT name FROM sqlite_master WHERE type=? AND name=?').get('table', 'migrations');
  if (!db) {
    prepare('CREATE TABLE migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, applied_at TEXT DEFAULT (datetime(\'now\')))').run();
  }
  const applied = new Set(prepare('SELECT name FROM migrations').all().map(r => r.name));
  const migrations = [
    '001_initial_schema',
    '002_seed_admin',
    '003_onda2_geo_workflow_lgpd',
    '004_onda3_push_reset',
    '005_onda45_final',
  ];
  for (const name of migrations) {
    if (applied.has(name)) continue;
    const mod = await import(`./${name}.js`);
    await mod.up(prepare);
    prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
    console.log(`Migration ${name} applied.`);
  }
}
