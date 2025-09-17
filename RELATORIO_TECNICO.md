# Relatório Técnico — Cuidando com Carinho

Data: 17/09/2025

## 1) Resumo Executivo
Projeto web para gestão de pacientes, prontuários e agenda, composto por:
- Frontend: React + TypeScript + Vite + Tailwind (componentes shadcn/Radix)
- Backend: Node.js + Express com persistência em arquivo JSON (fs-extra)

Entregas principais: CRUD de pacientes, prontuário (notas/evoluções/agendamentos), agenda centralizada, melhorias de acessibilidade/UX, padronização de horários no modelo brasileiro (UTC-3, 24h), testes automatizados, e guias de deploy (Vercel + Fly/Render).

## 2) Objetivos do Serviço
- Disponibilizar um protótipo funcional e acessível para uso clínico/educacional.
- Facilitar cadastro/gestão de pacientes e acompanhamento por agendamentos/evoluções.
- Oferecer caminho de deploy gratuito e persistência simples.

## 3) Arquitetura e Tecnologias
- Frontend: React 18, TypeScript, Vite, Tailwind, Radix UI (shadcn), React Router, TanStack Query.
- Backend: Express, CORS, body-parser; persistência simples via arquivo JSON.
- Persistência: arquivo `backend/backend-db.json` (configurável por `DB_FILE`/`DB_PATH`).
- Integração: REST API em `/api` (pacientes e agendamentos), consumida via `src/lib/api.ts`.
- Testes: Vitest + React Testing Library + jsdom.
- Dev/Build: Vite 5; ESLint configurado; build de produção gerando `dist/`.

## 4) Funcionalidades Entregues
- Pacientes: listagem, criação, edição e remoção (CRUD).
- Prontuário: notas, evoluções, agendamentos por paciente; status e estatísticas básicas.
- Agenda: visão consolidada de “Hoje” e “Próximas”, com ações rápidas (editar/remover/marcar presença/ausência).
- Acessibilidade/UX:
	- Checklist real (checkboxes) com rótulos e teclado, em vez de textarea.
	- Diálogos com descrição semântica.
	- Agendamento com Data e Hora separados, com rótulos e validação simples.
	- Seletor de Hora (TimePicker) 24h, passo configurável (padrão 15 min).
- Horário/Timezone: padronização BR (UTC-3, 24h) com utilitários em `src/lib/datetime.ts`.
- Deploy: guias para Vercel (frontend) e Fly/Render (backend) com variáveis de ambiente e Dockerfile do backend.

## 5) API — Endpoints Principais
- `GET /api/patients` — lista pacientes (com agendamentos agregados).
- `POST /api/patients` — cria paciente.
- `PUT /api/patients/:id` — atualiza paciente.
- `DELETE /api/patients/:id` — remove paciente (e agendamentos associados).
- `POST /api/patients/:id/appointments` — cria agendamento para o paciente.
- `PUT /api/patients/:id/appointments/:aid` — atualiza agendamento.
- `DELETE /api/patients/:id/appointments/:aid` — remove agendamento.

Persistência em `backend/db.js` com `fs-extra`, suportando `DB_FILE`/`DB_PATH` para configurar o local do JSON (compatível com volumes em produção).

## 6) Linha do Tempo (Sprints)
Período: ago/2025 – set/2025

- Sprint 1 — Persistência e API
	- Análise de armazenamento e import/export; decisão por persistência em JSON para evitar problemas de permissão (OneDrive/Windows).
	- Backend Express com CORS e endpoints REST para pacientes e agendamentos.
	- Inicialização segura do arquivo de dados com `fs-extra`.

- Sprint 2 — Integração Frontend+API e Estabilidade
	- `src/lib/api.ts` com chamadas tipadas; wiring do CRUD no frontend.
	- Correção de crash na Agenda (IDs, guards, normalização de tipos).
	- Centralização de estado e melhoria de validações.

- Sprint 3 — Codificação e Testes
	- Correção de acentuação/encoding (UTF-8) no dev server (middleware de charset no Vite).
	- Setup de testes (Vitest + RTL + jsdom); execução inicial passando.
	- Tipos compartilhados e ajustes no ESLint.

- Sprint 4 — Acessibilidade e UX
	- Checklist com checkboxes e rótulos claros.
	- Diálogos com `DialogDescription`.
	- Agendamento: inputs separados de Data e Hora com labels consistentes.

- Sprint 5 — Horários no padrão BR (UTC-3)
	- `src/lib/datetime.ts` com helpers (todayDatePartBR, split/join de data/hora, isoishToBR).
	- Refactor da Agenda e do Prontuário para 24h e formato pt-BR; TimePicker 24h.

- Sprint 6 — Deploy e DevOps
	- `backend/Dockerfile` para deploy containerizado.
	- Guia de deploy gratuito: Vercel (frontend) + Fly/Render (backend) com `VITE_API_URL` e `DB_FILE`.
	- `vercel.json` para SPA routing (fallback para `index.html`).

- Sprint 7 — Limpeza e Manutenção
	- Build de produção validado sem o plugin.

## 7) Qualidade e Verificações
- Build de Produção: OK (Vite 5, sem erros).
- Testes: suíte inicial com Vitest/RTL executando; sem falhas reportadas.
- Smoke Test: CRUD básico e agendamentos realizados na interface; persistência confirmada no arquivo JSON local.

## 8) Deploy (Resumo)
- Frontend (Vercel):
	- Build: `npm run build`, saída `dist/`.
	- Variáveis: `VITE_API_URL` apontando para o backend.
	- SPA: `vercel.json` com rewrites para `index.html`.

- Backend (Fly/Render):
	- Fly.io com volume: definir `DB_FILE=/data/backend-db.json`; montar volume em `/data`.
	- Render Web Service (monorepo root em `backend`): `PORT=3001`, `DB_FILE=/opt/render/project/src/backend/backend-db.json`; considerar Disk para persistência.

## 9) Riscos e Mitigações
- Persistência em arquivo JSON: simples e suficiente para protótipo; para produção, migrar para banco gerenciado (Postgres/Mongo) ou garantir volumes persistentes.
- Ausência de autenticação: adicionar em fases futuras (JWT/OAuth) conforme requisitos de privacidade.
- Backups: implementar rotina de exportação/backup periódico do JSON ou do banco.

## 10) Próximos Passos (Roadmap)
- Autenticação e perfis de acesso.
- Migração para banco gerenciado (ex.: Postgres/Mongo) e ORM.
- Cobertura de testes mais ampla (Agenda/fluxos críticos) e CI.
- Melhorias de relatórios (exportações CSV/Excel, filtros avançados).
- Observabilidade (logs estruturados, métricas básicas).

## 11) Critérios de Aceitação (Atualizados)
- CRUD de pacientes e agendamentos funcionando e persistindo.
- Prontuário com notas e evoluções operacionais.
- Horários exibidos e inseridos no padrão BR (UTC-3, 24h).
- Build e testes passando localmente; deploy gratuito possível conforme guia.

---

Assinatura: equipe de desenvolvimento

Data de entrega (versão atual): 17/09/2025
