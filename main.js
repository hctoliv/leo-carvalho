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

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
