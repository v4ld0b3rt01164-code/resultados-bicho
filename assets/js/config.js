export const ANIMAIS = {
  1: 'Avestruz', 2: 'Águia', 3: 'Burro', 4: 'Borboleta',
  5: 'Cachorro', 6: 'Cabra', 7: 'Carneiro', 8: 'Camelo',
  9: 'Cobra', 10: 'Coelho', 11: 'Cavalo', 12: 'Elefante',
  13: 'Galo', 14: 'Gato', 15: 'Jacaré', 16: 'Leão',
  17: 'Macaco', 18: 'Porco', 19: 'Pavão', 20: 'Peru',
  21: 'Touro', 22: 'Tigre', 23: 'Urso', 24: 'Veado',
  25: 'Vaca',
};

export const LOTERIAS = {
  'look-go': { label: 'LOOK - GOIÁS', page: '/look-go.html' },
  'boa-sorte-go': { label: 'BOA SORTE - GOIÁS', page: '/boa-sorte-go.html' },
  'pt-rj': { label: 'PT - RIO DE JANEIRO', page: '/pt-rj.html' },
  'maluquinha-rj': { label: 'MALUQUINHA - RJ', page: '/maluquinha-rj.html' },
  'bahia': { label: 'BAHIA', page: '/bahia.html' },
  'bahia-maluca': { label: 'BAHIA MALUCA', page: '/bahia-maluca.html' },
  'lbr': { label: 'LBR', page: '/lbr.html' },
  'saopaulo': { label: 'SÃO PAULO', page: '/saopaulo.html' },
  'lotep': { label: 'LOTEP - PARAÍBA', page: '/lotep.html' },
  'lotec': { label: 'LOTECE - CEARÁ', page: '/lotec.html' },
  'nacional': { label: 'NACIONAL', page: '/nacional.html' },
  'federal': { label: 'FEDERAL', page: '/federal.html' },
};

export const CABECALHOS = {
  'maluquinha-rj': 'MALUQUINHA',
};

export const FILTROS = {
  'index': Object.keys(LOTERIAS),
  'look-go': ['look-go'],
  'boa-sorte-go': ['boa-sorte-go'],
  'pt-rj': ['pt-rj'],
  'maluquinha-rj': ['maluquinha-rj'],
  'bahia': ['bahia'],
  'bahia-maluca': ['bahia-maluca'],
  'lbr': ['lbr'],
  'saopaulo': ['saopaulo'],
  'lotep': ['lotep'],
  'lotec': ['lotec'],
  'nacional': ['nacional'],
  'federal': ['federal'],
};

export const TEXTOS = {
  premio: '1º Prêmio',
  compartilhar: 'Compartilhar',
  nenhumResultado: 'Nenhum resultado disponível para esta data.',
  erroCarregar: 'Erro ao carregar resultados. Tente novamente.',
  carregando: 'Carregando resultados...',
  posicao: 'Posição',
  milhar: 'Milhar',
  grupo: 'Grupo',
  siteNome: 'ResultadosBicho',
  siteUrl: 'https://resultadosbicho.online',
};

export const API_URL =
  window.API_URL ||
  'https://resultadosjb.v4ld0b3rt01164.workers.dev/api/resultados';

export const MARCA = {
  nome: 'ResultadosBicho',
  email: 'loteriabronline@gmail.com',
};