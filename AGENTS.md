# CampoApp - Agent Instructions

## Comandos

- **Backend testes:** `cd backend && npm test`
- **Backend dev:** `cd backend && npm run dev`
- **Frontend build:** `cd frontend && npm run build`
- **Frontend dev:** `cd frontend && npm run dev`
- **QA end-to-end:** `bash scripts/qa.sh`

## Stack

- Backend ESM Express + better-sqlite3, Zod, Helmet, rate-limit, pino, multer, bcryptjs, jsonwebtoken
- Frontend ESM React + Vite, react-router-dom, leaflet, axios
- Migrations em `backend/src/migrations/0XX_*.js`
- RBAC em `backend/src/middleware/auth.js`
- Auditoria em `backend/src/services/audit.js`

## Convenções

- Sem emoji em UI/comentários
- Erro sempre JSON: `{ error: '...' }`
- Handlers async com `asyncHandler`
- Nunca retorne `path` de fotos no payload
