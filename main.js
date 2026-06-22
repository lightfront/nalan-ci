/* ===== 纳兰词 — Main Application ===== */

(function () {
  'use strict';

  // ---- State ----
  let poems = [];
  let filtered = [];

  // ---- DOM refs ----
  const grid = document.getElementById('poemGrid');
  const empty = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const rhythmicSel = document.getElementById('rhythmicFilter');
  const countSpan = document.getElementById('poemCount');
  const commentaryCountSpan = document.getElementById('commentaryCount');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // ---- Fetch & init ----
  async function init() {
    try {
      const resp = await fetch('poems.json', { cache: 'no-store' });
      const data = await resp.json();
      poems = data.poems || data;
      if (data.meta) {
        document.title = data.meta.title;
        countSpan.textContent = data.meta.total || poems.length;
      } else {
        countSpan.textContent = poems.length;
      }
      populateFilters();
      applyFilters();
      commentaryCountSpan.textContent = poems.filter(p => (p.notes && p.notes.length) || p.background).length;
      bindEvents();
    } catch (err) {
      console.error('Failed to load poems:', err);
      grid.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--ink-light);">加载失败，请刷新重试</p>';
    }
  }

  // ---- Populate filter dropdowns ----
  function populateFilters() {
    const rhythmics = [...new Set(poems.map(p => p.rhythmic).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'zh'));
    rhythmics.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      rhythmicSel.appendChild(opt);
    });
  }

  // ---- Filter & render ----
  function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const rhythmicFilter = rhythmicSel.value;

    filtered = poems.filter(p => {
      if (rhythmicFilter && p.rhythmic !== rhythmicFilter) return false;
      if (searchTerm) {
        const haystack = (p.title + ' ' + (p.name||'') + ' ' + p.rhythmic + ' ' + p.author + ' ' + p.content.join('')).toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }
      return true;
    });

    render();
  }

  // ---- Render cards ----
  function render() {
    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.classList.add('visible');
      return;
    }
    empty.classList.remove('visible');

    const html = filtered.map(p => {
      const excerpt = p.content.slice(0, 2).join('　');
      const hasCommentary = !!(p.notes && p.notes.length) || !!p.background;
      return `
        <div class="poem-card${hasCommentary ? ' has-commentary' : ''}" data-id="${p.id}">
          <div class="poem-card-header">
            <span class="poem-card-title">${escapeHtml(p.name ? p.name : p.title)}</span>
            <span class="poem-card-rhythmic">${escapeHtml(p.rhythmic)}</span>
          </div>
          <div class="poem-card-excerpt">${escapeHtml(excerpt)}</div>
          ${hasCommentary ? '<span class="commentary-badge" title="含字词注释与创作背景">讲解</span>' : ''}
        </div>
      `;
    }).join('');

    grid.innerHTML = html;
  }

  // ---- Show modal ----
  function showModal(id) {
    const poem = poems.find(p => p.id === id);
    if (!poem) return;

    const notesHtml = (poem.notes && poem.notes.length)
      ? `<section class="commentary">
          <h3 class="commentary-title">字词注释</h3>
          <dl class="notes-list">
            ${poem.notes.map(n => `
              <div class="note-item">
                <dt>${escapeHtml(n.term)}</dt>
                <dd>${escapeHtml(n.gloss)}</dd>
              </div>
            `).join('')}
          </dl>
        </section>`
      : '';

    const bgHtml = poem.background
      ? `<section class="commentary">
          <h3 class="commentary-title">创作背景</h3>
          <p class="commentary-text">${escapeHtml(poem.background)}</p>
        </section>`
      : '';

    modalBody.innerHTML = `
      <div class="modal-body-title">${escapeHtml(poem.name ? poem.name : poem.title)}</div>
      <div class="modal-body-rhythmic">【${escapeHtml(poem.rhythmic)}】</div>
      <div class="modal-body-author">${escapeHtml(poem.author)}</div>
      <div class="modal-body-content">
        ${poem.content.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
      </div>
      ${notesHtml}
      ${bgHtml}
    `;
    modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    modalOverlay.scrollTop = 0;
  }

  function hideModal() {
    modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // ---- Debounce ----
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ---- Escape HTML ----
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Bind events ----
  function bindEvents() {
    const debouncedFilter = debounce(applyFilters, 250);
    searchInput.addEventListener('input', debouncedFilter);
    rhythmicSel.addEventListener('change', applyFilters);

    grid.addEventListener('click', e => {
      const card = e.target.closest('.poem-card');
      if (card) {
        const id = parseInt(card.dataset.id, 10);
        showModal(id);
      }
    });

    modalClose.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) hideModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideModal();
    });
  }

  // ---- Start ----
  document.addEventListener('DOMContentLoaded', init);
})();
