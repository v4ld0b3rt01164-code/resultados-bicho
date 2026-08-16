-- Schema D1 - ResultadosBicho
-- Database: RESULTADOSJB (binding DB)

CREATE TABLE IF NOT EXISTS loterias (
  slug TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS resultados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loteria_id TEXT NOT NULL REFERENCES loterias(slug),
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  primeiro_premio TEXT,
  primeiro_grupo INTEGER,
  fonte TEXT NOT NULL DEFAULT 'api',
  criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (loteria_id, data, horario)
);

CREATE TABLE IF NOT EXISTS premios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resultado_id INTEGER NOT NULL REFERENCES resultados(id) ON DELETE CASCADE,
  posicao TEXT NOT NULL,
  milhar TEXT NOT NULL,
  grupo INTEGER,
  UNIQUE (resultado_id, posicao)
);

CREATE INDEX IF NOT EXISTS idx_resultados_data ON resultados(data);
CREATE INDEX IF NOT EXISTS idx_resultados_loteria ON resultados(loteria_id, data);