import { RESULTADOFACIL_LBR, USER_AGENT } from '../constantes.js';

function grupoPorMilhar(milhar) {
  const s = String(milhar).padStart(4, '0');
  const final = parseInt(s.slice(-2), 10);
  if (final === 0 || final >= 97) return 25;
  return Math.floor((final - 1) / 4) + 1;
}

function extrairDataDoHTML(html) {
  const m = html.match(/<title[^>]*>.*?(\d{2})\/(\d{2})\/(\d{4}).*?<\/title>/i);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function extrairResultadoFacilLBR(html) {
  html = html.replace(/<a[\s\S]*?<\/a>/gi, '');
  const resultados = [];
  const blocos = html.split(/<h3[^>]*>/gi);
  for (let i = 1; i < blocos.length; i++) {
    const cabecalho = blocos[i].split('</h3>')[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/LBR/i.test(cabecalho)) continue;

    const mHorario = cabecalho.match(/(\d{1,2}):(\d{2})/);
    const mH = cabecalho.match(/(\d{1,2})h/i);
    let horario;
    if (mHorario) horario = `${mHorario[1].padStart(2, '0')}:${mHorario[2]}:00`;
    else if (mH) horario = `${mH[1].padStart(2, '0')}:00:00`;
    else continue;

    const tbodyMatch = blocos[i].match(/<tbody>([\s\S]*?)<\/tbody>/i);
    if (!tbodyMatch) continue;
    const linhas = tbodyMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    const milhares = [];
    for (const linha of linhas) {
      if (linha.includes('soma') || linha.includes('mult')) continue;
      const td = linha.match(/<td[^>]*>(\d{4})<\/td>/i);
      if (td && milhares.length < 5) milhares.push(td[1]);
    }
    if (milhares.length < 5) continue;

    const premios = milhares.map((m, i) => ({
      posicao: `${i + 1}º`,
      milhar: m,
      grupo: grupoPorMilhar(m),
    }));

    const soma = milhares.reduce((acc, v) => acc + parseInt(v, 10), 0);
    const m6 = String(soma).padStart(4, '0');
    premios.push({ posicao: '6º', milhar: m6, grupo: grupoPorMilhar(m6) });

    const prod7 = parseInt(milhares[0], 10) * parseInt(milhares[1], 10);
    const m7 = String(prod7).padStart(9, '0').slice(-6, -3);
    premios.push({ posicao: '7º', milhar: m7, grupo: grupoPorMilhar(m7) });

    const prod8 = parseInt(milhares[0], 10) * 4;
    const m8 = String(prod8).slice(-4).padStart(4, '0');
    premios.push({ posicao: '8º', milhar: m8, grupo: grupoPorMilhar(m8) });

    resultados.push({ horario, primeiro_premio: milhares[0], primeiro_grupo: grupoPorMilhar(milhares[0]), premios });
  }
  return resultados;
}

export async function capturarLBR(env, data) {
  const res = await fetch(RESULTADOFACIL_LBR, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`LBR HTTP ${res.status}`);
  const html = await res.text();
  const dataPagina = extrairDataDoHTML(html);
  if (!dataPagina) throw new Error('LBR data não encontrada');

  const lista = extrairResultadoFacilLBR(html);
  return {
    ['lbr']: lista.map((r) => ({
      data: dataPagina,
      horario: r.horario,
      primeiro_premio: r.primeiro_premio,
      primeiro_grupo: r.primeiro_grupo,
      premios: r.premios,
      fonte: 'scrape',
    })),
  };
}