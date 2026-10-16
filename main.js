// Léo Carvalho: navegação, revelar no scroll e vídeos que tocam ao entrar na tela
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav: fundo ao rolar + menu mobile
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', false);
  }));

  // hero: o vídeo fica parado (no poster) para quem prefere menos movimento
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo && reduce) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }

  // revelar no scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // vídeos: tocam mudos quando visíveis; um toque liga o som (só um por vez)
  const clips = [...document.querySelectorAll('[data-clip]')];

  const setSound = (clip, on) => {
    const v = clip.querySelector('video');
    v.muted = !on;
    clip.classList.toggle('is-sound', on);
    const btn = clip.querySelector('.clip__sound');
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Desativar som' : 'Ativar som');
  };

  clips.forEach(clip => {
    const v = clip.querySelector('video');
    clip.addEventListener('click', () => {
      const turnOn = v.muted;
      clips.forEach(c => c !== clip && setSound(c, false));
      setSound(clip, turnOn);
      if (v.paused) v.play().catch(() => {});
    });
  });

  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) {
        if (!reduce || !v.muted) v.play().catch(() => {});
      } else {
        v.pause();
        setSound(e.target, false);
      }
    });
  }, { threshold: .45 });
  clips.forEach(c => vio.observe(c));

  // fotos: lightbox com setas, teclado e toque
  const lb = document.querySelector('.lightbox');
  const shots = [...document.querySelectorAll('.gallery__open')];
  if (lb && shots.length) {
    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('figcaption');
    let at = 0, lastFocus = null;
    const show = i => {
      at = (i + shots.length) % shots.length;
      const b = shots[at];
      lbImg.src = b.dataset.full;
      lbImg.alt = b.querySelector('img').alt;
      lbCap.textContent = b.closest('figure').querySelector('figcaption').textContent;
    };
    const open = i => {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    };
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    shots.forEach((b, i) => b.addEventListener('click', () => open(i)));
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(at - 1));
    lb.querySelector('.lightbox__nav--next').addEventListener('click', () => show(at + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // apresentação: slides com setas, pontos, teclado, tela cheia e PDF
  const deck = document.querySelector('.deck');
  if (deck) {
    const track = deck.querySelector('.deck__track');
    const slides = [...track.querySelectorAll('.slide')];
    const dots = deck.querySelector('.deck__dots');
    const cur = deck.querySelector('[data-deck-current]');
    const prev = deck.querySelector('.deck__btn--prev');
    const next = deck.querySelector('.deck__btn--next');
    const frame = deck.querySelector('.deck__frame');
    let idx = 0;

    slides.forEach((s, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', s.getAttribute('aria-label'));
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    });

    const paint = () => {
      cur.textContent = String(idx + 1).padStart(2, '0');
      [...dots.children].forEach((d, i) => d.setAttribute('aria-selected', i === idx));
      prev.disabled = idx === 0;
      next.disabled = idx === slides.length - 1;
    };
    const go = i => {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      const target = slides[idx].offsetLeft;
      const from = track.scrollLeft;
      track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
      // se a rolagem suave não andar (aba em segundo plano, navegador antigo), pula direto
      setTimeout(() => {
        if (track.scrollLeft === from && from !== target) {
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = target;
          track.style.scrollBehavior = '';
        }
      }, 450);
      paint();
    };
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    });
    // arrastar no celular: acompanha o slide que ficou na tela
    let t;
    track.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== idx) { idx = i; paint(); }
      }, 80);
    }, { passive: true });
    addEventListener('resize', () => { track.scrollLeft = slides[idx].offsetLeft; });

    const fullBtn = deck.querySelector('[data-deck-full]');
    if (!frame.requestFullscreen) fullBtn.hidden = true;
    fullBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else frame.requestFullscreen().then(() => track.focus()).catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      fullBtn.lastChild.textContent = document.fullscreenElement ? ' Sair da tela cheia' : ' Tela cheia';
      requestAnimationFrame(() => { track.scrollLeft = slides[idx].offsetLeft; });
    });

    paint();
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
