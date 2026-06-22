# CampoApp - Controle de Equipe de Campo Operacional

Sistema completo para controle de equipe de campo operacional.

## Stack

- Frontend: React + Vite
- Backend: Express.js + better-sqlite3
- Infra: Docker + Docker Compose
- Porta: 3001

## Funcionalidades

- Autenticação JWT
- CRUD de checklists, clientes, atendimentos
- Upload de fotos com geolocalização
- Dashboard com métricas
- Produtividade por técnico
- Kanban de atendimentos
- Controle de estoque, contratos, equipamentos
- LGPD e auditoria

## Credenciais Padrão

- Email: admin@campo.com
- Senha: admin123

## Rodar

```bash
docker compose up --build
```

Acesse: http://localhost:3001
