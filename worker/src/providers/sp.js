import { RESULTADOFACIL_SP, USER_AGENT } from '../constantes.js';

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

function normalizarHorario(extracao) {
  const match = extracao.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}:00`;
  const matchH = extracao.match(/(\d{1,2})h/i);
  if (matchH) return `${matchH[1].padStart(2, '0')}:00:00`;
  return null;
}

function extrairResultadoFacilSP(html) {
  html = html.replace(/<a[\s\S]*?<\/a>/gi, '');
  const resultados = [];
  const blocos = html.split(/<h3[^>]*>/gi);
  for (let i = 1; i < blocos.length; i++) {
    const cabecalho = blocos[i].split('</h3>')[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cabecalho.includes('Resultado do Jogo do Bicho') || cabecalho.includes('1º ao 10º')) continue;
    if (/federal/i.test(cabecalho)) continue;

    const texto = cabecalho.replace('Resultado do Jogo do Bicho', '').trim();
    const partes = texto.split(',').map((p) => p.trim()).filter((p) => p.length > 0 && p.length < 40);
    if (partes.length < 2) continue;
    const extracao = `${partes[0]} ${partes[1]}`;

    const horario = normalizarHorario(extracao);
    if (!horario) continue;

    const tbodyMatch = blocos[i].match(/<tbody>([\s\S]*?)<\/tbody>/i);
    if (!tbodyMatch) continue;
    const linhas = tbodyMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    const milhares = [];
    for (const linha of linhas) {
      if (linha.includes('soma') || linha.includes('mult')) continue;
      const td = linha.match(/<td[^>]*>(\d{4})<\/td>/i);
      if (td && milhares.length < 5) milhares.push(td[1]);
    }
    if (milhares.length < 5 || milhares[0] === '0000') continue;

    const premios = milhares.map((m, i) => ({
      posicao: `${i + 1}º`,
      milhar: m,
      grupo: grupoPorMilhar(m),
    }));

    const p1 = milhares[0].padStart(4, '0');
    const p2 = milhares[1].padStart(4, '0');
    const p3 = milhares[2].padStart(4, '0');
    const p4 = milhares[3].padStart(4, '0');

    const m6 = p1[0] + p2[0] + p3[0] + p4[0];
    const m7 = p1[1] + p2[1] + p3[1] + p4[1];
    const m8 = p1[2] + p2[2] + p3[2] + p4[2];
    const m9 = p1[3] + p2[3] + p3[3] + p4[3];

    premios.push({ posicao: '6º', milhar: m6, grupo: grupoPorMilhar(m6) });
    premios.push({ posicao: '7º', milhar: m7, grupo: grupoPorMilhar(m7) });
    premios.push({ posicao: '8º', milhar: m8, grupo: grupoPorMilhar(m8) });
    premios.push({ posicao: '9º', milhar: m9, grupo: grupoPorMilhar(m9) });

    const somaMilhares = premios.reduce((acc, r) => acc + parseInt(r.milhar, 10), 0);
    const m10 = String(somaMilhares);
    premios.push({ posicao: '10º', milhar: m10, grupo: grupoPorMilhar(m10) });

    resultados.push({
      horario,
      primeiro_premio: milhares[0],
      primeiro_grupo: grupoPorMilhar(milhares[0]),
      premios,
    });
  }
  return resultados;
}

export async function capturarSP(env, data) {
  const res = await fetch(RESULTADOFACIL_SP, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`SP HTTP ${res.status}`);
  const html = await res.text();
  const dataPagina = extrairDataDoHTML(html);
  if (!dataPagina) throw new Error('SP data não encontrada');

  const lista = extrairResultadoFacilSP(html);
  return {
    [dataPagina]: lista.map((r) => ({
      data: dataPagina,
      horario: r.horario,
      primeiro_premio: r.primeiro_premio,
      primeiro_grupo: r.primeiro_grupo,
      premios: r.premios,
      fonte: 'scrape',
    })),
  };
}