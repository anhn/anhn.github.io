// Lab now: fills the live parts of the home page from data/lab.json.
// Oversikt (Anh's work system) rewrites that file when papers are accepted, projects start or roles change.
// The page already holds a copy of the same content, so it reads fine without JavaScript or if the fetch fails.
(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function month(d) {
    if (!d) return '';
    var p = String(d).split('-');
    return p.length > 1 ? MONTHS[+p[1] - 1] + ' ' + p[0] : p[0];
  }
  function day(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function kindClass(k) {
    k = (k || '').toLowerCase();
    if (k.indexOf('paper') > -1 || k.indexOf('publish') > -1) return 'k-paper';
    if (k.indexOf('project') > -1) return 'k-project';
    return 'k-other';
  }
  function fill(id, nodes) {
    var box = document.getElementById(id);
    if (!box || !nodes || !nodes.length) return;
    box.textContent = '';
    nodes.forEach(function (n) { box.appendChild(n); });
  }

  function render(lab) {
    var upd = document.getElementById('lab-updated');
    if (upd && lab.updated) upd.textContent = 'Updated ' + day(lab.updated);

    fill('lab-feed', (lab.feed || []).map(function (e) {
      var li = el('li');
      li.appendChild(el('span', 'd', month(e.date)));
      var k = el('span', 'k');
      k.appendChild(el('span', 'chip ' + kindClass(e.kind), e.kind));
      li.appendChild(k);
      var t = el('span');
      t.appendChild(el('b', null, e.title));
      if (e.detail) { t.appendChild(el('br')); t.appendChild(el('span', 's', e.detail)); }
      li.appendChild(t);
      return li;
    }));

    fill('lab-stats', (lab.stats || []).map(function (s) {
      var row = el('div', 'stat');
      row.appendChild(el('span', null, s.label));
      row.appendChild(el('b', null, String(s.value)));
      return row;
    }));

    fill('lab-topics', (lab.working_on || []).map(function (w) { return el('span', 'chip k-project', w); }));

    fill('practice-rows', (lab.projects || []).slice(0, 4).map(function (p) {
      var a = el('article', 'row');
      var yr = el('div', 'yr', p.years || '');
      yr.appendChild(el('span', 'chip', p.active ? 'Active' : 'Completed'));
      a.appendChild(yr);
      var mid = el('div');
      mid.appendChild(el('h3', null, p.title));
      if (p.blurb) mid.appendChild(el('p', null, p.blurb));
      a.appendChild(mid);
      var meta = el('div', 'meta');
      if (p.role) meta.appendChild(el('span', null, 'Role: ' + p.role));
      if (p.funder) meta.appendChild(el('span', null, p.funder));
      a.appendChild(meta);
      return a;
    }));

    fill('recent-papers', (lab.papers || []).slice(0, 5).map(function (p) {
      var li = el('li');
      var t = p.url ? el('a', null, p.title) : el('span', null, p.title);
      if (p.url) t.href = p.url;
      li.appendChild(t);
      li.appendChild(el('span', 'v', [p.venue, (p.status === 'accepted' ? 'accepted ' : '') + month(p.date)].filter(Boolean).join(' · ')));
      return li;
    }));

    fill('service-list', (lab.service || []).map(function (s) {
      var li = el('li');
      li.appendChild(el('span', null, s.label));
      if (s.years) li.appendChild(el('span', 'v', s.years));
      return li;
    }));
  }

  if (!document.getElementById('lab')) return;
  fetch('data/lab.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (lab) { if (lab) render(lab); })
    .catch(function () { /* keep the copy already in the page */ });
})();
