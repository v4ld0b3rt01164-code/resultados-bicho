import { ANIMAIS, TEXTOS } from './config.js';
import { formatarDataBR, nomeExibicao } from './utils.js';

export function renderizarCards(lista, dataAtual, slugs) {
  const resultContainer = document.getElementById('resultContainer');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');

  loadingState.classList.add('hidden');
  resultContainer.innerHTML = '';

  const filtradas = lista.filter((l) => slugs.includes(l.slug));

  if (filtradas.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  const dataFormatada = formatarDataBR(dataAtual);
  const cardTemplate = document.getElementById('cardTemplate');

  for (let idx = 0; idx < filtradas.length; idx++) {
    const loteria = filtradas[idx];
    const resultados = loteria.resultados;
    const primeiro = resultados[0] || { milhar: '----', grupo: 0 };
    const animal = ANIMAIS[primeiro.grupo] || 'Desconhecido';
    const exibicao = nomeExibicao(loteria.nome_loteria);
    const isPar = idx % 2 === 0;

    const clone = cardTemplate.content.cloneNode(true);
    const card = clone.querySelector('.result-card');

    card.style.animationDelay = `${idx * 0.06}s`;
    card.setAttribute('aria-label', `${exibicao} — ${dataFormatada}`);

    const tituloGradient = isPar
      ? 'linear-gradient(135deg, #F59E0B, #F97316)'
      : 'linear-gradient(135deg, #F97316, #FBBF24)';

    const titleEl = card.querySelector('.card-title');
    titleEl.style.background = tituloGradient;
    titleEl.textContent = exibicao;

    card.querySelector('.card-milhar').textContent = primeiro.milhar;

    const animalNameEl = card.querySelector('.card-animal-name');
    animalNameEl.textContent = animal;

    const animalImg = card.querySelector('.card-animal-img');
    animalImg.src = `/assets/img/animais-webp/${primeiro.grupo}.webp`;
    animalImg.alt = animal;

    const caption = card.querySelector('.card-caption');
    if (caption) caption.textContent = `Resultados completos de ${exibicao} em ${dataFormatada}`;

    const table = card.querySelector('.card-table');
    table.setAttribute('aria-label', `Resultados de ${exibicao}`);

    const tbody = card.querySelector('tbody');
    for (let i = 0; i < resultados.length; i++) {
      const r = resultados[i];
      const tr = document.createElement('tr');
      if (i % 2 === 0) {
        tr.style.background = 'rgba(156, 139, 107, 0.05)';
      }

      const tdPosicao = document.createElement('td');
      tdPosicao.className = 'td-posicao';
      tdPosicao.textContent = r.posicao;

      const tdMilhar = document.createElement('td');
      tdMilhar.className = 'td-milhar';
      tdMilhar.textContent = r.milhar;

      const tdGrupo = document.createElement('td');
      tdGrupo.className = 'td-grupo';
      tdGrupo.textContent = r.grupo > 0 ? String(r.grupo) : '-';

      tr.appendChild(tdPosicao);
      tr.appendChild(tdMilhar);
      tr.appendChild(tdGrupo);
      tbody.appendChild(tr);
    }

    const resultadosTexto = resultados
      .map((r) => `*${r.posicao}* • ${r.milhar} — ${ANIMAIS[r.grupo] || '—'}`)
      .join('\n');

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(
      `*${exibicao}*\n*${dataFormatada}*\n\n${resultadosTexto}\n\n━━━━━━━━━━━━━━\n*${TEXTOS.siteNome}*`
    )}`;

    const shareLink = card.querySelector('.share-btn');
    shareLink.href = shareUrl;
    shareLink.setAttribute('aria-label', `Compartilhar resultados de ${exibicao} no WhatsApp`);

    resultContainer.appendChild(card);
  }
}