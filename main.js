// Léo Carvalho: navegação, revelar no scroll e vídeos que tocam ao entrar na tela
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // sem zoom no celular: o Safari ignora user-scalable=no, então bloqueia pinça e toque duplo
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300 && !e.target.closest('a, button, video')) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  // intro: contagem 1-2-3-4, groove na caixa, prato de ataque e mergulho na pele
  const root = document.documentElement;
  const intro = document.querySelector('div.intro');
  if (intro && root.classList.contains('intro-on')) {
    const stage = intro.querySelector('.intro__stage');
    const drum = intro.querySelector('.intro__drum');
    const head = intro.querySelector('.intro__head');
    const ripples = intro.querySelector('.intro__ripples');
    const count = intro.querySelector('.intro__count');
    const flash = intro.querySelector('.intro__flash');
    const kicker = intro.querySelector('.intro__kicker');
    const letters = [...intro.querySelectorAll('.intro__name span')];
    const sticks = { l: intro.querySelector('.intro__stick--l'), r: intro.querySelector('.intro__stick--r') };
    const rest = { l: 'rotate(-6deg) scaleY(.84)', r: 'rotate(6deg) scaleY(.84)' };
    const timers = [];
    let done = false, lit = 0;

    const ripple = (strength = 1) => {
      const r = document.createElement('span');
      ripples.appendChild(r);
      r.animate([
        { transform: 'scale(.35)', opacity: .9 * strength },
        { transform: `scale(${1.2 + strength * .9})`, opacity: 0 }
      ], { duration: 520 + strength * 260, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => r.remove();
    };
    const strike = (side, strength = 1) => {
      // a ponta desce na pele: gira para dentro e encurta um pouco (profundidade)
      const s = sticks[side], a = rest[side], hit = side === 'l' ? 'rotate(-19deg) scaleY(1)' : 'rotate(19deg) scaleY(1)';
      s.animate([{ transform: a }, { transform: hit, offset: .45 }, { transform: a }], { duration: 150, easing: 'ease-out' });
      setTimeout(() => {
        ripple(strength);
        drum.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 - .035 * strength})` }, { transform: 'scale(1)' }], { duration: 140 });
        head.style.fill = '#3a322c';
        setTimeout(() => { head.style.fill = ''; }, 90);
        stage.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${(Math.random() - .5) * 4 * strength}px, ${2 * strength}px)` }, { transform: 'translate(0,0)' }], { duration: 110 });
      }, 60);
    };
    const letter = () => { if (letters[lit]) letters[lit++].classList.add('is-on'); };
    const mark = intro.querySelector('.intro__mark');
    const say = n => {
      count.textContent = n;
      mark.style.opacity = '0';
      if (n === 4) setTimeout(() => { mark.style.opacity = ''; }, 300);
      count.animate([
        { opacity: 0, transform: 'scale(1.6)' },
        { opacity: 1, transform: 'scale(1)', offset: .25 },
        { opacity: 0, transform: 'scale(.9)' }
      ], { duration: 280, easing: 'ease-out' });
      // contagem: as baquetas batem uma na outra acima da caixa
      sticks.l.animate([{ transform: rest.l }, { transform: 'rotate(-30deg) scaleY(.8)' }, { transform: rest.l }], { duration: 140 });
      sticks.r.animate([{ transform: rest.r }, { transform: 'rotate(30deg) scaleY(.8)' }, { transform: rest.r }], { duration: 140 });
      ripple(.35);
    };
    const finish = (quick) => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem('leo-intro', '1'); } catch (e) {}
      letters.forEach(l => l.classList.add('is-on'));
      const out = quick ? 260 : 650;
      // mergulho: a caixa cresce e a tela se abre para o site
      stage.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(5)', opacity: 0 }], { duration: out, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' });
      intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: out * .7, delay: out * .3, easing: 'ease-in', fill: 'forwards' })
        .onfinish = () => { root.classList.remove('intro-on'); intro.remove(); };
    };
    // ?intro=1800 congela a intro nesse instante (só para conferir os quadros)
    const freeze = parseInt(new URLSearchParams(location.search).get('intro'), 10);
    const at = (ms, fn) => { if (!(freeze >= 0) || ms <= freeze) timers.push(setTimeout(fn, ms)); };

    // contagem do baterista
    [1, 2, 3, 4].forEach((n, i) => at(150 + i * 300, () => say(n)));
    // groove (caixa, mão alternada, uns fantasmas)
    const groove = [[1350, 'r', 1], [1500, 'l', .7], [1650, 'r', 1], [1725, 'r', .45], [1800, 'l', .8], [1950, 'r', 1], [2025, 'l', .5], [2100, 'r', .8], [2175, 'l', .6]];
    groove.forEach(([ms, side, st]) => at(ms, () => { strike(side, st); letter(); }));
    // prato de ataque
    at(2380, () => {
      strike('l', 1.4); strike('r', 1.4);
      setTimeout(() => {
        while (lit < letters.length) letter();
        kicker.classList.add('is-on');
        ripple(1.8); ripple(1.2);
        flash.animate([{ opacity: 0 }, { opacity: .9, offset: .15 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
        stage.animate([
          { transform: 'translate(0,0)' }, { transform: 'translate(-6px,4px)' }, { transform: 'translate(5px,-3px)' },
          { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }
        ], { duration: 320 });
      }, 60);
    });
    at(3050, () => finish(false));
    if (freeze >= 0) setTimeout(() => document.getAnimations().forEach(a => a.pause()), freeze + 90);

    intro.addEventListener('click', () => finish(true));
    addEventListener('keydown', () => finish(true), { once: true });
  }

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

  // hero e destaques: rolagem controla as cenas (um só rAF), mouse dá profundidade
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const hero = document.querySelector('[data-hero]');
  const hStage = hero.querySelector('.hero__stage');
  const hWord = hero.querySelector('.hero__word-in');
  const hWordBox = hero.querySelector('[data-hero-word]');
  const hFig = hero.querySelector('[data-hero-fig]');
  const hTag = hero.querySelector('[data-hero-tag]');
  const hSide = hero.querySelector('[data-hero-side]');
  const glow = hero.querySelector('[data-glow]');
  const spot = document.querySelector('[data-spot]');
  const scenes = [...spot.querySelectorAll('[data-scene]')];
  const bar = spot.querySelector('[data-spot-bar]');
  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  let ticking = false;

  const render = () => {
    ticking = false;
    const vh = innerHeight;
    // hero: a palavra corre, o Léo recua, os textos sobem e somem
    const hr = hero.getBoundingClientRect();
    const hp = clamp(-hr.top / vh, 0, 1);
    mouse.cx += (mouse.x - mouse.cx) * .08;
    mouse.cy += (mouse.y - mouse.cy) * .08;
    hWord.style.transform = `translateX(${-hp * 34}%)`;
    hWordBox.style.transform = `translate(${mouse.cx * -50}px, ${mouse.cy * -20}px)`;
    hFig.style.transform = `translateX(calc(-50% + ${mouse.cx * 22}px)) translateY(${hp * 4}%) scale(${1 - hp * .14})`;
    const fade = clamp(hp / .55, 0, 1);
    hTag.style.transform = `translateY(${-fade * 90}px)`;
    hTag.style.opacity = 1 - fade;
    if (hSide) { hSide.style.transform = `translateY(${-fade * 60}px)`; hSide.style.opacity = 1 - clamp(hp / .45, 0, 1); }
    // o palco recua quando a próxima seção sobe por cima
    const out = clamp((-hr.top - (hero.offsetHeight - vh)) / vh, 0, 1);
    hStage.style.transform = `scale(${1 - out * .08})`;
    hStage.style.filter = out ? `brightness(${1 - out * .55})` : '';
    hStage.style.borderRadius = `${out * 28}px`;

    // destaques: cada cena ocupa uma tela de rolagem
    const sr = spot.getBoundingClientRect();
    const total = spot.offsetHeight - vh;
    const sp = clamp(-sr.top / total, 0, 1) * scenes.length;
    scenes.forEach((sc, i) => {
      let t = sp - i - .5;                     // -0.5..0.5 enquanto a cena é a principal
      if (i === 0) t = Math.max(t, 0);         // a primeira já entra pronta
      if (i === scenes.length - 1) t = Math.min(t, 0); // a última fica até o fim
      const vis = 1 - clamp((Math.abs(t) - .4) / .1, 0, 1);
      sc.style.opacity = vis.toFixed(3);
      sc.style.visibility = vis > 0 ? 'visible' : 'hidden';
      const w = sc.querySelector('.spot__word'), f = sc.querySelector('.spot__fig'), c = sc.querySelector('.spot__cap');
      w.style.transform = `translateY(-62%) translateX(calc(${-t * 46}% + ${mouse.cx * -30}px))`;
      f.style.transform = `translateX(calc(-50% + var(--fx) + ${t * -16}vw + ${mouse.cx * 16}px)) translateY(${Math.abs(t) * 10}%) scale(${.92 + .08 * ease(1 - clamp(Math.abs(t) * 2, 0, 1))})`;
      c.style.transform = `translateY(${t * 60}px)`;
    });
    bar.style.transform = `scaleX(${clamp(sp / scenes.length, 0, 1)})`;

    if (Math.abs(mouse.x - mouse.cx) > .001 || Math.abs(mouse.y - mouse.cy) > .001) requestTick();
  };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick);
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      mouse.x = e.clientX / innerWidth - .5;
      mouse.y = e.clientY / innerHeight - .5;
      glow.style.setProperty('--gx', (e.clientX / innerWidth * 100).toFixed(1) + '%');
      glow.style.setProperty('--gy', (e.clientY / innerHeight * 100).toFixed(1) + '%');
      requestTick();
    }, { passive: true });
  }
  render();

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
