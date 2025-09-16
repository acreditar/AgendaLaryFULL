# Relatório Técnico — Prestação de Serviço (Cuidando com Carinho)

## 1. Resumo
Este relatório descreve o desenvolvimento do protótipo "Cuidando com Carinho", um front-end React/TypeScript para gerenciamento de pacientes e prontuários, entregue como atividade de extensão universitária.

## 2. Objetivo do Serviço
Fornecer um protótipo funcional para suporte a atividades clínicas/educacionais: cadastro e gestão de pacientes, prontuários com evoluções e agendamentos, e relatórios básicos.

## 3. Metodologia
- Desenvolvimento incremental com ciclos curtos (sprints de 1 semana).
- Estado centralizado no frontend para prototipagem rápida (persistência local via `localStorage`).
- Componentização (shadcn UI) e tipagem com TypeScript.

## 4. Escopo entregue
- Listagem e CRUD de pacientes.
- Prontuário com notas, evoluções e agendamentos por paciente.
- Agenda sincronizada com pacientes.
- Persistência local (key: `cuidando.pacientes`).
- Arquitetura e documentação mínima para entrega.

## 5. Horas gastas (exemplo)
- Planejamento: 4h
- Implementação: 20h
- Testes e ajustes: 6h
- Documentação e entrega: 4h
- Total estimado: 34h

*Ajuste conforme tempo real gasto.*

## 6. Entregáveis
- Código fonte no repositório (frontend).
- `README.md` com instruções de instalação e uso.
- Relatório técnico (este documento).
- Demonstração funcional (vídeo/screenshots recomendados).

## 7. Recomendações técnicas para evolução
- Backend com autenticação e armazenamento seguro.
- Migração de `localStorage` para banco (Postgres / MongoDB).
- Logging e backups.
- Controle de acesso por perfis (terapeuta, assistente, administrador).

## 8. Riscos e mitigação
- Uso de dados sensíveis em `localStorage`: mitigar com política de não uso em produção; migrar para backend seguro.
- Falta de backup: implementar rotina de exportação/backup automático.

## 9. Critérios de aceitação (proposta)
- Sistema instalável e executável seguindo README.
- CRUD de pacientes funcional em 80% dos casos de uso.
- Prontuário permitindo adicionar evoluções e agendamentos por paciente.
- Dados persistem após reload (localStorage).

## 10. Anexos
- Instruções de instalação (ver `README.md`).
- Sugestão de roteiro de apresentação para banca/avaliação.

---

Assinatura: equipe de desenvolvimento

Data de entrega: 29/08/2025
