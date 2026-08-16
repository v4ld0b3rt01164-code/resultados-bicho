import { LOTERIAS } from './config.js';

export function initSelector(currentSlug) {
  const select = document.getElementById('lotterySelect');
  if (!select) return;

  select.value = currentSlug;

  select.addEventListener('change', () => {
    const slug = select.value;
    if (slug === currentSlug) return;
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    const url = LOTERIAS[slug] ? LOTERIAS[slug].page : '/';
    window.location.href = data ? `${url}?data=${data}` : url;
  });
}