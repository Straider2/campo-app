import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prepare } from '../database.js';
import { authMiddleware, requireRole, guardAtendimento } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/http-error.js';

const router = Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (req, file, cb) => { cb(null, uuidv4() + path.extname(file.originalname)); }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, busca, status, tecnico, data_inicio, data_fim } = req.query;
  let query = 'SELECT a.*, u.nome as tecnico_nome FROM atendimentos a JOIN usuarios u ON a.usuario_id = u.id WHERE 1=1';
  const params = [];
  if (busca) { query += ' AND (a.cliente_nome LIKE ? OR a.endereco LIKE ? OR a.observacoes LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (tecnico) { query += ' AND a.usuario_id = ?'; params.push(tecnico); }
  if (data_inicio) { query += ' AND date(a.data_atendimento) >= ?'; params.push(data_inicio); }
  if (data_fim) { query += ' AND date(a.data_atendimento) <= ?'; params.push(data_fim); }
  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  const rows = prepare(query).all(...params);
  res.json(rows.map(r => ({ ...r, checklist_respostas: JSON.parse(r.checklist_respostas || '[]') })));
}));

router.get('/:id', guardAtendimento, asyncHandler(async (req, res) => {
  const a = prepare('SELECT a.*, u.nome as tecnico_nome FROM atendimentos a JOIN usuarios u ON a.usuario_id = u.id WHERE a.id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Atendimento não encontrado.' });
  const fotos = prepare('SELECT id, filename, original_name FROM fotos WHERE atendimento_id = ?').all(req.params.id);
  res.json({ ...a, checklist_respostas: JSON.parse(a.checklist_respostas || '[]'), fotos });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { cliente_id, cliente_nome, endereco, latitude, longitude, tipo_servico, checklist_id, checklist_respostas, observacoes, status, data_atendimento } = req.body;
  if (!cliente_nome || !tipo_servico) return res.status(400).json({ error: 'cliente_nome e tipo_servico são obrigatórios.' });
  const result = prepare('INSERT INTO atendimentos (usuario_id, cliente_id, cliente_nome, endereco, latitude, longitude, tipo_servico, checklist_id, checklist_respostas, observacoes, status, data_atendimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id, cliente_id || null, cliente_nome, endereco || null, latitude || null, longitude || null, tipo_servico, checklist_id || null, JSON.stringify(checklist_respostas || []), observacoes || null, status || 'pendente', data_atendimento || new Date().toISOString().split('T')[0]);
  res.status(201).json(prepare('SELECT * FROM atendimentos WHERE id = ?').get(result.lastInsertRowid));
}));

router.put('/:id', guardAtendimento, asyncHandler(async (req, res) => {
  const a = prepare('SELECT * FROM atendimentos WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Atendimento não encontrado.' });
  const { cliente_nome, endereco, latitude, longitude, tipo_servico, checklist_id, checklist_respostas, observacoes, status, data_atendimento } = req.body;
  prepare("UPDATE atendimentos SET cliente_nome=?, endereco=?, latitude=?, longitude=?, tipo_servico=?, checklist_id=?, checklist_respostas=?, observacoes=?, status=?, data_atendimento=?, updated_at=datetime('now') WHERE id=?").run(cliente_nome || a.cliente_nome, endereco || a.endereco, latitude ?? a.latitude, longitude ?? a.longitude, tipo_servico || a.tipo_servico, checklist_id ?? a.checklist_id, checklist_respostas ? JSON.stringify(checklist_respostas) : a.checklist_respostas, observacoes ?? a.observacoes, status || a.status, data_atendimento || a.data_atendimento, req.params.id);
  res.json(prepare('SELECT * FROM atendimentos WHERE id = ?').get(req.params.id));
}));

router.post('/:id/fotos', upload.array('fotos', 10), asyncHandler(async (req, res) => {
  const a = prepare('SELECT id FROM atendimentos WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Atendimento não encontrado.' });
  for (const f of req.files) {
    prepare('INSERT INTO fotos (atendimento_id, filename, original_name, path) VALUES (?, ?, ?, ?)').run(req.params.id, f.filename, f.originalname, f.path);
  }
  res.json(prepare('SELECT id, filename, original_name FROM fotos WHERE atendimento_id = ?').all(req.params.id));
}));

export default router;
