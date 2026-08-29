(function() {

  function initTabs() {
    document.querySelectorAll('.js-tab-group').forEach(function(group) {
      var btns   = group.querySelectorAll('.js-tab-btn');
      var panels = group.querySelectorAll('.js-tab-panel');
      btns.forEach(function(btn, i) {
        btn.addEventListener('click', function() {
          btns.forEach(function(b)   { b.classList.remove('js-tab-active'); });
          panels.forEach(function(p) { p.classList.remove('js-tab-panel-active'); });
          btn.classList.add('js-tab-active');
          if (panels[i]) panels[i].classList.add('js-tab-panel-active');
        });
      });
    });
  }

  function initPageNav() {
    document.querySelectorAll('.js-page-nav-link').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var href = a.getAttribute('href');
        if (!href || href[0] !== '#') return;
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initBarCharts() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.js-bar-fill').forEach(function(fill) {
          var w = fill.style.width;
          fill.style.width = '0';
          setTimeout(function() { fill.style.transition = 'width 0.6s ease'; fill.style.width = w; }, 50);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.js-bar-chart').forEach(function(c) { observer.observe(c); });
  }

  /* ── Color hex → CSS filter string ────────────────────────────────────
     Converts a 6-char hex color (no #) to a CSS filter chain that tints
     a neutral icon image to approximately that color.
     Strategy: invert(1) makes it black→white, then sepia+hue+sat+brightness.
     Pre-computed exact values for the 8 editor presets; generic fallback
     for any other hex value using HSL decomposition.
  ──────────────────────────────────────────────────────────────────────── */
  var COLOR_FILTERS = {
    'f0c060': 'brightness(0) sepia(1) saturate(4) hue-rotate(10deg) brightness(1.4)',
    'e05050': 'brightness(0) sepia(1) saturate(5) hue-rotate(310deg) brightness(1.3)',
    '60c060': 'brightness(0) sepia(1) saturate(3) hue-rotate(80deg) brightness(1.2)',
    '60c8f0': 'brightness(0) sepia(1) saturate(4) hue-rotate(165deg) brightness(1.4)',
    'a080e0': 'brightness(0) sepia(1) saturate(4) hue-rotate(220deg) brightness(1.3)',
    'f09040': 'brightness(0) sepia(1) saturate(5) hue-rotate(340deg) brightness(1.3)',
    'ffffff': 'brightness(0) invert(1) brightness(1.5)',
  };

  function hexToFilter(hex) {
    hex = hex.toLowerCase().replace(/^#/, '');
    if (COLOR_FILTERS[hex]) return COLOR_FILTERS[hex];
    /* Generic fallback via HSL decomposition */
    var r = parseInt(hex.slice(0,2),16)/255;
    var g = parseInt(hex.slice(2,4),16)/255;
    var b = parseInt(hex.slice(4,6),16)/255;
    var mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    var l = (mx+mn)/2;
    var s = mx===mn ? 0 : (l>0.5 ? (mx-mn)/(2-mx-mn) : (mx-mn)/(mx+mn));
    var h = 0;
    if (mx!==mn) {
      if (mx===r) h = ((g-b)/(mx-mn) + (g<b?6:0)) * 60;
      else if (mx===g) h = ((b-r)/(mx-mn) + 2) * 60;
      else h = ((r-g)/(mx-mn) + 4) * 60;
    }
    var sat = Math.round(s * 5);
    var bri = (0.3 + l * 1.2).toFixed(1);
    return 'brightness(0) sepia(1) saturate('+sat+') hue-rotate('+Math.round(h-30)+'deg) brightness('+bri+')';
  }

  function initInlineIcons() {
    var BASE = '/wiki/lib/tpl/bootstrap3/images/icons/';
    var STAT = BASE + 'Stats/';
    var ICON_URLS = {
      souls: BASE+'Souls.png', spirit: BASE+'Spirit.png',
      ammo: STAT+'ammo.png', bullet_dmg: STAT+'Bullet_damage.png',
      bullet_vel: STAT+'AttributeIconBulletSpeed.png',
      dps: STAT+'Bullets_per_sec_icon.png', fire_rate: STAT+'Bullets_per_sec_icon.png',
      melee_dmg: STAT+'Melee_damage.png', reload: STAT+'AttributeIconReloadTime.png',
      weapon_dmg: STAT+'Bullet_damage.png', bullet_armor: STAT+'Bullet_Armor.png',
      barrier: STAT+'Barrier.png', debuff_res: STAT+'Debuff_resist.png',
      bullet_evasion: STAT+'Bullet_Evasion.png', health: STAT+'Health.png',
      health_regen: STAT+'Health_regen.png', lifesteal: STAT+'Health_regen.png',
      move_speed: STAT+'Move_speed.png', stamina: STAT+'Stamina.png',
      cooldown: STAT+'Cooldown_Icon.png', ability_dur: STAT+'AttributeIconTechDuration.png',
      ability_range: STAT+'AttributeIconTechRange.png',
      charges: STAT+'AttributeIconMaxChargesIncrease.png',
      spirit_power: STAT+'Spirit_icon.png', spirit_dmg: STAT+'Damage_heart.png',
      damage: STAT+'Damage.png', spirit_scale: STAT+'Boon_scaling.png',
      buildup: STAT+'Fixation.png', chargeup: STAT+'Chargeup.png',
      ap: STAT+'Ability_point.png', duration: STAT+'AttributeIconTechDuration.png',
      displacement: STAT+'Move_speed.png',
    };

    function makeIconImg(key, url, color) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.style.cssText = 'display:inline;width:18px;height:18px;vertical-align:middle;margin:0 2px;object-fit:contain;';
      if (color) {
        img.style.filter = hexToFilter(color);
      }
      return img;
    }

    /* Token format: {{icon:key}} or {{icon:key:rrggbb}} */
    var content = document.querySelector('.dw-content');
    if (!content) return;

    var TOKEN_RE = /\{\{icon:([a-z_]+)(?::([0-9a-fA-F]{6}))?\}\}/g;

    function walkTextNodes(node) {
      if (node.nodeType === 3) {
        var text = node.nodeValue;
        if (text.indexOf('{{icon:') === -1) return;
        /* Reset regex state before exec loop */
        TOKEN_RE.lastIndex = 0;
        var parts = [];
        var last = 0, m;
        while ((m = TOKEN_RE.exec(text)) !== null) {
          if (m.index > last) parts.push({ t: text.slice(last, m.index) });
          parts.push({ key: m[1], color: m[2] || null });
          last = m.index + m[0].length;
        }
        if (!parts.length) return;
        if (last < text.length) parts.push({ t: text.slice(last) });
        var frag = document.createDocumentFragment();
        parts.forEach(function(p) {
          if (p.t !== undefined) {
            if (p.t) frag.appendChild(document.createTextNode(p.t));
          } else {
            var url = ICON_URLS[p.key];
            if (url) {
              frag.appendChild(makeIconImg(p.key, url, p.color));
            } else {
              frag.appendChild(document.createTextNode('{{icon:' + p.key + (p.color ? ':'+p.color : '') + '}}'));
            }
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        var children = Array.prototype.slice.call(node.childNodes);
        children.forEach(walkTextNodes);
      }
    }

    walkTextNodes(content);
  }

  function initCardIcons() {
    document.querySelectorAll('[data-src]').forEach(function(el) {
      var src = el.getAttribute('data-src');
      if (src) {
        el.style.backgroundImage = "url('" + src.replace(/'/g, '%27') + "')";
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTabs(); initPageNav(); initBarCharts(); initCardIcons(); initInlineIcons();
    });
  } else {
    initTabs(); initPageNav(); initBarCharts(); initCardIcons(); initInlineIcons();
  }
})();