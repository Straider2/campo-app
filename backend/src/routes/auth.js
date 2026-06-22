import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prepare } from '../database.js';
import { generateToken, authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/http-error.js';

const router = Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  const user = prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });
  const valid = bcrypt.compareSync(senha, user.senha);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas.' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
}));

router.post('/register', authMiddleware, requireRole('admin'), asyncHandler(async (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  const existing = prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email já cadastrado.' });
  const hash = bcrypt.hashSync(senha, 10);
  const result = prepare('INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)').run(nome, email, hash, role || 'tecnico');
  res.status(201).json({ id: result.lastInsertRowid, nome, email, role: role || 'tecnico' });
}));

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = prepare('SELECT id, nome, email, role, created_at FROM usuarios WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json(user);
}));

router.get('/tecnicos', authMiddleware, asyncHandler(async (req, res) => {
  res.json(prepare('SELECT id, nome FROM usuarios ORDER BY nome ASC').all());
}));

export default router;
