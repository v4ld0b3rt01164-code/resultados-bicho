# API do Worker

Base: `https://resultadosjb.v4ld0b3rt01164.workers.dev`

## `GET /api/resultados`

Consulta resultados de uma data.

### Parâmetros

| Query | Obrigatório | Descrição |
|---|---|---|
| `data` | não (default: hoje BR) | `YYYY-MM-DD` |
| `loteria` | não | Slug para filtrar uma loteria |

### Resposta (200)

```json
{
  "data": {
    "dia_semana": "Domingo",
    "data_formatada": "16/08/2026"
  },
  "loterias": [
    {
      "slug": "pt-rj",
      "nome_loteria": "PT - RIO DE JANEIRO - 16:00",
      "horario": "16:00",
      "primeiro_premio": "8538",
      "primeiro_grupo": 10,
      "resultados": [
        { "posicao": "1º", "milhar": "8538", "grupo": 10 },
        { "posicao": "2º", "milhar": "4128", "grupo": 7 },
        { "posicao": "6º", "milhar": "5598", "grupo": 25 }
      ]
    }
  ]
}
```

- Ordenado por horário.
- `resultados` ordenados por `rowid` (posição 1º → último).
- CORS aberto. `Cache-Control: public, s-maxage=120`.

### Erros

| Status | Caso |
|---|---|
| 500 | Erro interno / query |
| 400 | `/trigger/{slug}` inválido |

## `GET /trigger/{slug}`

Dispara captura manual de uma loteria. `slug` ∈ {look-go, boa-sorte-go, pt-rj, maluquinha-rj, bahia, bahia-maluca, lbr, saopaulo, lotep, lotec, nacional, federal}.

- Query opcional `data=YYYY-MM-DD` (default: hoje BR).
- Resposta `200 { ok, slug, data }` ou `500 { erro }`.

## `GET /`

Rota raiz informativa: `{ status, worker, rotas }`.

## Formato de entrada (API nova `resultadosjb-api`)

```json
{
  "data": "2026-08-16",
  "total": 53,
  "source": "cache",
  "resultados": [
    {
      "codigo": "PTSP17",
      "nome": "PT SP 17HS",
      "tipo": "BIXO",
      "data_loteria": "2026-08-16",
      "primeiro_premio": "1408",
      "primeiro_grupo": "02",
      "premios": [
        { "id": "1", "numero": "1408", "grupo": "02", "grupoe": "04", "grupom": "10" }
      ]
    }
  ]
}
```

O worker mapeia `codigo` → slug via prefixos (ver `worker/src/constantes.js`) e deriva o horário do campo `nome`.