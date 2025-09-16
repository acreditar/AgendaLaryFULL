
# Cuidando com Carinho

Sistema de gestão de pacientes para clínicas e profissionais de saúde, com foco em acessibilidade, controle de agendamentos, prontuários, relatórios e experiência do usuário.


---

## Visão Geral

O projeto permite:
- Cadastro, edição e exclusão de pacientes
- Gerenciamento de agendamentos (consultas)
- Prontuário completo do paciente (notas, evoluções, checklist, devolutiva)
- Marcação de presença/ausência em consultas
- Relatórios e exportação de dados
- Persistência local (localStorage)

---

## Tecnologias Utilizadas
- **React 18** + **TypeScript**
- **Vite** (build e dev server)
- **TailwindCSS** + **shadcn/ui** (componentes visuais)
- **date-fns** (datas)
- **lucide-react** (ícones)

## Requisitos
- Node.js (recomenda-se v18+)
- npm (ou yarn/pnpm se preferir — os scripts abaixo usam npm)

## Instalação (ambiente de desenvolvimento)
Abra um terminal (PowerShell no Windows) dentro da pasta do projeto e execute:

```powershell
# instalar dependências
npm install

# iniciar servidor de desenvolvimento (hot-reload)
npm run dev
```

Após iniciar, abra o navegador em http://localhost:8080/ (o terminal exibirá a porta caso seja diferente).

## Scripts úteis
- `npm run dev` — inicia o servidor de desenvolvimento (Vite)
- `npm run build` — gera a versão de produção em `dist/`
- `npm run preview` — serve a build gerada localmente para testes


## Estrutura de Pastas
```
├── public/
├── src/
│   ├── components/
│   │   ├── Agenda.tsx
│   │   ├── PatientList.tsx
│   │   ├── PatientDetail.tsx
│   │   ├── Prontuarios.tsx
│   │   ├── Reports.tsx
│   │   ├── Sidebar.tsx
│   │   └── ui/...
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   └── Index.tsx
│   └── types/
│       └── patient.ts
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## Backlog (Histórico de Funcionalidades)
- [x] Cadastro, edição e exclusão de pacientes
- [x] Listagem e busca de pacientes
- [x] Prontuário com abas: Informações, Checklist, Evolução, Devolutiva
- [x] Notas e evoluções do paciente
- [x] Agendamento de consultas (com data/hora e observação)
- [x] Marcação de presença/ausência (compareceu/não compareceu)
- [x] Relatórios dinâmicos (consultas, pacientes, exportação CSV)
- [x] Persistência local (localStorage)
- [x] Interface acessível e responsiva
- [x] Refatoração para centralizar estado dos pacientes
- [x] Remoção de dados hardcoded
- [x] Exportação/importação de dados (CSV)
- [x] Documentação técnica e README

---

## Sprints e Entregas

### Sprint 1
- Análise do projeto e definição do escopo
- Estruturação inicial do frontend (React, Vite, Tailwind)
- Protótipo de cadastro e listagem de pacientes

### Sprint 2
- Implementação do Prontuário (abas, notas, checklist, evolução)
- Adição de agendamentos e controle de presença
- Refino visual e acessibilidade

### Sprint 3
- Relatórios dinâmicos e exportação de dados
- Persistência local (localStorage)
- Refatoração para centralização do estado
- Ajustes finais de UX

### Sprint 4
- Revisão geral, testes manuais
- Documentação técnica e README
- Preparação para entrega acadêmica

---

## Fluxos Principais

### Paciente
- Cadastro, edição e exclusão via formulário/modal
- Visualização detalhada no Prontuário

### Agendamento
- Adição de consultas com data/hora e observação
- Marcação de presença/ausência
- Edição e remoção de agendamentos

### Prontuário
- Abas: Informações, Checklist, Evolução, Devolutiva
- Notas e evoluções salvas por paciente
- Histórico de agendamentos

### Relatórios
- Métricas de consultas, pacientes ativos, exportação CSV

---


## Dados e Persistência
- Os dados dos pacientes são gravados no `localStorage` do navegador para facilitar testes sem backend. A chave usada é:
	- `cuidando.pacientes`
- Não utilize `localStorage` para dados reais de pacientes em produção (LGPD/GDPR). Para produção, implemente um backend seguro com autenticação e armazenamento adequado.


## Testes Manuais / Fluxos de Aceitação
1. Criar paciente
	- Menu "Pacientes" → "Novo Paciente" → preencher formulário → Salvar
	- Verificar que aparece na lista
2. Abrir prontuário
	- Menu "Prontuários" → Abrir Prontuário de um paciente → Adicionar evolução/notas/agendamento
	- Verificar se evoluções e agendamentos ficam listados
3. Agenda central
	- Menu "Agenda" → Criar agendamento → Verificar que paciente associado tem `nextAppointment` atualizado
4. Persistência
	- Recarregar a página e confirmar que os pacientes permanecem (localStorage)


## Exportação / Importação de Dados
- Exportação recomendada: CSV (simples) ou XLSX (SheetJS) para compatibilidade com Excel.
- Exemplo de exportação CSV disponível no código-fonte.
- Para importação XLSX, utilize a biblioteca `xlsx` e converta planilhas em objetos para o localStorage.


## Boas Práticas e Recomendações para Produção
- Migrar persistência para backend com API (Node/Express, NestJS, etc.) e banco de dados (Postgres/MongoDB).
- Implementar autenticação e autorização (ex.: JWT + roles).
- Criptografar dados sensíveis e aplicar políticas de privacidade (LGPD).
- Implementar backups e exportação periódica de dados.


## Entrega Acadêmica / Prestação de Serviço
- Inclua este repositório, o `RELATORIO_TECNICO.md` e prints ou vídeo curto demonstrando os fluxos principais.
- Indique claramente no relatório as limitações (uso de `localStorage`, falta de autenticação) e as recomendações para evolução.


## Como Contribuir
- Fork este repositório
- Crie uma branch: `git checkout -b minha-feature`
- Faça commits claros e objetivos
- Abra um Pull Request

---

## Observações Finais
- O projeto foi desenvolvido para fins acadêmicos, mas pode ser expandido para uso real.
- Sugestões e melhorias são bem-vindas!

---

> Para detalhes técnicos, consulte também o arquivo `RELATORIO_TECNICO.md`.

---

Se quiser, eu adapto este README para um formato de entrega (PDF) ou gero slides com roteiro de apresentação e capturas de tela.
