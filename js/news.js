/* REZONANSLAR Haberler — continuous, accessible news carousel.
   Uses three matching card groups for seamless loops in both directions.
   Only this home-page component is affected. */
(() => {
  'use strict';

  const feed = document.getElementById('news-feed');
  if (!feed) return;

  const filters = [...document.querySelectorAll('.news-filter')];
  const empty = document.getElementById('news-empty');
  const categories = {
    release: { tr: 'Yeni Yayınlar', en: 'Releases' },
    social: { tr: 'Sosyal Medya', en: 'Social Media' },
    studio: { tr: 'Stüdyo Haberleri', en: 'Studio News' }
  };
  const formatters = {
    tr: new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    en: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  };
  const statusLabels = {
    plan: { tr: ' · Yayın Takvimi', en: ' · Release Schedule' },
    live: { tr: ' · Güncel', en: ' · Current' },
    soon: { tr: ' · Yakında', en: ' · Coming Soon' }
  };

  let active = 'all';
  let dispose = () => {};

  function element(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function cardFor(item, language, duplicate) {
    const card = element('article', 'news-card');
    if (duplicate) card.setAttribute('aria-hidden', 'true');

    const art = element('div', 'news-art');
    art.dataset.type = item.type;
    if (item.image) {
      art.classList.add('has-image');
      art.style.backgroundImage = `linear-gradient(180deg, rgba(20,16,10,.08), rgba(20,16,10,.62)), url("${item.image}")`;
    }
    art.append(
      element('span', 'news-art-kind', (categories[item.type] || categories.studio)[language]),
      element('span', 'news-art-mark', 'R')
    );

    const body = element('div', 'news-body');
    const date = new Date(item.date + 'T12:00:00Z');
    const dateText = Number.isNaN(date.valueOf()) ? item.date : formatters[language].format(date);
    const statusText = (statusLabels[item.status] || statusLabels.live)[language];
    body.append(
      element('div', 'news-meta', dateText + statusText),
      element('h3', '', item.title[language]),
      element('p', '', item.description[language])
    );

    if (item.url) {
      const link = element('a', 'news-more', item.link[language] + ' →');
      link.href = item.url;
      if (/^https?:\/\//i.test(item.url)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      if (duplicate) link.tabIndex = -1;
      body.append(link);
    }

    card.append(art, body);
    return card;
  }

  function render() {
    dispose();
    const language = document.documentElement.lang === 'en' ? 'en' : 'tr';
    const entries = (window.REZONANSLAR_NEWS || [])
      .filter(item => active === 'all' || item.type === active)
      .sort((a, b) => b.date.localeCompare(a.date));

    feed.replaceChildren();
    empty.hidden = entries.length > 0;
    feed.classList.toggle('is-empty', entries.length === 0);
    if (!entries.length) return;

    const shell = element('div', 'news-carousel-shell');
    shell.setAttribute('role', 'region');
    shell.setAttribute('aria-roledescription', language === 'tr' ? 'Haber kaydırıcısı' : 'News carousel');
    shell.setAttribute('aria-label', language === 'tr' ? 'REZONANSLAR kayan haberler' : 'REZONANSLAR scrolling news');

    const viewport = element('div', 'news-marquee-viewport');
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('aria-label', language === 'tr' ? 'Haber kartları, kaydırılabilir' : 'Scrollable news cards');
    const track = element('div', 'news-marquee-track');

    // One cycle must be longer than the visible viewport, including for the
    // two-item Social Media filter, otherwise a gap appears during looping.
    const cycle = [];
    const count = Math.max(entries.length, 5);
    for (let i = 0; i < count; i++) cycle.push(entries[i % entries.length]);

    for (let group = 0; group < 3; group++) {
      cycle.forEach(item => track.append(cardFor(item, language, group !== 1)));
    }

    viewport.append(track);
    const previous = element('button', 'news-arrow news-arrow-prev', '‹');
    previous.type = 'button';
    previous.setAttribute('aria-label', language === 'tr' ? 'Önceki habere git' : 'Previous news');
    previous.setAttribute('title', language === 'tr' ? 'Önceki haber' : 'Previous news');
    const next = element('button', 'news-arrow news-arrow-next', '›');
    next.type = 'button';
    next.setAttribute('aria-label', language === 'tr' ? 'Sonraki habere git' : 'Next news');
    next.setAttribute('title', language === 'tr' ? 'Sonraki haber' : 'Next news');
    shell.append(previous, viewport, next);
    feed.append(shell);

    let cycleWidth = 0;
    let frameId = 0;
    let previousTime = 0;
    let hovered = false;
    let focused = false;
    let dragging = false;
    let touchPauseUntil = 0;
    let manual = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function widthOfCycle() {
      // All cards are equally wide; this measures exactly one repeated group.
      return track.children[count].offsetLeft - track.children[0].offsetLeft;
    }
    function wrap(x) {
      if (!cycleWidth) return x;
      while (x >= cycleWidth * 2) x -= cycleWidth;
      while (x < cycleWidth) x += cycleWidth;
      return x;
    }
    function measure() {
      cycleWidth = widthOfCycle();
      if (cycleWidth > 0) viewport.scrollLeft = cycleWidth;
    }
    function stepWidth() {
      const cardA = track.children[0];
      const cardB = track.children[1];
      return cardB.offsetLeft - cardA.offsetLeft;
    }
    function move(direction) {
      if (!cycleWidth) measure();
      const delta = direction * stepWidth();
      if (!delta) return;
      if (reducedMotion.matches) {
        viewport.scrollLeft = wrap(viewport.scrollLeft + delta);
        return;
      }
      manual = { start: viewport.scrollLeft, distance: delta, startTime: performance.now(), duration: 440 };
    }
    function animate(time) {
      const elapsed = previousTime ? Math.min(60, time - previousTime) : 0;
      previousTime = time;
      if (manual) {
        const progress = Math.min(1, (time - manual.startTime) / manual.duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        viewport.scrollLeft = wrap(manual.start + manual.distance * eased);
        if (progress >= 1) manual = null;
      } else if (!hovered && !focused && !dragging && !document.hidden &&
                 !reducedMotion.matches && time > touchPauseUntil && cycleWidth) {
        // 60 px/sec: continuous, clearly visible right-to-left motion.
        viewport.scrollLeft = wrap(viewport.scrollLeft + elapsed * 0.060);
      }
      frameId = requestAnimationFrame(animate);
    }

    const onPrevious = () => move(-1);
    const onNext = () => move(1);
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    // Only pause for keyboard-focused *content*. Arrow buttons retain focus
    // after clicks, and must not indefinitely prevent automatic scrolling.
    const shouldPauseForFocus = () => {
      const node = document.activeElement;
      return !!(node && shell.contains(node) &&
        (node.classList.contains('news-more') || node === viewport));
    };
    const onFocus = () => { focused = shouldPauseForFocus(); };
    const onBlur = () => {
      // Focus may move to another child after focusout. Defer to let it settle.
      queueMicrotask(() => { focused = shouldPauseForFocus(); });
    };
    const onPointerDown = e => { if (e.pointerType === 'touch') dragging = true; };
    const onPointerUp = e => { if (e.pointerType === 'touch') { dragging = false; touchPauseUntil = performance.now() + 1500; } };
    const onResize = () => { measure(); previousTime = 0; };
    const onKeyboard = e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    };

    previous.addEventListener('click', onPrevious);
    next.addEventListener('click', onNext);
    shell.addEventListener('mouseenter', onEnter);
    shell.addEventListener('mouseleave', onLeave);
    shell.addEventListener('focusin', onFocus);
    shell.addEventListener('focusout', onBlur);
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('keydown', onKeyboard);
    window.addEventListener('resize', onResize);

    measure();
    frameId = requestAnimationFrame(animate);
    dispose = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    };
  }

  filters.forEach(filter => filter.addEventListener('click', () => {
    active = filter.dataset.filter;
    filters.forEach(button => {
      const selected = button === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    render();
  }));
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', render));
  render();
})();
