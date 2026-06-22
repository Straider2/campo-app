import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campo-app-secret-key-2024';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, nome: user.nome }, JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso não autorizado.' });
    }
    next();
  };
}

export function guardAtendimento(req, res, next) {
  if (req.user.role === 'admin') return next();
  const { prepare } = require('../database.js');
  if (req.params.id) {
    const atendimento = prepare('SELECT usuario_id FROM atendimentos WHERE id = ?').get(req.params.id);
    if (!atendimento || atendimento.usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Você só pode acessar seus próprios atendimentos.' });
    }
  }
  next();
}
