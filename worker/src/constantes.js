export const API_BASE = 'https://resultadosjb-api.v4ld0b3rt01164.workers.dev/api/resultados';

export const CAIXA_API = 'https://servicebus3.caixa.gov.br/portaldeloterias/api/federal';

export const RESULTADOFACIL_LBR = 'https://www.resultadofacil.com.br/resultado-do-jogo-do-bicho/df/de-hoje';

export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export const ANIMAIS = [
  null,
  'Avestruz', 'Águia', 'Burro', 'Borboleta', 'Cachorro', 'Cabra', 'Carneiro', 'Camelo',
  'Cobra', 'Coelho', 'Cavalo', 'Elefante', 'Galo', 'Gato', 'Jacaré', 'Leão',
  'Macaco', 'Porco', 'Pavão', 'Peru', 'Touro', 'Tigre', 'Urso', 'Veado', 'Vaca',
];

export const LOTERIAS = {
  'look-go':      { nome: 'LOOK - GOIÁS',     grupo: 'GOIÁS' },
  'boa-sorte-go': { nome: 'BOA SORTE - GOIÁS', grupo: 'GOIÁS' },
  'pt-rj':        { nome: 'PT - RIO DE JANEIRO', grupo: 'RIO DE JANEIRO' },
  'maluquinha-rj':{ nome: 'MALUQUINHA - RIO DE JANEIRO', grupo: 'RIO DE JANEIRO' },
  'bahia':        { nome: 'BAHIA',            grupo: 'BAHIA' },
  'bahia-maluca': { nome: 'BAHIA MALUCA',     grupo: 'BAHIA' },
  'lbr':          { nome: 'LBR',              grupo: 'BRASIL' },
  'saopaulo':     { nome: 'SÃO PAULO',        grupo: 'SÃO PAULO' },
  'lotep':        { nome: 'LOTEP - PARAÍBA',  grupo: 'PARAÍBA' },
  'lotec':        { nome: 'LOTECE - CEARÁ',   grupo: 'CEARÁ' },
  'nacional':     { nome: 'NACIONAL',         grupo: 'BRASIL' },
  'federal':      { nome: 'FEDERAL',          grupo: 'BRASIL' },
};

export const SLUGS_ORDEM = Object.keys(LOTERIAS);

export const API_PREFIXES = {
  'bahia-maluca':  ['BAM'],
  'look-go':       ['GO'],
  'boa-sorte-go':  ['BS'],
  'pt-rj':         ['PT'],
  'maluquinha-rj': ['MQ'],
  'bahia':         ['BA'],
  'saopaulo':      ['PTSP', 'PTNSP', 'BD'],
  'lotep':         ['LTEP'],
  'lotec':         ['LTCE'],
  'nacional':      ['NAC'],
};

export const PREFIXOS_LONGOS = ['PTSP', 'PTNSP', 'LTTRIVO', 'LTEP', 'LTCE', 'BAM', 'MQF', 'NAC'];

export const EXCLUIR_CODIGOS = new Set(['MQF19']);