import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDb } from './database.js';
import { runMigrations } from './migrations/migrate.js';
import { requestLogger, errorLogger } from './middleware/infra.js';
import authRouter from './routes/auth.js';
import clientesRouter from './routes/clientes.js';
import checklistsRouter from './routes/checklists.js';
import atendimentosRouter from './routes/atendimentos.js';
import dashboardRouter from './routes/dashboard.js';
import produtividadeRouter from './routes/produtividade.js';
import relatoriosRouter from './routes/relatorios.js';
import slaRouter from './routes/sla.js';
import workflowRouter from './routes/workflow.js';
import funcionariosRouter from './routes/funcionarios.js';
import equipamentosRouter from './routes/equipamentos.js';
import estoqueRouter from './routes/estoque.js';
import contratosRouter from './routes/contratos.js';
import itensRouter from './routes/itens.js';
import exportRouter from './routes/export.js';
import pushRouter from './routes/push.js';
import lgpdRouter from './routes/lgpd.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/atendimentos', atendimentosRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/produtividade', produtividadeRouter);
app.use('/api/relatorios', relatoriosRouter);
app.use('/api/sla', slaRouter);
app.use('/api/workflow', workflowRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/equipamentos', equipamentosRouter);
app.use('/api/estoque', estoqueRouter);
app.use('/api/contratos', contratosRouter);
app.use('/api/itens', itensRouter);
app.use('/api/export', exportRouter);
app.use('/api/push', pushRouter);
app.use('/api/lgpd', lgpdRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.use(errorLogger);

async function start() {
  await initDb();
  await runMigrations();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampoApp backend running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

export default app;
