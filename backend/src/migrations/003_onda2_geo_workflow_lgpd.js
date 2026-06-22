export async function up(prepare) {
  // Tabela de funcionários
  try {
    prepare(`CREATE TABLE IF NOT EXISTS funcionarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT, cargo TEXT, departamento TEXT, created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de equipamentos
  try {
    prepare(`CREATE TABLE IF NOT EXISTS equipamentos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tipo TEXT, serial TEXT, patrimonio TEXT, status TEXT DEFAULT 'disponivel', created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de contratos
  try {
    prepare(`CREATE TABLE IF NOT EXISTS contratos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER REFERENCES clientes(id), numero TEXT, tipo TEXT, valor REAL, data_inicio TEXT, data_fim TEXT, status TEXT DEFAULT 'ativo', created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de estoque
  try {
    prepare(`CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, categoria TEXT, quantidade INTEGER DEFAULT 0, unidade TEXT DEFAULT 'un', created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de itens
  try {
    prepare(`CREATE TABLE IF NOT EXISTS itens (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, descricao TEXT, valor REAL, created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de push tokens
  try {
    prepare(`CREATE TABLE IF NOT EXISTS push_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER REFERENCES usuarios(id), token TEXT NOT NULL UNIQUE, plataforma TEXT DEFAULT 'web', created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
  // Tabela de LGPD consentimentos
  try {
    prepare(`CREATE TABLE IF NOT EXISTS lgpd_consentimentos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER REFERENCES clientes(id), tipo TEXT NOT NULL, consentido INTEGER DEFAULT 1, data_consentimento TEXT DEFAULT (datetime('now')), data_revogacao TEXT)`).run();
  } catch {}
  // Tabela de auditoria
  try {
    prepare(`CREATE TABLE IF NOT EXISTS ocorrencias (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, tipo TEXT, descricao TEXT, created_at TEXT DEFAULT (datetime('now')))`).run();
  } catch {}
}
