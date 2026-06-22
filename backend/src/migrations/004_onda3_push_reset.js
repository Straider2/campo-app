export async function up(prepare) {
  try { prepare("DELETE FROM push_tokens").run(); } catch {}
  try { prepare("ALTER TABLE ocorrencias ADD COLUMN ref_id TEXT").run(); } catch {}
  try { prepare("ALTER TABLE contratos ADD COLUMN observacoes TEXT").run(); } catch {}
  try { prepare("CREATE INDEX IF NOT EXISTS idx_ocorrencias_usuario ON ocorrencias(usuario_id)").run(); } catch {}
}
