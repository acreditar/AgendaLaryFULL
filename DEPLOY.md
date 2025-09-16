# Deploy gratuito (Frontend + Backend)

Este projeto tem duas partes:
- Frontend (Vite/React) — ideal no Vercel (grátis)
- Backend (Express + JSON) — implante em um serviço com suporte a Node (ex.: Fly.io). Algumas plataformas gratuitas podem ter limitações/persistência volátil — verifique o provedor.

Observação importante sobre dados: o backend armazena tudo num arquivo JSON. Para não perder dados em cada deploy/restart, você precisa de um volume persistente ou trocar para um banco externo. Abaixo listo opções.

## Opção 1 — Rápida para teste (pode perder dados)
- Frontend: Vercel (grátis)
- Backend: Render (ou Koyeb/Railway free) sem volume. Funciona para demo, mas o arquivo pode ser resetado quando a instância dorme/reinicia.

## Opção 2 — Persistente (recomendado)
- Frontend: Vercel (grátis)
- Backend: Fly.io com Volume (dados persistem). Verifique os limites gratuitos do provedor.

---

## 1) Backend

### 1A) Fly.io (persistência com volume)
Pré-requisitos: instalar `flyctl` e criar conta.

1. Abra um terminal na pasta `backend` do projeto.
2. Inicialize o app (responda as perguntas; porta 3001):
   ```powershell
   fly launch
   ```
3. Crie um volume para persistência (1 GB é suficiente para JSON):
   ```powershell
   fly volumes create data --size 1
   ```
4. No `fly.toml` (gerado pelo launch), adicione/mantenha as variáveis e o mount (exemplo):
   - Env: `DB_FILE=/data/backend-db.json`
   - Mount: volume `data` para `/data`
5. Deploy:
   ```powershell
   fly deploy
   ```
6. Copie a URL pública (ex.: `https://seu-app.fly.dev`). Você usará no frontend como `VITE_API_URL`.

Notas:
- O backend suporta `DB_FILE` (via `backend/db.js`) para apontar o local do arquivo.
- A imagem Docker não é obrigatória no Fly (ele detecta Node), mas há um `backend/Dockerfile` caso prefira.

### 1B) Render (rápido, mas verifique persistência)
1. Publique seu repo no GitHub.
2. No Render, crie um novo Web Service apontando para a pasta `backend` (monorepo).
   - Build Command: `npm ci`
   - Start Command: `npm start`
3. Variáveis de ambiente:
   - `PORT` = `3001`
   - `DB_FILE` = `/opt/render/project/src/backend/backend-db.json` (caminho dentro do container)
4. (Opcional) Adicione um Disk (se disponível no plano) e aponte `DB_FILE` para a pasta montada.
5. Após o deploy, pegue a URL pública (ex.: `https://seu-backend.onrender.com`). Use-a no frontend.

Observação: Planos/ligações gratuitos mudam com o tempo. Sem Disk, o JSON pode ser apagado em reinícios.

---

## 2) Frontend (Vercel)
1. Importe o repositório no Vercel (New Project).
2. Framework Preset: Vite
3. Build & Output:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Variáveis de ambiente (Project Settings > Environment Variables):
   - `VITE_API_URL` = URL do backend (ex.: `https://seu-app.fly.dev`)
5. Deploy. A SPA usa React Router; se necessário, `vercel.json` (já incluído) faz fallback para `index.html`.

---

## 3) Teste pós-deploy
- Abra `${VITE_API_URL}/api/patients` no navegador — deve retornar `[]` inicialmente.
- Acesse o frontend na URL da Vercel e cadastre um paciente e um agendamento. Recarregue e verifique persistência.

---

## 4) Alternativa: Banco gerenciado gratuito
Se quiser manter 100% gratuito sem volume, considere migrar o backend para um banco gratuito (ex.: MongoDB Atlas Free). Isso requer alterar o código para usar um driver ao invés de arquivo JSON. Posso adaptar se quiser.
