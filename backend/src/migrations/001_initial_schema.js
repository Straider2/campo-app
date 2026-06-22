export async function up(prepare) {
  // Schema já é criado em database.js. Esta migration garante que os índices existam.
  try { prepare("CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status)").run(); } catch {}
  try { prepare("CREATE INDEX IF NOT EXISTS idx_atendimentos_usuario ON atendimentos(usuario_id)").run(); } catch {}
  try { prepare("CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos(data_atendimento)").run(); } catch {}
  try { prepare("CREATE INDEX IF NOT EXISTS idx_fotos_atendimento ON fotos(atendimento_id)").run(); } catch {}
  try { prepare("ALTER TABLE clientes ADD COLUMN cpf_cnpj TEXT").run(); } catch {}
  try { prepare("ALTER TABLE atendimentos ADD COLUMN cliente_id INTEGER REFERENCES clientes(id)").run(); } catch {}
}
