# Roadmap

## Filtros e comparação (planejado)

O usuário deseja permitir **filtros escolhidos pelo usuário**, juntando loterias lado a lado para comparação e análise. Exemplos:

- RIO + LOOK
- NACIONAL + LOOK

### Como a arquitetura atual já suporta

- O endpoint `GET /api/resultados?data=` retorna **todas** as loterias da data.
- `render.js` recebe uma lista de slugs (`FILTROS[slug]`) e renderiza apenas as correspondentes.
- Portanto, para suportar multi-seleção, basta:
  1. Permitir que a página aceite múltiplos slugs (ex.: `?loterias=pt-rj,look-go`).
  2. Ler esses slugs no `main.js` em vez de usar `FILTROS[pageSlug]`.
  3. Renderizar em grade; opcionalmente agrupar ou destacar as comparações.

### Proposta de UI

- Checkbox/chips de loterias no header (em vez do `<select>` simples).
- Estado persistido em `?loterias=` (shareable URL).
- Ordenação estável por horário; destaque visual por grupo (GOIÁS, RJ, BA, ...).

## Outros itens

- [ ] Filtro por grupo/estado (GOIÁS, RJ, BA, SP, ...).
- [ ] Destacar "pendente" (extração ainda não saiu no dia).
- [ ] PWA: manifest + service worker para offline.
- [ ] Ranking dos bichos mais sorteados no dia.
- [ ] Alternar tema (claro/escuro)? — contra design atual; avaliar.
- [ ] Backfill histórico a partir da API nova (dias anteriores).