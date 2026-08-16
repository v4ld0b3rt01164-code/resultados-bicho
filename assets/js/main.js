import { FILTROS, TEXTOS } from './config.js';
import { fetchResultados } from './api.js';
import { renderizarCards } from './render.js';
import { initDateNav } from './date-nav.js';
import { initSelector } from './selector.js';

const pageSlug =
  document.body.getAttribute('data-page-slug') || 'index';
const slugs = FILTROS[pageSlug] || FILTROS['index'];

const inputData = document.getElementById('inputData');
const resultContainer = document.getElementById('resultContainer');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');

function emptyStateMsg(texto) {
  const p = emptyState.querySelector('p');
  if (p) p.textContent = texto;
}

async function carregarResultados() {
  const data = inputData.value;
  loadingState.classList.remove('hidden');
  resultContainer.innerHTML = '';
  emptyState.classList.add('hidden');

  try {
    const json = await fetchResultados(data);
    emptyStateMsg(TEXTOS.nenhumResultado);
    renderizarCards(json.loterias, data, slugs);
  } catch (err) {
    loadingState.classList.add('hidden');
    if (err.message === 'network') {
      emptyStateMsg(TEXTOS.erroCarregar);
    } else {
      emptyStateMsg(TEXTOS.nenhumResultado);
    }
    emptyState.classList.remove('hidden');
  }
}

initDateNav();
initSelector(pageSlug);

document.addEventListener('dataChange', () => carregarResultados());

carregarResultados();

setInterval(() => {
  if (!document.hidden) carregarResultados();
}, 5 * 60 * 1000);