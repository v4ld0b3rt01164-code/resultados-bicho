# Deploy

## Estado atual (16/08/2026 — deploy concluído)

- **D1**: `RESULTADOSJB` — id `7d341bc7-6bf5-44c1-a08c-e086f7ae588e`
- **Worker**: `resultadosjb` → `https://resultadosjb.v4ld0b3rt01164.workers.dev`
- **API origem**: `resultadosjb-api` (Service Binding `API_NOVA`)
- **Pages**: `resultadosbicho` → `https://resultadosbicho.pages.dev`
- **Contato**: `https://resultadosbicho.pages.dev/api/contato` (Function, precisa `RESEND_API_KEY` no Pages)

## Pré-requisitos

- Conta Cloudflare com Workers + D1 + Pages habilitados.
- Token API com escopos `Workers:Edit`, `D1:Edit`, `Pages:Edit` no **mesmo token**.
- Node.js (opcional, para `wrangler` local).

## 1. Criar o D1

Pelo dashboard (Workers & Pages → D1 → Create database) ou CLI:

```powershell
npx wrangler d1 create RESULTADOSJB
```

Copiar o `database_id` retornado.

## 2. Configurar bindings

No `worker/wrangler.toml`, substituir `SEU_DATABASE_ID_AQUI` pelo `database_id`.

**Service Binding obrigatório**: o worker `resultadosjb` NÃO faz fetch direto na URL `*.workers.dev` da API (`resultadosjb-api`). Fetch worker→worker via subdomain retorna `error code: 1042` (404). A solução é um Service Binding `API_NOVA → resultadosjb-api` (declarado em `wrangler.toml` e em `deploy-worker.ps1`). O provider `api-matrix.js` usa `env.API_NOVA.fetch()` com fallback para `fetch()` puro no dev local.

> Se o subdomain do worker recém-criado não responder (404 code 1042), ativá-lo via API:
> ```powershell
> Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/workers/scripts/{NOME}/subdomain" -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="application/json"} -Body '{"enabled":true,"previews_enabled":true}'
> ```

## 3. Aplicar o schema

```powershell
npx wrangler d1 execute RESULTADOSJB --remote --file=worker/schema.sql
```

Ou via API REST:

```powershell
# corpo JSON: { "sql": "<conteudo do schema.sql>" } — escapar \n e " corretamente (PS 5.1 não serializa string multilinha bem com ConvertTo-Json)
Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/d1/database/{DB_ID}/query" -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="application/json"} -Body $bytes
```

## 4. Deploy do Worker

```powershell
Copy-Item .env.example .env
# editar .env com CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID
powershell -File deploy.ps1
```

`deploy.ps1` carrega o `.env` e chama `deploy-worker.ps1`, que envia o script via REST API (multipart) com:

- `main_module: worker.js`
- `workers_dev: true`
- cron `3-58/5 * * * *` (minutos 3, 8, 13... — offset -3)
- binding D1 `DB` (type `d1`, **não** `d1_database`)
- binding service `API_NOVA` → `resultadosjb-api`
- observability habilitado

> Não usar `npx wrangler deploy` se o token não tiver scope adequado — o deploy via REST é o padrão deste projeto.

## 5. Deploy do front (Pages — Git)

O projeto `resultadosbicho` é **integrado ao GitHub** (`v4ld0b3rt01164-code/resultados-bicho`, branch `master`). Cada `git push` dispara deploy automático.

Criar o projeto Pages com integração Git:

```powershell
# via API (exige GitHub já conectado à conta Cloudflare)
$body = '{"name":"resultadosbicho","production_branch":"master","source":{"type":"github","config":{"owner":"v4ld0b3rt01164-code","repo_name":"resultados-bicho","production_branch":"master","deployments_enabled":true,"production_deployment_enabled":true,"preview_deployment_enabled":true}},"build_config":{"build_command":"","destination_dir":"/"}}'
curl.exe -X POST "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary "@arquivo.json"
```

Notas:

- **Não** usar Direct Upload para o front — o deploy é via Git.
- Build command vazio, output directory `/`. O Pages compila a Function `functions/api/contato.ts` automaticamente.
- O nome do projeto **define o subdomínio** (`resultadosbicho` → `resultadosbicho.pages.dev`). Renomear depois **não** muda o subdomínio — se precisar de outro URL, recrie com outro nome e exclua o antigo.
- Deploy manual de um commit específico (se o webhook não disparar): `POST .../pages/projects/resultadosbicho/deployments` com `{}`.
- Pages redireciona `/look-go.html` → `/look-go` (308) e serve sem extensão. Links com `.html` funcionam (browser segue o redirect).
- **Secret obrigatória**: `RESEND_API_KEY` no projeto Pages (não no worker):
  ```powershell
  npx wrangler pages secret put RESEND_API_KEY --project-name=resultadosbicho
  ```
- Domínio custom (ex.: `resultadosbicho.online`) é configurado no dashboard (Pages → Custom domains).

## 6. Verificação

```powershell
# Trigger manual (usar curl — Invoke-RestMethod do PS 5.1 pode estragar o parse da URL)
curl.exe "https://resultadosjb.v4ld0b3rt01164.workers.dev/trigger/look-go?data=2026-08-16"
# Endpoint público
curl.exe "https://resultadosjb.v4ld0b3rt01164.workers.dev/api/resultados?data=2026-08-16"
# Front
curl.exe "https://resultadosbicho.pages.dev/"
```

## Troubleshooting

| Problema | Causa provável |
|---|---|
| Deploy erro 1102 | `[observability]` com sub-tabelas inválidas |
| Deploy erro 10021 "binding DB has unknown type" | Usou `d1_database` no metadata; usar `d1` |
| Fetch worker→worker retorna 404/1042 | Usar **Service Binding** em vez de URL `*.workers.dev` |
| Subdomain novo responde 404 (1042) | Ativar via `POST .../workers/scripts/{nome}/subdomain` |
| Deploy worker sem subdomain ativo | Faltou `workers_dev: true` no metadata |
| KV/D1 binding perdido | Tokens separados; usar um único token com todos os escopos |
| Captura vazia no cron | Fonte externa fora do ar ou mudou layout; checar logs do Worker |
| Front sem dados | API_URL incorreta ou CORS; testar com `window.API_URL` no console |