import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/http-error.js';
import { prepare } from '../database.js';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const dashboard = {};
  const hoje = new Date().toISOString().split('T')[0];

  dashboard.total_atendimentos_hoje = prepare("SELECT COUNT(*) as count FROM atendimentos WHERE date(created_at) = ?").get(hoje).count;

  const statusRows = prepare('SELECT status, COUNT(*) as count FROM atendimentos GROUP BY status').all();
  dashboard.atendimentos_por_status = {};
  statusRows.forEach(r => { dashboard.atendimentos_por_status[r.status] = r.count; });

  const totalTecnicos = prepare('SELECT COUNT(*) as count FROM usuarios WHERE role = ?').get('tecnico').count;
  const totalAtendimentosHoje = dashboard.total_atendimentos_hoje || 0;
  dashboard.media_atendimentos_tecnico_dia = totalTecnicos > 0 ? (totalAtendimentosHoje / totalTecnicos).toFixed(1) : 0;

  dashboard.top_tecnicos = prepare(`SELECT u.nome, COUNT(a.id) as total FROM usuarios u LEFT JOIN atendimentos a ON u.id = a.usuario_id WHERE u.role = 'tecnico' GROUP BY u.id ORDER BY total DESC LIMIT 5`).all();

  res.json(dashboard);
}));

export default router;
