export function getDataInteligente() {
  const agora = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const partes = formatter.formatToParts(agora);
  const getParte = (tipo) =>
    (partes.find((p) => p.type === tipo) || {}).value || '';
  const ano = getParte('year');
  const mes = getParte('month');
  const dia = getParte('day');
  const hora = parseInt(getParte('hour'), 10);

  if (!ano || !mes || !dia) {
    return new Date().toISOString().split('T')[0];
  }

  if (hora < 1) {
    const dataBR = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10), 12);
    dataBR.setDate(dataBR.getDate() - 1);
    const y = dataBR.getFullYear();
    const m = String(dataBR.getMonth() + 1).padStart(2, '0');
    const d = String(dataBR.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function nomeExibicao(nomeLoteria, slug) {
  const partes = nomeLoteria.split(' - ');
  const horario = partes[1] || '';
  return horario ? `${partes[0]} - ${horario}` : partes[0];
}