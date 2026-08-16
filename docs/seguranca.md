# Segurança

## Worker

- **Sem segredos no código**. Credenciais apenas via `.env` (ignorado pelo git) e variáveis de ambiente do Cloudflare (`RESEND_API_KEY` no Pages).
- **CORS**: endpoint `/api/resultados` público e read-only (GET). Não expõe escrita.
- **Cabeçalhos de resposta**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` na Pages Function de contato.
- **User-Agent** definido nos fetches a fontes externas (Caixa, resultadofacil) para evitar bloqueios.

## Pages Function de contato (`/api/contato`)

- Aceita apenas `POST`.
- Valida presença de `nome`, `email`, `mensagem`.
- **Escapa HTML** de todos os campos antes de montar o corpo do e-mail (anti XSS no HTML email).
- `RESEND_API_KEY` lida do env do Pages. Retorna 500 se ausente.
- Não loga o conteúdo completo (apenas `email` e `id`).

## Frontend

- Links do WhatsApp usam `rel="noopener noreferrer"`.
- Sem injeção de HTML em texto: prêmios são inseridos via `textContent` (não `innerHTML`) em `render.js`.
- Imagens com `loading="lazy"` e dimensões explícitas (evita layout shift / CLS).

## D1

- Acesso apenas pelo Worker (binding `DB`), nunca exposto diretamente.
- Tokens de deploy precisam de `Workers:Edit` + `D1:Edit` (e `KV:Edit` se houver KV) no **mesmo token** para preservar bindings.

## Recomendações

- Rotacionar `RESEND_API_KEY` e o token Cloudflare periodicamente.
- Não adicionar `[observability.logs]`/`[observability.traces]` (sub-tabelas inválidas → erro 1102 no deploy).
- Revisar logs do Worker no dashboard se capturas falharem (rede, HTTP status).