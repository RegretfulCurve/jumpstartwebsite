/* characters-init.js */
(function() {
  var pageId = document.body.getAttribute('data-page-id') || '';
if (pageId !== 'characters:start') return;
var isAdmin = document.body.classList.contains('mode_admin') ||
              document.body.classList.contains('mode_plugin') ||
              document.body.classList.contains('mode_profile');
if (!isAdmin) document.body.classList.add('characters');
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  /* ─────────────────────────────────────
     SHARED UTILITIES
  ───────────────────────────────────── */

  /* Bilinear quad-warp — shared by card warp + render warp */
  function drawQuadImage(ctx, img, cw, ch, tl, tr, br, bl) {
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var s00={x:0,y:0}, s10={x:iw,y:0}, s11={x:iw,y:ih}, s01={x:0,y:ih};
    drawTri(ctx, tl, tr, br, s00, s10, s11, img, iw, ih);
    drawTri(ctx, tl, br, bl, s00, s11, s01, img, iw, ih);
  }

  function drawTri(ctx, d0, d1, d2, s0, s1, s2, img, iw, ih) {
    var det = (s1.x-s0.x)*(s2.y-s0.y) - (s2.x-s0.x)*(s1.y-s0.y);
    if (Math.abs(det) < 0.01) return;
    var a = ((d1.x-d0.x)*(s2.y-s0.y) - (d2.x-d0.x)*(s1.y-s0.y)) / det;
    var b = ((d2.x-d0.x)*(s1.x-s0.x) - (d1.x-d0.x)*(s2.x-s0.x)) / det;
    var c = ((d1.y-d0.y)*(s2.y-s0.y) - (d2.y-d0.y)*(s1.y-s0.y)) / det;
    var d = ((d2.y-d0.y)*(s1.x-s0.x) - (d1.y-d0.y)*(s2.x-s0.x)) / det;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d0.x,d0.y); ctx.lineTo(d1.x,d1.y); ctx.lineTo(d2.x,d2.y);
    ctx.closePath(); ctx.clip();
    ctx.setTransform(a, c, b, d, d0.x-a*s0.x-b*s0.y, d0.y-c*s0.x-d*s0.y);
    ctx.drawImage(img, 0, 0, iw, ih);
    ctx.restore();
  }

  function rnd(range) { return (Math.random()-0.5) * 2 * range; }

  function randomCorners(w, h, pad, range) {
    return [
      {x:pad+rnd(range), y:pad+rnd(range)},
      {x:pad+w+rnd(range), y:pad+rnd(range)},
      {x:pad+w+rnd(range), y:pad+h+rnd(range)},
      {x:pad+rnd(range), y:pad+h+rnd(range)}
    ];
  }

  function randomClipCorners(range) {
    return [
      {x:rnd(range),     y:rnd(range)},
      {x:100+rnd(range), y:rnd(range)},
      {x:100+rnd(range), y:100+rnd(range)},
      {x:rnd(range),     y:100+rnd(range)}
    ];
  }

  function polyStr(cc) {
    return 'polygon('+cc[0].x.toFixed(2)+'% '+cc[0].y.toFixed(2)+'%,'+
      cc[1].x.toFixed(2)+'% '+cc[1].y.toFixed(2)+'%,'+
      cc[2].x.toFixed(2)+'% '+cc[2].y.toFixed(2)+'%,'+
      cc[3].x.toFixed(2)+'% '+cc[3].y.toFixed(2)+'%)';
  }

  var BASE = '/wiki/lib/tpl/bootstrap3/images/heroes/';

  function toFilename(slug) {
    var special = {
      mo_krill:    'Mo_&_Krill',
      the_doorman: 'The_Doorman',
      grey_talon:  'Grey_Talon',
      lady_geist:  'Lady_Geist',
      mcginnis:    'McGinnis'
    };
    if (special[slug]) return special[slug];
    return slug.split('_').map(function(w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join('_');
  }

  function cardUrl(slug)   { return BASE + 'cards/'   + toFilename(slug) + '_card.png';   }
  function renderUrl(slug) { return BASE + 'renders/' + toFilename(slug) + '_Render.png'; }
  function nameUrl(slug)   { return BASE + 'titles/'  + toFilename(slug) + '_name.png';   }

  /* ─────────────────────────────────────
     WARP ENGINE
  ───────────────────────────────────── */

  var warpTargets = [];
  function startWarp(el, range, sourceImg) {
    stopWarp(el);
    var w = el.offsetWidth || 80, h = el.offsetHeight || 100;
    var pad = range + 4;
    var cw = w + pad*2, ch = h + pad*2;
    var canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    canvas.style.cssText = 'position:absolute;top:'+-pad+'px;left:'+-pad+'px;'+
      'width:'+cw+'px;height:'+ch+'px;pointer-events:none;z-index:5;';
    el.style.position = 'relative';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    if (sourceImg) {
      var fA = randomCorners(w,h,pad,range), fB = randomCorners(w,h,pad,range);
      warpTargets.push({mode:'canvas', el:el, canvas:canvas, ctx:ctx, img:sourceImg,
        w:w, h:h, pad:pad, cw:cw, ch:ch, range:range, frameA:fA, frameB:fB, useA:true});
      if (sourceImg.complete && sourceImg.naturalWidth)
        try { drawQuadImage(ctx, sourceImg, cw, ch, fA[0], fA[1], fA[2], fA[3]); } catch(e){}
    } else {
      el.style.overflow = 'visible';
      var img = el.querySelector('img');
      if (img) img.style.opacity = '0';
      var cA = randomClipCorners(range), cB = randomClipCorners(range);
      var t = {mode:'clip', el:el, range:range, canvas:canvas, ctx:ctx, img:img,
        w:w, h:h, pad:pad, cw:cw, ch:ch, frameA:cA, frameB:cB, useA:true,
        bgColor:el.getAttribute('data-color')||'#0d0820'};
      warpTargets.push(t);
      if (img && img.complete && img.naturalWidth) drawClipFrame(t, cA);
    }
  }

  function drawClipFrame(t, cc) {
    var tl={x:cc[0].x/100*t.w+t.pad, y:cc[0].y/100*t.h+t.pad};
    var tr={x:cc[1].x/100*t.w+t.pad, y:cc[1].y/100*t.h+t.pad};
    var br={x:cc[2].x/100*t.w+t.pad, y:cc[2].y/100*t.h+t.pad};
    var bl={x:cc[3].x/100*t.w+t.pad, y:cc[3].y/100*t.h+t.pad};
    t.ctx.clearRect(0,0,t.cw,t.ch);
    t.ctx.save(); t.ctx.beginPath();
    t.ctx.moveTo(tl.x,tl.y); t.ctx.lineTo(tr.x,tr.y);
    t.ctx.lineTo(br.x,br.y); t.ctx.lineTo(bl.x,bl.y); t.ctx.closePath();
    var g = t.ctx.createLinearGradient(tl.x,tl.y,br.x,br.y);
    g.addColorStop(0, t.bgColor); g.addColorStop(1, '#0d0820');
    t.ctx.fillStyle = g; t.ctx.fill(); t.ctx.restore();
    if (t.img && t.img.complete && t.img.naturalWidth)
      try { drawQuadImage(t.ctx, t.img, t.cw, t.ch, tl, tr, br, bl); } catch(e){}
    t.el.style.clipPath = polyStr(cc);
  }

  function stopWarp(el) {
    for (var i = warpTargets.length-1; i >= 0; i--) {
      if (warpTargets[i].el !== el) continue;
      var t = warpTargets[i];
      if (t.canvas && t.canvas.parentNode) t.canvas.parentNode.removeChild(t.canvas);
      if (t.mode === 'clip') {
        el.style.clipPath = ''; el.style.overflow = '';
        var img = el.querySelector('img'); if (img) img.style.opacity = '';
      }
      warpTargets.splice(i, 1);
    }
  }

  setInterval(function() {
    for (var i = warpTargets.length-1; i >= 0; i--) {
      var t = warpTargets[i];
      if (!t.el) { warpTargets.splice(i, 1); continue; }
      if (!t.img || !t.img.complete || !t.img.naturalWidth)
        t.img = t.el.querySelector('img');
      if (!t.img || !t.img.complete || !t.img.naturalWidth) continue;

      var corners = t.useA ? t.frameA : t.frameB;
      t.useA = !t.useA;

      if (t.mode === 'canvas') {
        try { drawQuadImage(t.ctx, t.img, t.cw, t.ch, corners[0], corners[1], corners[2], corners[3]); } catch(e){}
        if (t.useA) t.frameA = randomCorners(t.w,t.h,t.pad,t.range);
        else        t.frameB = randomCorners(t.w,t.h,t.pad,t.range);
      } else {
        drawClipFrame(t, corners);
        if (t.useA) t.frameA = randomClipCorners(t.range);
        else        t.frameB = randomClipCorners(t.range);
      }
    }
  }, 1000);

  /* ─────────────────────────────────────
     RENDER ENGINE
  ───────────────────────────────────── */

  var renderImg          = null, renderElRef = null;
  var renderWarpImg      = new Image();
  var renderWarpInterval = null;
  var renderWarpUseA     = true;
  var renderWarpFrameA   = null, renderWarpFrameB = null;
  var renderTimers       = [], renderCache = {}, renderGeneration = 0;

  function newRenderCorners(cw, ch) {
    return [{x:rnd(4),y:0},{x:cw+rnd(4),y:0},{x:cw+rnd(4),y:ch},{x:rnd(4),y:ch}];
  }

  function startRenderWarp(img, canvas) {
    stopRenderWarp();
    renderWarpImg    = img;
    renderWarpUseA   = true;
    renderWarpFrameA = newRenderCorners(canvas.width, canvas.height);
    renderWarpFrameB = newRenderCorners(canvas.width, canvas.height);
    renderWarpInterval = setInterval(function() {
      var c = renderImg;
      if (!c || !renderWarpImg.complete || !renderWarpImg.naturalWidth) return;
      var cw = c.width, ch = c.height;
      if (!cw || !ch) return;
      var corners = renderWarpUseA ? renderWarpFrameA : renderWarpFrameB;
      renderWarpUseA = !renderWarpUseA;
      if (renderWarpUseA) renderWarpFrameA = newRenderCorners(cw, ch);
      else                renderWarpFrameB = newRenderCorners(cw, ch);
      try {
        var ctx = c.getContext('2d');
        drawQuadImage(ctx, renderWarpImg, cw, ch, corners[0], corners[1], corners[2], corners[3]);
        ctx.fillStyle = 'rgba(10,6,26,0.28)';
        ctx.fillRect(0, 0, cw, ch);
      } catch(e) {}
    }, 1000);
  }

  function stopRenderWarp() {
    clearInterval(renderWarpInterval);
    renderWarpInterval = null;
  }

  function clearRenderTimers() {
    renderTimers.forEach(clearTimeout); renderTimers = [];
  }

  function showRender(slug, heroColor) {
    var gen = ++renderGeneration;
    stopRenderWarp();
    clearRenderTimers();
    if (renderImg) {
      renderImg.classList.remove('active');
      if (renderImg.getContext) {
        var c0 = renderImg.getContext('2d');
        if (c0) c0.clearRect(0, 0, renderImg.width, renderImg.height);
      }
    }

    var img = renderCache[slug];
    if (!img) { img = new Image(); renderCache[slug] = img; }

    var fired = false;
    function go() {
      if (fired || gen !== renderGeneration) return;
      fired = true;
      renderTimers.push(setTimeout(function() {
        if (gen !== renderGeneration) return;
        var canvas = renderImg, el = renderElRef;
        if (canvas && el && el.offsetWidth && !canvas.width) {
          canvas.width  = el.offsetWidth;
          canvas.height = el.offsetHeight;
        }
        try {
          var cw = canvas.width, ch = canvas.height;
          if (cw && ch && img.naturalWidth) {
            var ctx1 = canvas.getContext('2d');
            ctx1.clearRect(0, 0, cw, ch);
            ctx1.drawImage(img, 0, 0, cw, ch);
            ctx1.fillStyle = 'rgba(10,6,26,0.28)';
            ctx1.fillRect(0, 0, cw, ch);
          }
        } catch(e) {}
        void canvas.offsetWidth;
        canvas.classList.add('active');
        startRenderWarp(img, canvas);
      }, 180));
    }

    if (img.complete && img.naturalWidth) go();
    else { img.onload = go; if (!img.src) img.src = renderUrl(slug); }
  }

  var HERO_COLORS = {
    abrams:      '#3d4a58',
    apollo:      '#81443d',
    bebop:       '#c4622a',
    billy:       '#614c42',
    calico:      '#483c4b',
    celeste:     '#9787be',
    the_doorman: '#794d3f',
    drifter:     '#75332f',
    dynamo:      '#c4a01a',
    graves:      '#384d2f',
    grey_talon:  '#2a6b2a',
    haze:        '#c4621a',
    holliday:    '#75553c',
    infernus:    '#8b2a2a',
    ivy:         '#6b3a8b',
    kelvin:      '#1a6b9b',
    lady_geist:  '#546857',
    lash:        '#2a6a9b',
    mcginnis:    '#6c5156',
    mina:        '#4f3651',
    mirage:      '#58324b',
    mo_krill:    '#675646',
    paige:       '#2a6b2a',
    paradox:     '#c4405a',
    pocket:      '#68593d',
    rem:         '#516b9b',
    seven:       '#6e6236',
    shiv:        '#7d4f42',
    silver:      '#cf9e84',
    sinclair:    '#575382',
    venator:     '#856070',
    victor:      '#646952',
    vindicta:    '#6773b2',
    viscous:     '#245321',
    vyper:       '#7e5810',
    warden:      '#574d54',
    wraith:      '#634352',
    yamato:      '#564658'
  };

  /* ─────────────────────────────────────
     RENDER PARTICLE BURST
  ───────────────────────────────────── */

  function spawnRenderParticles(color) { /* particles removed */ }

  /* ─────────────────────────────────────
     PARTICLE SYSTEM
  ───────────────────────────────────── */

  var diffParticleInterval = null;
  var diffParticleTimers   = [];
  var activeParticles      = [];
  var particleCanvas       = null;
  var particleCtx          = null;
  var particleRafId        = null;

  var DIFF_CONFIG = {
    novice:       {count:0,  color:'#5aafd4', speed:0},
    intermediate: {count:2,  color:'#72d472', speed:1.2},
    skilled:      {count:4,  color:'#e8924e', speed:1.8},
    expert:       {count:7,  color:'#e87070', speed:2.4},
    master:       {count:10, color:'#c080ff', speed:3.0}
  };

  function ensureParticleCanvas() {
    if (particleCanvas) return;
    particleCanvas = document.createElement('canvas');
    particleCanvas.style.cssText =
      'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;';
    particleCanvas.width  = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    document.body.appendChild(particleCanvas);
    particleCtx = particleCanvas.getContext('2d');
    window.addEventListener('resize', function() {
      particleCanvas.width  = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    });
  }

  function particleTick(now) {
    if (activeParticles.length === 0) {
      if (particleCtx) particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particleRafId = null; return;
    }
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (var i = activeParticles.length - 1; i >= 0; i--) {
      var p = activeParticles[i];
      var t = (now - p.t0) / p.life;
      if (t < 0) continue;
      if (t >= 1) { activeParticles.splice(i, 1); continue; }

      var ease;
      if (t < 0.15) {
        ease = t / 0.15;
        ease = ease * ease;
      } else if (t < 0.75) {
        ease = 1;
      } else {
        var dt = (t - 0.75) / 0.25;
        ease = 1 - (dt * dt);
      }

      var dist   = p.vy * t * ease;
      var x      = p.sx + p.vx * t;
      var y      = p.sy + dist;
      var alpha  = t < 0.7 ? 0.85 : 0.85 * (1 - (t - 0.7) / 0.3);
      particleCtx.globalAlpha = alpha;
      particleCtx.fillStyle = p.color;
      particleCtx.beginPath();
      particleCtx.arc(x, y, p.size, 0, Math.PI * 2);
      particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
    particleRafId = requestAnimationFrame(particleTick);
  }

  function kickParticleRaf() {
    if (!particleRafId) particleRafId = requestAnimationFrame(particleTick);
  }

  function clearDiffParticles() {
    clearInterval(diffParticleInterval); diffParticleInterval = null;
    diffParticleTimers.forEach(clearTimeout); diffParticleTimers = [];
    activeParticles = [];
    if (particleCtx) particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  }

  function spawnDiffParticles(el, diff) {
    clearDiffParticles();
    var cfg = DIFF_CONFIG[diff];
    if (!cfg || cfg.count === 0) return;
    ensureParticleCanvas();

    function spawnOne() {
      var rect = el.getBoundingClientRect();
      if (!rect.width) return;
      activeParticles.push({
        sx:    rect.left + Math.random() * rect.width,
        sy:    rect.top  + rect.height * (0.3 + Math.random() * 0.7),
        vx:    rnd(28),
        vy:    -(40 + Math.random() * 55) * cfg.speed,
        size:  1 + Math.random() * 2,
        life:  600 + Math.random() * 700,
        t0:    performance.now(),
        color: cfg.color
      });
      kickParticleRaf();
    }

    diffParticleInterval = setInterval(spawnOne, Math.max(200, 2000 / cfg.count));
    for (var i = 0; i < Math.min(cfg.count, 2); i++)
      diffParticleTimers.push(setTimeout(spawnOne, i * 100));
  }

  /* ─────────────────────────────────────
     MAIN INIT
  ───────────────────────────────────── */

  function init() {
    var heroEls = document.querySelectorAll('.js-char-data');
    var heroes = [];
    heroEls.forEach(function(el) {
      heroes.push({
        name:       el.getAttribute('data-name')       || '',
        diff:       el.getAttribute('data-diff')       || 'novice',
        tier:       el.getAttribute('data-tier')       || 'B',
        move:       el.getAttribute('data-move')       || '6.0',
        stamina:    el.getAttribute('data-stamina')    || '3',
        dashspd:    el.getAttribute('data-dashspd')    || '14',
        sprintspd:  el.getAttribute('data-sprintspd')  || '—',
        dashbucket: el.getAttribute('data-dashbucket') || '—',
        color:      el.getAttribute('data-color')      || '#1a0f3a',
        slug:       el.getAttribute('data-slug')       || '',
        titleImg:   el.getAttribute('data-title-img')  || ''
      });
    });
    if (!heroes.length) return;

    heroes.sort(function(a, b) {
      var na = a.name.toLowerCase(), nb = b.name.toLowerCase();
      ['the ','a ','an '].forEach(function(art) {
        if (na.startsWith(art)) na = na.slice(art.length);
        if (nb.startsWith(art)) nb = nb.slice(art.length);
      });
      return na.localeCompare(nb);
    });

    /* ── DOM Build ── */
    var wrap     = document.createElement('div'); wrap.id     = 'cs-wrap';
    var bg       = document.createElement('div'); bg.id       = 'cs-bg';
    var vignette = document.createElement('div'); vignette.id = 'cs-vignette';
    var renderEl = document.createElement('div'); renderEl.id = 'cs-render';
    renderElRef  = renderEl;
    var renderImgEl = document.createElement('canvas');
    renderImgEl.id  = 'cs-render-img';
    renderImg = renderImgEl;
    renderEl.appendChild(renderImgEl);

    /* Video sources — served directly from heroes folder */
    var videoSrcs = ['wiki1','wiki2','wiki3','wiki4'].map(function(n) {
      return '/wiki/lib/tpl/bootstrap3/images/heroes/' + n + '.mp4';
    });

    /* Preload first video */
    var vPreload = document.createElement('link');
    vPreload.rel = 'preload'; vPreload.as = 'video';
    vPreload.href = videoSrcs[0];
    document.head.appendChild(vPreload);

    var videos = videoSrcs.map(function(src, i) {
      var v = document.createElement('video');
      v.className = 'cs-bg-video'; v.autoplay = v.muted = v.loop = v.playsInline = true;
      v.preload = i === 0 ? 'auto' : 'none';
      v.innerHTML = '<source src="'+src+'" type="video/mp4">';
      bg.appendChild(v); return v;
    });

    var info = document.createElement('div'); info.id = 'cs-info';
    info.innerHTML =
      '<div class="cs-info-title-wrap" id="cs-title-wrap">'+
        '<img class="cs-info-title-img" id="cs-title-img" src="" alt="" style="display:none">'+
        '<span class="cs-info-name" id="cs-name"></span>'+
      '</div>'+
      '<div class="cs-info-stats">'+
        ['move','sprintspd','dashspd','dashbucket','stamina','diff'].map(function(id, i) {
          var labels = ['Move Speed','Sprint Speed','Dash Speed','Dash Bucket','Stamina','Difficulty'];
          return '<div class="cs-info-stat"><span class="cs-info-stat-val" id="cs-'+id+'"></span>'+
            '<span class="cs-info-stat-label">'+labels[i]+'</span></div>';
        }).join('')+
      '</div>';

    var bottom   = document.createElement('div'); bottom.id   = 'cs-bottom';
    var filterEl = document.createElement('div'); filterEl.id = 'cs-filter';
    filterEl.innerHTML = '<span class="cs-filter-label">Difficulty</span>'+
      [{key:'all',label:'All'},{key:'novice',label:'Novice'},{key:'intermediate',label:'Intermediate'},
       {key:'expert',label:'Expert'}]
      .map(function(d) {
        return '<button class="cs-filter-btn'+(d.key==='all'?' active':'')+'" data-diff="'+d.key+'">'+d.label+'</button>';
      }).join('');

    var grid = document.createElement('div'); grid.id = 'cs-grid';
    var diffMap = {novice:'diff-novice',intermediate:'diff-intermediate',
      skilled:'diff-skilled',expert:'diff-expert',master:'diff-master'};
    var cellList = [];

    heroes.forEach(function(h, idx) {
      var slug = h.slug || h.name.toLowerCase().replace(/[^a-z0-9]/g,'_');
      var initials = h.name.split(' ')
        .filter(function(w){return ['the','a','an','of','and','or'].indexOf(w.toLowerCase())===-1;})
        .map(function(w){return w[0];}).join('') || h.name[0];

      var cell = document.createElement('div');
      cell.className = 'cs-hero-cell';
      cell.setAttribute('data-diff', h.diff);
      cell.setAttribute('data-slug', slug);
      cell.style.setProperty('--hero-color', h.color);

      var btn = document.createElement('div');
      btn.className = 'cs-hero-btn';
      btn.setAttribute('data-color', h.color);
      btn.innerHTML =
        '<div class="cs-btn-bg" style="background:linear-gradient(160deg,'+h.color+' 0%,#0d0820 100%)">'+
          '<img class="cs-btn-portrait" crossorigin="anonymous" src="'+cardUrl(slug)+'" alt="'+h.name+'" '+
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'+
          '<span class="cs-btn-initials" style="display:none">'+initials+'</span>'+
        '</div>'+
        '<div class="cs-btn-overlay"></div>'+
        '<div class="cs-btn-diff '+(diffMap[h.diff]||'diff-novice')+'"></div>'+
        '<div class="cs-btn-tier">'+h.tier+'</div>';

      var heroColor = HERO_COLORS[slug] || h.color;
      cell.style.setProperty('--hero-color', heroColor);
      btn.querySelector('.cs-btn-bg').style.background =
        'linear-gradient(160deg,' + heroColor + ' 0%,#0d0820 100%)';

      var nameImg  = document.createElement('img');
      nameImg.className = 'cs-btn-name-img';
      nameImg.src = nameUrl(slug);
      nameImg.alt = h.name;
      var nameText = document.createElement('div');
      nameText.className = 'cs-btn-name';
      nameText.style.display = 'none';
      nameText.textContent = h.name;
      nameImg.onerror = function() { nameImg.style.display='none'; nameText.style.display='block'; };

      cell.appendChild(btn);
      cell.appendChild(nameImg);
      cell.appendChild(nameText);
      cell.addEventListener('mouseenter', function(){ showHero(h, btn, idx); });
      cell.addEventListener('click', function(){ window.location.href='/wiki/doku.php?id=characters:'+slug; });
      cellList.push(cell);
      grid.appendChild(cell);
    });

    bottom.appendChild(info);
    bottom.appendChild(grid);
    bottom.appendChild(filterEl);
    wrap.appendChild(bg);
    wrap.appendChild(renderEl);
    wrap.appendChild(vignette);
    wrap.appendChild(bottom);
    document.body.appendChild(wrap);

    requestAnimationFrame(function() {
      if (renderElRef.offsetWidth) {
        renderImg.width  = renderElRef.offsetWidth;
        renderImg.height = renderElRef.offsetHeight;
      }
    });

    /* ── GLITCH OVERLAY ── */
    var glitchCanvas = document.createElement('canvas');
    glitchCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9995;opacity:0;';
    document.body.appendChild(glitchCanvas);
    var glitchCtx = glitchCanvas.getContext('2d');

    function resizeGlitch() {
      glitchCanvas.width  = window.innerWidth;
      glitchCanvas.height = window.innerHeight;
    }
    resizeGlitch();
    window.addEventListener('resize', resizeGlitch);

    function doGlitch() {
      var w = glitchCanvas.width, h = glitchCanvas.height;
      glitchCtx.clearRect(0, 0, w, h);
      var slices = 2 + Math.floor(Math.random() * 3);
      for (var i = 0; i < slices; i++) {
        var y      = Math.random() * h;
        var sh     = 1 + Math.random() * 4;
        var offset = (Math.random() - 0.5) * 30;
        var alpha  = 0.04 + Math.random() * 0.08;
        glitchCtx.fillStyle = 'rgba(180,160,255,' + alpha + ')';
        glitchCtx.fillRect(offset, y, w, sh);
      }
      glitchCanvas.style.opacity = '1';
      setTimeout(function() { glitchCanvas.style.opacity = '0'; }, 80 + Math.random() * 120);
      setTimeout(doGlitch, 2000 + Math.random() * 5000);
    }
    setTimeout(doGlitch, 1500);

    /* Video autoplay */
    var activeVideoIdx = 0;
    videos[0].classList.add('active');
    videos[0].load();
    videos[0].play().catch(function(){});
    function tryPlay() { videos.forEach(function(v){ v.play().catch(function(){}); }); }
    document.addEventListener('mousemove', tryPlay, {once:true});
    document.addEventListener('click',     tryPlay, {once:true});

    /* ── Show Hero ── */
    var currentHeroSlug = null, imgCache = {};

    var elMove      = document.getElementById('cs-move');
    var elSprint    = document.getElementById('cs-sprintspd');
    var elDash      = document.getElementById('cs-dashspd');
    var elBucket    = document.getElementById('cs-dashbucket');
    var elStamina   = document.getElementById('cs-stamina');
    var elDiff      = document.getElementById('cs-diff');
    var elTitleImg  = document.getElementById('cs-title-img');
    var elTitleText = document.getElementById('cs-name');
    var elTitleWrap = document.getElementById('cs-title-wrap');

    function showHero(h, btn, idx) {
      cellList.forEach(function(c) {
        c.classList.remove('active');
        var b = c.querySelector('.cs-hero-btn');
        if (b) { b.classList.remove('active'); stopWarp(b); }
      });
      btn.classList.add('active');
      if (btn.parentElement) btn.parentElement.classList.add('active');

      var vIdx = idx % videos.length;
      if (vIdx !== activeVideoIdx) {
        videos[activeVideoIdx].classList.remove('active');
        var nv = videos[vIdx];
        nv.classList.add('active');
        if (nv.preload === 'none') { nv.preload = 'auto'; nv.load(); }
        nv.play().catch(function(){});
        activeVideoIdx = vIdx;
      }
      var slug = h.slug || h.name.toLowerCase().replace(/[^a-z0-9]/g,'_');
      var heroColor = HERO_COLORS[slug] || h.color;
      bg.style.background = 'radial-gradient(ellipse at 65% 35%, '+heroColor+'77 0%, #0a0716 55%)';

      var existingTint = bg.querySelector('.cs-bg-tint');
      if (!existingTint) {
        existingTint = document.createElement('div');
        existingTint.className = 'cs-bg-tint';
        existingTint.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;transition:background 0.6s ease;';
        bg.appendChild(existingTint);
      }
      existingTint.style.background = 'rgba(' +
        parseInt(heroColor.slice(1,3),16) + ',' +
        parseInt(heroColor.slice(3,5),16) + ',' +
        parseInt(heroColor.slice(5,7),16) + ',0.18)';
      showRender(slug, heroColor);

      function applyTitleGlow(color) {
        var warpCanvas = elTitleWrap.querySelector('canvas');
        if (warpCanvas) {
          warpCanvas.style.filter =
            'drop-shadow(0 0 8px ' + color + ') ' +
            'drop-shadow(0 0 20px ' + color + ') ' +
            'drop-shadow(0 0 40px ' + color + '99)';
        }
      }
      setTimeout(function() { applyTitleGlow(heroColor); }, 100);

      var autoTitleSrc = h.titleImg || nameUrl(slug);
      currentHeroSlug = slug;
      stopWarp(elTitleWrap);
      elTitleImg.onload = elTitleImg.onerror = null;
      elTitleImg.alt = h.name;
      elTitleImg.style.opacity = '0';
      elTitleImg.style.display = 'block';
      elTitleText.style.display = 'none';

      function startTitleWarp() {
        Object.assign(elTitleImg.style, {display:'block', width:'100%', height:'auto', maxHeight:'140px', objectFit:'contain', objectPosition:'center center'});
        elTitleText.style.display = 'none';
        Object.assign(elTitleWrap.style, {position:'relative', width:'520px', maxWidth:'90vw', height:'140px'});
        elTitleImg.style.opacity = '0';
        startWarp(elTitleWrap, 4, elTitleImg);
      }

      var cached = imgCache[autoTitleSrc];
      if (cached && cached.complete && cached.naturalWidth) {
        elTitleImg.src = autoTitleSrc; startTitleWarp();
      } else {
        elTitleImg.src = autoTitleSrc;
        var ws = slug;
        elTitleImg.onload  = function(){ if (currentHeroSlug!==ws) return; startTitleWarp(); };
        elTitleImg.onerror = function(){ elTitleImg.style.display='none'; elTitleText.style.display='block'; elTitleText.textContent=h.name; };
      }

      elMove.textContent    = h.move + ' m/s';
      elSprint.textContent  = h.sprintspd==='—' ? '0.0 m/s' : h.sprintspd+' m/s';
      elSprint.className    = 'cs-info-stat-val'+(h.sprintspd==='—'?' cs-info-stat-val-empty':'');
      elDash.textContent    = h.dashspd + ' m/s';
      elBucket.textContent  = h.dashbucket==='—' ? '0' : h.dashbucket;
      elBucket.className    = 'cs-info-stat-val'+(h.dashbucket==='—'?' cs-info-stat-val-empty':'');
      elStamina.textContent = h.stamina;
      elDiff.textContent    = h.diff.charAt(0).toUpperCase() + h.diff.slice(1);
      elDiff.className      = 'cs-info-stat-val cs-diff-' + h.diff;
      info.classList.add('visible');
      startWarp(btn, 3);
    }

    /* Filter */
    filterEl.addEventListener('click', function(e) {
      var fbtn = e.target.closest('.cs-filter-btn');
      if (!fbtn) return;
      filterEl.querySelectorAll('.cs-filter-btn').forEach(function(b){ b.classList.remove('active'); });
      fbtn.classList.add('active');
      var diff = fbtn.getAttribute('data-diff');
      cellList.forEach(function(c) {
        c.classList.toggle('filtered-out', diff!=='all' && c.getAttribute('data-diff')!==diff);
      });
    });

    /* Preload first hero */
    var firstSlug = heroes[0].slug || heroes[0].name.toLowerCase().replace(/[^a-z0-9]/g,'_');
    [renderUrl(firstSlug), nameUrl(firstSlug), cardUrl(firstSlug)].forEach(function(href) {
      var link = document.createElement('link');
      link.rel = 'preload'; link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    });
    var firstTitleSrc = heroes[0].titleImg || nameUrl(firstSlug);
    var fi = new Image(); fi.src = firstTitleSrc; imgCache[firstTitleSrc] = fi;
    var fr = new Image(); fr.src = renderUrl(firstSlug); renderCache[firstSlug] = fr;

    heroes.slice(1).forEach(function(h, i) {
      setTimeout(function() {
        var s = h.slug || h.name.toLowerCase().replace(/[^a-z0-9]/g,'_');
        var src = h.titleImg || nameUrl(s);
        var ti = new Image(); ti.src = src; imgCache[src] = ti;
        var ri = new Image(); ri.src = renderUrl(s); renderCache[s] = ri;
      }, Math.floor(i/4) * 200 + 300);
    });

    /* Show first hero */
    function showFirst() {
      var first = grid.querySelector('.cs-hero-btn');
      if (first) showHero(heroes[0], first, 0);
    }
    if (fr.complete && fr.naturalWidth) setTimeout(showFirst, 100);
    else { var ft = setTimeout(showFirst, 1500); fr.onload = function(){ clearTimeout(ft); showFirst(); }; }
  }
})();