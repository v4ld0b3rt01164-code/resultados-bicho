# Manutenção e Operação

## Rotinas

- **Cron** `*/5 * * * *` captura as 12 loterias. Não requer intervenção.
- **Trigger manual**: `GET /trigger/{slug}` para reprocessar uma loteria (útil após queda de fonte).
- **Front**: estático. Alterações em `assets/*` ou páginas → redeploy automático do Pages no push.

## Monitoramento

- Logs do Worker no dashboard Cloudflare (seção Workers → resultadosjb → Logs).
- Verificar se capturas não estão falhando: procurar `[SLUG] N resultado(s)` nos logs.
- O endpoint público pode ser monitorado por uptime check (ex.: `GET /api/resultados?data=YYYY-MM-DD`).

## Troubleshooting comum

### Captura falhando

1. Checar HTTP status no log (`API nova HTTP 5xx`, `LBR HTTP 404`, `Caixa HTTP 5xx`).
2. Se a fonte externa mudou o layout HTML, atualizar `worker/src/providers/lbr.js` (regex/padrões).
3. Se a API nova mudou o formato JSON, atualizar `api-matrix.js`.

### Horário errado na Federal

- Federal sorteia **quarta 20h** e **domingo 11h**. O worker define `horario = dia 0 ? 11:00 : 20:00`. Verificar `dataApuracao` da Caixa se divergir.

### Front sem dados

- Abrir console do navegador. Confirmar `window.API_URL`.
- Testar o endpoint direto no navegador.
- Verificar se o D1 tem dados (Console D1: `SELECT data, loteria_id, count(*) FROM resultados GROUP BY data, loteria_id`).

### Grupo "0" nos prêmios

- Se um prêmio da API vier sem `grupo`, `grupoPorMilhar` calcula automaticamente (só usado em LBR/Federal). Prêmios da API nova usam o `grupo` fornecido.

## Backup

- D1 pode ser exportado pelo dashboard (Console D1 → Export).
- Recomenda-se snapshot semanal do esquema + dados se o histórico for crítico.

## Adicionar/remover loteria

1. `worker/src/constantes.js`: adicionar slug em `LOTERIAS`, `API_PREFIXES` (se via API) e `SLUGS_ORDEM`.
2. `worker/resultadosjb`: incluir no `CRON_SLUGS`.
3. Frontend `assets/js/config.js`: adicionar em `LOTERIAS` e `FILTROS`.
4. Se for página própria: editar `gerar-paginas.ps1` e rodar.
5. Atualizar `sitemap.xml` e `docs/` conforme necessário.