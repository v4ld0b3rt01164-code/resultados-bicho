# ResultadosBicho

Site estático **HTML5/CSS3/JS puro** (sem framework, sem build) no Cloudflare Pages, com Worker `resultadosjb` + banco **D1**. Exibe resultados do Jogo do Bicho de 12 loterias em UI glassmorphism com paleta **Ouro/âmbar**.

Projeto novo e independente, criado a partir do projeto exemplo `LoteriaBR` (na pasta pai), que serviu apenas como referência de layout e lógica.

## Loterias

| Loteria | Slug |
|---|---|
| LOOK - GOIÁS | `look-go` |
| Boa Sorte - GOIÁS | `boa-sorte-go` |
| PT - RIO DE JANEIRO | `pt-rj` |
| Maluquinha - RIO DE JANEIRO | `maluquinha-rj` |
| BAHIA | `bahia` |
| BAHIA MALUCA | `bahia-maluca` |
| LBR | `lbr` |
| SÃO PAULO (PT-SP/BAND) | `saopaulo` |
| LOTEP - PARAÍBA | `lotep` |
| LOTECE - CEARÁ | `lotec` |
| NACIONAL | `nacional` |
| FEDERAL | `federal` |

## Estrutura

```
resultados-bicho/
├─ index.html                     # hub (todas as loterias)
├─ {slug}.html                    # 12 páginas por loteria
├─ contato.html, politica-de-privacidade.html, termos-de-uso.html, 404.html
├─ assets/
│  ├─ css/style.css               # tokens + layout + cards (paleta ouro/âmbar)
│  ├─ js/  config.js, api.js, render.js, date-nav.js, selector.js, main.js
│  └─ img/  logo.webp, favicon.ico, animais-webp/1-25.webp
├─ worker/
│  ├─ resultadosjb                # worker (módulo ES, sem extensão)
│  ├─ src/constantes.js           # loterias, prefixos, URLs
│  ├─ src/providers/              # api-matrix, lbr, federal
│  ├─ schema.sql                  # schema D1
│  └─ wrangler.toml
├─ functions/api/contato.ts       # Pages Function (Resend)
├─ deploy.ps1 / deploy-worker.ps1
├─ gerar-paginas.ps1              # gera as 12 páginas a partir do index
└─ docs/                          # documentação
```

## Fontes de dados

- **API nova** (`resultadosjb-api`): LOOK, Boa Sorte, PT-RJ, Maluquinha, Bahia, Bahia Maluca, São Paulo, LOTEP, LOTECE, Nacional.
- **Scraping** (resultadofacil `/df/de-hoje`): apenas LBR.
- **Caixa API**: apenas Federal.

Detalhes completos em `docs/arquitetura.md` e `docs/api.md`.

## Desenvolvimento

Não há build. Abra o `index.html` no navegador ou sirva com um servidor estático simples:

```powershell
npx serve .
```

O front consome `window.API_URL || 'https://resultadosjb.v4ld0b3rt01164.workers.dev/api/resultados'`. Para desenvolvimento local, defina no console:

```js
window.API_URL = 'http://localhost:8787/api/resultados'
```

## Deploy

1. Criar D1 `RESULTADOSJB` (dashboard), copiar `database_id` para `worker/wrangler.toml`.
2. Aplicar `worker/schema.sql` (wrangler ou dashboard).
3. Copiar `.env.example` para `.env` e preencher.
4. `powershell -File deploy.ps1` (deploy do Worker via REST API).
5. Publicar os arquivos estáticos no Cloudflare Pages (build command vazio, output root).

Mais em `docs/deploy.md`.

## Documentação

- `docs/arquitetura.md` — visão da arquitetura e fluxo de dados
- `docs/schema-d1.md` — modelagem do banco
- `docs/api.md` — contrato da API do worker
- `docs/seguranca.md` — boas práticas de segurança
- `docs/design.md` — design system (paleta, tokens, componentes)
- `docs/manutencao.md` — operação e troubleshooting
- `docs/roadmap.md` — evolução planejada (filtros/comparação)
- `docs/deploy.md` — passos de deploy