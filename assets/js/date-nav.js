import { getDataInteligente } from './utils.js';

export function initDateNav() {
  const dateNav = document.getElementById('dateNav');
  const inputData = document.getElementById('inputData');
  if (!dateNav || !inputData) return;

  inputData.value =
    new URLSearchParams(window.location.search).get('data') ||
    getDataInteligente();

  function mudarData(delta) {
    const d = new Date(inputData.value + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    inputData.value = `${ano}-${mes}-${dia}`;
    atualizarURL();
    document.dispatchEvent(new CustomEvent('dataChange', { detail: inputData.value }));
  }

  function atualizarURL() {
    const params = new URLSearchParams(window.location.search);
    params.set('data', inputData.value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  const prevBtn = document.getElementById('prevDate');
  const nextBtn = document.getElementById('nextDate');
  if (prevBtn) prevBtn.addEventListener('click', () => mudarData(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => mudarData(1));

  inputData.addEventListener('change', () => {
    atualizarURL();
    document.dispatchEvent(new CustomEvent('dataChange', { detail: inputData.value }));
  });
}