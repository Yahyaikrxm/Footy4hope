(function () {
  function getPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function setText(el, text) {
    if (text == null) return;
    el.textContent = text;
  }

  function setHtml(el, html) {
    if (html == null) return;
    el.innerHTML = html;
  }

  function applyListItemReveal(li, ul, index) {
    var liClass = ul.getAttribute('data-li-class');
    if (liClass) {
      li.className = liClass;
    }
    var delayStart = parseInt(ul.getAttribute('data-reveal-delay-start') || '300', 10);
    var delayStep = parseInt(ul.getAttribute('data-reveal-delay-step') || '20', 10);
    if (liClass && liClass.indexOf('mask-reveal') !== -1) {
      li.style.setProperty('--reveal-bg', ul.getAttribute('data-reveal-bg') || 'var(--pure-white)');
      li.style.setProperty('--reveal-delay', delayStart + index * delayStep + 'ms');
    }
  }

  function fillEmphasisList(ul, items) {
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = '';
    items.forEach(function (item, index) {
      var li = document.createElement('li');
      if (typeof item === 'string') {
        li.textContent = item;
      } else if (item && item.lead != null) {
        var strong = document.createElement('strong');
        strong.textContent = item.lead;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(item.text || ''));
      }
      applyListItemReveal(li, ul, index);
      ul.appendChild(li);
    });
  }

  function fillPlainList(ul, items) {
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = '';
    items.forEach(function (text, index) {
      var li = document.createElement('li');
      li.textContent = text;
      applyListItemReveal(li, ul, index);
      ul.appendChild(li);
    });
  }

  function fillTeamList(ul, items) {
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = '';
    items.forEach(function (member, index) {
      if (!member) return;
      var li = document.createElement('li');
      li.className = 'mission-item mask-reveal';
      li.style.setProperty('--reveal-bg', 'var(--pure-white)');
      li.style.setProperty('--reveal-delay', 300 + index * 20 + 'ms');
      if (index === items.length - 1) {
        li.style.setProperty('--reveal-delay', '500ms');
      }
      var strong = document.createElement('strong');
      strong.textContent = member.name || '';
      var span = document.createElement('span');
      span.className = 'mission-role';
      span.textContent = member.role || '';
      li.appendChild(strong);
      li.appendChild(span);
      ul.appendChild(li);
    });
  }

  window.applySiteContent = function (data) {
    if (!data) return;

    if (data.meta && data.meta.title) {
      document.title = data.meta.title;
    }

    document.querySelectorAll('[data-content]').forEach(function (el) {
      var spec = el.getAttribute('data-content');
      if (!spec) return;
      var mode = 'text';
      var path = spec;
      if (spec.indexOf(':') !== -1) {
        var idx = spec.indexOf(':');
        mode = spec.slice(0, idx);
        path = spec.slice(idx + 1);
      }
      var val = getPath(data, path);
      if (val === undefined) return;
      if (mode === 'html') setHtml(el, val);
      else setText(el, val);
    });

    document.querySelectorAll('[data-list]').forEach(function (ul) {
      var path = ul.getAttribute('data-list');
      var type = ul.getAttribute('data-list-type') || 'plain';
      var items = getPath(data, path);
      if (!items) return;
      if (type === 'emphasis') fillEmphasisList(ul, items);
      else if (type === 'team') fillTeamList(ul, items);
      else fillPlainList(ul, items);
    });

    document.querySelectorAll('[data-content-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-content-attr');
      if (!spec) return;
      var idx = spec.indexOf(':');
      if (idx === -1) return;
      var attr = spec.slice(0, idx);
      var path = spec.slice(idx + 1);
      var val = getPath(data, path);
      if (val !== undefined && val !== null) el.setAttribute(attr, val);
    });
  };

  window.loadSiteContent = function (jsonUrl) {
    return fetch(jsonUrl)
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + jsonUrl);
        return r.json();
      })
      .then(function (data) {
        window.applySiteContent(data);
        return data;
      });
  };
})();
