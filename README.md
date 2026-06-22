# 📋 CampoApp — Controle de Equipe de Campo Operacional

Sistema de controle de equipe de campo operacional com checklists, registro de atendimentos, fotos, geolocalização e dashboard de métricas.

## Stack

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Express.js + better-sqlite3
- **Infra:** Docker + Docker Compose
- **Porta:** 3001

## Funcionalidades

- ✅ Autenticação JWT com seed de admin
- ✅ CRUD de checklists operacionais
- ✅ Registro de atendimentos com geolocalização
- ✅ Upload de fotos (multipart, drag & drop)
- ✅ Dashboard com cards de métricas
- ✅ Relatório de produtividade por técnico/dia
- ✅ Kanban de atendimentos
- ✅ Controle de estoque e contratos
- ✅ LGPD e auditoria
- ✅ Filtros, paginação e busca textual
- ✅ Layout responsivo com sidebar

## Como Rodar

```bash
docker compose up --build
```

Acesse: http://localhost:3001

## Credenciais Padrão

- **Email:** admin@campo.com
- **Senha:** admin123

## Licença

MIT
