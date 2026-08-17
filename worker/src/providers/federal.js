import { CAIXA_API, USER_AGENT } from '../constantes.js';

function grupoPorMilhar(milhar) {
  const s = String(milhar).padStart(4, '0');
  const final = parseInt(s.slice(-2), 10);
  if (final === 0 || final >= 97) return 25;
  return Math.floor((final - 1) / 4) + 1;
}

function extrairPremios(json) {
  const premios = (json.listaDezenas || []).slice(0, 5).map((b) => {
    const s = String(b);
    return s.length >= 6 ? s.slice(-5) : s.padStart(5, '0');
  });
  if (premios.length !== 5) return null;
  return premios;
}

function resultadoFederal(dataISO, premios) {
  const dataObj = new Date(`${dataISO}T12:00:00`);
  const horario = dataObj.getDay() === 0 ? '11:00:00' : '20:00:00';
  const linhas = premios.map((m, i) => ({
    posicao: `${i + 1}º`,
    milhar: m,
    grupo: grupoPorMilhar(m),
  }));

  const soma = premios.reduce((acc, v) => acc + parseInt(v, 10), 0);
  const m6 = String(soma).padStart(4, '0');
  linhas.push({ posicao: '6º', milhar: m6, grupo: grupoPorMilhar(m6) });

  const prod7 = parseInt(premios[0], 10) * parseInt(premios[1], 10);
  const m7 = String(prod7).padStart(9, '0').slice(-6, -3);
  linhas.push({ posicao: '7º', milhar: m7, grupo: grupoPorMilhar(m7) });

  const prod8 = parseInt(premios[0], 10) * 4;
  const m8 = String(prod8).slice(-4).padStart(4, '0');
  linhas.push({ posicao: '8º', milhar: m8, grupo: grupoPorMilhar(m8) });

  return {
    data: dataISO,
    horario,
    primeiro_premio: premios[0],
    primeiro_grupo: grupoPorMilhar(premios[0]),
    premios: linhas,
    fonte: 'caixa',
  };
}

export async function capturarFederal(env, data) {
  const res = await fetch(CAIXA_API, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Caixa HTTP ${res.status}`);
  const json = await res.json();

  const premios = extrairPremios(json);
  if (!premios) throw new Error('Federal: prêmios inválidos');

  const parts = String(json.dataApuracao || '').split('/');
  const dataISO = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : data;

  return {
    ['federal']: [resultadoFederal(dataISO, premios)],
  };
}