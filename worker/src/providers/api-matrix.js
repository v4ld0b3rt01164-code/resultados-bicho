import { API_BASE, API_PREFIXES, EXCLUIR_CODIGOS, PREFIXOS_LONGOS, USER_AGENT } from '../constantes.js';

const API_SERVICE = 'API_NOVA';

const HORARIOS_PADRAO_MIN = 20;
const HORARIOS_EXCECAO_MIN = { 19: 30 };
const HORARIOS_PADRAO_SLUGS = new Set(['pt-rj', 'maluquinha-rj', 'look-go']);

function prefixoDoCodigo(codigo) {
  if (!codigo) return null;
  for (const c of PREFIXOS_LONGOS) {
    if (codigo.startsWith(c)) return c;
  }
  return codigo.slice(0, 2);
}

function slugDoCodigo(codigo) {
  const prefixo = prefixoDoCodigo(codigo);
  if (!prefixo) return null;
  for (const [slug, prefixes] of Object.entries(API_PREFIXES)) {
    if (prefixes.includes(prefixo)) return slug;
  }
  return null;
}

function horarioDoNome(nome) {
  const m = String(nome || '').match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}:00`;
  const h = String(nome || '').match(/(\d{1,2})h/i);
  if (h) return `${h[1].padStart(2, '0')}:00:00`;
  return null;
}

function horarioPadrao(slug, horario) {
  if (!HORARIOS_PADRAO_SLUGS.has(slug)) return horario;
  const h = parseInt(horario.slice(0, 2), 10);
  if (Number.isNaN(h)) return horario;
  const min = HORARIOS_EXCECAO_MIN[h] ?? HORARIOS_PADRAO_MIN;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}

export async function capturarApiMatrix(env, data) {
  const url = `${API_BASE}?data=${data}`;
  const res = env && env[API_SERVICE]
    ? await env[API_SERVICE].fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    : await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`API nova HTTP ${res.status}`);
  const json = await res.json();
  const resultados = Array.isArray(json.resultados) ? json.resultados : [];

  const porSlug = {};
  for (const item of resultados) {
    const codigo = item.codigo;
    if (!codigo || EXCLUIR_CODIGOS.has(codigo)) continue;
    if (/federal/i.test(String(item.nome))) continue;
    const slug = slugDoCodigo(codigo);
    if (!slug) continue;
    const horario = horarioDoNome(item.nome);
    if (!horario) continue;

    const horarioFinal = horarioPadrao(slug, horario);

    const premios = (item.premios || []).map((p) => ({
      posicao: `${String(p.id).replace(/\.0$/, '')}º`,
      milhar: String(p.numero),
      grupo: p.grupo ? parseInt(p.grupo, 10) : null,
    }));

    if (!porSlug[slug]) porSlug[slug] = [];
    porSlug[slug].push({
      data,
      horario: horarioFinal,
      primeiro_premio: item.primeiro_premio ? String(item.primeiro_premio) : null,
      primeiro_grupo: item.primeiro_grupo ? parseInt(item.primeiro_grupo, 10) : null,
      premios,
      fonte: 'api',
    });
  }

  return porSlug;
}