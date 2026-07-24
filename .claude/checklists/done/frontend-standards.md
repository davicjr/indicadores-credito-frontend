---
feature: frontend-standards
status: done
created: 2026-07-21
---

# Standard de frontend via `/davi-ux:frontend-standards`

Rodado logo após a `fundacao`, antes do primeiro módulo com tela real — evita o mesmo gap que
levou o `pipeline-standards` do `-dados` a ficar uma sessão inteira sem rodar. Plugin `davi-ux`
já estava atualizado (0.2.0) do lado da CLI, mas a sessão em andamento ainda não tinha
recarregado — skill lida direto do arquivo e seguida manualmente (mesmo conteúdo que a
invocação normal usaria).

## Tarefas
- [x] Ponto 1 (pesquisa/UX) — usuário interno, sem persona formal, `ux-flow` fica pendente pros
      módulos com tela
- [x] Ponto 2 (design system) — apontado como pendente, é o próximo módulo do roadmap
- [x] Ponto 3 (composição de UI) — apontado como pendente até `ux-flow` de cada módulo
- [x] Ponto 4 (componentização/arquitetura) — `frontend.md` novo: convenção de pastas,
      nomenclatura, critério de decompor, onde mora estado, arquitetura de formulário
- [x] Ponto 5 (qualidade/a11y/perf) — apontado pra `verify-ui`
- [x] Ponto 6 (colaboração) — `frontend.md`: documentação de componente, handoff N/A, ADR usa
      `/davi-docs:adr` (não `frontend-adr` da biblioteca, evita duplicidade)
- [x] CLAUDE.md — tabela de standards e Skills-chave atualizadas; linha stale sobre auth "quando
      for decidida" corrigida (já está decidida)

## Quality gates
- [x] Nenhum código alterado — só documentação/standard
- [ ] `/davi-core:review` — não aplicável (sem diff de código)
- [x] Verificado: pontos 2/3/5 checados contra o estado real do projeto (nenhuma tela existe
      ainda, apontamento pras skills irmãs é correto, não prematuro)

## Notas
- Achado do processo: plugin atualizado (`claude plugin update`) só aplica na próxima sessão —
  mesmo achado já registrado em `claude-profile/docs/mapa-acervo.md`, reforçado aqui.
