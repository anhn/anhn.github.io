// Anh Nguyen-Duc · small site behaviours (copy email, list filters, photo lightbox)
(function () {
  // Copy email
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-copy'));
      var text = el.textContent.trim();
      var label = btn.textContent;
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = label; }, 1600); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        done('Selected, press Ctrl+C');
      }
      try { navigator.clipboard.writeText(text).then(function () { done('Copied'); }, fallback); }
      catch (e) { fallback(); }
    });
  });

  // Filterable lists: <div class="filters" data-target="#id"> with buttons[data-filter] and input[type=search]
  document.querySelectorAll('.filters[data-target]').forEach(function (bar) {
    var root = document.querySelector(bar.getAttribute('data-target'));
    if (!root) return;
    var items = root.querySelectorAll('[data-type]');
    var groups = root.querySelectorAll('[data-group]');
    var input = bar.querySelector('input');
    var count = bar.querySelector('.count');
    var active = 'all';
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (li) {
        var typeOk = active === 'all' || li.getAttribute('data-type') === active || li.getAttribute('data-year') === active;
        var textOk = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        li.hidden = !(typeOk && textOk);
        if (!li.hidden) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('[data-type]:not([hidden])'); });
      if (count) count.textContent = shown + ' shown';
    }
    bar.querySelectorAll('button[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        active = b.getAttribute('data-filter');
        bar.querySelectorAll('button[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    apply();
  });

  // Lightbox
  var photos = Array.prototype.slice.call(document.querySelectorAll('.ph button[data-full]'));
  if (photos.length) {
    var box = document.createElement('div');
    box.className = 'lightbox'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="ctl close" type="button">Close ✕</button>' +
      '<button class="ctl prev" type="button">◀ Previous</button>' +
      '<button class="ctl next" type="button">Next ▶</button>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), idx = 0, opener = null;
    function show(i) {
      var vis = photos.filter(function (p) { return !p.closest('[hidden]'); });
      if (!vis.length) return;
      idx = (i + vis.length) % vis.length;
      var b = vis[idx];
      img.src = b.getAttribute('data-full'); img.alt = b.querySelector('img').alt;
      cap.textContent = b.getAttribute('data-caption') || '';
    }
    function open(b) {
      opener = b;
      var vis = photos.filter(function (p) { return !p.closest('[hidden]'); });
      box.hidden = false; show(vis.indexOf(b));
      box.querySelector('.close').focus();
    }
    function close() { box.hidden = true; if (opener) opener.focus(); }
    photos.forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    box.querySelector('.close').addEventListener('click', close);
    box.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }
})();
