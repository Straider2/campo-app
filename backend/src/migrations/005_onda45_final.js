export async function up(prepare) {
  try { prepare("ALTER TABLE estoque ADD COLUMN valor_unitario REAL").run(); } catch {}
  try { prepare("ALTER TABLE itens ADD COLUMN categoria TEXT").run(); } catch {}
  try { prepare("ALTER TABLE push_tokens ADD COLUMN device_name TEXT").run(); } catch {}
  try { prepare("ALTER TABLE lgpd_consentimentos ADD COLUMN finalidade TEXT").run(); } catch {}
  try { prepare("ALTER TABLE ocorrencias ADD COLUMN ip TEXT").run(); } catch {}
  try { prepare("ALTER TABLE funcionarios ADD COLUMN matricula TEXT").run(); } catch {}
  try { prepare("ALTER TABLE contratos ADD COLUMN renovacao_automatica INTEGER DEFAULT 0").run(); } catch {}
}
