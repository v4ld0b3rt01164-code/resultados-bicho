# Design System

## Paleta (Ouro/âmbar)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0F0A05` | Fundo |
| `--surface` | `#1C1208` | Cards/superfícies |
| `--surface-2` | `#241708` | Inputs/select |
| `--surface-3` | `#2C1C0C` | Elementos elevados |
| `--accent` | `#F59E0B` | Ações, destaque |
| `--accent-light` | `#FBBF24` | Hover, milhar do card |
| `--accent-deep` | `#B45309` | Bordas fortes |
| `--text-primary` | `#FFF7ED` | Texto principal |
| `--text-secondary` | `#D6C9A8` | Texto secundário |
| `--text-muted` | `#9C8B6B` | Labels/rodapé |

Gradientes:
- Título do card (par): `linear-gradient(135deg, #F59E0B, #F97316)`
- Título do card (ímpar): `linear-gradient(135deg, #F97316, #FBBF24)`
- Texto gradiente (`--gradient-text`): `#FBBF24 → #F59E0B → #F97316`
- Fundo: radial-gradients âmbar/laranja com baixa opacidade sobre `#0F0A05`.

## Tipografia

- Sans: **Inter** (400–900)
- Display: **Space Grotesk** (títulos de páginas estáticas)
- Mono: **JetBrains Mono** (input de data)
- Carregamento via Google Fonts com `media="print" onload` (não bloqueante).

## Layout

- Header fixo (glass) com logo + seletor de loteria + date nav.
- Grid de cards (`.card-grid`):
  - `<640px`: 2 colunas, gap 10px
  - `640–1024px`: 3 colunas, gap 14px
  - `1024px+`: 5 colunas, gap 16px, max-width 1360px
- `<thead>` da tabela oculto em mobile (`display:none`; visível ≥768px).
- Footer fixo (glass) com navegação.

## Card (template `#cardTemplate`)

- Título gradiente (par/ímpar alternado).
- 1º prêmio: label + milhar grande em gradiente + imagem do animal (`animais-webp/{grupo}.webp`).
- Tabela: Posição | Milhar | Grupo. Linhas alternadas com fundo sutil.
- Botão Compartilhar (WhatsApp, texto puro sem emojis).

## Glassmorphism

- `backdrop-filter` **sempre com prefixo `-webkit-`** (compat iOS Safari).
- `--glass-bg: rgba(20,12,4,0.72)`, `--glass-border: rgba(245,158,11,0.16)`, blur 20px.

## Acessibilidade

- `skip-link` para conteúdo.
- `aria-label` em cards, tabelas, botões, inputs.
- `focus-visible` rings em controles.
- `prefers-reduced-motion: reduce` desliga animações e transformações.

## SEO

- Meta description, canonical, OG e Twitter por página.
- JSON-LD `WebSite`.
- `sitemap.xml` + `robots.txt`.
- Páginas individuais por loteria para indexação.