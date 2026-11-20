
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function splitText(root) {
    var index = 0;
    function walk(node, em) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'w';
            var inner = document.createElement('span');
            inner.className = 'wi' + (em ? ' em' : '');
            inner.style.setProperty('--i', index++);
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child, em || child.tagName === 'EM');
        }
      });
    }
    walk(root, false);
    root.querySelectorAll('em').forEach(function (em) {
      while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em);
      em.remove();
    });
  }
  var T = function (s) { return s; };
  document.querySelectorAll('[data-split]').forEach(splitText);

  var targets = document.querySelectorAll('[data-reveal],[data-split]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (n) { io.observe(n); });
  }

  var observeReveal = function (nodes) {
    Array.prototype.forEach.call(nodes, function (n) {
      if (reduce || !('IntersectionObserver' in window)) { n.classList.add('in'); return; }
      if (!window.__revealIO) {
        window.__revealIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            window.__revealIO.unobserve(entry.target);
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
      }
      window.__revealIO.observe(n);
    });
  };
  window.GlobalUI = { toast: toast, reveal: observeReveal };

  var nav = document.getElementById('nav');
  var navLinks = document.getElementById('nav-links');
  var indicator = document.getElementById('nav-ind');
  var toggle = document.getElementById('nav-toggle');
  var anchors = Array.prototype.slice.call(navLinks.querySelectorAll('a'));
  var activeLink = anchors.filter(function (a) { return a.classList.contains('active'); })[0] || anchors[0];

  function moveIndicator(link) {
    if (!link || getComputedStyle(indicator).display === 'none') return;
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    indicator.style.opacity = '1';
  }
  anchors.forEach(function (link) {
    link.addEventListener('pointerenter', function () { moveIndicator(link); });
    link.addEventListener('focus', function () { moveIndicator(link); });
  });
  navLinks.addEventListener('pointerleave', function () { moveIndicator(activeLink); });
  window.addEventListener('resize', function () { moveIndicator(activeLink); });
  window.addEventListener('load', function () { moveIndicator(activeLink); });

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  anchors.forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.btn').forEach(function (button) {
    button.addEventListener('pointerdown', function (e) {
      var r = button.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - r.left - size / 2) + 'px';
      dot.style.top = (e.clientY - r.top - size / 2) + 'px';
      button.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    });
  });

  var mouse = { x: 0, y: 0, px: 0, py: 0, cx: 0, cy: 0, tx: 0, ty: 0 };
  var cursor = document.getElementById('cursor');
  var glows = [document.getElementById('glow'), document.getElementById('glow2')];

  if (fine && !reduce) {
    window.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX / innerWidth * 2 - 1;
      mouse.y = e.clientY / innerHeight * 2 - 1;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      cursor.classList.add('on');
    });
    document.addEventListener('pointerleave', function () { cursor.classList.remove('on'); });

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add('live');
        card.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('live');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });

    document.querySelectorAll('[data-magnetic]').forEach(function (button) {
      button.addEventListener('pointermove', function (e) {
        var r = button.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        button.style.transform = 'translate(' + (dx * 0.2).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px)';
      });
      button.addEventListener('pointerleave', function () { button.style.transform = ''; });
    });
  }

  var copyForm = document.getElementById('copy-form');
  var copyInput = document.getElementById('copy-input');
  var copyButton = document.getElementById('copy-btn');
  copyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var done = function () {
      copyButton.firstChild.nodeValue = T('Copiado ✓');
      toast(T('Comando copiado'));
      setTimeout(function () { copyButton.firstChild.nodeValue = T('Copiar'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyInput.value).then(done).catch(function () {
        copyInput.select();
        try { document.execCommand('copy'); done(); } catch (err) { toast(T('Selecione e copie o comando')); }
      });
    } else {
      copyInput.select();
      try { document.execCommand('copy'); done(); } catch (err) { toast(T('Selecione e copie o comando')); }
    }
  });

  var topButton = document.getElementById('top');
  topButton.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var progress = document.getElementById('progress');
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var sy = scrollY;
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = 'scaleX(' + clamp(sy / max, 0, 1).toFixed(4) + ')';
    nav.classList.toggle('scrolled', sy > 30);
    topButton.classList.toggle('show', sy > 900);

    if (fine && !reduce) {
      var k = 1 - Math.exp(-dt * 8);
      mouse.cx += (mouse.tx - mouse.cx) * k;
      mouse.cy += (mouse.ty - mouse.cy) * k;
      cursor.style.transform = 'translate3d(' + mouse.cx.toFixed(1) + 'px,' + mouse.cy.toFixed(1) + 'px,0)';
      var kp = 1 - Math.exp(-dt * 5);
      mouse.px += (mouse.x - mouse.px) * kp;
      mouse.py += (mouse.y - mouse.py) * kp;
    }
    if (!reduce) {
      glows.forEach(function (glow, i) {
        if (!glow) return;
        var r = glow.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var sp = clamp((r.top + r.height / 2) / innerHeight, 0, 1.2);
        glow.style.transform = 'translate3d(' + (mouse.px * 26).toFixed(1) + 'px,0,0) scale(' + (1.12 - sp * 0.14).toFixed(3) + ')';
        glow.style.opacity = clamp(1.25 - sp * 0.35, 0.6, 1).toFixed(2);
      });
    }
  }
  requestAnimationFrame(frame);
})();
