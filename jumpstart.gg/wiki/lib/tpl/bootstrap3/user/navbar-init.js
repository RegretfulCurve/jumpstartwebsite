/* navbar-init.js */
(function() {
  /* ── Scroll detection ── */
  function updateNavbar() {
    document.body.classList.toggle('navbar-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ── Nav links ── */
  var navLinks = [
    { label: 'Guides',          href: '/wiki/doku.php?id=guides:start',       id: 'guides' },
    { label: 'Characters',      href: '/wiki/doku.php?id=characters:start',    id: 'characters' },
    { label: 'Universal Tech',  href: '/wiki/doku.php?id=universaltech:start', id: 'universaltech' },
    { label: 'MOG × JumpStart', href: '/wiki/doku.php?id=mog:start',           id: 'mog' }
  ];
  var currentPage = document.body.getAttribute('data-page-id') || '';

  function buildLinks() {
    document.querySelectorAll('.js-nav-link').forEach(function(el) { el.remove(); });
    var collapse = document.querySelector('#dw__navbar .navbar-collapse, #dw__navbar .collapse');
    if (!collapse) { setTimeout(buildLinks, 300); return; }
    var ul = document.createElement('ul');
    ul.className = 'nav navbar-nav js-nav-links';
    navLinks.forEach(function(link) {
      var li = document.createElement('li');
      li.className = 'js-nav-link';
      if (currentPage.indexOf(link.id + ':') === 0) li.classList.add('active');
      var a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
    collapse.insertBefore(ul, collapse.firstChild);
  }
  if (document.readyState !== 'loading') buildLinks();
  else document.addEventListener('DOMContentLoaded', buildLinks);

  /* ── Prevent navbar dropdown links from closing before click fires ── */
  document.addEventListener('DOMContentLoaded', function() {
    function fixDropdownMenus() {
      ['#dw__user_menu .dropdown-menu', '#dw__tools .dropdown-menu'].forEach(function(sel) {
        var menu = document.querySelector(sel);
        if (!menu || menu._jsFixed) return;
        menu._jsFixed = true;
        /* Stop mousedown bubbling so Bootstrap's document handler doesn't close the menu */
        menu.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        menu.addEventListener('click', function(e) { e.stopPropagation(); });
      });
    }
    fixDropdownMenus();
    setTimeout(fixDropdownMenus, 800);

    var navbar = document.getElementById('dw__navbar');
    if (navbar) {
      new MutationObserver(fixDropdownMenus).observe(navbar, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
    }
  });
  document.addEventListener('DOMContentLoaded', function() {
    var username = document.body.getAttribute('data-user') || '';
    if (!username) return;

    document.querySelectorAll('a.menuitem.profile').forEach(function(link) {
      link.href = '/wiki/doku.php?id=user:' + username;
    });

    var avatarUrl = '/wiki/lib/exe/fetch.php?media=user:' + encodeURIComponent(username) + '.png&' + Date.now();
    var test = new Image();
    test.onload = function() {
      var navImg = document.querySelector('#dw__user_menu img.img-circle');
      if (navImg) {
        navImg.src = avatarUrl;
        navImg.style.objectFit = 'cover';
        navImg.style.objectPosition = 'top center';
      }
    };
    test.src = avatarUrl;
  });

  /* ── Rich Search Dropdown ── */
  document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.querySelector('#dw__search input[type="text"], #dw__search input[name="q"], .navbar-form input[type="text"]');
    if (!searchInput) return;

    /* Inject styles */
    var style = document.createElement('style');
    style.textContent =
      /* Kill DokuWiki's own quicksearch dropdown entirely */
      '.search_quickresult,ul.search_quickresult,.autocomplete,' +
      '#dw__search .autocomplete_here,#dw__search ul,' +
      '.dokuwiki .search_quickresult{display:none!important;visibility:hidden!important;' +
      'opacity:0!important;pointer-events:none!important;height:0!important;overflow:hidden!important;}' +
      '#js-search-drop{' +
        'position:fixed;' +
        'background:rgba(20,12,40,0.99);' +
        'border:1px solid rgba(107,79,187,0.4);' +
        'border-radius:8px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.7);' +
        'z-index:99999;overflow:hidden;' +
        'min-width:460px;max-height:72vh;overflow-y:auto;' +
        'scrollbar-width:thin;scrollbar-color:rgba(107,79,187,0.3) transparent;' +
      '}' +
      '#js-search-drop::-webkit-scrollbar{width:4px;}' +
      '#js-search-drop::-webkit-scrollbar-thumb{background:rgba(107,79,187,0.3);border-radius:2px;}' +
      '.jsd-heading{' +
        'font-size:0.85rem;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;' +
        'color:rgba(107,79,187,0.75);padding:12px 16px 6px;' +
        'border-top:1px solid rgba(107,79,187,0.12);' +
      '}' +
      '.jsd-section:first-child .jsd-heading{border-top:none;}' +
      '.jsd-item{' +
        'display:flex;align-items:center;gap:14px;padding:13px 18px;' +
        'text-decoration:none;transition:background 0.12s ease;cursor:pointer;' +
        'outline:none;' +
      '}' +
      '.jsd-item:hover,.jsd-item:focus{background:rgba(107,79,187,0.18);}' +
      '.jsd-thumb{' +
        'width:54px;height:54px;flex-shrink:0;border-radius:3px;overflow:hidden;' +
        'background:rgba(10,7,22,0.8);border:1px solid rgba(107,79,187,0.25);' +
        'display:flex;align-items:center;justify-content:center;' +
      '}' +
      '.jsd-thumb img{width:100%;height:100%;object-fit:cover;object-position:center 20%;}' +
      '.jsd-thumb.round{border-radius:50%;}' +
      '.jsd-thumb svg{width:20px;height:20px;stroke:rgba(107,79,187,0.5);fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5;}' +
      '.jsd-text{flex:1;min-width:0;}' +
      '.jsd-name{font-size:1.2rem;font-weight:600;color:#EDE8F5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:"Radiance",sans-serif;}' +
      '.jsd-sub{font-size:1rem;color:rgba(184,173,219,0.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px;letter-spacing:0.04em;}' +
      '.jsd-badge{font-size:0.8rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:2px;flex-shrink:0;}' +
      '.jsd-badge-character{background:rgba(107,79,187,0.25);color:#B8ADDB;border:1px solid rgba(107,79,187,0.4);}' +
      '.jsd-badge-user{background:rgba(61,43,122,0.3);color:rgba(184,173,219,0.8);border:1px solid rgba(61,43,122,0.5);}' +
      '.jsd-badge-guide{background:rgba(42,107,42,0.25);color:rgba(130,200,130,0.9);border:1px solid rgba(42,107,42,0.4);}' +
      '.jsd-badge-page{background:rgba(30,30,60,0.4);color:rgba(184,173,219,0.45);border:1px solid rgba(107,79,187,0.15);}' +
      '.jsd-empty{padding:28px 16px;text-align:center;color:rgba(184,173,219,0.35);font-size:1.1rem;letter-spacing:0.06em;}' +
      '.jsd-footer{padding:13px 16px;border-top:1px solid rgba(107,79,187,0.12);font-size:1rem;color:rgba(107,79,187,0.6);text-align:center;cursor:pointer;transition:color 0.12s ease;}' +
      '.jsd-footer:hover{color:#B8ADDB;}';
    document.head.appendChild(style);

    /* Character slug helpers */
    var CHAR_SLUGS = ['abrams','apollo','bebop','billy','calico','celeste','the_doorman','drifter',
      'dynamo','graves','grey_talon','haze','holliday','infernus','ivy','kelvin','lady_geist',
      'lash','mcginnis','mina','mirage','mo_krill','paige','paradox','pocket','rem','seven',
      'shiv','silver','sinclair','venator','victor','vindicta','viscous','vyper','warden','wraith','yamato'];

    function toFilename(slug) {
      var special = {mo_krill:'Mo_&_Krill',the_doorman:'The_Doorman',
        grey_talon:'Grey_Talon',lady_geist:'Lady_Geist',mcginnis:'McGinnis'};
      if (special[slug]) return special[slug];
      return slug.split('_').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join('_');
    }

    function cardUrl(slug) {
      return '/wiki/lib/tpl/bootstrap3/images/heroes/cards/' + toFilename(slug) + '_card.png';
    }

    function categorize(id) {
      if (id.indexOf('user:') === 0)       return 'user';
      if (id.indexOf('characters:') === 0) return 'character';
      if (id.indexOf('guides:') === 0)     return 'guide';
      return 'page';
    }

    function labelFromId(id) {
      var parts = id.split(':');
      var last = parts[parts.length - 1];
      return last.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
    }

    /* Build dropdown */
    var drop = document.createElement('div');
    drop.id = 'js-search-drop';
    drop.style.display = 'none';

    var formWrap = searchInput.closest('form') || searchInput.parentElement;

    /* Attach drop to body so it isn't clipped by the narrow form */
    drop.style.position = 'fixed';
    document.body.appendChild(drop);

    function positionDrop() {
      var rect = formWrap.getBoundingClientRect();
      drop.style.top  = (rect.bottom + 6) + 'px';
      drop.style.left = rect.left + 'px';
      drop.style.width = Math.max(rect.width, 460) + 'px';
      drop.style.right = 'auto';
    }

    /* Clone input to strip any DokuWiki-attached event listeners */
    var fresh = searchInput.cloneNode(true);
    fresh.setAttribute('autocomplete', 'off');
    fresh.removeAttribute('data-autocomplete');
    searchInput.parentNode.replaceChild(fresh, searchInput);
    searchInput = fresh;

    /* MutationObserver — nuke any DokuWiki autocomplete list as soon as it appears */
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (node.id === 'js-search-drop') return; /* don't remove our own */
          var tag = node.tagName && node.tagName.toLowerCase();
          var cls = node.className || '';
          if (tag === 'ul' || cls.indexOf('autocomplete') !== -1 || cls.indexOf('search_quick') !== -1) {
            node.style.cssText = 'display:none!important;';
            if (node.parentNode) node.parentNode.removeChild(node);
          }
        });
      });
    });
    observer.observe(formWrap, {childList: true, subtree: true});

    var debounceTimer = null;
    var lastQuery = '';

    function showDrop() { positionDrop(); drop.style.display = 'block'; }
    function hideDrop() { drop.style.display = 'none'; }

    function svgThumb(path) {
      return '<svg viewBox="0 0 24 24">' + path + '</svg>';
    }

    function renderResults(query, items) {
      drop.innerHTML = '';
      if (!items.length) {
        drop.innerHTML = '<div class="jsd-empty">No results for &ldquo;' + esc(query) + '&rdquo;</div>';
        showDrop(); return;
      }

      var groups = {character:[], user:[], guide:[], page:[]};
      items.forEach(function(item){ groups[item.cat].push(item); });

      var order = [
        {key:'character', label:'Characters'},
        {key:'user',      label:'Users'},
        {key:'guide',     label:'Guides'},
        {key:'page',      label:'Pages'}
      ];

      order.forEach(function(g) {
        var list = groups[g.key];
        if (!list.length) return;

        var sec = document.createElement('div');
        sec.className = 'jsd-section';

        var heading = document.createElement('div');
        heading.className = 'jsd-heading';
        heading.textContent = g.label;
        sec.appendChild(heading);

        list.forEach(function(item) {
          var a = document.createElement('a');
          a.className = 'jsd-item';
          a.href = '/wiki/doku.php?id=' + encodeURIComponent(item.id);
          a.tabIndex = 0;
          /* Prevent mousedown from blurring the input (which would close the drop before click fires) */
          a.addEventListener('mousedown', function(e){ e.preventDefault(); });

          /* Thumbnail */
          var thumb = document.createElement('div');
          thumb.className = 'jsd-thumb' + (item.cat === 'user' ? ' round' : '');

          if (item.cat === 'character') {
            var slug = item.id.replace('characters:', '');
            var ci = document.createElement('img');
            ci.src = cardUrl(slug);
            ci.onerror = function(){
              thumb.innerHTML = svgThumb('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>');
            };
            thumb.appendChild(ci);
          } else if (item.cat === 'user') {
            var ui = document.createElement('img');
            ui.src = item.avatar || ('/wiki/lib/exe/fetch.php?media=user:' + encodeURIComponent(item.id.replace('user:','')) + '.png');
            ui.onerror = function(){
              thumb.innerHTML = svgThumb('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>');
            };
            thumb.appendChild(ui);
          } else if (item.cat === 'guide') {
            thumb.innerHTML = svgThumb('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>');
          } else {
            thumb.innerHTML = svgThumb('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>');
          }

          /* Text */
          var text = document.createElement('div');
          text.className = 'jsd-text';
          var name = document.createElement('div');
          name.className = 'jsd-name';
          name.textContent = item.label;
          var sub = document.createElement('div');
          sub.className = 'jsd-sub';
          sub.textContent = item.sublabel || item.id;
          text.appendChild(name); text.appendChild(sub);

          /* Badge */
          var badge = document.createElement('span');
          badge.className = 'jsd-badge jsd-badge-' + item.cat;
          var badgeLabels = {character:'Character',user:'User',guide:'Guide',page:'Page'};
          badge.textContent = badgeLabels[item.cat];

          a.appendChild(thumb); a.appendChild(text); a.appendChild(badge);
          sec.appendChild(a);
        });

        drop.appendChild(sec);
      });

      /* Full search footer */
      var footer = document.createElement('div');
      footer.className = 'jsd-footer';
      footer.textContent = 'See all results for \u201c' + query + '\u201d \u2192';
      footer.addEventListener('mousedown', function(e) {
        e.preventDefault();
        window.location.href = '/wiki/doku.php?do=search&q=' + encodeURIComponent(query);
      });
      drop.appendChild(footer);
      showDrop();
    }

    function parseQsearch(html, qLower, skipUsers) {
      var parser = new DOMParser();
      var doc = parser.parseFromString('<ul>' + html + '</ul>', 'text/html');
      var SYSTEM_IDS = ['start','recent_changes','media_manager','sitemap',
        'show_pagesource','old_revisions','backlinks','register','login',
        'dokuwiki','wiki:welcome','wiki:syntax','wiki:dokuwiki'];
      var SYSTEM_PREFIXES = ['wiki:','playground:','dokuwiki:'];
      var items = [];
      doc.querySelectorAll('a').forEach(function(a) {
        var href = a.getAttribute('href') || '';
        var m = href.match(/[?&]id=([^&#]+)/);
        if (!m) return;
        var id = decodeURIComponent(m[1]);
        var label = a.textContent.trim() || labelFromId(id);
        if (SYSTEM_IDS.indexOf(id) !== -1) return;
        if (SYSTEM_PREFIXES.some(function(p){ return id.indexOf(p)===0; })) return;
        if (skipUsers && id.indexOf('user:') === 0) return;
        if (id.toLowerCase().indexOf(qLower) === -1 && label.toLowerCase().indexOf(qLower) === -1) return;
        items.push({ id: id, label: label, cat: categorize(id) });
      });
      return items;
    }

    function doSearch(query) {
      if (query === lastQuery) return;
      lastQuery = query;
      if (query.length < 2) { hideDrop(); return; }
      var qLower = query.toLowerCase();

      var contentP = fetch('/wiki/doku.php?do=ajax&call=qsearch&q=' + encodeURIComponent(query))
        .then(function(r){ return r.text(); })
        .then(function(html){ return parseQsearch(html, qLower, true); })
        .catch(function(){ return []; });

      var userP = fetch('/wiki/doku.php?do=searchusers&q=' + encodeURIComponent(query))
        .then(function(r){ return r.json(); })
        .then(function(users) {
          return users.map(function(u) {
            return {
              id:          'user:' + u.username,
              label:       u.displayName,
              sublabel:    '@' + u.username,
              avatar:      u.avatar,
              cat:         'user'
            };
          });
        })
        .catch(function(){ return []; });

      Promise.all([contentP, userP]).then(function(res) {
        if (lastQuery !== query) return;
        renderResults(query, res[0].concat(res[1]));
      });
    }

    searchInput.addEventListener('input', function() {
      var q = this.value.trim();
      clearTimeout(debounceTimer);
      if (q.length < 2) { hideDrop(); lastQuery = ''; return; }
      debounceTimer = setTimeout(function(){ doSearch(q); }, 200);
    });

    searchInput.addEventListener('focus', function() {
      if (this.value.trim().length >= 2 && drop.innerHTML) showDrop();
    });

    document.addEventListener('mousedown', function(e) {
      if (!formWrap.contains(e.target) && !drop.contains(e.target)) hideDrop();
    });

    /* Keyboard navigation */
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { hideDrop(); return; }
      var items = drop.querySelectorAll('.jsd-item');
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var focused = drop.querySelector('.jsd-item:focus');
        var idx = -1;
        items.forEach(function(el,i){ if(el===focused) idx=i; });
        idx = e.key === 'ArrowDown' ? Math.min(idx+1, items.length-1) : Math.max(idx-1, 0);
        items[idx].focus();
      }
      if (e.key === 'Enter') {
        var foc = drop.querySelector('.jsd-item:focus');
        if (foc) { e.preventDefault(); foc.click(); }
      }
    });

    function esc(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  });
})();