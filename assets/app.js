/* ==========================================================================
   Project page behaviour. No dependencies, no network requests.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.PAGE_DATA || {};
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── icons ────────────────────────────────────────────────────────── */

  var ICON = {
    play:  '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M7 4.4v15.2L20 12z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M7 4.5h3.4v15H7zM13.6 4.5H17v15h-3.4z" fill="currentColor"/></svg>',
    replay:'<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><polyline points="1 4 1 10 7 10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    full:  '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ── build one video card ─────────────────────────────────────────── */

  function buildCard(item, index, total) {
    var card = document.createElement('figure');
    card.className = 'video-card';
    card.dataset.videoId = item.id || item.src;

    var frame = document.createElement('div');
    frame.className = 'video-frame';

    var video = document.createElement('video');
    video.muted = true;                 // required for autoplay in every browser
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    video.poster = item.poster;
    video.setAttribute('aria-label', item.title || 'Simulation clip');
    video.tabIndex = 0;
    if (reduceMotion) video.controls = true;

    if (item.badge) {
      var badge = document.createElement('span');
      badge.className = 'video-badge';
      badge.textContent = item.badge;
      frame.appendChild(badge);
    }

    var missing = document.createElement('div');
    missing.className = 'video-missing';
    missing.hidden = true;
    missing.innerHTML = 'Poster only — add <code>' + (item.src || '') + '</code>';

    frame.appendChild(video);
    frame.appendChild(missing);
    card.appendChild(frame);

    /* caption bar */
    var bar = document.createElement('figcaption');
    bar.className = 'video-bar';

    var meta = document.createElement('div');
    meta.className = 'video-meta';
    var t = document.createElement('span');
    t.className = 'video-title';
    t.textContent = item.title || '';
    meta.appendChild(t);
    if (item.note) {
      var n = document.createElement('span');
      n.className = 'video-note';
      n.textContent = item.note;
      meta.appendChild(n);
    }
    bar.appendChild(meta);

    var ctl = document.createElement('div');
    ctl.className = 'video-ctl';

    var speed = document.createElement('div');
    speed.className = 'ctl-speed';
    speed.setAttribute('role', 'group');
    speed.setAttribute('aria-label', 'Playback speed');
    [['0.25', '0.25×'], ['0.5', '0.5×'], ['1', '1×']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ctl-btn';
      b.dataset.speed = pair[0];
      b.textContent = pair[1];
      b.setAttribute('aria-pressed', pair[0] === '1' ? 'true' : 'false');
      b.addEventListener('click', function () { setSpeed(video, speed, parseFloat(pair[0])); });
      speed.appendChild(b);
    });
    ctl.appendChild(speed);

    var btnPlay = document.createElement('button');
    btnPlay.type = 'button';
    btnPlay.className = 'ctl-btn';
    btnPlay.innerHTML = ICON.pause;
    btnPlay.setAttribute('aria-label', 'Play or pause');
    btnPlay.addEventListener('click', function () {
      if (video.paused) { video.play().catch(noop); } else { video.pause(); }
    });
    ctl.appendChild(btnPlay);

    var btnReplay = document.createElement('button');
    btnReplay.type = 'button';
    btnReplay.className = 'ctl-btn';
    btnReplay.innerHTML = ICON.replay;
    btnReplay.setAttribute('aria-label', 'Replay from start');
    btnReplay.setAttribute('title', 'Replay');
    btnReplay.addEventListener('click', function () {
      try { video.currentTime = 0; } catch (e) {}
      video.play().catch(noop);
    });
    ctl.appendChild(btnReplay);

    var btnFull = document.createElement('button');
    btnFull.type = 'button';
    btnFull.className = 'ctl-btn';
    btnFull.innerHTML = ICON.full;
    btnFull.setAttribute('aria-label', 'Full screen');
    btnFull.addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (frame.requestFullscreen) { frame.requestFullscreen(); }
      else if (video.webkitEnterFullscreen) { video.webkitEnterFullscreen(); }
    });
    ctl.appendChild(btnFull);

    bar.appendChild(ctl);
    card.appendChild(bar);

    /* state wiring */
    video.addEventListener('play',  function () { btnPlay.innerHTML = ICON.pause; });
    video.addEventListener('pause', function () { btnPlay.innerHTML = ICON.play; });
    video.addEventListener('error', function () { markEmpty(card, frame, video, item); });
    video.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        if (video.paused) { video.play().catch(noop); } else { video.pause(); }
      }
    });

    if (item.src) { video.src = item.src; } else { markEmpty(card, frame, video, item); }

    return { el: card, video: video, index: index, total: total };
  }

  function setSpeed(video, group, rate) {
    video.playbackRate = rate;
    $$('.ctl-btn', group).forEach(function (b) {
      b.setAttribute('aria-pressed', parseFloat(b.dataset.speed) === rate ? 'true' : 'false');
    });
  }

  function markEmpty(card, frame, video, item) {
    card.classList.add('is-empty');
    if (item.poster) {
      frame.style.backgroundImage = 'url("' + item.poster + '")';
      frame.style.backgroundSize = 'cover';
      frame.style.backgroundPosition = 'center';
    }
    var m = $('.video-missing', frame);
    if (m) m.hidden = false;
    video.removeAttribute('src');
    video.load();
  }

  function noop() {}

  /* ── render the grids ─────────────────────────────────────────────── */

  var players = [];

  Object.keys(DATA.grids || {}).forEach(function (key) {
    var group = DATA.grids[key];
    var host = $('[data-grid="' + key + '"]');
    if (!host) return;
    if (group.cols === 1) host.dataset.cols = '1';
    group.items.forEach(function (item, i) {
      var p = buildCard(item, i, group.items.length);
      host.appendChild(p.el);
      players.push(p);
    });
  });

  /* hero clip */
  (function () {
    var card = $('[data-video="teaser"]');
    if (!card || !DATA.hero) return;
    var video = $('video', card);
    var item = DATA.hero;
    video.poster = item.poster;
    video.addEventListener('error', function () { markEmpty(card, $('.video-frame', card), video, item); });
    if (item.src) { video.src = item.src; } else { markEmpty(card, $('.video-frame', card), video, item); }

    if (item.badge && !$('.video-badge', card)) {
      var b = document.createElement('span');
      b.className = 'video-badge';
      b.textContent = item.badge;
      $('.video-frame', card).appendChild(b);
    }

    /* give the hero the same control cluster as the grid cards */
    var ctlHost = $('.video-ctl', card);
    if (ctlHost) {
      var speed = document.createElement('div');
      speed.className = 'ctl-speed';
      speed.setAttribute('role', 'group');
      speed.setAttribute('aria-label', 'Playback speed');
      [['0.25', '0.25×'], ['0.5', '0.5×'], ['1', '1×']].forEach(function (pair) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ctl-btn';
        btn.dataset.speed = pair[0];
        btn.textContent = pair[1];
        btn.setAttribute('aria-pressed', pair[0] === '1' ? 'true' : 'false');
        btn.addEventListener('click', function () { setSpeed(video, speed, parseFloat(pair[0])); });
        speed.appendChild(btn);
      });
      ctlHost.appendChild(speed);

      var pb = document.createElement('button');
      pb.type = 'button'; pb.className = 'ctl-btn'; pb.innerHTML = ICON.pause;
      pb.setAttribute('aria-label', 'Play or pause');
      pb.addEventListener('click', function () {
        if (video.paused) { video.play().catch(noop); } else { video.pause(); }
      });
      ctlHost.appendChild(pb);

      var fb = document.createElement('button');
      fb.type = 'button'; fb.className = 'ctl-btn'; fb.innerHTML = ICON.full;
      fb.setAttribute('aria-label', 'Full screen');
      fb.addEventListener('click', function () {
        var fr = $('.video-frame', card);
        if (document.fullscreenElement) { document.exitFullscreen(); }
        else if (fr.requestFullscreen) { fr.requestFullscreen(); }
        else if (video.webkitEnterFullscreen) { video.webkitEnterFullscreen(); }
      });
      ctlHost.appendChild(fb);

      video.addEventListener('play',  function () { pb.innerHTML = ICON.pause; });
      video.addEventListener('pause', function () { pb.innerHTML = ICON.play; });
    }

    players.push({ el: card, video: video, index: 0, total: 1 });
  })();

  /* ── autoplay what is on screen, park what is not ─────────────────── */

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = $('video', entry.target);
        if (!video || !video.src || entry.target.classList.contains('is-empty')) return;
        if (entry.intersectionRatio >= 0.5) {
          video.play().catch(noop);
        } else if (entry.intersectionRatio < 0.3) {
          video.pause();          // hysteresis: avoids flapping at the threshold
        }
      });
    }, { threshold: [0, 0.3, 0.5, 0.8] });

    players.forEach(function (p) { io.observe(p.el); });
  }

  /* a clip that fails to load mid-playback should fall back too */
  players.forEach(function (p) {
    p.video.addEventListener('stalled', function () {
      if (p.video.readyState === 0 && p.video.currentSrc) { /* transient — leave it */ }
    });
  });

  /* ── bar charts ───────────────────────────────────────────────────── */

  Object.keys(DATA.charts || {}).forEach(function (key) {
    var cfg = DATA.charts[key];
    var host = $('[data-chart="' + key + '"]');
    if (!host) return;

    host.style.setProperty('--step', (100 / cfg.ticks.length) + '%');

    cfg.rows.forEach(function (row) {
      var pct = (row.value / cfg.max) * 100;

      var li = document.createElement('li');
      li.className = 'bar-row';
      li.tabIndex = 0;
      li.dataset.tip = row.tip || (row.value + ' ms');

      var label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = row.label;

      var plot = document.createElement('span');
      plot.className = 'bar-plot';

      var fill = document.createElement('span');
      fill.className = 'bar-fill';
      fill.style.width = '0%';
      plot.appendChild(fill);

      var val = document.createElement('span');
      val.className = 'bar-val';
      val.style.left = pct + '%';
      val.textContent = row.display || (row.value.toFixed(2) + ' ms');
      plot.appendChild(val);

      li.appendChild(label);
      li.appendChild(plot);
      host.appendChild(li);

      /* animate on first paint, and only when the row is actually on screen */
      requestAnimationFrame(function () {
        if (reduceMotion || !('IntersectionObserver' in window)) {
          fill.style.width = pct + '%';
          return;
        }
        var once = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { fill.style.width = pct + '%'; once.disconnect(); }
          });
        }, { threshold: 0.4 });
        once.observe(li);
      });
    });

    /* axis */
    var axis = document.createElement('div');
    axis.className = 'axis';
    cfg.ticks.forEach(function (t) {
      var s = document.createElement('span');
      s.textContent = String(t);
      axis.appendChild(s);
    });
    host.parentNode.appendChild(axis);

    var unit = document.createElement('span');
    unit.className = 'axis-unit';
    unit.textContent = 'ms';
    host.parentNode.appendChild(unit);
  });

  /* ── nav: active section, scroll progress ─────────────────────────── */

  var navLinks = $$('.nav-links a');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var seen = {};
    var nav = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      Object.keys(seen).forEach(function (id) {
        if (seen[id] > bestRatio) { bestRatio = seen[id]; best = id; }
      });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', best !== null && a.getAttribute('href') === '#' + best);
      });
    }, { threshold: [0.05, 0.25, 0.5], rootMargin: '-72px 0px -55% 0px' });
    sections.forEach(function (s) { nav.observe(s); });
  }

  var progress = $('#progress');
  if (progress) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── theme toggle ─────────────────────────────────────────────────── */

  var toggle = $('#themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      /* drop a ?theme= override, otherwise the URL would win on every reload */
      if (/([?&])theme=/.test(location.search)) {
        var q = new URLSearchParams(location.search);
        q.delete('theme');
        var rest = q.toString();
        history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      }
    });
  }

  /* ── copy BibTeX ──────────────────────────────────────────────────── */

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer;

  function flash(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1900);
  }

  $$('[data-copy-bib]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = $('#bibtexSrc');
      if (!src) return;
      var text = src.textContent;
      var done = function () {
        flash('BibTeX copied');
        if (btn.classList.contains('copy-btn')) {
          btn.classList.add('is-done');
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.classList.remove('is-done');
            btn.textContent = 'Copy';
          }, 1900);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { flash('Copy failed — select manually'); }
    document.body.removeChild(ta);
  }

  /* ── fullscreen should scale the video, not letterbox it ──────────── */

  document.addEventListener('fullscreenchange', function () {
    var el = document.fullscreenElement;
    if (el && el.classList.contains('video-frame')) {
      var v = $('video', el);
      if (v) { v.style.objectFit = 'contain'; v.play().catch(noop); }
    } else {
      players.forEach(function (p) { p.video.style.objectFit = ''; });
    }
  });
})();
