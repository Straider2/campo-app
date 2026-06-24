# CampoApp — Controle de Equipe de Campo Operacional

Sistema completo para controle de equipe de campo: checklists, registro de atendimentos com geolocalização, fotos, dashboard de métricas, mapa interativo, Kanban, SLA, contratos, estoque e equipamentos.

## Stack

- **Frontend**: React 18 + Vite 5 (JavaScript, ESM)
- **Mapa**: Leaflet + react-leaflet 4 (OpenStreetMap)
- **Backend**: Express.js + SQLite (better-sqlite3, WAL mode)
- **Containerização**: Docker + Docker Compose (dev e prod)
- **Testes**: Vitest + Supertest (105 testes)

## Executar com Docker (Desenvolvimento)

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Serviço   | Porta  | URL                          |
|-----------|--------|------------------------------|
| Frontend  | 5174   | http://localhost:5174        |
| Backend   | 3001   | http://localhost:3001/api    |

## Executar Localmente (Desenvolvimento)

### Backend
```bash
cd backend
npm install
npm run dev        # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Credenciais Padrão

- **Email**: `admin@campo.com`
- **Senha**: `admin123` (definida via `ADMIN_DEFAULT_PASSWORD` na primeira inicialização)

## Estrutura do Projeto

```
campo-app/
├── frontend/
│   ├── src/
│   │   ├── api/           # Cliente Axios com interceptor JWT
│   │   ├── components/    # ExportButton, Layout, PrivateRoute, Foto
│   │   ├── context/       # AuthContext, ThemeContext
│   │   └── pages/         # Dashboard, Atendimentos, Mapa, Kanban, SLA...
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/        # 17 módulos de rotas
│   │   ├── middleware/     # auth (RBAC), validators (Zod), infra, http-error
│   │   ├── migrations/    # 001 a 005 (versionadas, idempotentes)
│   │   ├── services/      # audit, routeOptimizer, retentionJob
│   │   ├── database.js    # better-sqlite3 + WAL
│   │   ├── seed.js        # Dados de demonstração
│   │   └── index.js       # Entry point Express
│   └── test/              # 105 testes Vitest + Supertest
├── scripts/
│   └── qa.sh              # QA automatizado
├── docker-compose.yml           # Produção (nginx + backend)
├── docker-compose.dev.yml       # Desenvolvimento (Vite HMR + hot-reload)
├── Dockerfile.backend
├── Dockerfile.backend.dev
├── Dockerfile.frontend
├── Dockerfile.frontend.dev
├── AGENTS.md             # Guia para OpenCode/IA agents
├── SPEC.md               # Especificação original
└── README.md
```

## Ondas de Desenvolvimento

### Onda 1 — Segurança & Robustez do Backend
- Troca do `sql.js` pelo `better-sqlite3` (transações reais, WAL)
- Migrations versionadas (`backend/src/migrations/`) com tabela `migrations_run`
- `JWT_SECRET` obrigatório em produção
- RBAC granular: `requireRole`, `guardAtendimento` com autorização por proprietário + técnico alocado
- Rate limiting em login/register (15 req/15 min por IP)
- Helmet + CORS + pino (logs estruturados, sem vazar secrets)
- Error handler padronizado (sem stack trace em prod)
- Validação Zod em todas as rotas
- Política mínima de senha (8+ caracteres, 1 letra, 1 número)
- Número de OS atômico (transação, sem race condition)
- Fotos servidas por rota autenticada (`Authorization` header)
- Auditoria: tabela `ocorrencias` + endpoint `GET /api/relatorios/auditoria`
- Exclusão segura de fotos (arquivo em disco + row)
- Proteção contra auto-exclusão do admin e exclusão de técnicos com atendimentos ativos

### Onda 2 — Geolocalização, Workflow, LGPD, Roteirização
- Geolocalização obrigatória (lat/lng + precision + timestamp)
- Workflow customizável (`status_workflow` + `GET/PUT /api/workflow`)
- Roteirização OSRM com fallback nearest-neighbour (`GET /api/atendimentos/rota`)
- LGPD: consentimentos, exportação PII, anonimização, purge automático de fotos
- Prometheus `/metrics` (prom-client) + Sentry (`SENTRY_DSN`)

### Onda 3 — Push, Reset, Comentários, Histórico
- Push notifications (service worker + endpoint)
- Reset de senha com token
- Comentários em atendimentos
- Histórico de mudanças de status
- Alocação múltipla de técnicos por atendimento

### Ondas 4 & 5 — Equipamentos, SLA, Contratos, Estoque, Refresh Tokens
- **Equipamentos**: cadastro de ativos do cliente (tipo, modelo, serial, MAC, status)
- **SLA**: prazos por tipo de serviço com alertas de vencimento
- **Contratos**: OS recorrentes com periodicidade configurável
- **Estoque**: movimentações (entrada/saída/ajuste) com controle de saldo
- **Refresh Tokens**: autenticação persistente com revogação
- **Retenção automática**: job de limpeza de dados expirados (LGPD)

## Variáveis de Ambiente

| Variável                    | Dev padrão                           | Obrigatória em prod |
|-----------------------------|--------------------------------------|---------------------|
| `JWT_SECRET`                | `campo-app-dev-secret-key`           | sim                 |
| `ADMIN_DEFAULT_PASSWORD`    | `admin123`                           | não                 |
| `LOG_LEVEL`                 | `info`                               | não                 |
| `PORT`                      | `3001`                               | não                 |
| `OSRM_URL`                  | `https://router.project-osrm.org`    | não                 |
| `SENTRY_DSN`                | (vazio)                              | não                 |
| `RETENTION_PHOTO_DAYS`      | `365`                                | não                 |
| `LGPD_RETENTION_INTERVAL_MS`| `21600000` (6h)                      | não                 |

## API Endpoints

### Autenticação
| Método | Rota                | Descrição                    |
|--------|---------------------|------------------------------|
| POST   | /api/auth/login     | Login (email, senha)         |
| POST   | /api/auth/register  | Registrar novo usuário (admin)|
| GET    | /api/auth/me        | Dados do usuário logado      |
| GET    | /api/auth/tecnicos  | Listar técnicos              |

### Atendimentos
| Método | Rota                                | Descrição                    |
|--------|-------------------------------------|------------------------------|
| GET    | /api/atendimentos                   | Listar (filtros: data, tecnico, status, busca, page, limit) |
| GET    | /api/atendimentos/:id               | Detalhes do atendimento      |
| POST   | /api/atendimentos                   | Criar atendimento            |
| PUT    | /api/atendimentos/:id               | Editar atendimento           |
| DELETE | /api/atendimentos/:id               | Excluir atendimento          |
| POST   | /api/atendimentos/:id/fotos         | Upload de fotos (multipart)  |
| GET    | /api/atendimentos/:id/fotos/:fotoId | Visualizar foto              |
| DELETE | /api/atendimentos/:id/fotos/:fotoId | Remover foto                 |
| GET    | /api/atendimentos/rota              | Rota otimizada (OSRM)        |

### Checklists
| Método | Rota                | Descrição                          |
|--------|---------------------|------------------------------------|
| GET    | /api/checklists     | Listar (filtro: tipo_servico)      |
| POST   | /api/checklists     | Criar checklist                    |
| PUT    | /api/checklists/:id | Editar checklist                   |
| DELETE | /api/checklists/:id | Excluir checklist                  |

### Clientes
| Método | Rota              | Descrição              |
|--------|-------------------|------------------------|
| GET    | /api/clientes     | Listar todos           |
| POST   | /api/clientes     | Criar cliente          |
| PUT    | /api/clientes/:id | Editar cliente         |
| DELETE | /api/clientes/:id | Excluir cliente        |

### Funcionários
| Método | Rota                  | Descrição              |
|--------|-----------------------|------------------------|
| GET    | /api/funcionarios     | Listar todos           |
| POST   | /api/funcionarios     | Criar funcionário      |
| PUT    | /api/funcionarios/:id | Editar funcionário     |
| DELETE | /api/funcionarios/:id | Excluir funcionário    |

### Equipamentos
| Método | Rota                    | Descrição              |
|--------|-------------------------|------------------------|
| GET    | /api/equipamentos       | Listar (filtro: cliente_id) |
| POST   | /api/equipamentos       | Cadastrar equipamento  |
| PUT    | /api/equipamentos/:id   | Editar equipamento     |
| DELETE | /api/equipamentos/:id   | Excluir equipamento    |

### Estoque / Itens
| Método | Rota              | Descrição              |
|--------|-------------------|------------------------|
| GET    | /api/itens        | Listar itens           |
| POST   | /api/itens        | Criar item             |
| PUT    | /api/itens/:id    | Editar item            |
| DELETE | /api/itens/:id    | Excluir item           |
| GET    | /api/estoque      | Consultar saldo        |

### Contratos
| Método | Rota                | Descrição              |
|--------|---------------------|------------------------|
| GET    | /api/contratos      | Listar contratos       |
| POST   | /api/contratos      | Criar contrato         |
| PUT    | /api/contratos/:id  | Editar contrato        |
| DELETE | /api/contratos/:id  | Excluir contrato       |

### SLA
| Método | Rota          | Descrição                    |
|--------|---------------|------------------------------|
| GET    | /api/sla      | Listar configurações de SLA  |
| GET    | /api/sla/stats| Estatísticas de cumprimento  |

### Workflow
| Método | Rota            | Descrição                    |
|--------|-----------------|------------------------------|
| GET    | /api/workflow   | Obter workflow de status     |
| PUT    | /api/workflow   | Atualizar workflow           |

### Dashboard & Relatórios
| Método | Rota                | Descrição                    |
|--------|---------------------|------------------------------|
| GET    | /api/dashboard      | Métricas do dashboard        |
| GET    | /api/produtividade  | Produtividade por técnico/dia|
| GET    | /api/relatorios     | Relatórios gerais            |
| GET    | /api/relatorios/auditoria | Log de auditoria        |

### Exportação & Push
| Método | Rota            | Descrição                    |
|--------|-----------------|------------------------------|
| GET    | /api/export     | Exportar dados (CSV)         |
| POST   | /api/push       | Registrar push subscription  |

### LGPD
| Método | Rota                   | Descrição                    |
|--------|------------------------|------------------------------|
| GET    | /api/lgpd/export/:id   | Exportar dados do titular    |
| POST   | /api/lgpd/anonymize/:id| Anonimizar dados do titular  |

## Funcionalidades do Frontend

- **Dashboard**: cards de métricas (atendimentos hoje, por status, média/técnico, top 5)
- **Atendimentos**: tabela com filtros, busca textual, paginação, drag & drop de fotos
- **Mapa interativo**: visualização geoespacial com Leaflet/OpenStreetMap, filtros por status e técnico, marcadores coloridos, popups com detalhes
- **Kanban**: quadro visual de atendimentos por status (drag & drop entre colunas)
- **Clientes**: CRUD completo com busca
- **Funcionários**: gestão de equipe
- **Checklists**: templates por tipo de serviço
- **Estoque**: controle de itens/peças com saldo
- **Equipamentos**: cadastro de ativos dos clientes
- **Contratos**: OS recorrentes com periodicidade
- **SLA**: painel de prazos e alertas
- **Produtividade**: relatório por técnico/período
- **Relatórios**: exportação CSV
- **Tema**: claro/escuro (ThemeContext)
- **Responsivo**: sidebar de navegação, layout adaptativo
- **PWA-ready**: service worker + manifest

## QA

```bash
bash scripts/qa.sh
```

Relatório automatizado:
- 105 testes backend (Vitest + Supertest)
- Build do frontend
- Verificações de regressão de segurança
- Sai `0` se aprovado

## AGENTS.md

O arquivo `AGENTS.md` contém guia para agentes de IA (OpenCode, Claude Code) com:
- Comandos de verificação
- Estrutura do projeto
- Convenções de código
- Stack e test framework
