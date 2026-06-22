import { Router } from 'express';
import { prepare } from '../database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/http-error.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const { busca, cidade, estado, page = 1, limit = 50 } = req.query;
  let query = 'SELECT * FROM clientes WHERE 1=1';
  const params = [];
  if (busca) { query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ? OR cpf_cnpj LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`); }
  if (cidade) { query += ' AND cidade LIKE ?'; params.push(`%${cidade}%`); }
  if (estado) { query += ' AND estado = ?'; params.push(estado); }
  query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit), offset);
  res.json(prepare(query).all(...params));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const cliente = prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
  res.json(cliente);
}));

router.post('/', requireRole('admin', 'tecnico', 'supervisor'), asyncHandler(async (req, res) => {
  const { nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, observacoes } = req.body;
  const result = prepare('INSERT INTO clientes (nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, observacoes);
  const cliente = prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(cliente);
}));

router.put('/:id', requireRole('admin', 'tecnico', 'supervisor'), asyncHandler(async (req, res) => {
  const existing = prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cliente não encontrado.' });
  const { nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, observacoes } = req.body;
  prepare(`UPDATE clientes SET nome=?, email=?, telefone=?, cpf_cnpj=?, endereco=?, cidade=?, estado=?, cep=?, observacoes=?, updated_at=datetime('now') WHERE id=?`).run(nome || existing.nome, email || existing.email, telefone || existing.telefone, cpf_cnpj || existing.cpf_cnpj, endereco || existing.endereco, cidade || existing.cidade, estado || existing.estado, cep || existing.cep, observacoes || existing.observacoes, req.params.id);
  res.json(prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id));
}));

export default router;
