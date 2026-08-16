# ResultadosBicho

Site estático **HTML5/CSS3/JS puro** (sem framework) no Cloudflare Pages + Worker `resultadosjb` com **D1** (SQLite). Exibe resultados do Jogo do Bicho de 12 loterias com UI glassmorphism na paleta **Ouro/âmbar** (`bg:#0F0A05`).

Projeto independente do `LoteriaBR` (que fica na pasta pai). Layout replicado do exemplo, mas com tema ouro/âmbar e dados via nova API.

## Regras

- **REGRAGORA**: toda alteração deve ser commitada e enviada ao GitHub (`git add -A && git commit && git push origin master`). Ao terminar qualquer tarefa, verificar `git status` e deixar o working tree **limpo**, com `HEAD == origin/master`. O Pages faz deploy automático a cada push — não há deploy manual de frontend.
- `.env` (credenciais) **nunca** entra no repo (está no `.gitignore`).

## Comandos

| Comando | Ação |
|---------|------|
| — | Sem build para o front. HTML/CSS/JS estáticos servidos direto pelo Pages |
| `npm install` | Instala esbuild (dependência de dev) |
| `npm run worker:build` | Bundle do worker → `dist/worker.js` (necessário antes do deploy) |
| `npm run worker:preview` | Dev local do worker (wrangler) |
| `powershell -File deploy.ps1` | Deploy do Worker via REST API (lê `.env`) |

Sem test suite. Validação manual: `node --check dist/worker.js` e scripts em `C:\Users\Valdo\AppData\Local\Temp\opencode\teste-*.mjs`.

## Stack

- **Front**: HTML5 + CSS3 (custom properties) + JS vanilla ES modules. Sem Tailwind, sem Astro.
- **Worker**: `worker/resultadosjb` (arquivo **sem extensão**), módulo ES. Deploy via REST API (curl), **não** `wrangler deploy`.
- **Banco**: D1 `RESULTADOSJB` (binding `DB`). Schema em `worker/schema.sql`.
- **Pages Function**: `functions/api/contato.ts` (Resend).

## Fontes dos dados

| Loteria | Slug | Fonte |
|---------|------|-------|
| LOOK - GOIÁS | `look-go` | API `resultadosjb-api` (prefixo `GO*`) |
| Boa Sorte - GOIÁS | `boa-sorte-go` | API `resultadosjb-api` (prefixo `BS*`) |
| PT - RIO DE JANEIRO | `pt-rj` | API `resultadosjb-api` (prefixo `PT*`) |
| Maluquinha - RIO | `maluquinha-rj` | API `resultadosjb-api` (prefixo `MQ*`, exceto `MQF19`) |
| BAHIA | `bahia` | API `resultadosjb-api` (prefixo `BA*`) |
| BAHIA MALUCA | `bahia-maluca` | API `resultadosjb-api` (prefixo `BAM*`) |
| LBR | `lbr` | **Scraping** resultadofacil `/df/de-hoje` |
| SÃO PAULO (PT-SP/BAND) | `saopaulo` | **Scraping** resultadofacil `/sp` (verticalização 6º-9º = colunas verticais, 10º = soma) |
| LOTEP - PARAÍBA | `lotep` | API `resultadosjb-api` (prefixo `LTEP*`) |
| LOTECE - CEARÁ | `lotec` | API `resultadosjb-api` (prefixo `LTCE*`) |
| NACIONAL | `nacional` | API `resultadosjb-api` (prefixo `NAC*`) |
| FEDERAL | `federal` | **Caixa API** `servicebus3.caixa.gov.br/portaldeloterias/api/federal` |

- API principal: `https://resultadosjb-api.v4ld0b3rt01164.workers.dev/api/resultados?data=YYYY-MM-DD`
- Formato (verificado): `{ data, total, source, resultados: [{ codigo, nome, tipo, data_loteria, primeiro_premio, primeiro_grupo, premios: [{id, numero, grupo, grupoe, grupom}] }] }`
- **Filtrar fora**: `CP*` (Capital), `MG*` (Minas), `UR*` (Uruguai), `ST*` (Sorte), `LTTRIVO*`, `LOTO/QUIN/SEN` (Caixa), `MQF19` (Maluquinha Federal).
- **Federal** vem da Caixa API (não da API nova). LBR vem de scraping (`/df/de-hoje`). SP vem de scraping (`/sp`, com verticalização). Demais vêm da API nova.

### Federal — detalhes
- API retorna JSON com bilhetes de 6 dígitos → drop do 1º dígito (zero) → mantém últimos 5.
- Sorteia apenas **Quartas (20h)** e **Domingos (11h)** — sem time-gate.
- `horario = diaSemana === 0 ? '11:00:00' : '20:00:00'`.

### Regras dos prêmios
- **BAHIA / BAHIA MALUCA / LOTEP / LOTECE**: 10 prêmios reais (API já retorna).
- **Demais** (via API): 7 itens (5 reais + 6º/7º já computados soma/mult na API).
- **LBR** (scraping): 5 reais + soma + mult (worker calcula 6º/7º/8º como no base).
- **SP** (scraping): 5 reais + verticalização — 6º/7º/8º/9º = colunas verticais dos 4 primeiros, 10º = soma total (igual base).
- **Federal**: 5 reais + worker calcula 6º/7º/8º.

## Rotas do Worker

- `/api/resultados?data=YYYY-MM-DD` — endpoint público (GET, CORS aberto, cache 120s)
- `/trigger/{SLUG}` — trigger manual
- Cron `3-58/5 * * * *` (minutos 3, 8, 13... — offset -3) — todas as 12 loterias em paralelo via `Promise.all`

## Wrangler

- `worker/wrangler.toml` tem binding D1 + cron. `[observability]` sem sub-tabelas.

## Deploy

- Worker via REST API (curl), `deploy.ps1` lê `.env` (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `D1_DATABASE_ID`). `.env` no `.gitignore`.
- **Service Binding `API_NOVA` → `resultadosjb-api`** — o fetch worker→worker via `*.workers.dev` retorna 404/1042. Declarado em `wrangler.toml` e no metadata do `deploy-worker.ps1`. Provider `api-matrix.js` usa `env.API_NOVA.fetch()` (fallback `fetch()` no dev local).
- Metadata do worker: type do binding D1 é `d1` (não `d1_database`, erro 10021); incluir `workers_dev = $true` senão subdomain fica inativo.
- Subdomain inativo (404 code 1042): ativar via `POST .../workers/scripts/{nome}/subdomain` com `{"enabled":true,"previews_enabled":true}`.
- D1: `RESULTADOSJB` id `7d341bc7-6bf5-44c1-a08c-e086f7ae588e`. Schema em `worker/schema.sql`.
- Pages: projeto `resultadosbicho` em `resultadosbicho.pages.dev`, **integrado ao GitHub** (`v4ld0b3rt01164-code/resultados-bicho`, branch `master`). Deploy automático a cada push — **não** usar Direct Upload/wrangler para o front.
- Secret `RESEND_API_KEY` vai no **Pages** (`wrangler pages secret put`), não no worker.

## Frontend

### Páginas
- `/` (index.html): hub com seletor de loterias (todas as 12)
- `/look-go.html`, `/boa-sorte-go.html`, `/pt-rj.html`, `/maluquinha-rj.html`, `/bahia.html`, `/bahia-maluca.html`, `/lbr.html`, `/saopaulo.html`, `/lotep.html`, `/lotec.html`, `/nacional.html`, `/federal.html`
- Estáticas: `contato.html`, `politica-de-privacidade.html`, `termos-de-uso.html`, `404.html`

### Componentes (JS vanilla)
- `assets/js/config.js` → constantes (`LOTERIAS`, `ANIMAIS`, `FILTROS`, `API_URL`, `TEXTOS`)
- `assets/js/api.js` → `fetchResultados(data)`
- `assets/js/render.js` → renderiza cards via template cloning
- `assets/js/date-nav.js` → navegação de data + auto-refresh 15min
- `assets/js/selector.js` → `<select>` de loteria que navega entre páginas
- `assets/js/main.js` → inicialização por página (lê `data-page-slug`)

Cada página tem `<template id="cardTemplate">` inline + `<script type="module" src="/assets/js/main.js">`.

### Estilos
- `assets/css/style.css` — custom properties, grid, cards, glass.
- Grid: `<640px` 2 cols, `640-1024px` 3 cols, `1024px+` 5 cols (`.card-grid`)
- `<thead>` oculto em mobile (`hidden md:table-header-group`)
- `prefers-reduced-motion: reduce` desliga animações
- Paleta ouro/âmbar: `--bg:#0F0A05`, `--accent:#F59E0B`, `--accent-light:#FBBF24`, `--accent-deep:#B45309`, gradiente `#F59E0B→#F97316`
- `-webkit-backdrop-filter` sempre junto com `backdrop-filter` (compat iOS)

### i18n / Naming
- Textos centralizados em `assets/js/config.js`
- `nomeExibicao(slug, horario)` → `"{NOME} - {horario}"` (slug resolvido em `LOTERIAS`)

### `getDataInteligente()`
- Usa `America/Sao_Paulo`. Se hora < 1 AM, retorna dia anterior.

### `API_URL`
- `window.API_URL || 'https://resultadosjb.v4ld0b3rt01164.workers.dev/api/resultados'` — override via console para dev.

### WhatsApp
- Mensagem em texto puro (sem emojis). Link `wa.me` com `encodeURIComponent`, `rel="noopener,noreferrer"`.

### Contato
- Cloudflare Pages Function em `functions/api/contato.ts`. POST JSON → Resend API → `loteriabronline@gmail.com`. Requer `RESEND_API_KEY`.

### Gotchas
- Imagens animais: `loading="lazy"` com `width`/`height` explícitos.
- Logo: `assets/img/logo.webp` (placeholder da marca atual — configurável).