# Schema D1

Banco: **RESULTADOSJB** (binding `DB`). Arquivo: `worker/schema.sql`.

## Tabela `loterias`

Catálogo estático de loterias.

| Coluna | Tipo | Descrição |
|---|---|---|
| `slug` | TEXT PK | Identificador (`look-go`, `bahia`, ...) |
| `nome` | TEXT | Nome de exibição |
| `grupo` | TEXT | Grupo/região (GOIÁS, RIO DE JANEIRO, ...) |
| `ordem` | INTEGER | Ordem de exibição no seletor |
| `ativa` | INTEGER | 1 ativa, 0 inativa |

Seed feito pelo worker (`seedLoterias`) via `INSERT OR IGNORE`.

## Tabela `resultados`

Um registro por (loteria, data, horário de extração).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `loteria_id` | TEXT FK → loterias.slug | |
| `data` | TEXT | `YYYY-MM-DD` |
| `horario` | TEXT | `HH:MM:SS` |
| `primeiro_premio` | TEXT | Milhar do 1º prêmio |
| `primeiro_grupo` | INTEGER | Grupo do 1º prêmio |
| `fonte` | TEXT | `api` \| `scrape` \| `caixa` |
| `criado_em` | TEXT | Timestamp UTC |
| **UNIQUE** | | `(loteria_id, data, horario)` |

## Tabela `premios`

Linhas de cada resultado (1º a 8º/10º).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | |
| `resultado_id` | INTEGER FK → resultados.id (ON DELETE CASCADE) | |
| `posicao` | TEXT | `1º`, `2º`, ..., `6º` |
| `milhar` | TEXT | Número (4 dígitos; soma/mult podem ter menos) |
| `grupo` | INTEGER | Grupo do bicho (1-25) |
| **UNIQUE** | | `(resultado_id, posicao)` |

## Índices

- `idx_resultados_data` em `resultados(data)`
- `idx_resultados_loteria` em `resultados(loteria_id, data)`

## Migrações

Schema idempotente (`CREATE TABLE IF NOT EXISTS`). Para evoluções, criar novo `ALTER TABLE`/migração em `schema.sql` e reaplicar — ou manter `worker/migrations/` com scripts numerados e um `MIGRATIONS`/`schema_version` simples se necessário.