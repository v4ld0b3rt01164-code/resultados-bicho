# Arquitetura

## Visão geral

```
┌─────────────────────────────┐
│ Cloudflare Pages (estático) │   HTML5 + CSS3 + JS vanilla (sem build)
└──────────────┬──────────────┘
               │ GET /api/resultados?data=YYYY-MM-DD
               ▼
┌─────────────────────────────┐
│ Worker resultadosjb (cron)  │   */5 * * * *
│                             │
│  providers/                 │
│  ├─ api-matrix  ──────────► resultadosjb-api (JSON, prefixos filtrados)
│  ├─ lbr         ──────────► resultadofacil /df/de-hoje (scrape HTML)
│  └─ federal     ──────────► Caixa API (JSON)
│                             │
│  upsert ──────────────────► D1 RESULTADOSJB
└──────────────┬──────────────┘
               │ endpoint /api/resultados
               ▼
        Frontend (template cloning + fetch)
```

## Fluxo de captura

1. Cron dispara a cada 5 minutos.
2. `processarTodos` faz seed da tabela `loterias` e dispara `Promise.all` para as 12 loterias.
3. Cada provider busca a fonte, normaliza para `{ data, horario, primeiro_premio, primeiro_grupo, premios: [{posicao, milhar, grupo}], fonte }`.
4. `upsertResultado` grava em D1 com `ON CONFLICT (loteria_id, data, horario) DO UPDATE`, apaga e reinsere os prêmios.

## Cobertura por fonte

| Fonte | Loterias |
|---|---|
| API nova (prefixos) | `GO*`, `BS*`, `PT*`, `MQ*`, `BA*`, `BAM*`, `PTSP*/PTNSP*/BD*`, `LTEP*`, `LTCE*`, `NAC*` |
| Scraping resultadofacil | `lbr` |
| Caixa API | `federal` |

Códigos da API nova **ignorados**: `CP*` (Capital), `MG*` (Minas), `UR*` (Uruguai), `ST*` (Sorte), `LTTRIVO*`, `LOTO`, `QUIN`, `SEN`, `FD*`, `MQF19` (Maluquinha Federal — redundante com a Federal da Caixa).

## Regras de prêmios

- **Via API nova**: prêmios já vêm completos (Bahia/Bahia Maluca/LOTEP/LOTECE com 10 reais; demais com 5 reais + soma/mult).
- **LBR (scrape)**: 5 milhares reais + 6º soma, 7º multiplicação (p1×p2, slice -6,-3), 8º (p1×4, últimos 4).
- **Federal (Caixa)**: 5 milhares reais (drop do 1º dígito dos 6 dígitos) + 6º soma, 7º mult, 8º ×4.
- `grupoPorMilhar`: grupo = `floor((últimos 2 dígitos - 1) / 4) + 1`, com bordas (00 e 97-99 → 25).

## Regras de horário

- Federal: domingo `11:00`, demais dias `20:00` (extração acontece quarta 20h e domingo 11h).
- API nova: horário extraído do campo `nome` (ex.: `LT LOOK 16HS` → `16:00:00`).
- LBR: horário extraído do cabeçalho `<h3>` (ex.: `LBR 11:00`).

## Endpoints do Worker

- `GET /api/resultados?data=YYYY-MM-DD[&loteria=slug]` — público, CORS aberto, cache 120s.
- `GET /trigger/{slug}[?data=YYYY-MM-DD]` — trigger manual de captura.
- `GET /` — rota raiz informativa.

## Racional de decisões

- **HTML/CSS/JS puro**: máxima compatibilidade (iOS/Android), performance, sem dependências de runtime.
- **D1 em vez de KV**: consultas estruturadas por data/loteria, histórico consultável, independência da API externa.
- **Worker single-file**: deploy via REST API (multipart) sem bundler.
- **Providers isolados**: cada fonte em módulo próprio, facilitando troca de fonte ou adição de loteria.