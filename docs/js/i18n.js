(function () {
  var DATA = window.I18N_DATA || {};
  var IDX = { en: 0, es: 1 };
  var ATTR = { pt: 'pt-BR', en: 'en', es: 'es' };
  var LANGS = ['pt', 'en', 'es'];
  var STORE = 'global-lang';
  var INLINE = { A: 1, CODE: 1, STRONG: 1, EM: 1, B: 1, I: 1, SPAN: 1, BR: 1, KBD: 1, SMALL: 1, MARK: 1 };
  var SKIP = 'script, style, textarea, [data-no-i18n], .pname';
  var ATTRS = ['aria-label', 'placeholder', 'title'];

  var exact = {};
  var templates = [];
  Object.keys(DATA).forEach(function (key) {
    if (key.indexOf('{}') < 0) { exact[key] = DATA[key]; return; }
    var source = key.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\}/g, '(.+?)');
    templates.push({ re: new RegExp('^' + source + '$'), to: DATA[key] });
  });

  var lang = 'pt';
  var textOrig = new WeakMap();
  var textLast = new WeakMap();
  var attrOrig = new WeakMap();
  var htmlOrig = new WeakMap();
  var htmlEls = [];

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function translate(key) {
    if (lang === 'pt') return key;
    var hit = exact[key];
    if (hit) return hit[IDX[lang]];
    for (var i = 0; i < templates.length; i++) {
      var m = templates[i].re.exec(key);
      if (m) {
        var n = 0;
        return templates[i].to[IDX[lang]].replace(/\{\}/g, function () { return m[++n] || ''; });
      }
    }
    return null;
  }

  function T(pt) {
    var out = translate(pt);
    return out === null ? pt : out;
  }
  window.T = T;

  function readCookie() {
    var m = document.cookie.match(/(?:^|; )global-lang=([a-z]{2})/);
    return m ? m[1] : null;
  }

  function saveLang(value) {
    try { localStorage.setItem(STORE, value); } catch (err) {}
    var domain = /(^|\.)globalbot\.site$/.test(location.hostname) ? '; domain=.globalbot.site' : '';
    document.cookie = STORE + '=' + value + '; path=/; max-age=31536000; SameSite=Lax' + domain;
  }

  function detect() {
    var q = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(q) >= 0) return q;
    var c = readCookie();
    if (LANGS.indexOf(c) >= 0) return c;
    var s = null;
    try { s = localStorage.getItem(STORE); } catch (err) {}
    if (LANGS.indexOf(s) >= 0) return s;
    var n = (navigator.language || 'pt').slice(0, 2).toLowerCase();
    return n === 'en' || n === 'es' ? n : 'pt';
  }

  function inlineOnly(el) {
    if (!el.children.length) return false;
    for (var i = 0; i < el.children.length; i++) {
      if (!INLINE[el.children[i].tagName]) return false;
      if (el.children[i].children.length && !inlineOnly(el.children[i])) return false;
    }
    return true;
  }

  function htmlKey(el) {
    var hrefs = [];
    var key = norm(el.innerHTML).replace(/href="([^"]*)"/g, function (m, h) { hrefs.push(h); return 'href=""'; });
    return { key: key, hrefs: hrefs };
  }

  function writeHtml(el, rec, split) {
    var out = lang === 'pt' ? rec.key : translate(rec.key);
    if (out === null) out = rec.key;
    var n = 0;
    el.innerHTML = out.replace(/href=""/g, function () { return 'href="' + (rec.hrefs[n++] || '') + '"'; });
    if (split && el.hasAttribute('data-split') && window.GlobalUI && window.GlobalUI.splitText) {
      window.GlobalUI.splitText(el);
      el.classList.remove('in');
      void el.offsetWidth;
      el.classList.add('in');
    }
  }

  function registerHtml(el) {
    if (htmlOrig.has(el)) return htmlOrig.get(el);
    var rec = htmlKey(el);
    htmlOrig.set(el, rec);
    htmlEls.push(el);
    el.setAttribute('data-i18nh', '');
    return rec;
  }

  function scanHtml(root, collect) {
    var list = root.nodeType === 1 ? [root].concat(Array.prototype.slice.call(root.querySelectorAll('*'))) : Array.prototype.slice.call(root.querySelectorAll('*'));
    list.forEach(function (el) {
      if (el.closest(SKIP) || (el.parentElement && el.parentElement.closest('[data-i18nh]')) || el.hasAttribute('data-i18nh')) return;
      var split = el.hasAttribute('data-split');
      if (!split && !inlineOnly(el)) return;
      if (!norm(el.textContent)) return;
      var rec = htmlKey(el);
      if (collect) { collect.html[rec.key] = 1; return; }
      if (!split && translate(rec.key) === null && lang !== 'pt') return;
      if (!split && lang === 'pt') return;
      htmlOrig.set(el, rec);
      htmlEls.push(el);
      el.setAttribute('data-i18nh', '');
      writeHtml(el, rec, false);
    });
  }

  function applyText(node) {
    var parent = node.parentNode;
    if (!parent || parent.nodeType !== 1) return;
    if (parent.closest(SKIP) || parent.closest('[data-i18nh]')) return;
    var cur = node.nodeValue;
    var t = cur.trim();
    if (!t) return;
    var o = textOrig.get(node);
    var w = textLast.get(node);
    if (o === undefined || (t !== w && t !== o)) { o = t; textOrig.set(node, o); }
    var out = lang === 'pt' ? o : translate(o);
    if (out === null) out = o;
    if (out !== t) node.nodeValue = cur.replace(t, function () { return out; });
    textLast.set(node, out);
  }

  function applyAttrs(el) {
    if (el.closest && el.closest(SKIP)) return;
    ATTRS.forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      var rec = attrOrig.get(el);
      if (!rec) { rec = {}; attrOrig.set(el, rec); }
      var cur = el.getAttribute(name);
      var slot = rec[name];
      if (!slot || (cur !== slot.last && cur !== slot.orig)) slot = rec[name] = { orig: cur, last: cur };
      var out = lang === 'pt' ? slot.orig : translate(slot.orig);
      if (out === null) out = slot.orig;
      if (out !== cur) el.setAttribute(name, out);
      slot.last = out;
    });
  }

  function walkText(root, fn) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var list = [];
    var n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(fn);
  }

  function process(root) {
    if (root.nodeType === 3) { applyText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest('[data-i18nh]') && !root.hasAttribute('data-i18nh')) return;
    scanHtml(root);
    walkText(root, applyText);
    applyAttrs(root);
    root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(applyAttrs);
  }

  function applyMeta() {
    var d = document.querySelector('meta[name="description"]');
    if (d) {
      if (!d.__o) d.__o = d.getAttribute('content');
      var out = translate(d.__o);
      d.setAttribute('content', out === null ? d.__o : out);
    }
    if (!document.__t) document.__t = document.title;
    var tt = translate(document.__t);
    document.title = tt === null ? document.__t : tt;
    document.documentElement.lang = ATTR[lang];
  }

  var observer = new MutationObserver(function (records) {
    if (lang === 'pt') return;
    records.forEach(function (r) {
      if (r.type === 'characterData') applyText(r.target);
      else r.addedNodes.forEach(function (n) { if (n.nodeType === 1 || n.nodeType === 3) process(n); });
    });
  });

  function setLang(next, user) {
    if (LANGS.indexOf(next) < 0) next = 'pt';
    lang = next;
    htmlEls = htmlEls.filter(function (el) { return el.isConnected; });
    htmlEls.forEach(function (el) { writeHtml(el, htmlOrig.get(el), user); });
    process(document.body);
    applyMeta();
    var cur = document.getElementById('lang-cur');
    if (cur) cur.textContent = next.toUpperCase();
    document.querySelectorAll('#lang-menu [data-lang]').forEach(function (o) { o.setAttribute('aria-selected', String(o.dataset.lang === next)); });
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: next }));
    if (user) saveLang(next);
  }

  function initSwitcher() {
    var box = document.getElementById('lang');
    var btn = document.getElementById('lang-btn');
    if (!box || !btn) return;
    var toggle = function (open) {
      box.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(!box.classList.contains('open')); });
    document.querySelectorAll('#lang-menu [data-lang]').forEach(function (o) {
      o.addEventListener('click', function () { setLang(o.dataset.lang, true); toggle(false); });
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  window.__i18nCollect = function () {
    var out = { text: {}, html: {} };
    scanHtml(document.body, out);
    document.querySelectorAll('[data-split]').forEach(function (el) { out.html[htmlKey(el).key] = 1; });
    walkText(document.body, function (n) {
      var p = n.parentNode;
      if (!p || p.nodeType !== 1 || p.closest(SKIP) || p.closest('[data-i18nh]')) return;
      var t = n.nodeValue.trim();
      if (t) out.text[t] = 1;
    });
    document.querySelectorAll('[aria-label],[placeholder],[title]').forEach(function (el) {
      ATTRS.forEach(function (nm) { if (el.hasAttribute(nm) && !el.closest(SKIP)) out.text[el.getAttribute(nm)] = 1; });
    });
    var d = document.querySelector('meta[name="description"]');
    if (d) out.text[d.getAttribute('content')] = 1;
    out.text[document.title] = 1;
    return { text: Object.keys(out.text), html: Object.keys(out.html) };
  };

  document.querySelectorAll('[data-split]').forEach(registerHtml);
  initSwitcher();
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  var start = detect();
  if (start !== 'pt') setLang(start, false);
  else document.documentElement.lang = ATTR.pt;
})();
