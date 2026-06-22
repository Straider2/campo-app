import { Router } from 'express';
import { prepare } from '../database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/http-error.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const { tipo_servico } = req.query;
  let query = 'SELECT * FROM checklists';
  const params = [];
  if (tipo_servico) { query += ' WHERE tipo_servico = ?'; params.push(tipo_servico); }
  query += ' ORDER BY created_at DESC';
  const rows = prepare(query).all(...params);
  res.json(rows.map(r => ({ ...r, itens: JSON.parse(r.itens) })));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const c = prepare('SELECT * FROM checklists WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Checklist não encontrado.' });
  res.json({ ...c, itens: JSON.parse(c.itens) });
}));

router.post('/', requireRole('admin', 'supervisor', 'tecnico'), asyncHandler(async (req, res) => {
  const { titulo, tipo_servico, itens } = req.body;
  if (!titulo || !tipo_servico || !itens) return res.status(400).json({ error: 'Título, tipo_servico e itens são obrigatórios.' });
  const result = prepare('INSERT INTO checklists (titulo, tipo_servico, itens) VALUES (?, ?, ?)').run(titulo, tipo_servico, JSON.stringify(itens));
  res.status(201).json(prepare('SELECT * FROM checklists WHERE id = ?').get(result.lastInsertRowid));
}));

router.put('/:id', requireRole('admin', 'supervisor'), asyncHandler(async (req, res) => {
  const c = prepare('SELECT * FROM checklists WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Checklist não encontrado.' });
  const { titulo, tipo_servico, itens } = req.body;
  prepare("UPDATE checklists SET titulo=?, tipo_servico=?, itens=?, updated_at=datetime('now') WHERE id=?").run(titulo || c.titulo, tipo_servico || c.tipo_servico, itens ? JSON.stringify(itens) : c.itens, req.params.id);
  res.json(prepare('SELECT * FROM checklists WHERE id = ?').get(req.params.id));
}));

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  prepare('DELETE FROM checklists WHERE id = ?').run(req.params.id);
  res.json({ message: 'Checklist removido.' });
}));

export default router;
