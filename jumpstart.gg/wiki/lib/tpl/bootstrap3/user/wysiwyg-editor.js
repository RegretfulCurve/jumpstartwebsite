(function () {
  var STAT_TYPES = [
    /* Weapon */
    { key:'ammo',          file:'ammo.png',                        label:'Ammo',                 cat:'Weapon' },
    { key:'bullet_dmg',    file:'Bullet_damage.png',               label:'Bullet Damage',        cat:'Weapon' },
    { key:'bullet_vel',    file:'AttributeIconBulletSpeed.png',    label:'Bullet Velocity',      cat:'Weapon' },
    { key:'dps',           file:'Bullets_per_sec_icon.png',        label:'Damage per Second',    cat:'Weapon' },
    { key:'fire_rate',     file:'Bullets_per_sec_icon.png',        label:'Fire Rate',            cat:'Weapon' },
    { key:'melee_dmg',     file:'Melee_damage.png',                label:'Melee Damage',         cat:'Weapon' },
    { key:'reload',        file:'AttributeIconReloadTime.png',     label:'Reload Time',          cat:'Weapon' },
    { key:'weapon_dmg',    file:'Bullet_damage.png',               label:'Weapon Damage',        cat:'Weapon' },
    /* Vitality */
    { key:'bullet_armor',  file:'Bullet_Armor.png',                label:'Bullet Resist',        cat:'Vitality' },
    { key:'barrier',       file:'Barrier.png',                     label:'Damage Barrier',       cat:'Vitality' },
    { key:'debuff_res',    file:'Debuff_resist.png',               label:'Debuff Resist',        cat:'Vitality' },
    { key:'bullet_evasion',file:'Bullet_Evasion.png',              label:'Bullet Evasion',       cat:'Vitality' },
    { key:'health',        file:'Health.png',                      label:'Health',               cat:'Vitality' },
    { key:'health_regen',  file:'Health_regen.png',                label:'Health Regen',         cat:'Vitality' },
    { key:'lifesteal',     file:'Health_regen.png',                label:'Lifesteal',            cat:'Vitality' },
    { key:'move_speed',    file:'Move_speed.png',                  label:'Move Speed',           cat:'Vitality' },
    { key:'stamina',       file:'Stamina.png',                     label:'Stamina',              cat:'Vitality' },
    /* Spirit */
    { key:'cooldown',      file:'Cooldown_Icon.png',               label:'Cooldown',             cat:'Spirit' },
    { key:'ability_dur',   file:'AttributeIconTechDuration.png',   label:'Ability Duration',     cat:'Spirit' },
    { key:'ability_range', file:'AttributeIconTechRange.png',      label:'Ability Range',        cat:'Spirit' },
    { key:'charges',       file:'AttributeIconMaxChargesIncrease.png', label:'Ability Charges',  cat:'Spirit' },
    { key:'spirit_power',  file:'Spirit_icon.png',                 label:'Spirit Power',         cat:'Spirit' },
    { key:'spirit_dmg',    file:'Damage_heart.png',                label:'Spirit Damage',        cat:'Spirit' },
    /* Other */
    { key:'damage',        file:'Damage.png',                      label:'Damage',               cat:'Other' },
    { key:'spirit_scale',  file:'Boon_scaling.png',                label:'Spirit Scaling',       cat:'Other' },
    { key:'buildup',       file:'Fixation.png',                    label:'Build-Up',             cat:'Other' },
    { key:'chargeup',      file:'Chargeup.png',                    label:'Charge-Up',            cat:'Other' },
    { key:'ap',            file:'Ability_point.png',               label:'Ability Points',       cat:'Other' },
    { key:'duration',      file:'AttributeIconTechDuration.png',   label:'Duration',             cat:'Other' },
    { key:'displacement',  file:'Move_speed.png',                  label:'Displacement',         cat:'Other' },
  ];

  var STAT_ICON_BASE = '/wiki/lib/tpl/bootstrap3/images/icons/Stats/';

  function statIconUrl(statKey) {
    var s = STAT_TYPES.find(function(t){ return t.key === statKey; });
    return s ? STAT_ICON_BASE + s.file : '';
  }
  function statLabel(statKey) {
    var s = STAT_TYPES.find(function(t){ return t.key === statKey; });
    return s ? s.label : statKey;
  }


  'use strict';

  var textarea = document.getElementById('wiki__text');
  if (!textarea) return;
  var editBox = textarea.closest('.editBox') || textarea.closest('#dokuwiki__content');
  if (!editBox) return;

  var pageNs = (typeof JSINFO !== 'undefined' && JSINFO.id)
    ? JSINFO.id.replace(/:/g, '/') : 'wiki';



  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  var pendingUploadCb = null;

  function triggerUpload(accept, cb) {
    fileInput.accept = accept || 'image/*,video/mp4,video/webm';
    pendingUploadCb = cb;
    fileInput.value = '';
    fileInput.click();
  }

  fileInput.addEventListener('change', function() {
    var file = fileInput.files[0];
    if (!file || !pendingUploadCb) return;
    var cb = pendingUploadCb; pendingUploadCb = null;
    var toast = document.createElement('div');
    toast.id = 'jw-uploading-toast';
    toast.textContent = 'Uploading ' + file.name + '…';
    document.body.appendChild(toast);
    var fd = new FormData();
    fd.append('file', file);
    fd.append('ns', pageNs);
    fetch('/wiki/doku.php?do=uploadmedia', { method: 'POST', body: fd })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        toast.parentNode && toast.parentNode.removeChild(toast);
        if (data.ok) cb(data.url, data.name);
        else alert('Upload failed: ' + (data.error || 'unknown'));
      })
      .catch(function(err) {
        toast.parentNode && toast.parentNode.removeChild(toast);
        alert('Upload error: ' + err.message);
      });
  });



  function attachmentMarkup(att) {
    if (!att) return '';
    if (att.type !== 'callout' && !att.src && !(att.images && att.images.length)) return '';
    var w   = (att.width || 320) + 'px';
    var side = att.side || 'right';
    var style = '';
    if (side === 'left')   style = 'float:left;margin:0 20px 12px 0;width:' + w + ';max-width:50%;';
    if (side === 'right')  style = 'float:right;margin:0 0 12px 20px;width:' + w + ';max-width:50%;';
    if (side === 'center') style = 'display:block;margin:0 auto 16px;width:' + w + ';max-width:100%;';

    if (att.type === 'callout') {
      var cs = att.calloutStyle || 'tip';
      var cl = att.calloutLabel || 'Tip';
      var ct = att.calloutText  || '';
      return '<div class="js-callout" style="' + style + '">' +
             '<div class="js-callout-bar ' + cs + '"></div>' +
             '<div class="js-callout-inner"><span class="js-callout-label">' + cl + '</span>' +
             '<p class="js-callout-text">' + ct + '</p></div></div>';
    }
    var inner = '';
    if (att.type === 'video') {
      inner = '<div class="js-video-wrap"><video autoplay muted loop playsinline>' +
              '<source src="' + (att.src||'') + '" type="video/mp4"></video></div>' +
              '<div class="js-video-caption">' + (att.caption||'') + '</div>';
      return '<div class="js-att-video" style="' + style + '">' + inner + '</div>';
    }
    if (att.type === 'imageGrid') {
      var cols = att.cols || 2;
      var cells = (att.images||[]).map(function(img) {
        return '<div class="js-att-grid-cell"><img src="' + img.src + '" alt="' + (img.caption||'') +
               '" style="width:100%;height:auto;display:block;border-radius:3px;">' +
               (img.caption ? '<div class="js-video-caption">' + img.caption + '</div>' : '') + '</div>';
      }).join('');
      return '<div class="js-att-grid" style="' + style + 'display:grid;grid-template-columns:repeat(' +
             cols + ',1fr);gap:6px;">' + cells + '</div>';
    }
    inner = '<img src="' + (att.src||'') + '" alt="' + (att.caption||'') +
            '" style="width:100%;height:auto;display:block;">' +
            '<div class="js-video-caption">' + (att.caption||'') + '</div>';
    return '<div class="js-att-image" style="' + style + '">' + inner + '</div>';
  }



  var BLOCK_TYPES = {
    heading1:    { label:'Main Heading',    markup:function(d){return '====== '+d.text+' ======\n';}},
    heading2:    { label:'Sub Heading',     markup:function(d){return '===== '+d.text+' =====\n';}},
    heading3:    { label:'Tertiary Heading',markup:function(d){return '==== '+d.text+' ====\n';}},
    paragraph:   { label:'Paragraph',      markup:function(d){return d.text+'\n\n';}},
    divider:     { label:'Divider',        markup:function(){return '<html>\n<hr class="js-divider">\n</html>\n\n';}},
    callout:     { label:'Callout',        markup:function(d){
      return '<html>\n<div class="js-callout">\n  <div class="js-callout-bar '+d.style+'"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">'+d.label+'</span>\n    <p class="js-callout-text">'+d.text+'</p>\n  </div>\n</div>\n</html>\n\n';
    }},
    quote:       { label:'Quote',          markup:function(d){
      return '<html>\n<div class="js-hero-quote">\n  <span class="js-hero-quote-mark">"</span>\n  <span class="js-hero-quote-text">'+d.text+'</span>\n</div>\n</html>\n\n';
    }},
    sectionBanner:{ label:'Section Banner',markup:function(d){
      return '<html>\n<div class="js-section-banner">\n  <div class="js-section-banner-inner">\n    <span class="js-section-banner-eyebrow">'+d.eyebrow+'</span>\n    <h2 class="js-section-banner-title">'+d.title+'</h2>\n    <p class="js-section-banner-sub">'+d.sub+'</p>\n  </div>\n</div>\n</html>\n\n';
    }},
    steps:       { label:'Steps',          markup:function(d){
      var rows=d.steps.map(function(s,i){return '  <div class="js-step">\n    <div class="js-step-num">0'+(i+1)+'</div>\n    <div class="js-step-content">\n      <div class="js-step-title">'+s.title+'</div>\n      <p class="js-step-desc">'+s.desc+'</p>\n    </div>\n  </div>';}).join('\n');
      return '<html>\n<div class="js-steps">\n'+rows+'\n</div>\n</html>\n\n';
    }},
    inputTable:  { label:'Input Table',    markup:function(d){
      var rows=d.rows.map(function(r){return '    <tr>\n      <td>'+r.action+'</td>\n      <td><span class="js-key">'+r.input+'</span></td>\n      <td>'+r.timing+'</td>\n      <td>'+r.notes+'</td>\n    </tr>';}).join('\n');
      return '<html>\n<table class="js-input-table">\n  <thead><tr><th>Action</th><th>Input</th><th>Timing</th><th>Notes</th></tr></thead>\n  <tbody>\n'+rows+'\n  </tbody>\n</table>\n</html>\n\n';
    }},
    statTable:   { label:'Stat Table',     markup:function(d){
      var rows=d.rows.map(function(r){return '    <tr><td>'+r.metric+'</td><td>'+r.base+'</td><td><span class="js-stat-val">'+r.with+'</span></td><td><span class="js-stat-note">'+r.notes+'</span></td></tr>';}).join('\n');
      return '<html>\n<table class="js-stat-table">\n  <thead><tr><th>Metric</th><th>Base</th><th>With Technique</th><th>Notes</th></tr></thead>\n  <tbody>\n'+rows+'\n  </tbody>\n</table>\n</html>\n\n';
    }},
    barChart:    { label:'Bar Chart',      markup:function(d){
      var rows=d.bars.map(function(b){var pct=Math.round((b.val/(d.max||100))*100);return '    <div class="js-bar-row"><span class="js-bar-label">'+b.label+'</span><div class="js-bar-track"><div class="js-bar-fill" style="width:'+pct+'%"></div></div><span class="js-bar-val">'+b.val+'</span></div>';}).join('\n');
      return '<html>\n<div class="js-bar-chart" data-title="'+d.title+'">\n  <div class="js-bar-chart-inner">\n'+rows+'\n  </div>\n</div>\n</html>\n\n';
    }},
    videoGrid:   { label:'Video Grid',     markup:function(d){
      var items=(d.videos||[]).map(function(v){return '  <div class="js-video-block">\n    <div class="js-video-wrap"><video autoplay muted loop playsinline><source src="'+v.src+'" type="video/mp4"></video></div>\n    <div class="js-video-caption">'+v.caption+'</div>\n  </div>';}).join('\n');
      return '<html>\n<div class="js-video-grid" style="grid-template-columns:repeat('+(d.cols||2)+',1fr)">\n'+items+'\n</div>\n</html>\n\n';
    }},
    imageGrid:   { label:'Image Grid',     markup:function(d){
      var items=(d.images||[]).map(function(img){return '  <div class="js-image-block">\n    <img src="'+img.src+'" alt="'+img.alt+'" class="js-image">\n    <div class="js-image-caption">'+img.caption+'</div>\n  </div>';}).join('\n');
      return '<html>\n<div class="js-image-grid" style="grid-template-columns:repeat('+(d.cols||2)+',1fr)">\n'+items+'\n</div>\n</html>\n\n';
    }},
    keyCombo:    { label:'Key Combo',      markup:function(d){
      var keys=(d.keys||[]).map(function(k){return k.type==='plus'?'<span class="js-input-plus">+</span>':'<span class="js-key">'+k.label+'</span>';}).join('');
      return '<html>\n<div class="js-key-combo">'+keys+(d.caption?'<span class="js-key-combo-caption">'+d.caption+'</span>':'')+'\n</div>\n</html>\n\n';
    }},
    techCredit:  { label:'Tech Credit',    markup:function(d){
      return '<html>\n<div class="js-tech-credit">\n  <div class="js-tech-credit-avatar"></div>\n  <div class="js-tech-credit-info">\n    <span class="js-tech-credit-label">Discovered by</span>\n    <span class="js-tech-credit-name">'+d.name+'</span>\n    <span class="js-tech-credit-meta">'+d.hero+(d.date?' · '+d.date:'')+'</span>\n  </div>\n</div>\n</html>\n\n';
    }},
    collapsible: { label:'Collapsible',    markup:function(d){
      return '<html>\n<details class="js-collapsible">\n  <summary class="js-collapsible-title">'+d.title+'</summary>\n  <div class="js-collapsible-body">\n    <p>'+d.text+'</p>\n  </div>\n</details>\n</html>\n\n';
    }},
    tabGroup:    { label:'Tab Group',      markup:function(d){
      var uid='tabs-'+Date.now();
      var tabs=(d.tabs||[]).map(function(t,i){return '  <button class="js-tab-btn'+(i===0?' js-tab-active':'')+'" data-tab="'+uid+'-'+i+'">'+t.label+'</button>';}).join('\n');
      var panels=(d.tabs||[]).map(function(t,i){return '  <div class="js-tab-panel'+(i===0?' js-tab-panel-active':'')+'" id="'+uid+'-'+i+'">\n    <p>'+t.content+'</p>\n  </div>';}).join('\n');
      return '<html>\n<div class="js-tab-group">\n  <div class="js-tab-bar">\n'+tabs+'\n  </div>\n  <div class="js-tab-panels">\n'+panels+'\n  </div>\n</div>\n</html>\n\n';
    }},
    pageNav:     { label:'Page Nav',       markup:function(d){
      var links=(d.links||[]).map(function(l){return '  <a href="#'+l.anchor+'" class="js-page-nav-link">'+l.label+'</a>';}).join('\n');
      return '<html>\n<nav class="js-page-nav">\n  <span class="js-page-nav-label">On this page</span>\n'+links+'\n</nav>\n</html>\n\n';
    }},
    itemBlock:   { label:'Item Block',     markup:function(d){
      var chips = (d.statChips||[]).map(function(c){
        var ciu = statIconUrl(c.statKey||c.icon||'damage');
        var ciImg = ciu ? '<span class="js-ib-chip-icon" data-src="'+ciu+'"></span>' : '';
        return '<div class="js-ib-chip-card">'+ciImg+'<span class="js-ib-chip-val">'+c.value+'</span><span class="js-ib-chip-lbl">'+c.label+'</span>'+(c.cond?'<span class="js-ib-chip-cond">'+c.cond+'</span>':'')+'</div>';
      }).join('');
var pstats = (d.passiveStats||[]).map(function(s){ return '<div class="js-ib-pstat">'+s+'</div>'; }).join('');
      var passive = d.hasPassive ? '<div class="js-ib-section"><span class="js-ib-section-label">Passive</span></div><p class="js-ib-desc">'+d.passiveDesc+'</p>' : '';
      var active  = d.hasActive  ? '<div class="js-ib-section"><span class="js-ib-section-label">Active</span><span class="js-ib-cooldown">⏱ '+d.activeCooldown+'</span></div><p class="js-ib-desc">'+d.activeDesc+'</p>' : '';
      var iconHtml = d.iconUrl ? '<div class="js-ib-icon" data-src="' + d.iconUrl.replace(/"/g,'%22') + '"></div>' : '';
      return '<html>\n<div class="js-item-block2" data-type="'+d.type+'" data-icon="'+escHtml(d.iconUrl||'')+'" data-icon-name="'+escHtml(d.iconName||'')+'" data-icon-hero="'+escHtml(d.iconHero||'')+'" data-icon-file="'+escHtml(d.iconFile||'')+'" >'+
        '<div class="js-ib-namebar"><span class="js-ib-name">'+d.name+'</span><div class="js-ib-badge"><span class="js-ib-badge-val">'+d.badge+'</span><span class="js-ib-badge-label">'+d.badgeLabel+'</span></div></div>'+
        (d.iconUrl ? '<div class="js-ib-imgwrap">'+iconHtml+'</div>' : '')+
        '<div class="js-ib-costtable"><div class="js-ib-costrow"><span class="js-ib-costlabel">Cost</span><span class="js-ib-cost">$ '+d.cost+'</span></div><div class="js-ib-costrow"><span class="js-ib-costlabel">Tier</span><span class="js-ib-tier">'+d.tier+'</span></div></div>'+
        pstats+passive+active+
        (chips?'<div class="js-ib-chips-grid">'+chips+'</div>':'')+
        (d.duration?'<div class="js-ib-duration">'+d.duration+' Duration</div>':'')+
        '</div>\n</html>\n\n';
    }},
    abilityBlock:{ label:'Ability Block',  markup:function(d){
      var pills = (d.statPills||[]).map(function(p){
        return '<div class="js-ab-pill"><span class="js-ab-pill-icon js-icon-'+p.icon+'"></span><span class="js-ab-pill-value">'+p.value+'</span></div>';
      }).join('');
      var grid = (d.statGrid||[]).map(function(s){
        var giu = statIconUrl(s.statKey||s.icon||'damage');
        var giImg = giu ? '<span class="js-ab-grid-icon" data-src="'+giu+'"></span>' : '';
        return '<div class="js-ab-grid-cell'+(s.highlight?' js-ab-cell-hl':'')+'">'+giImg+'<span class="js-ab-grid-val">'+s.value+'</span><span class="js-ab-grid-lbl">'+s.label+'</span></div>';
      }).join('');
      var upgrades = (d.upgrades||[]).map(function(u){
        return '<div class="js-ab-upgrade"><div class="js-ab-upgrade-cost">⚡'+u.cost+'</div><div class="js-ab-upgrade-value">'+u.value+'</div><div class="js-ab-upgrade-label">'+u.label+'</div></div>';
      }).join('');
      var abIconHtml = d.iconUrl ? '<div class="js-ab-icon" data-src="' + d.iconUrl.replace(/"/g,'%22') + '"></div>' : '';
      return '<html>\n<div class="js-ability-block2" data-icon="'+escHtml(d.iconUrl||'')+'" data-icon-hero="'+escHtml(d.iconHero||'')+'" data-icon-file="'+escHtml(d.iconFile||'')+'">'+
        '<div class="js-ab-header">'+abIconHtml+'<span class="js-ab-name">'+d.name+'</span><div class="js-ab-cooldown"><span>⏱</span><span>'+d.cooldown+'</span></div></div>'+
        (pills?'<div class="js-ab-pills">'+pills+'</div>':'')+
        '<p class="js-ab-desc">'+d.desc+'</p>'+
        (d.altCast?'<p class="js-ab-altcast">'+d.altCast+'</p>':'')+
        (grid?'<div class="js-ab-grid">'+grid+'</div>':'')+
        (upgrades?'<div class="js-ab-upgrades">'+upgrades+'</div>':'')+
        '</div>\n</html>\n\n';
    }},
    relatedCards:{ label:'Related Cards',  markup:function(d){
      var cards=(d.cards||[]).map(function(c){return '  <a href="'+c.href+'" class="js-related-card">\n    <span class="js-related-card-name">'+c.name+'</span>\n    <span class="js-related-card-desc">'+c.desc+'</span>\n  </a>';}).join('\n');
      return '<html>\n<div class="js-related">\n'+cards+'\n</div>\n</html>\n\n';
    }},
    inlineImage: { label:'Image',          markup:function(d){
      return '<html>\n<div class="js-inline-image"' +(d.align?' style="text-align:'+d.align+'"':'')+' >\n  <img src="'+(d.src||'')+'" alt="'+(d.caption||'')+'" style="width:'+(d.width||'100%')+';height:auto;display:block;border-radius:5px;'+(d.align==='center'?'margin:0 auto;':'')+'">\n'+(d.caption?'  <div class="js-image-caption">'+d.caption+'</div>\n':'')+'</div>\n</html>\n\n';
    }},
    twoColumn:   { label:'Two Column',     markup:function(d){


      function blockToHtml(b) {
        var data = b.data;
        switch (b.type) {
          case 'heading1': return '<h1 class="jw-h1" style="font-family:Forevs,serif;font-size:4.5rem;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#EDE8F5;margin:0 0 8px;border-bottom:1px solid rgba(107,79,187,0.2);padding-bottom:10px;">'+escHtml(data.text)+'</h1>';
          case 'heading2': return '<h2 class="jw-h2" style="font-family:Forevs,serif;font-size:3rem;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#B8ADDB;margin:0;border-bottom:1px solid rgba(107,79,187,0.15);padding-bottom:5px;">'+escHtml(data.text)+'</h2>';
          case 'heading3': return '<h3 class="jw-h3" style="font-family:Forevs,serif;font-size:2.4rem;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:rgba(184,173,219,0.7);margin:0;">'+escHtml(data.text)+'</h3>';
          case 'paragraph': return '<p style="font-family:Forevs,serif;font-size:2.2rem;line-height:2.1;color:rgba(237,232,245,0.8);margin:0;">'+data.text+'</p>';
          case 'divider':  return '<hr class="js-divider">';
          default:

            var mu = blockToMarkup(b);

            mu = mu.replace(/^<html>\r?\n?/,'').replace(/\r?\n?<\/html>\s*$/,'').trim();
            return mu;
        }
      }
      function colHtml(colBlocks) {
        return (colBlocks||[]).map(blockToHtml).join('\n');
      }
      var leftHtml  = colHtml(d.leftBlocks);
      var rightHtml = colHtml(d.rightBlocks);
      return '<html>\n<div class="js-two-col" data-split="'+(d.split||'1fr 1fr')+'" data-gap="'+(d.gap||24)+'" style="display:grid;grid-template-columns:'+(d.split||'1fr 1fr')+';gap:'+(d.gap||24)+'px;align-items:start;">\n<div class="js-two-col-left" style="min-width:0;">\n'+leftHtml+'\n</div>\n<div class="js-two-col-right" style="min-width:0;">\n'+rightHtml+'\n</div>\n</div>\n</html>\n\n';
    }},
    raw:         { label:'Code Block',     markup:function(d){return d.markup;}},
  };

  function blockToMarkup(block) {
    var def = BLOCK_TYPES[block.type];
    if (!def) return block.data.markup || "";
    var blockContent = def.markup(block.data);
    var att = block.attachment;
    if (!att || (!att.src && !(att.images && att.images.length))) return blockContent;
    var attHtml = attachmentMarkup(att);
    var w    = (att.width || 320) + "px";
    var side = att.side || "right";


    var inner = blockContent.trim().replace(/^<html>\n?/, "").replace(/\n?<\/html>\s*$/, "").trim();
    if (!inner.match(/^</)) {

      inner = '<p style="font-family:Forevs,serif;font-size:2.2rem;line-height:2.2;color:rgba(237,232,245,0.85);margin:0;">' + inner + '</p>';
    }
    var attMeta = 'data-jw-att="1" data-jw-side="' + side + '" data-jw-w="' + w + '" data-jw-type="' + (att.type||'image') + '"';
    return "<html>\n<div " + attMeta + " style=\"overflow:hidden;\">\n" +
           attHtml + "\n" + inner + "\n" +
           "</div>\n</html>\n\n";
  }

  function blocksToMarkup() {
    return blocks.map(blockToMarkup).join('');
  }



  var blocks = [];
  var blockIdCounter = 0;
  function makeId() { return 'blk-' + (++blockIdCounter); }
  function makeBlock(type, data) {
    return { id: makeId(), type: type, data: data || getDefaultData(type), attachment: null };
  }

  function getDefaultData(type) {
    var d = {
      heading1:    { text: 'Main Heading' },
      heading2:    { text: 'Sub Heading' },
      heading3:    { text: 'Tertiary Heading' },
      paragraph:   { text: 'Write your text here.' },
      divider:     {},
      callout:     { style: 'tip', label: 'Tip', text: 'Add helpful content here.' },
      quote:       { text: 'Quote text goes here.' },
      sectionBanner:{ eyebrow: 'Category', title: 'Section Title', sub: 'Brief description.' },
      steps:       { steps: [{ title: 'Step title', desc: 'Describe this step.' }, { title: 'Step title', desc: 'Describe this step.' }] },
      inputTable:  { rows: [{ action: 'Action', input: 'Space', timing: 'On ground', notes: '' }] },
      statTable:   { rows: [{ metric: 'Stat', base: '0', with: '0', notes: '' }] },
      barChart:    { title: 'Comparison', max: 100, bars: [{ label: 'Hero A', val: 80 }, { label: 'Hero B', val: 60 }] },
      videoGrid:   { cols: 2, videos: [{ src: '', caption: 'Caption one' }, { src: '', caption: 'Caption two' }] },
      imageGrid:   { cols: 2, images: [{ src: '', alt: '', caption: 'Caption one' }, { src: '', alt: '', caption: 'Caption two' }] },
      keyCombo:    { keys: [{ type:'key', label:'Space' }, { type:'plus' }, { type:'key', label:'Shift' }], caption: 'Action description' },
      techCredit:  { name: 'Username', hero: 'Hero Name', date: 'Patch 1.0' },
      collapsible: { title: 'Section Title', text: 'Hidden content goes here.' },
      tabGroup:    { tabs: [{ label: 'Tab One', content: 'Content for tab one.' }, { label: 'Tab Two', content: 'Content for tab two.' }] },
      pageNav:     { links: [{ anchor: 'overview', label: 'Overview' }, { anchor: 'how-to', label: 'How to Execute' }] },
      itemBlock: {
        name: 'Item Name', type: 'weapon', tier: '1', cost: '500',
        badge: '+10%', badgeLabel: 'Weapon Damage', badgeIcon: 'weapon',
        passiveStats: ['+50 Bonus Health'],
        hasPassive: false, passiveDesc: '',
        hasActive: true, activeCooldown: '15s', activeDesc: 'Describe the active effect.',
        statChips: [{icon:'move',value:'+3.5m/s',label:'Move Speed',cond:''},{icon:'ammo',value:'+35%',label:'Ammo',cond:'Conditional'}],
        duration: '',
      },
      abilityBlock: {
        name: 'Ability Name', cooldown: '38s',
        statPills: [{icon:'range',value:'24m',label:'Range'},{icon:'cast',value:'7s',label:'Cast Time'},{icon:'dur',value:'20m',label:'Duration'}],
        desc: 'Describe what this ability does, including any <b>spirit damage</b> or effects.',
        altCast: '',
        statGrid: [{icon:'spirit',value:'90',label:'Damage',highlight:true},{icon:'immob',value:'1.5s',label:'Immobilize Duration',highlight:false}],
        upgrades: [{cost:'1',value:'+2s',label:'Duration'},{cost:'2',value:'+0.75s',label:'Immobilize Duration'},{cost:'5',value:'+15m Wall Length',label:'& -10s Cooldown'}],
      },
      relatedCards:{ cards: [{ name: 'Related Page', desc: 'Brief description.', href: '#' }, { name: 'Related Page', desc: 'Brief description.', href: '#' }] },
      inlineImage: { src: '', caption: '', width: '100%', align: 'center' },
      twoColumn:   { split: '1fr 1fr', gap: 24, leftBlocks: [], rightBlocks: [] },
      raw:         { markup: '' },
    };
    return d[type] || {};
  }



  function parseMarkup(markup) {
    var result = [];
    var lines = markup.split('\n');
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var h1 = line.match(/^======\s*(.+?)\s*======$/);
      var h2 = line.match(/^=====\s*(.+?)\s*=====$/);
      var h3 = line.match(/^====\s*(.+?)\s*====$/);
      if (h1) { result.push(makeBlock('heading1', { text: h1[1] })); i++; continue; }
      if (h2) { result.push(makeBlock('heading2', { text: h2[1] })); i++; continue; }
      if (h3) { result.push(makeBlock('heading3', { text: h3[1] })); i++; continue; }
      if (line.trim() === '<html>') {
        var htmlLines = []; i++;
        while (i < lines.length && lines[i].trim() !== '</html>') { htmlLines.push(lines[i]); i++; }
        i++;
        result.push(parseHtmlBlock(htmlLines.join('\n')));
        continue;
      }
      if (line.trim() === '') { i++; continue; }
      var paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^={2,}/) && lines[i].trim() !== '<html>') {
        paraLines.push(lines[i]); i++;
      }
      if (paraLines.length) result.push(makeBlock('paragraph', { text: paraLines.join('\n') }));
    }
    return result;
  }

  function parseHtmlBlock(html) {


    if (html.match(/data-jw-att="1"/)) {
      var jwSide = (html.match(/data-jw-side="([^"]+)"/) || [])[1] || 'right';
      var jwW    = parseInt((html.match(/data-jw-w="([^"]+)"/) || [])[1]) || 320;
      var jwType = (html.match(/data-jw-type="([^"]+)"/) || [])[1] || 'image';
      var attSrc = ((html.match(/<img src="([^"]+)"/) || html.match(/source src="([^"]+)"/)) || [])[1] || '';
      var attCap = ((html.match(/js-video-caption[^>]*>([^<]+)</) || html.match(/js-image-caption[^>]*>([^<]+)</)) || [])[1] || '';
      /* Inner content comes after the attachment div — find the js-att-* div end */
      var attDivEnd = 0;
      var attClass = html.match(/class="(js-att-[^"]+)"/);
      if (attClass) {
        var attStart = html.indexOf('class="' + attClass[1] + '"');
        var attOpen = html.indexOf('>', attStart) + 1;
        var attDepth = 0, attJ = attOpen;
        while (attJ < html.length) {
          var atnd = html.indexOf('<div', attJ); var atnc = html.indexOf('</div>', attJ);
          if (atnc < 0) { attJ = html.length; break; }
          if (atnd >= 0 && atnd < atnc) { attDepth++; attJ = atnd + 4; }
          else { if (attDepth === 0) { attJ = atnc + 6; break; } attDepth--; attJ = atnc + 6; }
        }
        attDivEnd = attJ;
      }
      var innerContent = attDivEnd > 0 ? html.substring(attDivEnd).trim() : '';

      innerContent = innerContent.replace(/<\/div>\s*$/, '').trim();
      var innerBlock;

      var pMatch = innerContent.match(/^<p[^>]*>([\s\S]*?)<\/p>$/);
      if (pMatch) {
        innerBlock = makeBlock('paragraph', {text: pMatch[1]});
      } else {
        innerBlock = innerContent ? parseHtmlBlock(innerContent) : makeBlock('paragraph', {text:''});
        if (!innerBlock || innerBlock.type === 'raw') innerBlock = makeBlock('paragraph', {text: innerContent});
      }
      innerBlock.attachment = { type: jwType, src: attSrc, caption: attCap, side: jwSide, width: jwW };
      return innerBlock;
    }
    if (html.match(/class="js-two-col"/)) {
      var splitM=html.match(/data-split="([^"]+)"/); var gapM=html.match(/data-gap="(\d+)"/);
      function extractColContent2(src, colClass, searchFrom) {
        /* searchFrom: start searching after this position to skip nested blocks */
        var startSearch = searchFrom || 0;
        var marker = 'class="' + colClass + '"';
        var classPos = src.indexOf(marker, startSearch);
        if (classPos < 0) return '';
        var tagStart = classPos;
        while (tagStart > 0 && src[tagStart] !== '<') tagStart--;
        var contentStart = src.indexOf('>', tagStart) + 1;
        var depth = 0, i = contentStart;
        while (i < src.length) {
          var nextDiv   = src.indexOf('<div',  i);
          var nextClose = src.indexOf('</div>', i);
          if (nextClose < 0) break;
          if (nextDiv < 0 || nextClose < nextDiv) {
            if (depth === 0) { i = nextClose; break; }
            depth--;
            i = nextClose + 6;
          } else {
            depth++;
            i = nextDiv + 4;
          }
        }
        return src.substring(contentStart, i).trim();
      }
      function parseColEl(inner) {
        if (!inner || !inner.trim()) return [makeBlock('paragraph',{text:''})];
        var blocks = [], src = inner.trim(), i = 0;
        /* Block-level tags we handle */
        var BLOCK_TAGS = ['div','table','details','nav','h1','h2','h3','h4','p','hr','section','html'];
        while (i < src.length) {
          /* Skip whitespace */
          while (i < src.length && src.charCodeAt(i) <= 32) i++;
          if (i >= src.length) break;
          if (src[i] !== '<') { i++; continue; }
          /* Get tag name */
          var tagMatch = src.substring(i).match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
          if (!tagMatch) { i++; continue; }
          var tagName = tagMatch[1].toLowerCase();
          if (BLOCK_TAGS.indexOf(tagName) < 0) { i++; continue; }
          /* html wrapper — strip and parse inner content */
          if (tagName === 'html') {
            var htmlEnd = src.indexOf('</html>', i);
            if (htmlEnd < 0) { i++; continue; }
            var htmlInner = src.substring(src.indexOf('>', i) + 1, htmlEnd).trim();
            var b = parseHtmlBlock(htmlInner);
            if (b) blocks.push(b);
            i = htmlEnd + 7;
            continue;
          }
          /* Self-closing tags */
          if (tagName === 'hr') {
            var end = src.indexOf('>', i) + 1;
            var el = src.substring(i, end).trim();
            var b = parseHtmlBlock(el);
            if (b) blocks.push(b);
            i = end;
            continue;
          }
          /* Find matching close tag by depth-counting this specific tag */
          var openPat = '<' + tagName;
          var closePat = '</' + tagName + '>';
          var openTagEnd = src.indexOf('>', i) + 1;
          var depth = 0, j = openTagEnd;
          while (j < src.length) {
            var nd = src.indexOf(openPat, j);
            var nc = src.indexOf(closePat, j);
            if (nc < 0) { j = src.length; break; }
            if (nd >= 0 && nd < nc) { depth++; j = nd + openPat.length; }
            else { if (depth === 0) { j = nc + closePat.length; break; } depth--; j = nc + closePat.length; }
          }
          var element = src.substring(i, j).trim();
          if (element) {
            var b2 = parseHtmlBlock(element);
            if (b2) blocks.push(b2);
          }
          i = j;
        }
        return blocks.length ? blocks : [makeBlock('paragraph',{text:inner})];
      }
      /* Find position after the outer js-two-col opening tag to avoid matching nested columns */
      var outerTagEnd = html.indexOf('>') + 1;
      var leftInner  = extractColContent2(html, 'js-two-col-left', outerTagEnd);
      /* Find the end of the left column wrapper div by depth-counting from its start */
      var leftColStart = html.indexOf('class="js-two-col-left"', outerTagEnd);
      var leftColContentStart = html.indexOf('>', leftColStart) + 1;
      var leftDepth = 0, leftPos = leftColContentStart;
      while (leftPos < html.length) {
        var lnd = html.indexOf('<div', leftPos); var lnc = html.indexOf('</div>', leftPos);
        if (lnc < 0) { leftPos = html.length; break; }
        if (lnd >= 0 && lnd < lnc) { leftDepth++; leftPos = lnd + 4; }
        else { if (leftDepth === 0) { leftPos = lnc + 6; break; } leftDepth--; leftPos = lnc + 6; }
      }
      var rightInner = extractColContent2(html, 'js-two-col-right', leftPos);
      var leftBlocks  = parseColEl(leftInner);
      var rightBlocks = parseColEl(rightInner);
      return makeBlock('twoColumn',{split:splitM?splitM[1]:'1fr 1fr',gap:gapM?parseInt(gapM[1]):24,leftBlocks:leftBlocks,rightBlocks:rightBlocks});
    }
    if (html.match(/class="js-divider"/))    return makeBlock('divider', {});
    var callout = html.match(/class="js-callout-bar\s*(\w*)"[\s\S]*?class="js-callout-label">([^<]+)<[\s\S]*?class="js-callout-text">([^<]+)</);
    if (callout) return makeBlock('callout', { style: callout[1], label: callout[2], text: callout[3] });
    var quote = html.match(/js-hero-quote-text[^>]*>([^<]+)</);
    if (quote) return makeBlock('quote', { text: quote[1] });
    var bannerTitle = html.match(/js-section-banner-title[^>]*>([^<]+)</);
    if (bannerTitle) {
      var bEye = html.match(/js-section-banner-eyebrow[^>]*>([^<]+)</);
      var bSub = html.match(/js-section-banner-sub[^>]*>([^<]+)</);
      return makeBlock('sectionBanner', { eyebrow: bEye?bEye[1]:'', title: bannerTitle[1], sub: bSub?bSub[1]:'' });
    }
    if (html.match(/class="js-key-combo"/)) {
      var keys = [];
      var km = html.match(/<span class="js-key">([^<]+)<\/span>|<span class="js-input-plus">[^<]+<\/span>/g)||[];
      km.forEach(function(m) { if (m.indexOf('js-input-plus')>=0) keys.push({type:'plus'}); else { var t=m.match(/>([^<]+)</); if(t) keys.push({type:'key',label:t[1]}); } });
      var capM = html.match(/js-key-combo-caption[^>]*>([^<]+)</);
      return makeBlock('keyCombo', { keys: keys, caption: capM?capM[1]:'' });
    }
    if (html.match(/class="js-tech-credit"/)) {
      var tcN = html.match(/js-tech-credit-name[^>]*>([^<]+)</);
      var tcM = html.match(/js-tech-credit-meta[^>]*>([^<]+)</);
      var mp = tcM ? tcM[1].split(' · ') : [];
      return makeBlock('techCredit', { name: tcN?tcN[1]:'', hero: mp[0]||'', date: mp[1]||'' });
    }
    if (html.match(/<details/)) {
      var sM = html.match(/js-collapsible-title[^>]*>([^<]+)</);
      var bM = html.match(/js-collapsible-body[\s\S]*?<p>([^<]+)<\/p>/);
      return makeBlock('collapsible', { title: sM?sM[1]:'', text: bM?bM[1]:'' });
    }
    if (html.match(/class="js-tab-group"/)) {
      /* Extract tab buttons and panels by scanning for js-tab-btn and js-tab-panel */
      var tabs = [];
      var btnRe = /js-tab-btn[^>]*>([^<]+)</g; var btnM;
      var panRe = /<div[^>]*js-tab-panel[^>]*>\s*<p>([^<]*)<\/p>/g; var panM;
      var labels = []; while ((btnM = btnRe.exec(html)) !== null) labels.push(btnM[1]);
      var contents = []; while ((panM = panRe.exec(html)) !== null) contents.push(panM[1]);
      labels.forEach(function(l,i){ tabs.push({label:l, content:contents[i]||''}); });
      return makeBlock('tabGroup', { tabs: tabs.length?tabs:getDefaultData('tabGroup').tabs });
    }
    if (html.match(/class="js-page-nav"/)) {
      var links = [];
      var lnkRe = /href="#([^"]+)"[^>]*>([^<]+)</g; var lnkM;
      while ((lnkM = lnkRe.exec(html)) !== null) links.push({anchor:lnkM[1], label:lnkM[2]});
      return makeBlock('pageNav', { links: links.length?links:getDefaultData('pageNav').links });
    }
    if (html.match(/class="js-related"/)) {

      var cards = [];
      var ci = html.indexOf('class="js-related-card"');
      while (ci >= 0) {
        var aStart = ci; while (aStart > 0 && html[aStart] !== '<') aStart--;
        var aEnd = html.indexOf('</a>', ci) + 4;
        var cardEl = html.substring(aStart, aEnd);
        var hM=cardEl.match(/href="([^"]*)"/); var nM=cardEl.match(/js-related-card-name[^>]*>([^<]+)</); var dM=cardEl.match(/js-related-card-desc[^>]*>([^<]+)</);
        cards.push({href:hM?hM[1]:'#', name:nM?nM[1]:'Page', desc:dM?dM[1]:''});
        ci = html.indexOf('class="js-related-card"', aEnd);
      }
      return makeBlock('relatedCards', { cards: cards.length?cards:getDefaultData('relatedCards').cards });
    }
    /* ── ITEM BLOCK 2 ── */
    if (html.match(/class="js-item-block2"/)) {
      var typeM = html.match(/data-type="([^"]+)"/);
      var nameM = html.match(/js-ib-name[^>]*>([^<]+)</);
      var badgeValM = html.match(/js-ib-badge-val[^>]*>([^<]+)</);
      var badgeLblM = html.match(/js-ib-badge-label[^>]*>([^<]+)</);
      var costM = html.match(/js-ib-cost[^>]*>\$\s*([^<]+)</);
      var tierM = html.match(/js-ib-tier[^>]*>Tier\s*([^<]+)</);
var pstats = [];
      var pstatRe = /class="js-ib-pstat"[^>]*>([\s\S]*?)<\/div>/g; var pm;
      while ((pm=pstatRe.exec(html))!==null) pstats.push(pm[1]);
      var hasPassiveM = html.match(/js-ib-section-label[^>]*>Passive</);
      var hasActiveM  = html.match(/js-ib-section-label[^>]*>Active</);
      var passDescM = html.match(/js-ib-desc[^>]*>([^<]+)</);
      var activeDescMs = html.match(/js-ib-desc[^>]*>([^<]+)</g)||[];
      var activeDescM = activeDescMs[hasPassiveM&&activeDescMs.length>1?1:0];
      var activeCdM = html.match(/js-ib-cooldown[^>]*>⏱\s*([^<]+)</);
      var durationM = html.match(/js-ib-duration[^>]*>([^<]+)s Duration</);
      /* Stat chips */
      var statChips = [];
      var chipRe = /js-ib-chip">/g; var cm;
      var chipIconRe = /js-ib-chip-icon[^>]*>([^<]+)</g;
      var chipValRe  = /js-ib-chip-value[^>]*>([^<]+)</g;
      var chipLblRe  = /js-ib-chip-label[^>]*>([^<]+)</g;
      var chipCondRe = /js-ib-chip-cond[^>]*>([^<]+)</g;
      var ciArr=[], cvArr=[], clArr=[], ccArr=[];
      var cim; while((cim=chipIconRe.exec(html))!==null) ciArr.push(cim[1]);
      var cvm; while((cvm=chipValRe.exec(html))!==null) cvArr.push(cvm[1]);
      var clm; while((clm=chipLblRe.exec(html))!==null) clArr.push(clm[1]);
      var ccm; while((ccm=chipCondRe.exec(html))!==null) ccArr.push(ccm[1]);
      for (var ci3=0;ci3<cvArr.length;ci3++) statChips.push({icon:'move',value:cvArr[ci3],label:clArr[ci3]||'',cond:ccArr[ci3]||''});
      var iconUrlM = html.match(/data-icon="([^"]+)"/);
      var iconNameM = html.match(/data-icon-name="([^"]+)"/);
      return makeBlock('itemBlock', {
        name: nameM?nameM[1]:'Item', type: typeM?typeM[1]:'weapon', tier: tierM?tierM[1].trim():'1',
        cost: costM?costM[1].trim():'500', badge: badgeValM?badgeValM[1]:'+10%',
        badgeLabel: badgeLblM?badgeLblM[1]:'Weapon Damage', badgeIcon: 'weapon',
        passiveStats: pstats, hasPassive: !!hasPassiveM, passiveDesc: passDescM?passDescM[1]:'',
        hasActive: !!hasActiveM, activeCooldown: activeCdM?activeCdM[1].trim():'15s',
        activeDesc: activeDescM?(activeDescM.match(/[^>]+>([^<]+)/)||[])[1]||'':'',
        statChips: statChips, duration: durationM?durationM[1]:'',
        iconUrl: iconUrlM?iconUrlM[1]:'', iconName: iconNameM?iconNameM[1]:'',
      });
    }
    /* legacy item block */
    var iN = html.match(/js-item-block-name[^>]*>([^<]+)</);
    if (iN) {
      var iC=html.match(/js-item-block-category[^>]*>([^<]+)</); var iCo=html.match(/js-item-block-cost[^>]*>([^<]+)</); var iD=html.match(/js-item-block-desc[^>]*>([^<]+)</);
      return makeBlock('itemBlock', { name:iN[1], type:'weapon', tier:'1', cost:iCo?iCo[1].replace(' souls',''):'0', badge:'+10%', badgeLabel:'Weapon Damage', badgeIcon:'weapon', passiveStats:[], hasPassive:false, passiveDesc:'', hasActive:false, activeCooldown:'15s', activeDesc:iD?iD[1]:'', statChips:[], duration:'' });
    }

    /* ── ABILITY BLOCK 2 ── */
    if (html.match(/class="js-ability-block2"/)) {
      var abNameM = html.match(/js-ab-name[^>]*>([^<]+)</);
      var abCdM   = html.match(/js-ab-cd[^>]*>⏱\s*([^<]+)</);
      var abDescM = html.match(/js-ab-desc[^>]*>([\s\S]*?)<\/p>/);
      var abAltM  = html.match(/js-ab-altcast[^>]*>([^<]+)</);
      /* Pills */
      var statPills = [];
      var pilValRe=/js-ab-pill-value[^>]*>([^<]+)</g; var pilLblRe=/js-ab-pill-label[^>]*>([^<]+)</g;
      var pvArr=[],plArr=[]; var pvm2; while((pvm2=pilValRe.exec(html))!==null) pvArr.push(pvm2[1]);
      var plm; while((plm=pilLblRe.exec(html))!==null) plArr.push(plm[1]);
      for(var pi3=0;pi3<pvArr.length;pi3++) statPills.push({icon:'range',value:pvArr[pi3],label:plArr[pi3]||''});
      /* Stat grid */
      var statGrid = [];
      var gridRe = /js-ab-stat[^"]*"[^>]*>/g; var gridValRe=/js-ab-stat-value[^>]*>([^<]+)</g; var gridLblRe=/js-ab-stat-label[^>]*>([^<]+)</g;
      var gvArr=[],glArr=[]; var gvm; while((gvm=gridValRe.exec(html))!==null) gvArr.push(gvm[1]);
      var glm; while((glm=gridLblRe.exec(html))!==null) glArr.push(glm[1]);
      for(var gi2=0;gi2<gvArr.length;gi2++) statGrid.push({icon:'spirit',value:gvArr[gi2],label:glArr[gi2]||'',highlight:false});
      /* Upgrades */
      var upgrades = [];
      var uCostRe=/js-ab-upgrade-cost[^>]*>⚡([^<]+)</g; var uValRe=/js-ab-upgrade-value[^>]*>([^<]+)</g; var uLblRe=/js-ab-upgrade-label[^>]*>([^<]+)</g;
      var ucArr=[],uvArr=[],ulArr=[]; var ucm; while((ucm=uCostRe.exec(html))!==null) ucArr.push(ucm[1]);
      var uvm; while((uvm=uValRe.exec(html))!==null) uvArr.push(uvm[1]);
      var ulm; while((ulm=uLblRe.exec(html))!==null) ulArr.push(ulm[1]);
      for(var ui2=0;ui2<ucArr.length;ui2++) upgrades.push({cost:ucArr[ui2],value:uvArr[ui2]||'',label:ulArr[ui2]||''});
      var abIconM = html.match(/data-icon="([^"]+)"/);
      var abIconHeroM = html.match(/data-icon-hero="([^"]+)"/);
      var abIconFileM = html.match(/data-icon-file="([^"]+)"/);
      return makeBlock('abilityBlock', {
        name: abNameM?abNameM[1]:'Ability', cooldown: abCdM?abCdM[1].trim():'0s',
        statPills: statPills, desc: abDescM?abDescM[1]:'', altCast: abAltM?abAltM[1]:'',
        statGrid: statGrid, upgrades: upgrades,
        iconUrl: abIconM?abIconM[1]:'', iconHero: abIconHeroM?abIconHeroM[1]:'', iconFile: abIconFileM?abIconFileM[1]:'',
      });
    }
    /* legacy ability block */
    var abN = html.match(/js-ability-block-name[^>]*>([^<]+)</);
    if (abN) {
      var abD=html.match(/js-ability-block-desc[^>]*>([^<]+)</); var abCd=html.match(/↻\s*([^<]+)</);
      return makeBlock('abilityBlock', { name:abN[1], cooldown:abCd?abCd[1].trim():'0s', statPills:[], desc:abD?abD[1]:'', altCast:'', statGrid:[], upgrades:[] });
    }
    var chartTitle = html.match(/data-title="([^"]+)"/);
    if (chartTitle && html.includes('js-bar-row')) {

      var bars = [];
      var bri = html.indexOf('class="js-bar-row"');
      while (bri >= 0) {
        var brStart = bri; while (brStart > 0 && html[brStart] !== '<') brStart--;
        var brOpen = html.indexOf('>', brStart) + 1;
        var brdepth = 0, brj = brOpen;
        while (brj < html.length) {
          var brnd = html.indexOf('<div', brj); var brnc = html.indexOf('</div>', brj);
          if (brnc < 0) { brj = html.length; break; }
          if (brnd >= 0 && brnd < brnc) { brdepth++; brj = brnd + 4; }
          else { if (brdepth === 0) { brj = brnc + 6; break; } brdepth--; brj = brnc + 6; }
        }
        var brEl = html.substring(brStart, brj);
        var lM=brEl.match(/js-bar-label[^>]*>([^<]+)</); var vM=brEl.match(/js-bar-val[^>]*>([^<]+)</);
        if (lM && vM) bars.push({label:lM[1], val:parseFloat(vM[1])||0});
        bri = html.indexOf('class="js-bar-row"', brj);
      }
      if (!bars.length) bars = getDefaultData('barChart').bars;
      return makeBlock('barChart', { title: chartTitle[1], max: Math.max.apply(null,bars.map(function(b){return b.val;}))||100, bars: bars });
    }
    if (html.match(/class="js-video-grid"/)) {
      var vcM=html.match(/repeat\((\d+)/); var vids=[];

      var vbi = html.indexOf('class="js-video-block"');
      while (vbi >= 0) {
        var vbStart = vbi; while (vbStart > 0 && html[vbStart] !== '<') vbStart--;
        var vbOpen = html.indexOf('>', vbStart) + 1;
        var vbdepth = 0, vbj = vbOpen;
        while (vbj < html.length) {
          var vbnd = html.indexOf('<div', vbj); var vbnc = html.indexOf('</div>', vbj);
          if (vbnc < 0) { vbj = html.length; break; }
          if (vbnd >= 0 && vbnd < vbnc) { vbdepth++; vbj = vbnd + 4; }
          else { if (vbdepth === 0) { vbj = vbnc + 6; break; } vbdepth--; vbj = vbnc + 6; }
        }
        var vbEl = html.substring(vbStart, vbj);
        var s=vbEl.match(/source src="([^"]+)"/); var c=vbEl.match(/js-video-caption[^>]*>([^<]+)</);
        vids.push({src:s?s[1]:'', caption:c?c[1]:''});
        vbi = html.indexOf('class="js-video-block"', vbj);
      }
      return makeBlock('videoGrid', { cols: vcM?parseInt(vcM[1]):2, videos: vids });
    }
    if (html.match(/class="js-image-grid"/)) {
      var igcM=html.match(/repeat\((\d+)/); var imgs=[];
      /* Extract each js-image-block using indexOf */
      var ibi = html.indexOf('class="js-image-block"');
      while (ibi >= 0) {
        var ibStart = ibi; while (ibStart > 0 && html[ibStart] !== '<') ibStart--;
        var ibOpen = html.indexOf('>', ibStart) + 1;
        var ibdepth = 0, ibj = ibOpen;
        while (ibj < html.length) {
          var ibnd = html.indexOf('<div', ibj); var ibnc = html.indexOf('</div>', ibj);
          if (ibnc < 0) { ibj = html.length; break; }
          if (ibnd >= 0 && ibnd < ibnc) { ibdepth++; ibj = ibnd + 4; }
          else { if (ibdepth === 0) { ibj = ibnc + 6; break; } ibdepth--; ibj = ibnc + 6; }
        }
        var ibEl = html.substring(ibStart, ibj);
        var s2=ibEl.match(/<img src="([^"]+)"/); var a2=ibEl.match(/alt="([^"]+)"/); var c2=ibEl.match(/js-image-caption[^>]*>([^<]+)</);
        imgs.push({src:s2?s2[1]:'', alt:a2?a2[1]:'', caption:c2?c2[1]:''});
        ibi = html.indexOf('class="js-image-block"', ibj);
      }
      return makeBlock('imageGrid', { cols: igcM?parseInt(igcM[1]):2, images: imgs });
    }
    if (html.match(/class="js-steps"/)) {
      /* Extract each <div class="js-step"> using depth counting */
      var steps = [];
      var si = html.indexOf('<div class="js-step">');
      while (si >= 0) {
        var sOpen = html.indexOf('>', si) + 1;
        var depth = 0, sj = sOpen;
        while (sj < html.length) {
          var snd = html.indexOf('<div', sj);
          var snc = html.indexOf('</div>', sj);
          if (snc < 0) { sj = html.length; break; }
          if (snd >= 0 && snd < snc) { depth++; sj = snd + 4; }
          else { if (depth === 0) { sj = snc + 6; break; } depth--; sj = snc + 6; }
        }
        var stepEl = html.substring(si, sj);
        var t = stepEl.match(/js-step-title[^>]*>([^<]+)</);
        var desc = stepEl.match(/js-step-desc[^>]*>([^<]+)</);
        steps.push({title:t?t[1]:'Step', desc:desc?desc[1]:''});
        si = html.indexOf('<div class="js-step">', sj);
      }
      return makeBlock('steps', { steps: steps.length?steps:getDefaultData('steps').steps });
    }
    if (html.match(/class="js-inline-image"/)) {
      var imgSrc=html.match(/<img src="([^"]+)"/); var imgCap=html.match(/js-image-caption[^>]*>([^<]+)</);
      var imgW=html.match(/width:([^;'"]+)/); var imgAl=html.match(/text-align:([^"']+)/);
      return makeBlock('inlineImage',{src:imgSrc?imgSrc[1]:'',caption:imgCap?imgCap[1]:'',width:imgW?imgW[1].trim():'100%',align:imgAl?imgAl[1].trim():'center'});
    }
    if (html.match(/class="js-input-table"/)) {

      var rows = [];
      var tri = html.indexOf('<tr>', html.indexOf('<tbody>') > 0 ? html.indexOf('<tbody>') : 0);
      while (tri >= 0) {
        var trEnd = html.indexOf('</tr>', tri) + 5;
        var trEl = html.substring(tri, trEnd);
        var tds = []; var tdi = trEl.indexOf('<td');
        while (tdi >= 0) {
          var tdOpen = trEl.indexOf('>', tdi) + 1;
          var tdClose = trEl.indexOf('</td>', tdOpen);
          tds.push(trEl.substring(tdOpen, tdClose).replace(/<[^>]+>/g,'').trim());
          tdi = trEl.indexOf('<td', tdClose + 5);
        }
        if (tds.length >= 4) rows.push({action:tds[0],input:tds[1],timing:tds[2],notes:tds[3]});
        tri = html.indexOf('<tr>', trEnd);
      }
      return makeBlock('inputTable', { rows: rows.length?rows:getDefaultData('inputTable').rows });
    }
    if (html.match(/class="js-stat-table"/)) {
      var srows = [];
      var stri = html.indexOf('<tr>', html.indexOf('<tbody>') > 0 ? html.indexOf('<tbody>') : 0);
      while (stri >= 0) {
        var strEnd = html.indexOf('</tr>', stri) + 5;
        var strEl = html.substring(stri, strEnd);
        var stds = []; var stdi = strEl.indexOf('<td');
        while (stdi >= 0) {
          var stdOpen = strEl.indexOf('>', stdi) + 1;
          var stdClose = strEl.indexOf('</td>', stdOpen);
          stds.push(strEl.substring(stdOpen, stdClose).replace(/<[^>]+>/g,'').trim());
          stdi = strEl.indexOf('<td', stdClose + 5);
        }
        if (stds.length >= 2) srows.push({metric:stds[0],base:stds[1],with:stds[2]||''});
        stri = html.indexOf('<tr>', strEnd);
      }
      return makeBlock('statTable', { rows: srows.length?srows:getDefaultData('statTable').rows });
    }
    if (html.match(/class="js-key-combo"/)) {
      var keys2 = [];
      var km2 = html.match(/<span class="js-key">([^<]+)<\/span>|<span class="js-input-plus">[^<]+<\/span>/g)||[];
      km2.forEach(function(m) { if (m.indexOf('js-input-plus')>=0) keys2.push({type:'plus'}); else { var t=m.match(/>([^<]+)</); if(t) keys2.push({type:'key',label:t[1]}); } });
      var capM2 = html.match(/js-key-combo-caption[^>]*>([^<]+)</);
      return makeBlock('keyCombo', { keys: keys2, caption: capM2?capM2[1]:'' });
    }
    /* Plain <p> tag (from blockToHtml paragraph serialization) */
    if (/^<p[\s>]/.test(html)) {
      var inner = html.replace(/^<p[^>]*>/, '').replace(/<\/p>$/, '');
      return makeBlock('paragraph', { text: inner });
    }
    /* Plain heading tags */
    var hm = html.match(/^<h([1-4])[^>]*>([\s\S]*?)<\/h[1-4]>$/);
    if (hm) {
      var lvl = parseInt(hm[1]);
      var types = ['heading1','heading2','heading3','heading4'];
      return makeBlock(types[lvl-1]||'heading1', { text: hm[2] });
    }
    return makeBlock('raw', { markup: '<html>\n' + html + '\n</html>\n' });
  }



  function renderAttachmentPanel(block) {
    var att = block.attachment;
    if (!att) return '';
    var w = (att.width || 320) + 'px';
    var inner = '';
    if (att.type === 'callout') {
      var cs = att.calloutStyle || 'tip';
      var cl = att.calloutLabel || 'Tip';
      var ct = att.calloutText  || '';
      inner = '<div class="js-callout"><div class="js-callout-bar '+cs+'"></div><div class="js-callout-inner"><span class="js-callout-label">'+cl+'</span><p class="js-callout-text">'+ct+'</p></div></div>';
    } else if (att.type === 'video') {
      inner = att.src
        ? '<div class="js-video-wrap"><video autoplay muted loop playsinline><source src="'+att.src+'" type="video/mp4"></video></div>'
        : '<div class="jw-att-no-media">▶ No video — click to edit</div>';
    } else if (att.type === 'imageGrid') {
      var cells = (att.images||[]).map(function(img) {
        return '<div class="jw-att-grid-cell">'+(img.src?'<img src="'+img.src+'" style="width:100%;height:auto;display:block;border-radius:3px;">':'<div class="jw-att-no-media" style="height:60px;font-size:0.7rem">🖼</div>')+'</div>';
      }).join('');
      inner = '<div style="display:grid;grid-template-columns:repeat('+(att.cols||2)+',1fr);gap:4px;">'+cells+'</div>';
    } else {
      inner = att.src
        ? '<img src="'+att.src+'" style="width:100%;height:auto;display:block;" alt="'+(att.caption||'')+'">'
        : '<div class="jw-att-no-media">🖼 Click to add image</div>';
    }
    var caption = att.caption ? '<div class="jw-att-float-caption">'+att.caption+'</div>' : '';
    var resizeHandle = '<div class="jw-att-resize-handle" title="Drag to resize">↔</div>';
    return '<div class="jw-att-float" style="width:'+w+';" data-att-edit="true">'+inner+caption+resizeHandle+'</div>';
  }



  function renderBlockContent(block) {
    var d = block.data;
    switch (block.type) {
      case 'heading1': return '<h1 class="jw-heading jw-h1" contenteditable="true" data-field="text">'+escHtml(d.text)+'</h1>';
      case 'heading2': return '<h2 class="jw-heading jw-h2" contenteditable="true" data-field="text">'+escHtml(d.text)+'</h2>';
      case 'heading3': return '<h3 class="jw-heading jw-h3" contenteditable="true" data-field="text">'+escHtml(d.text)+'</h3>';
      case 'paragraph': return '<p class="jw-paragraph" contenteditable="true" data-field="text">'+escHtml(d.text)+'</p>';
      case 'divider': return '<hr class="js-divider jw-divider">';
      case 'quote': return '<div class="js-hero-quote jw-quote-block"><span class="js-hero-quote-mark">"</span><span class="js-hero-quote-text" contenteditable="true" data-field="text">'+escHtml(d.text)+'</span></div>';
      case 'sectionBanner': return '<div class="js-section-banner"><div class="js-section-banner-inner"><span class="js-section-banner-eyebrow" contenteditable="true" data-field="eyebrow">'+escHtml(d.eyebrow)+'</span><h2 class="js-section-banner-title" contenteditable="true" data-field="title">'+escHtml(d.title)+'</h2><p class="js-section-banner-sub" contenteditable="true" data-field="sub">'+escHtml(d.sub)+'</p></div></div>';
      case 'callout': return '<div class="js-callout"><div class="js-callout-bar '+d.style+'"></div><div class="js-callout-inner"><span class="js-callout-label" contenteditable="true" data-field="label">'+escHtml(d.label)+'</span><p class="js-callout-text" contenteditable="true" data-field="text">'+escHtml(d.text)+'</p></div></div>';
      case 'steps': return renderSteps(block);
      case 'inputTable': return renderInputTable(block);
      case 'statTable': return '<table class="js-stat-table"><thead><tr><th>Metric</th><th>Base</th><th>With Technique</th><th>Notes</th></tr></thead><tbody>'+d.rows.map(function(r,i){return '<tr data-row-idx="'+i+'"><td contenteditable="true" data-field="metric">'+escHtml(r.metric)+'</td><td contenteditable="true" data-field="base">'+escHtml(r.base)+'</td><td><span class="js-stat-val" contenteditable="true" data-field="with">'+escHtml(r.with)+'</span></td><td><span class="js-stat-note" contenteditable="true" data-field="notes">'+escHtml(r.notes)+'</span></td></tr>';}).join('')+'</tbody></table>'+
        '<div class="jw-table-footer"><button class="jw-row-add-btn" data-table="stat">+ Row</button></div>';
      case 'barChart': return '<div class="js-bar-chart"><div class="js-bar-chart-inner">'+d.bars.map(function(b,i){var pct=Math.round((b.val/(d.max||100))*100);return '<div class="js-bar-row" data-bar-idx="'+i+'"><span class="js-bar-label" contenteditable="true" data-field="bar-label">'+escHtml(b.label)+'</span><div class="js-bar-track"><div class="js-bar-fill jw-bar-fill" style="width:'+pct+'%"></div></div><span class="js-bar-val" contenteditable="true" data-field="bar-val">'+b.val+'</span><button class="jw-row-remove-btn" data-bar-idx="'+i+'">✕</button></div>';}).join('')+'</div></div>'+
        '<div class="jw-table-footer"><button class="jw-row-add-btn" data-table="bar">+ Bar</button></div>';
      case 'videoGrid': return renderVideoGrid(block);
      case 'imageGrid': return renderImageGrid(block);
      case 'keyCombo': return renderKeyCombo(block);
      case 'techCredit': return '<div class="js-tech-credit"><div class="js-tech-credit-avatar"></div><div class="js-tech-credit-info"><span class="js-tech-credit-label">Discovered by</span><span class="js-tech-credit-name" contenteditable="true" data-field="name">'+escHtml(d.name)+'</span><span class="js-tech-credit-meta"><span contenteditable="true" data-field="hero">'+escHtml(d.hero)+'</span> · <span contenteditable="true" data-field="date">'+escHtml(d.date)+'</span></span></div></div>';
      case 'collapsible': return '<details class="js-collapsible" open><summary class="js-collapsible-title" contenteditable="true" data-field="title">'+escHtml(d.title)+'</summary><div class="js-collapsible-body"><p contenteditable="true" data-field="text">'+escHtml(d.text)+'</p></div></details>';
      case 'tabGroup': return renderTabGroup(block);
      case 'pageNav': return renderPageNav(block);
      case 'itemBlock': return renderItemBlock2(d);
      case 'abilityBlock': return renderAbilityBlock2(d);
      case 'relatedCards': return renderRelatedCards(block);
      case 'inlineImage': return renderInlineImage(block);
      case 'twoColumn':   return renderTwoColumn(block);
      case 'raw': return '<div class="jw-raw-block"><pre class="jw-raw-pre" contenteditable="true" spellcheck="false">'+escHtml(d.markup)+'</pre></div>';
      default: return '<div>'+escHtml(JSON.stringify(d))+'</div>';
    }
  }

  function renderSteps(block) {
    var d = block.data;
    var rows = d.steps.map(function(s,i){
      return '<div class="js-step" data-step-idx="'+i+'">' +
        '<div class="js-step-num">0'+(i+1)+'</div>' +
        '<div class="js-step-content">' +
          '<div class="js-step-title" contenteditable="true" data-field="step-title">'+escHtml(s.title)+'</div>' +
          '<p class="js-step-desc" contenteditable="true" data-field="step-desc">'+escHtml(s.desc)+'</p>' +
        '</div>' +
        '<button class="jw-row-remove-btn jw-step-remove" data-step-idx="'+i+'" title="Remove step">✕</button>' +
      '</div>';
    }).join('');
    return '<div class="js-steps">'+rows+'</div>' +
      '<div class="jw-table-footer"><button class="jw-step-add-btn">+ Add Step</button></div>';
  }

  function renderInputTable(block) {
    var d = block.data;
    var rows = d.rows.map(function(r,i){
      return '<tr data-row-idx="'+i+'">' +
        '<td contenteditable="true" data-field="action">'+escHtml(r.action)+'</td>' +
        '<td><span class="js-key" contenteditable="true" data-field="input">'+escHtml(r.input)+'</span></td>' +
        '<td contenteditable="true" data-field="timing">'+escHtml(r.timing)+'</td>' +
        '<td contenteditable="true" data-field="notes">'+escHtml(r.notes)+'</td>' +
        '<td><button class="jw-row-remove-btn" data-row-idx="'+i+'" data-table="input">✕</button></td>' +
      '</tr>';
    }).join('');
    return '<table class="js-input-table"><thead><tr><th>Action</th><th>Input</th><th>Timing</th><th>Notes</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>' +
      '<div class="jw-table-footer"><button class="jw-row-add-btn" data-table="input">+ Row</button></div>';
  }

  function renderKeyCombo(block) {
    var d = block.data;
    var keys = (d.keys||[]).map(function(k,ki){
      if (k.type === 'plus') return '<span class="js-input-plus" data-key-idx="'+ki+'">+</span>';
      return '<span class="js-key jw-key-editable" contenteditable="true" data-key-idx="'+ki+'">'+escHtml(k.label)+'</span>' +
             '<button class="jw-key-remove-btn" data-key-idx="'+ki+'" title="Remove">✕</button>';
    }).join('');
    return '<div class="js-key-combo jw-key-combo-wrap">' + keys +
      '<div class="jw-key-combo-actions">' +
        '<button class="jw-key-add-btn">+ Key</button>' +
        '<button class="jw-key-add-plus-btn">+ Plus</button>' +
      '</div>' +
      (d.caption !== undefined ? '<span class="js-key-combo-caption" contenteditable="true" data-field="caption">'+escHtml(d.caption)+'</span>' : '') +
    '</div>';
  }

  function renderRelatedCards(block) {
    var d = block.data;
    var cards = (d.cards||[]).map(function(c,ci){
      return '<div class="js-related-card jw-related-card-edit" data-card-idx="'+ci+'">' +
        '<span class="js-related-card-name" contenteditable="true" data-field="card-name" data-card-idx="'+ci+'">'+escHtml(c.name)+'</span>' +
        '<span class="js-related-card-desc" contenteditable="true" data-field="card-desc" data-card-idx="'+ci+'">'+escHtml(c.desc)+'</span>' +
        '<input class="jw-related-href" type="text" placeholder="URL or #anchor" value="'+escHtml(c.href||'#')+'" data-card-idx="'+ci+'">' +
        '<button class="jw-row-remove-btn" data-card-idx="'+ci+'" data-table="related">✕</button>' +
      '</div>';
    }).join('');
    return '<div class="js-related">'+cards+'</div>' +
      '<div class="jw-table-footer"><button class="jw-related-add-btn">+ Add Card</button></div>';
  }

  function renderVideoGrid(block) {
    var d = block.data, cols = d.cols||2;
    var items = (d.videos||[]).map(function(v,vi){
      return '<div class="js-video-block">' +
        '<div class="jw-grid-item-toolbar"><button class="jw-media-btn jw-upload-btn" data-media-type="video" data-vg-idx="'+vi+'">📁</button><span class="jw-media-src">'+escHtml(v.src?(v.src.split('media=')[1]||v.src):'No file')+'</span><button class="jw-row-remove-btn" data-vg-idx="'+vi+'" data-table="video">✕</button></div>' +
        (v.src?'<div class="js-video-wrap"><video autoplay muted loop playsinline><source src="'+v.src+'" type="video/mp4"></video></div>':'<div class="jw-media-empty">▶ No video</div>') +
        '<div class="js-video-caption" contenteditable="true" data-vg-cap-idx="'+vi+'">'+escHtml(v.caption)+'</div>' +
      '</div>';
    }).join('');
    return '<div class="jw-grid-block"><div class="jw-grid-toolbar"><span class="jw-grid-label">Video Grid</span><label class="jw-grid-cols-label">Cols: <input type="number" class="jw-grid-cols-input" data-field="cols" value="'+cols+'" min="1" max="4" style="width:40px"></label><button class="jw-media-btn jw-grid-add" data-add-type="video">+ Add</button></div><div class="js-video-grid" style="grid-template-columns:repeat('+cols+',1fr)">'+items+'</div></div>';
  }

  function renderImageGrid(block) {
    var d = block.data, cols = d.cols||2;
    var items = (d.images||[]).map(function(img,ii){
      return '<div class="js-image-block">' +
        '<div class="jw-grid-item-toolbar"><button class="jw-media-btn jw-upload-btn" data-media-type="image" data-ig-idx="'+ii+'">📁</button><span class="jw-media-src">'+escHtml(img.src?(img.src.split('media=')[1]||img.src):'No file')+'</span><button class="jw-row-remove-btn" data-ig-idx="'+ii+'" data-table="image">✕</button></div>' +
        (img.src?'<img src="'+img.src+'" alt="'+escHtml(img.alt||'')+'" class="js-image">':'<div class="jw-media-empty">🖼 No image</div>') +
        '<div class="js-image-caption" contenteditable="true" data-ig-cap-idx="'+ii+'">'+escHtml(img.caption)+'</div>' +
      '</div>';
    }).join('');
    return '<div class="jw-grid-block"><div class="jw-grid-toolbar"><span class="jw-grid-label">Image Grid</span><label class="jw-grid-cols-label">Cols: <input type="number" class="jw-grid-cols-input" data-field="cols" value="'+cols+'" min="1" max="4" style="width:40px"></label><button class="jw-media-btn jw-grid-add" data-add-type="image">+ Add</button></div><div class="js-image-grid" style="grid-template-columns:repeat('+cols+',1fr)">'+items+'</div></div>';
  }

  function renderTabGroup(block) {
    var d=block.data, tgId=block.id;
    var btns = (d.tabs||[]).map(function(t,i){
      return '<button class="js-tab-btn'+(i===0?' js-tab-active':'')+'" data-tab-target="'+tgId+'-'+i+'" data-tab-idx="'+i+'">' +
        '<span contenteditable="true" data-tab-label-idx="'+i+'">'+escHtml(t.label)+'</span>' +
        '<span class="jw-tab-remove" data-tab-idx="'+i+'" title="Remove tab">✕</span>' +
      '</button>';
    }).join('');
    var panels = (d.tabs||[]).map(function(t,i){
      return '<div class="js-tab-panel'+(i===0?' js-tab-panel-active':'')+'" id="'+tgId+'-'+i+'">' +
        '<p contenteditable="true" data-tab-content-idx="'+i+'">'+escHtml(t.content)+'</p>' +
      '</div>';
    }).join('');
    return '<div class="js-tab-group" data-tg-id="'+tgId+'">' +
      '<div class="js-tab-bar">'+btns+'<button class="jw-tab-add-btn">+ Tab</button></div>' +
      '<div class="js-tab-panels">'+panels+'</div>' +
    '</div>';
  }

  function renderPageNav(block) {
    var d=block.data;
    var rows = (d.links||[]).map(function(l,li){
      return '<div class="jw-page-nav-row" data-nav-idx="'+li+'">' +
        '<span class="js-page-nav-link">#<span contenteditable="true" data-field="anchor">'+escHtml(l.anchor)+'</span> — <span contenteditable="true" data-field="nav-label">'+escHtml(l.label)+'</span></span>' +
        '<button class="jw-nav-remove-btn" data-nav-idx="'+li+'">✕</button>' +
      '</div>';
    }).join('');
    return '<nav class="js-page-nav jw-page-nav-edit"><span class="js-page-nav-label">On this page</span>'+rows+'<button class="jw-nav-add-btn">+ Add Link</button></nav>';
  }

  function renderInlineImage(block) {
    var d = block.data;
    var wStyle = d.width ? 'width:'+d.width+';' : 'width:100%;';
    var aStyle = d.align === 'center' ? 'margin:0 auto;' : d.align === 'right' ? 'margin-left:auto;' : '';
    var imgHtml = d.src
      ? '<img src="'+d.src+'" alt="'+(d.caption||'')+'" style="'+wStyle+aStyle+'height:auto;display:block;border-radius:5px;border:1px solid rgba(107,79,187,0.35);">'
      : '<div class="jw-att-no-media" style="min-height:120px;">🖼 No image — click Upload</div>';
    return '<div class="jw-inline-image-block">' +
      '<div class="jw-inline-image-toolbar">' +
        '<button class="jw-media-btn jw-inline-img-upload">📁 Upload Image</button>' +
        '<select class="jw-inline-img-align jw-media-btn" title="Align">' +
          '<option value="left"'+(d.align==='left'?' selected':'')+'>Left</option>' +
          '<option value="center"'+((!d.align||d.align==='center')?' selected':'')+'>Center</option>' +
          '<option value="right"'+(d.align==='right'?' selected':'')+'>Right</option>' +
        '</select>' +
        '<input class="jw-inline-img-width jw-media-btn" type="text" value="'+(d.width||'100%')+'" placeholder="100%" style="width:70px;" title="Width">' +
      '</div>' +
      '<div class="jw-inline-image-wrap">'+imgHtml+'</div>' +
      (d.caption ? '<div class="js-image-caption" contenteditable="true" data-field="caption">'+escHtml(d.caption)+'</div>' : '<div class="js-image-caption" contenteditable="true" data-field="caption" style="opacity:0.4;font-style:italic">Caption (optional)</div>') +
    '</div>';
  }


  /* ── ICON helper — maps icon key to emoji/symbol for editor display ── */
  var ICONS = {
    weapon:'🔫', move:'🏃', ammo:'📦', health:'❤️', spirit:'✨', range:'↔',
    cast:'⌛', dur:'⏱', immob:'⚓', bleed:'🩸', heal:'💊', shield:'🛡',
    bullet:'💠', fire:'🔥', star:'⭐', buff:'⬆', debuff:'⬇',
  };
  function ic(key) { return ICONS[key] || '◆'; }

  /* ── ITEM BLOCK 2 RENDERER ── */
  function renderItemBlock2(d) {
    /* Card body colors matching game exactly */
    var bodyBg   = { weapon:'#2a1f0f', vitality:'#0f1f0f', spirit:'#1a0f2a' };
    var nameBar  = { weapon:'#c8922a', vitality:'#3a9a3a', spirit:'#c040c0' };
    var nameText = { weapon:'#fff8e0', vitality:'#e0ffe0', spirit:'#ffe0ff' };
    var bg   = bodyBg[d.type]  || bodyBg.weapon;
    var nb   = nameBar[d.type] || nameBar.weapon;
    var nt   = nameText[d.type]|| nameText.weapon;

    var pstats = (d.passiveStats||[]).map(function(s,i){
      return '<div class="jw-ib-pstat-wrap">'+
'<div class="jw-ib-pstat-line" contenteditable="true" data-field="pstat-'+i+'">'+s+'</div>'+
        '<button class="jw-ib-pstat-del jw-micro-btn" data-pstat-idx="'+i+'">&#215;</button>'+
      '</div>';
    }).join('');

    var passive = d.hasPassive
      ? '<div class="jw-ib-sec-passive"><i class="jw-ib-sec-italic">Passive</i></div>'+
        '<div class="jw-inline-icon-bar"><button class="jw-trigger-sm jw-inline-icon-trigger" data-target="passiveDesc">&#8853; icon</button></div>'+
        '<p class="jw-ib-desc-p" contenteditable="true" data-field="passiveDesc">'+d.passiveDesc+'</p>'
      : '';

    var active = d.hasActive
      ? '<div class="jw-ib-sec-active">'+
          '<span class="jw-ib-sec-active-lbl">Active</span>'+
          '<span class="jw-ib-cd-pill">&#9203; <span contenteditable="true" data-field="activeCooldown">'+escHtml(d.activeCooldown||'15s')+'</span></span>'+
        '</div>'+
        '<div class="jw-inline-icon-bar"><button class="jw-trigger-sm jw-inline-icon-trigger" data-target="activeDesc">&#8853; icon</button></div>'+
        '<p class="jw-ib-desc-p" contenteditable="true" data-field="activeDesc">'+d.activeDesc+'</p>'
      : '';

    var chips = (d.statChips||[]).map(function(c,i){
      var iu = statIconUrl(c.statKey||c.icon||'damage');
      var icEl = iu ? '<img src="'+escHtml(iu)+'" class="jw-chip-ico" />' : '';
      return '<div class="jw-ib-chip-card">'+
        '<div class="jw-chip-card-inner">'+
          '<div class="jw-chip-card-top">'+icEl+
            '<button class="jw-chip-stat-pick jw-micro-btn" data-chip-idx="'+i+'">&#9881;</button>'+
            '<button class="jw-ib-chip-del jw-micro-btn" data-chip-idx="'+i+'">&#215;</button>'+
          '</div>'+
          '<div class="jw-chip-card-val" contenteditable="true" data-field="chip-val-'+i+'">'+escHtml(c.value)+'</div>'+
          '<div class="jw-chip-card-lbl" contenteditable="true" data-field="chip-lbl-'+i+'">'+escHtml(c.label)+'</div>'+
          (c.cond?'<div class="jw-chip-card-cond" contenteditable="true" data-field="chip-cond-'+i+'">'+escHtml(c.cond)+'</div>':'')+
        '</div>'+
      '</div>';
    }).join('');

    var artEl = d.iconUrl
      ? '<div class="jw-ib-art" style="background-image:url(\''+d.iconUrl.replace(/\'/g,'%27')+'\')"></div>'
      : '<div class="jw-ib-art-empty">+ Image</div>';

    return '<div class="jw-item-block2" data-type="'+escHtml(d.type||'weapon')+'" style="background:'+bg+';">'+

      /* ① NAMEBAR — solid color, name centered */
      '<div class="jw-ib-namebar" style="background:'+nb+';">'+
        '<span class="jw-ib-title" contenteditable="true" data-field="name" style="color:'+nt+';">'+escHtml(d.name)+'</span>'+
        '<div class="jw-ib-badge-box">'+
          '<div class="jw-ib-badge-pct" contenteditable="true" data-field="badge">'+escHtml(d.badge||'+10%')+'</div>'+
          '<div class="jw-ib-badge-cat" contenteditable="true" data-field="badgeLabel">'+escHtml(d.badgeLabel||'Weapon Damage')+'</div>'+
        '</div>'+
      '</div>'+

      /* ② ART — dark square centered */
      '<div class="jw-ib-artbox">'+
        artEl+
        '<div class="jw-ib-artbox-ctrls">'+
          '<button class="jw-ib-icon-pick jw-ctrl-btn">&#128444; Image</button>'+
          '<select class="jw-ib-type jw-ctrl-btn" data-field="type">'+
            ['weapon','vitality','spirit'].map(function(t){
              return '<option value="'+t+'"'+(d.type===t?' selected':'')+'>'+t.charAt(0).toUpperCase()+t.slice(1)+'</option>';
            }).join('')+
          '</select>'+
          '<button class="jw-lib-load-btn jw-ctrl-btn">&#128218;</button>'+
          '<button class="jw-lib-save-btn jw-ctrl-btn">&#128190;</button>'+
        '</div>'+
      '</div>'+

      /* ③ COST / TIER TABLE */
      '<div class="jw-ib-meta-table">'+
        '<div class="jw-ib-meta-row"><span class="jw-ib-meta-lbl">Cost</span><span class="jw-ib-meta-div"></span><span class="jw-ib-cost-val">$ <span contenteditable="true" data-field="cost">'+escHtml(d.cost||'500')+'</span></span></div>'+
        '<div class="jw-ib-meta-row"><span class="jw-ib-meta-lbl">Tier</span><span class="jw-ib-meta-div"></span><span class="jw-ib-tier-val" contenteditable="true" data-field="tier">'+escHtml(d.tier||'1')+'</span></div>'+
      '</div>'+

      /* ④ PASSIVE STATS */
      pstats+

      /* ⑤ PASSIVE / ACTIVE */
      passive+active+

      /* ⑥ CHIPS */
      (chips?'<div class="jw-ib-chips-grid">'+chips+'</div>':'')+

      /* ⑦ DURATION with remove */
      (d.duration
        ? '<div class="jw-ib-dur-wrap"><span class="jw-ib-dur-line"><span contenteditable="true" data-field="duration">'+escHtml(d.duration)+'</span>s Duration</span><button class="jw-ib-dur-del jw-micro-btn" data-action="remove-duration">&#215;</button></div>'
        : '')+

      /* ⑧ CONTROLS */
      '<div class="jw-ib-ctrls-bar">'+
        '<button class="jw-ctrl-btn" data-action="add-pstat">+ Stat</button>'+
        '<button class="jw-ctrl-btn" data-action="add-chip">+ Chip</button>'+
        (!d.duration?'<button class="jw-ctrl-btn" data-action="add-duration">+ Duration</button>':'')+
        '<label class="jw-ctrl-toggle"><input type="checkbox" data-field="hasPassive"'+(d.hasPassive?' checked':'')+'/> Passive</label>'+
        '<label class="jw-ctrl-toggle"><input type="checkbox" data-field="hasActive"'+(d.hasActive?' checked':'')+'/> Active</label>'+
      '</div>'+

    '</div>';
  }


  /* ── ABILITY BLOCK 2 RENDERER ── */
  function renderAbilityBlock2(d) {

    /* Stat pills row — icon box + value */
    var pills = (d.statPills||[]).map(function(p,i){
      return '<div class="jw-ab-pill-box">'+
        '<span class="jw-ab-pill-val" contenteditable="true" data-field="pill-val-'+i+'">'+escHtml(p.value)+'</span>'+
        '<span class="jw-ab-pill-lbl" contenteditable="true" data-field="pill-lbl-'+i+'">'+escHtml(p.label)+'</span>'+
        '<button class="jw-ab-x jw-micro-btn" data-pill-idx="'+i+'">&#215;</button>'+
      '</div>';
    }).join('');

    /* Stat grid — 2 cells */
    var grid = (d.statGrid||[]).map(function(s,i){
      var iu = statIconUrl(s.statKey||s.icon||'damage');
      var icImg = iu ? '<img src="'+escHtml(iu)+'" class="jw-grid-ico" />' : '';
      return '<div class="jw-ab-grid-cell'+(s.highlight?' jw-ab-cell-hl':'')+'">'+
        icImg+
        '<div class="jw-ab-grid-val" contenteditable="true" data-field="grid-val-'+i+'">'+escHtml(s.value)+'</div>'+
        '<div class="jw-ab-grid-lbl" contenteditable="true" data-field="grid-lbl-'+i+'">'+escHtml(s.label)+'</div>'+
        '<div class="jw-ab-grid-hover">'+
          '<button class="jw-grid-stat-pick jw-micro-btn" data-grid-idx="'+i+'">&#9881;</button>'+
          '<button class="jw-ab-x jw-micro-btn" data-grid-idx="'+i+'">&#215;</button>'+
        '</div>'+
      '</div>';
    }).join('');

    /* Upgrades — 3 cells */
    var upgrades = (d.upgrades||[]).map(function(u,i){
      return '<div class="jw-ab-upg-cell">'+
        '<div class="jw-ab-upg-cost">&#9672;<span contenteditable="true" data-field="upg-cost-'+i+'">'+escHtml(u.cost)+'</span></div>'+
        '<div class="jw-ab-upg-val" contenteditable="true" data-field="upg-val-'+i+'">'+escHtml(u.value)+'</div>'+
        '<div class="jw-ab-upg-lbl" contenteditable="true" data-field="upg-lbl-'+i+'">'+escHtml(u.label)+'</div>'+
        '<button class="jw-ab-x jw-micro-btn jw-ab-upg-x" data-upg-idx="'+i+'">&#215;</button>'+
      '</div>';
    }).join('');

    var abIcon = d.iconUrl
      ? '<div class="jw-ab-ico" style="background-image:url(\''+d.iconUrl.replace(/\'/g,'%27')+'\')"></div>'
      : '<div class="jw-ab-ico-empty">?</div>';

    return '<div class="jw-ability-block2">'+

      /* ① HEADER: icon | name | cooldown */
      '<div class="jw-ab-hdr">'+
        '<div class="jw-ab-ico-wrap">'+
          abIcon+
          '<button class="jw-ab-icon-pick jw-micro-btn">&#128444;</button>'+
        '</div>'+
        '<span class="jw-ab-title" contenteditable="true" data-field="name">'+escHtml(d.name)+'</span>'+
        '<div class="jw-ab-hdr-right">'+
          '<div class="jw-ab-cd-badge">&#9203; <span contenteditable="true" data-field="cooldown">'+escHtml(d.cooldown||'0s')+'</span></div>'+
          '<div class="jw-ab-hdr-ctrls">'+
            '<button class="jw-lib-load-btn jw-micro-btn">&#128218;</button>'+
            '<button class="jw-lib-save-btn jw-micro-btn">&#128190;</button>'+
          '</div>'+
        '</div>'+
      '</div>'+

      /* ② STAT PILLS */
      '<div class="jw-ab-pills-wrap">'+
        pills+
        '<button class="jw-ctrl-btn" data-action="add-pill">+ Pill</button>'+
      '</div>'+

      /* ③ DESCRIPTION */
      '<div class="jw-ab-desc-wrap">'+
        '<div class="jw-inline-icon-bar"><button class="jw-trigger-sm jw-inline-icon-trigger" data-target="desc">&#8853; icon</button></div>'+
        '<p class="jw-ab-desc-text" contenteditable="true" data-field="desc">'+d.desc+'</p>'+
        (d.altCast!==undefined?'<p class="jw-ab-altcast-text" contenteditable="true" data-field="altCast">'+(d.altCast||'Alt-Cast note...')+'</p>':'')+
      '</div>'+

      /* ④ STAT GRID */
      '<div class="jw-ab-grid-wrap">'+
        (grid?'<div class="jw-ab-grid-row">'+grid+'</div>':'')+
        '<div class="jw-ab-grid-ctrls"><button class="jw-ctrl-btn" data-action="add-grid">+ Stat</button></div>'+
      '</div>'+

      /* ⑤ UPGRADES */
      '<div class="jw-ab-upg-wrap">'+
        (upgrades?'<div class="jw-ab-upg-row">'+upgrades+'</div>':'')+
        '<div class="jw-ab-grid-ctrls"><button class="jw-ctrl-btn" data-action="add-upg">+ Upgrade</button></div>'+
      '</div>'+

    '</div>';
  }

  function renderTwoColumn(block) {
    var d = block.data;
    var splitOpts = [['1fr 1fr','50/50'],['2fr 1fr','67/33'],['1fr 2fr','33/67'],['3fr 1fr','75/25'],['1fr 3fr','25/75']];
    var splitBtns = splitOpts.map(function(o){ return '<button class="jw-two-col-split-btn'+(d.split===o[0]?' jw-tc-active':'')+'" data-split="'+o[0]+'">'+o[1]+'</button>'; }).join('');
    return '<div class="jw-two-col-block" data-tc-id="'+block.id+'">' +
      '<div class="jw-two-col-toolbar">' +
        '<span class="jw-grid-label">Two Column</span>' +
        '<div class="jw-two-col-splits">'+splitBtns+'</div>' +
        '<label class="jw-grid-cols-label">Gap:<input type="number" class="jw-two-col-gap jw-grid-cols-input" value="'+(d.gap||24)+'" min="0" max="80" style="width:46px"></label>' +
      '</div>' +
      '<div class="jw-two-col-cols" style="display:grid;grid-template-columns:'+(d.split||'1fr 1fr')+';gap:'+(d.gap||24)+'px;align-items:start;">' +
        '<div class="jw-col-canvas" data-col="left"></div>' +
        '<div class="jw-col-canvas" data-col="right"></div>' +
      '</div>' +
    '</div>';
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* Build full block DOM element */
  function createBlockEl(block) {
    var wrap = document.createElement('div');
    wrap.className = 'jw-block' + (block.attachment ? ' jw-block-has-attachment' : '');
    wrap.setAttribute('data-block-id', block.id);
    wrap.setAttribute('data-block-type', block.type);
    wrap.draggable = true;

    var controls = '<div class="jw-block-controls">' +
      '<div class="jw-drag-handle" title="Drag to reorder">⠿</div>' +
      '<div class="jw-block-type-label">'+(BLOCK_TYPES[block.type]?BLOCK_TYPES[block.type].label:block.type)+'</div>' +
      '<div class="jw-block-actions">' +
        '<button class="jw-btn-code" data-action="code">{ }</button>' +
        '<button class="jw-btn-delete" data-action="delete">✕</button>' +
      '</div>' +
    '</div>';

    /* Only paragraph and quote blocks support addons (image/video/callout attachments) */
    var ADDON_TYPES = { paragraph: true, quote: true };
    var supportsAddon = ADDON_TYPES[block.type];

    var att = supportsAddon ? block.attachment : null;
    /* Clear any stale attachment on non-addon blocks */
    if (!supportsAddon && block.attachment) block.attachment = null;

    var side = att ? (att.side || 'right') : null;
    var contentHtml = renderBlockContent(block);
    var attHtml = supportsAddon ? renderAttachmentPanel(block) : '';
    var pills = supportsAddon
      ? '<button class="jw-att-pill jw-att-pill-left"  data-att-pill="left"  title="Attach left">🖼</button>' +
        '<button class="jw-att-pill jw-att-pill-right" data-att-pill="right" title="Attach right">🖼</button>'
      : '';

    if (att) {
      var attWidth = (att.width || 320);
      var gap      = 20;
      if (side === 'left') {
        wrap.innerHTML = controls + pills +
          '<div class="jw-block-content">' +
            '<div class="jw-att-slot" draggable="false" style="float:left;margin:0 ' + gap + 'px 12px 0;width:' + attWidth + 'px;position:relative;">' + attHtml + '</div>' +
            '<div class="jw-block-text-col">' + contentHtml + '</div>' +
          '</div>';
      } else if (side === 'right') {
        wrap.innerHTML = controls + pills +
          '<div class="jw-block-content">' +
            '<div class="jw-att-slot" draggable="false" style="float:right;margin:0 0 12px ' + gap + 'px;width:' + attWidth + 'px;position:relative;">' + attHtml + '</div>' +
            '<div class="jw-block-text-col">' + contentHtml + '</div>' +
          '</div>';
      } else {
        wrap.innerHTML = controls + pills +
          '<div class="jw-block-content">' +
            '<div class="jw-att-slot" draggable="false" style="display:block;margin:0 auto 16px;width:' + attWidth + 'px;position:relative;">' + attHtml + '</div>' +
            '<div class="jw-block-text-col">' + contentHtml + '</div>' +
          '</div>';
      }
    } else {
      wrap.innerHTML = controls + pills +
        '<div class="jw-block-content">' + contentHtml + '</div>';
    }

    return wrap;
  }

  /* ══════════════════════════════════════════════════
     CANVAS
  ══════════════════════════════════════════════════ */

  var canvas = document.createElement('div');
  canvas.id = 'jw-canvas';
  var canvasInner = document.createElement('div');
  canvasInner.id = 'jw-canvas-inner';
  canvas.appendChild(canvasInner);
  /* Register canvasInner as a drop target ONCE — not inside renderCanvas */
  /* (called after makeDropTarget is defined, via a deferred init) */
  var _canvasDropTargetInit = false;

  function renderCanvas() {
    canvasInner.innerHTML = '';
    blocks.forEach(function(block) { canvasInner.appendChild(createBlockEl(block)); });
    var dz = document.createElement('div');
    dz.className = 'jw-drop-zone';
    dz.innerHTML = '<span>+ Click Insert to add a block</span>';
    canvasInner.appendChild(dz);
    bindBlockEvents();
    bindDragDrop();
  }

  /* ══════════════════════════════════════════════════
     SYNC contenteditable → block data
  ══════════════════════════════════════════════════ */

  function syncBlockFromEl(blockEl) {
    var id = blockEl.getAttribute('data-block-id');
    var block = blocks.find(function(b){ return b.id===id; });
    if (!block) return;
    var content = blockEl.querySelector('.jw-block-content');
    if (!content) return;

    content.querySelectorAll('[contenteditable][data-field]').forEach(function(el) {
      /* Skip fields that belong to nested column blocks — they sync themselves */
      if (el.closest('.jw-col-canvas')) return;
      var f = el.getAttribute('data-field');
      var htmlFields = ['desc','altCast','passiveDesc','activeDesc'];
      var t = (htmlFields.indexOf(f) >= 0) ? (el.innerHTML||'') : (el.innerText||'');
// pstat-N fields — must use innerHTML to preserve color spans and icon tokens
      if (/^pstat-\d+$/.test(f)) {
        var pidx = parseInt(f.split('-')[1]);
        if (!block.data.passiveStats) block.data.passiveStats = [];
        block.data.passiveStats[pidx] = el.innerHTML || '';
        return;
      }
      else if (f==='step-title'||f==='step-desc') { var si=el.closest('[data-step-idx]'); if(si){var idx=parseInt(si.getAttribute('data-step-idx'));if(!block.data.steps[idx])block.data.steps[idx]={};block.data.steps[idx][f==='step-title'?'title':'desc']=t;} }
      else if (f==='bar-label'||f==='bar-val') { var bi=el.closest('[data-bar-idx]'); if(bi){var bidx=parseInt(bi.getAttribute('data-bar-idx'));if(!block.data.bars[bidx])block.data.bars[bidx]={label:'',val:0};if(f==='bar-label')block.data.bars[bidx].label=t;else{block.data.bars[bidx].val=parseFloat(t)||0;var fill=bi.querySelector('.js-bar-fill');if(fill)fill.style.width=Math.round((block.data.bars[bidx].val/(block.data.max||100))*100)+'%';}} }
      else if (['action','input','timing','notes','metric','base','with'].indexOf(f)>=0) { var ri=el.closest('[data-row-idx]'); if(ri){var ridx=parseInt(ri.getAttribute('data-row-idx'));if(!block.data.rows[ridx])block.data.rows[ridx]={};block.data.rows[ridx][f]=t;} }
      else if (f==='card-name'||f==='card-desc') { var ci=el.closest('[data-card-idx]'); if(ci){var cidx=parseInt(ci.getAttribute('data-card-idx'));if(!block.data.cards[cidx])block.data.cards[cidx]={};block.data.cards[cidx][f==='card-name'?'name':'desc']=t;} }
      else if (f==='anchor') { var ni=el.closest('[data-nav-idx]'); if(ni){var nidx=parseInt(ni.getAttribute('data-nav-idx'));if(!block.data.links[nidx])block.data.links[nidx]={};block.data.links[nidx].anchor=t;} }
      else if (f==='nav-label') { var ni2=el.closest('[data-nav-idx]'); if(ni2){var nidx2=parseInt(ni2.getAttribute('data-nav-idx'));if(!block.data.links[nidx2])block.data.links[nidx2]={};block.data.links[nidx2].label=t;} }
    });
    content.querySelectorAll('[data-key-idx]').forEach(function(el){if(el.closest('.jw-col-canvas'))return;var ki=parseInt(el.getAttribute('data-key-idx'));if(block.data.keys&&block.data.keys[ki]&&block.data.keys[ki].type==='key')block.data.keys[ki].label=el.innerText||'';});
    content.querySelectorAll('[data-tab-label-idx]').forEach(function(el){if(el.closest('.jw-col-canvas'))return;var ti=parseInt(el.getAttribute('data-tab-label-idx'));if(block.data.tabs&&block.data.tabs[ti])block.data.tabs[ti].label=el.innerText||'';});
    content.querySelectorAll('[data-tab-content-idx]').forEach(function(el){if(el.closest('.jw-col-canvas'))return;var ti=parseInt(el.getAttribute('data-tab-content-idx'));if(block.data.tabs&&block.data.tabs[ti])block.data.tabs[ti].content=el.innerText||'';});
    content.querySelectorAll('[data-vg-cap-idx]').forEach(function(el){if(el.closest('.jw-col-canvas'))return;var vi=parseInt(el.getAttribute('data-vg-cap-idx'));if(block.data.videos&&block.data.videos[vi])block.data.videos[vi].caption=el.innerText||'';});
    content.querySelectorAll('[data-ig-cap-idx]').forEach(function(el){if(el.closest('.jw-col-canvas'))return;var ii=parseInt(el.getAttribute('data-ig-cap-idx'));if(block.data.images&&block.data.images[ii])block.data.images[ii].caption=el.innerText||'';});
    content.querySelectorAll('.jw-related-href').forEach(function(input){if(input.closest('.jw-col-canvas'))return;var ci=parseInt(input.getAttribute('data-card-idx'));if(block.data.cards&&block.data.cards[ci])block.data.cards[ci].href=input.value;});
    var rawPre = content.querySelector('.jw-raw-pre');
    if (rawPre) block.data.markup = rawPre.innerText||'';
    var inlineCap = content.querySelector('.jw-inline-image-wrap + [data-field="caption"]');
    if (inlineCap) block.data.caption = inlineCap.innerText||'';
  }

  function syncAllBlocks() {
    canvasInner.querySelectorAll('.jw-block').forEach(syncBlockFromEl);
  }

  /* ══════════════════════════════════════════════════
     ATTACHMENT MODAL
  ══════════════════════════════════════════════════ */

  var attModal = document.createElement('div');
  attModal.id = 'jw-att-modal';
  attModal.innerHTML =
    '<div class="jw-att-modal-backdrop"></div>' +
    '<div class="jw-att-modal-inner">' +
      '<div class="jw-att-modal-header">' +
        '<span class="jw-att-modal-title">Attach Media</span>' +
        '<button class="jw-att-modal-close" id="jw-att-modal-close">✕</button>' +
      '</div>' +
      '<div class="jw-att-modal-body">' +
        '<div class="jw-att-modal-left">' +
          '<div class="jw-att-modal-preview" id="jw-att-modal-preview"></div>' +
          '<button class="jw-att-modal-upload-btn" id="jw-att-modal-upload">📁 Upload File</button>' +
        '</div>' +
        '<div class="jw-att-modal-right">' +
          '<div class="jw-att-modal-section">' +
            '<div class="jw-att-modal-label">Type</div>' +
            '<div class="jw-att-modal-row">' +
              '<button class="jw-att-modal-opt" data-modal-type="image">Image</button>' +
              '<button class="jw-att-modal-opt" data-modal-type="video">Video</button>' +
              '<button class="jw-att-modal-opt" data-modal-type="imageGrid">Grid</button>' +
              '<button class="jw-att-modal-opt" data-modal-type="callout">Callout</button>' +
            '</div>' +
          '</div>' +
          '<div class="jw-att-modal-section">' +
            '<div class="jw-att-modal-label">Side</div>' +
            '<div class="jw-att-modal-row">' +
              '<button class="jw-att-modal-opt" data-modal-side="left">◧ Left</button>' +
              '<button class="jw-att-modal-opt" data-modal-side="center">◫ Center</button>' +
              '<button class="jw-att-modal-opt" data-modal-side="right">◨ Right</button>' +
            '</div>' +
          '</div>' +
          '<div class="jw-att-modal-section">' +
            '<div class="jw-att-modal-label">Width <span id="jw-att-modal-width-val">320px</span></div>' +
            '<input type="range" id="jw-att-modal-width" min="80" max="700" step="10" value="320" class="jw-att-modal-range">' +
          '</div>' +
          '<div class="jw-att-modal-section">' +
            '<div class="jw-att-modal-label">Caption</div>' +
            '<input type="text" id="jw-att-modal-caption" class="jw-att-modal-text" placeholder="Optional caption…">' +
          '</div>' +
          '<div class="jw-att-modal-section" id="jw-att-modal-grid-section" style="display:none">' +
            '<div class="jw-att-modal-label">Grid Columns</div>' +
            '<input type="number" id="jw-att-modal-cols" class="jw-att-modal-text" value="2" min="1" max="6" style="width:60px">' +
          '</div>' +
          '<div class="jw-att-modal-section" id="jw-att-modal-callout-section" style="display:none">' +
            '<div class="jw-att-modal-label">Callout Style</div>' +
            '<div class="jw-att-modal-row">' +
              '<button class="jw-att-modal-opt" data-callout-style="tip">✦ Tip</button>' +
              '<button class="jw-att-modal-opt" data-callout-style="warning">⚠ Warn</button>' +
              '<button class="jw-att-modal-opt" data-callout-style="danger">✕ Danger</button>' +
            '</div>' +
            '<div class="jw-att-modal-label">Label</div>' +
            '<input type="text" id="jw-att-modal-callout-label" class="jw-att-modal-text" placeholder="Tip" value="Tip">' +
            '<div class="jw-att-modal-label">Text</div>' +
            '<input type="text" id="jw-att-modal-callout-text" class="jw-att-modal-text" placeholder="Callout content…">' +
          '</div>' +
          '<div class="jw-att-modal-footer">' +
            '<button class="jw-att-modal-remove" id="jw-att-modal-remove">Remove</button>' +
            '<button class="jw-att-modal-save" id="jw-att-modal-save">Save</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(attModal);

  var attModalBlock = null;
  var attModalData  = null;

  function openAttModal(block, side) {
    attModalBlock = block;
    if (block.attachment) {
      attModalData = JSON.parse(JSON.stringify(block.attachment));
    } else {
      attModalData = { type: 'image', src: '', side: side || 'right', width: 320, caption: '', images: [], cols: 2, calloutStyle: 'tip', calloutLabel: 'Tip', calloutText: '' };
    }
    if (side && !block.attachment) attModalData.side = side;
    refreshAttModal();
    attModal.classList.add('jw-att-modal-open');
  }

  function refreshAttModal() {
    var d = attModalData;
    var preview = document.getElementById('jw-att-modal-preview');
    if (preview) {
      if (d.type === 'callout') {
        var cs2 = d.calloutStyle || 'tip'; var cl2 = d.calloutLabel || 'Tip'; var ct2 = d.calloutText || '';
        preview.innerHTML = '<div class="js-callout"><div class="js-callout-bar '+cs2+'"></div><div class="js-callout-inner"><span class="js-callout-label">'+cl2+'</span><p class="js-callout-text">'+ct2+'</p></div></div>';
      } else if (d.type === 'video') {
        preview.innerHTML = d.src ? '<video autoplay muted loop playsinline style="width:100%;border-radius:4px"><source src="'+d.src+'" type="video/mp4"></video>' : '<div class="jw-att-no-media">▶ No video uploaded</div>';
      } else if (d.type === 'imageGrid') {
        var cells = (d.images||[]).map(function(img,gi){
          return '<div style="position:relative">'+(img.src?'<img src="'+img.src+'" style="width:100%;height:60px;object-fit:cover;border-radius:3px">':'<div class="jw-att-no-media" style="height:60px">🖼</div>')+
            '<button class="jw-att-modal-grid-upload" data-gi="'+gi+'" style="position:absolute;bottom:2px;left:2px;font-size:9px;padding:1px 4px">📁</button>'+
            '<button class="jw-att-modal-grid-remove" data-gi="'+gi+'" style="position:absolute;bottom:2px;right:2px;font-size:9px;padding:1px 4px">✕</button>'+
          '</div>';
        }).join('');
        preview.innerHTML = '<div style="display:grid;grid-template-columns:repeat('+(d.cols||2)+',1fr);gap:4px;margin-bottom:8px">'+cells+'</div>'+
          '<button class="jw-att-modal-grid-add" style="width:100%">+ Add Image</button>';
        preview.querySelectorAll('.jw-att-modal-grid-upload').forEach(function(btn){
          btn.addEventListener('click', function(e){e.stopPropagation();var gi=parseInt(btn.getAttribute('data-gi'));triggerUpload('image/*',function(url){attModalData.images[gi]=attModalData.images[gi]||{src:'',caption:''};attModalData.images[gi].src=url;refreshAttModal();});});
        });
        preview.querySelectorAll('.jw-att-modal-grid-remove').forEach(function(btn){
          btn.addEventListener('click', function(e){e.stopPropagation();attModalData.images.splice(parseInt(btn.getAttribute('data-gi')),1);refreshAttModal();});
        });
        var addBtn = preview.querySelector('.jw-att-modal-grid-add');
        if (addBtn) addBtn.addEventListener('click', function(){attModalData.images=attModalData.images||[];attModalData.images.push({src:'',caption:''});refreshAttModal();});
      } else {
        preview.innerHTML = d.src ? '<img src="'+d.src+'" style="width:100%;border-radius:4px;display:block" alt="">' : '<div class="jw-att-no-media">🖼 No image uploaded</div>';
      }
    }
    attModal.querySelectorAll('[data-modal-type]').forEach(function(btn){ btn.classList.toggle('jw-att-modal-active', btn.getAttribute('data-modal-type')===d.type); });
    attModal.querySelectorAll('[data-modal-side]').forEach(function(btn){ btn.classList.toggle('jw-att-modal-active', btn.getAttribute('data-modal-side')===d.side); });
    var wSlider = document.getElementById('jw-att-modal-width');
    var wVal    = document.getElementById('jw-att-modal-width-val');
    if (wSlider) wSlider.value = d.width || 320;
    if (wVal)    wVal.textContent = (d.width || 320) + 'px';
    var capIn = document.getElementById('jw-att-modal-caption');
    if (capIn) capIn.value = d.caption || '';
    var colsIn = document.getElementById('jw-att-modal-cols');
    if (colsIn) colsIn.value = d.cols || 2;
    var gridSec = document.getElementById('jw-att-modal-grid-section');
    if (gridSec) gridSec.style.display = d.type === 'imageGrid' ? 'block' : 'none';
    var calloutSec = document.getElementById('jw-att-modal-callout-section');
    if (calloutSec) calloutSec.style.display = d.type === 'callout' ? 'block' : 'none';
    var calloutLabelIn = document.getElementById('jw-att-modal-callout-label');
    var calloutTextIn  = document.getElementById('jw-att-modal-callout-text');
    if (calloutLabelIn) calloutLabelIn.value = d.calloutLabel || 'Tip';
    if (calloutTextIn)  calloutTextIn.value  = d.calloutText  || '';
    attModal.querySelectorAll('[data-callout-style]').forEach(function(btn){ btn.classList.toggle('jw-att-modal-active', btn.getAttribute('data-callout-style')===(d.calloutStyle||'tip')); });
    /* show/hide upload & width for callout */
    var uploadBtn = document.getElementById('jw-att-modal-upload');
    var widthSec  = attModal.querySelector('#jw-att-modal-width') && attModal.querySelector('#jw-att-modal-width').closest('.jw-att-modal-section');
    if (uploadBtn) uploadBtn.style.display = d.type === 'callout' ? 'none' : '';
    if (widthSec)  widthSec.style.display  = d.type === 'callout' ? 'none' : '';
  }

  attModal.querySelector('.jw-att-modal-backdrop').addEventListener('click', function(){ attModal.classList.remove('jw-att-modal-open'); });
  document.getElementById('jw-att-modal-close').addEventListener('click', function(){ attModal.classList.remove('jw-att-modal-open'); });
  attModal.querySelectorAll('[data-modal-type]').forEach(function(btn){ btn.addEventListener('click', function(){ attModalData.type=btn.getAttribute('data-modal-type'); refreshAttModal(); }); });
  attModal.querySelectorAll('[data-callout-style]').forEach(function(btn){ btn.addEventListener('click', function(){ attModalData.calloutStyle=btn.getAttribute('data-callout-style'); refreshAttModal(); }); });
  document.getElementById('jw-att-modal-callout-label').addEventListener('input', function(){ attModalData.calloutLabel=this.value; refreshAttModal(); });
  document.getElementById('jw-att-modal-callout-text').addEventListener('input',  function(){ attModalData.calloutText=this.value;  refreshAttModal(); });
  attModal.querySelectorAll('[data-modal-side]').forEach(function(btn){ btn.addEventListener('click', function(){ attModalData.side=btn.getAttribute('data-modal-side'); refreshAttModal(); }); });
  document.getElementById('jw-att-modal-width').addEventListener('input', function(){ attModalData.width=parseInt(this.value); document.getElementById('jw-att-modal-width-val').textContent=this.value+'px'; });
  document.getElementById('jw-att-modal-caption').addEventListener('input', function(){ attModalData.caption=this.value; });
  document.getElementById('jw-att-modal-cols').addEventListener('change', function(){ attModalData.cols=parseInt(this.value)||2; refreshAttModal(); });
  document.getElementById('jw-att-modal-upload').addEventListener('click', function(){ triggerUpload(attModalData.type==='video'?'video/mp4,video/webm':'image/png,image/jpeg,image/gif,image/webp', function(url){ attModalData.src=url; refreshAttModal(); }); });
  document.getElementById('jw-att-modal-save').addEventListener('click', function(){ if(attModalBlock){attModalBlock.attachment=JSON.parse(JSON.stringify(attModalData));renderCanvas();} attModal.classList.remove('jw-att-modal-open'); });
  document.getElementById('jw-att-modal-remove').addEventListener('click', function(){ if(attModalBlock){attModalBlock.attachment=null;renderCanvas();} attModal.classList.remove('jw-att-modal-open'); });

  function bindAttachmentEvents(blockEl, block) {
    blockEl.querySelectorAll('.jw-att-pill').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); openAttModal(block, btn.getAttribute('data-att-pill')); });
    });
    var floatEl = blockEl.querySelector('.jw-att-float');
    if (floatEl) {
      floatEl.addEventListener('click', function(e) { if(e.target.classList.contains('jw-att-resize-handle'))return; e.stopPropagation(); openAttModal(block, null); });
    }
    var handle = blockEl.querySelector('.jw-att-resize-handle');
    if (handle && block.attachment) {
      handle.addEventListener('mousedown', function(e) {
        e.preventDefault(); e.stopPropagation();
        /* Prevent this mousedown from triggering a block dragstart */
        blockEl.draggable = false;
        var restoreDrag = function() { blockEl.draggable = true; document.removeEventListener('mouseup', restoreDrag); };
        document.addEventListener('mouseup', restoreDrag);
        var startX=e.clientX, startW=block.attachment.width||320, side=block.attachment.side||'right';
        var onMove=function(ev){ var delta=side==='right'?(startX-ev.clientX):(ev.clientX-startX); var newW=Math.max(80,Math.min(startW+delta,canvasInner.offsetWidth*0.6)); block.attachment.width=Math.round(newW); var slot=blockEl.querySelector('.jw-att-slot'); if(slot)slot.style.width=newW+'px'; };
        var onUp=function(){ document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); renderCanvas(); };
        document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
      });
    }
  }

  /* ══════════════════════════════════════════════════
     TWO-COLUMN NESTED CANVAS
  ══════════════════════════════════════════════════ */

  function bindTwoColumnEvents(blockEl, block) {

    var d = block.data;
    if (!d.leftBlocks)  d.leftBlocks  = [makeBlock('paragraph',{text:'Left column.'})];
    if (!d.rightBlocks) d.rightBlocks = [makeBlock('paragraph',{text:'Right column.'})];

    /* ── Render a single column canvas ── */
    function renderColCanvas(colEl, colBlocks) {
      colEl.innerHTML = '';
      colBlocks.forEach(function(cb) {
        var cbEl = createBlockEl(cb);
        cbEl.classList.add('jw-col-block');
        colEl.appendChild(cbEl);
        bindChildBlockEvents(cbEl, cb, colBlocks, colEl);
        /* Register each child as draggable (drop target already bound once) */
        makeBlockDraggable(cbEl, cb, colBlocks, function(){ renderColCanvas(colEl, colBlocks); });
      });
      /* Add block button */
      var addBtn = document.createElement('button');
      addBtn.className = 'jw-col-add-btn';
      addBtn.textContent = colBlocks.length === 0 ? '+ Add Block' : '+ Block';
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openColInsert(colEl, colBlocks, addBtn);
      });
      colEl.appendChild(addBtn);
    }

    var colId = block.id;

    /* ── Render both columns ── */
    var leftEl  = blockEl.querySelector('.jw-col-canvas[data-col="left"]');
    var rightEl = blockEl.querySelector('.jw-col-canvas[data-col="right"]');
    if (!leftEl || !rightEl) return;
    renderColCanvas(leftEl, d.leftBlocks);
    renderColCanvas(rightEl, d.rightBlocks);
    /* Register each column as a drop target ONCE (colEl is new each time bindTwoColumnEvents runs) */
    makeDropTarget(leftEl,  d.leftBlocks,  function(){ renderColCanvas(leftEl,  d.leftBlocks); });
    makeDropTarget(rightEl, d.rightBlocks, function(){ renderColCanvas(rightEl, d.rightBlocks); });

    /* ── Split / gap controls ── */
    blockEl.querySelectorAll('.jw-two-col-split-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        d.split = btn.getAttribute('data-split');
        var cols = blockEl.querySelector('.jw-two-col-cols');
        if (cols) cols.style.gridTemplateColumns = d.split;
        blockEl.querySelectorAll('.jw-two-col-split-btn').forEach(function(b){ b.classList.toggle('jw-tc-active', b===btn); });
      });
    });
    blockEl.querySelectorAll('.jw-two-col-gap').forEach(function(inp) {
      inp.addEventListener('change', function() {
        d.gap = parseInt(this.value)||24;
        var cols = blockEl.querySelector('.jw-two-col-cols');
        if (cols) cols.style.gap = d.gap + 'px';
      });
    });

    /* ── Column insert dropdown ── */
    function openColInsert(colEl, colBlocks, anchorEl) {
      /* close any open col/body dropdowns first */
      document.querySelectorAll('.jw-col-insert-dropdown').forEach(function(dd){ dd.parentNode&&dd.parentNode.removeChild(dd); });
      /* build and attach to body so it's never clipped */
      var dd = createColInsertDropdown(colEl, colBlocks);
      dd.style.position = 'fixed';
      dd.style.zIndex   = '99990';
      dd.style.display  = 'block';
      document.body.appendChild(dd);
      /* position above (or below) the anchor button */
      var anchor = anchorEl || colEl.querySelector('.jw-col-add-btn') || colEl;
      var rect = anchor.getBoundingClientRect();
      var ddH  = Math.min(420, window.innerHeight * 0.6);
      dd.style.maxHeight = ddH + 'px';
      dd.style.width     = Math.max(260, Math.min(320, rect.width + 40)) + 'px';
      /* prefer opening upward */
      if (rect.top - ddH - 8 >= 0) {
        dd.style.top  = (rect.top - ddH - 4) + 'px';
      } else {
        dd.style.top  = (rect.bottom + 4) + 'px';
      }
      /* left-align with the column, clamped to viewport */
      var left = Math.max(8, Math.min(rect.left, window.innerWidth - parseInt(dd.style.width) - 8));
      dd.style.left = left + 'px';
      /* dismiss on next outside click */
      setTimeout(function() {
        document.addEventListener('click', function closeDd(e) {
          if (!dd.contains(e.target)) {
            dd.parentNode && dd.parentNode.removeChild(dd);
            document.removeEventListener('click', closeDd);
          }
        });
      }, 0);
    }

    function createColInsertDropdown(colEl, colBlocks) {
      var dd = document.createElement('div');
      dd.className = 'jw-col-insert-dropdown';

      var groups = [
        ['Headings', [['heading1','H1','Main'],['heading2','H2','Sub'],['heading3','H3','Tertiary'],['sectionBanner','▬','Banner']]],
        ['Content',  [['paragraph','¶','Paragraph'],['quote','"','Quote'],['steps','①','Steps'],['collapsible','▼','Collapsible'],['tabGroup','⊟','Tab Group'],['divider','—','Divider']]],
        ['Callouts', [['callout-tip','✦','Tip'],['callout-warning','⚠','Warning'],['callout-danger','✕','Danger'],['callout-info','ℹ','Info']]],
        ['Media',    [['inlineImage','🖼','Image'],['videoGrid','▶','Video'],['imageGrid','⊞','Img Grid']]],
        ['Data',     [['inputTable','⌨','Input Tbl'],['statTable','📊','Stat Tbl'],['barChart','▦','Bar Chart'],['keyCombo','⌨','Key Combo'],['techCredit','★','Tech Credit']]],
        ['Cards',    [['relatedCards','⬡','Related'],['itemBlock','◆','Item Blk'],['abilityBlock','✦','Ability Blk'],['pageNav','≡','Page Nav']]],
      ];

      groups.forEach(function(g) {
        var sec = document.createElement('div');
        sec.className = 'jw-col-insert-section';
        var lbl = document.createElement('div'); lbl.className='jw-col-insert-group-label'; lbl.textContent=g[0]; sec.appendChild(lbl);
        var grid = document.createElement('div'); grid.className='jw-col-insert-grid';
        g[1].forEach(function(it) {
          var card = document.createElement('div');
          card.className = 'jw-col-insert-card';
          card.innerHTML = '<span>'+it[1]+'</span><span class="jw-col-insert-label">'+it[2]+'</span>';
          card.addEventListener('click', function(e) {
            e.stopPropagation();
            var type = it[0], data = {};
            if(type==='callout-tip'){type='callout';data={style:'tip',label:'Tip',text:'Add content.'};}
            else if(type==='callout-warning'){type='callout';data={style:'warning',label:'Warning',text:'Add content.'};}
            else if(type==='callout-danger'){type='callout';data={style:'danger',label:'Danger',text:'Add content.'};}
            else if(type==='callout-info'){type='callout';data={style:'',label:'Info',text:'Add content.'};}
            else{data=getDefaultData(type);}
            var nb = makeBlock(type,data);
            colBlocks.push(nb);
            dd.style.display = 'none';
            renderColCanvas(colEl, colBlocks);
          });
          grid.appendChild(card);
        });
        sec.appendChild(grid); dd.appendChild(sec);
      });
      return dd;
    }

    /* ── Bind events for a block inside a column ── */
    function bindChildBlockEvents(cbEl, cb, colBlocks, colEl) {
      /* delete + code */
      cbEl.querySelectorAll('[data-action]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = btn.getAttribute('data-action');
          if (action === 'delete') {
            if (confirm('Delete this block?')) {
              var i = colBlocks.indexOf(cb);
              if (i >= 0) colBlocks.splice(i, 1);
              renderColCanvas(colEl, colBlocks);
            }
          } else if (action === 'code') {
            showBlockCode(cb.id, colBlocks, function() { renderColCanvas(colEl, colBlocks); });
          }
        });
      });
      /* All standard block controls (contenteditable, steps, tables, uploads, etc.) */
      bindStandardBlockControls(cbEl, cb, function() { renderColCanvas(colEl, colBlocks); });
    }

    /* ── In-column drag & drop — uses shared jwDrag context ── */
    function bindColDragDrop(colEl, colBlocks) {
      /* register each column block as draggable */
      colEl.querySelectorAll('.jw-col-block').forEach(function(cbEl) {
        var id = cbEl.getAttribute('data-block-id');
        var cb = colBlocks.find(function(b){ return b.id===id; });
        if (!cb) return;
        makeBlockDraggable(cbEl, cb, colBlocks, function(){ renderColCanvas(colEl, colBlocks); });
      });
      /* make this column a drop target ONCE — guard with a data attribute */
      if (!colEl.getAttribute('data-drop-bound')) {
        colEl.setAttribute('data-drop-bound', '1');
        makeDropTarget(colEl, colBlocks, function(){ renderColCanvas(colEl, colBlocks); });
      }
    }

    /* dropdown close handled per-open via body listener */
  }

  /* ══════════════════════════════════════════════════
     BLOCK EVENTS
  ══════════════════════════════════════════════════ */

  /* ── bindStandardBlockControls: all add/remove/upload controls for any block ─
     rerender() is called instead of renderCanvas() so it works inside columns too. ── */
  function bindStandardBlockControls(blockEl, block, rerender) {
    rerender = rerender || renderCanvas;

    blockEl.querySelectorAll('[contenteditable]').forEach(function(el) {
      el.addEventListener('input', function() { syncBlockFromEl(blockEl); });
    });

    bindAttachmentEvents(blockEl, block);

    /* Steps add/remove */
    blockEl.querySelectorAll('.jw-step-add-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation(); syncBlockFromEl(blockEl);
        block.data.steps=block.data.steps||[];
        block.data.steps.push({title:'Step title',desc:'Describe this step.'});
        rerender();
      });
    });
    blockEl.querySelectorAll('.jw-step-remove').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation(); syncBlockFromEl(blockEl);
        var idx=parseInt(btn.getAttribute('data-step-idx'));
        block.data.steps.splice(idx,1);
        rerender();
      });
    });

    /* Input table / stat table / bar chart add/remove */
    blockEl.querySelectorAll('.jw-row-add-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation(); syncBlockFromEl(blockEl);
        var tbl=btn.getAttribute('data-table');
        if(tbl==='input'){block.data.rows=block.data.rows||[];block.data.rows.push({action:'Action',input:'Key',timing:'',notes:''});}
        else if(tbl==='stat'){block.data.rows=block.data.rows||[];block.data.rows.push({metric:'Stat',base:'0',with:'0',notes:''});}
        else if(tbl==='bar'){block.data.bars=block.data.bars||[];block.data.bars.push({label:'Label',val:50});}
        rerender();
      });
    });
    blockEl.querySelectorAll('.jw-row-remove-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation(); syncBlockFromEl(blockEl);
        var tbl=btn.getAttribute('data-table');
        var ridx=btn.getAttribute('data-row-idx');
        var bidx=btn.getAttribute('data-bar-idx');
        var vgi=btn.getAttribute('data-vg-idx');
        var igi=btn.getAttribute('data-ig-idx');
        var cardi=btn.getAttribute('data-card-idx');
        if(ridx!==null&&tbl==='input'){block.data.rows.splice(parseInt(ridx),1);}
        else if(ridx!==null&&tbl==='stat'){block.data.rows.splice(parseInt(ridx),1);}
        else if(bidx!==null){block.data.bars.splice(parseInt(bidx),1);}
        else if(vgi!==null){block.data.videos.splice(parseInt(vgi),1);}
        else if(igi!==null){block.data.images.splice(parseInt(igi),1);}
        else if(cardi!==null){block.data.cards.splice(parseInt(cardi),1);}
        rerender();
      });
    });

    /* Related cards */
    blockEl.querySelectorAll('.jw-related-add-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation(); syncBlockFromEl(blockEl);
        block.data.cards=block.data.cards||[];
        block.data.cards.push({name:'Related Page',desc:'Brief description.',href:'#'});
        rerender();
      });
    });
    blockEl.querySelectorAll('.jw-related-href').forEach(function(input){
      input.addEventListener('input', function(){ syncBlockFromEl(blockEl); });
    });

    /* Grid cols/add */
    blockEl.querySelectorAll('.jw-grid-cols-input').forEach(function(input) {
      input.addEventListener('change', function() { syncBlockFromEl(blockEl); rerender(); });
    });
    blockEl.querySelectorAll('.jw-grid-add').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var type = btn.getAttribute('data-add-type');
        if(type==='video'){block.data.videos=block.data.videos||[];block.data.videos.push({src:'',caption:'Caption'});}
        else{block.data.images=block.data.images||[];block.data.images.push({src:'',alt:'',caption:'Caption'});}
        rerender();
      });
    });
    blockEl.querySelectorAll('.jw-upload-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var mediaType=btn.getAttribute('data-media-type');
        var vgIdx=btn.getAttribute('data-vg-idx');
        var igIdx=btn.getAttribute('data-ig-idx');
        var accept=mediaType==='video'?'video/mp4,video/webm':'image/png,image/jpeg,image/gif,image/webp';
        triggerUpload(accept, function(url) {
          if(vgIdx!==null){block.data.videos=block.data.videos||[];block.data.videos[parseInt(vgIdx)]=block.data.videos[parseInt(vgIdx)]||{src:'',caption:''};block.data.videos[parseInt(vgIdx)].src=url;}
          else if(igIdx!==null){block.data.images=block.data.images||[];block.data.images[parseInt(igIdx)]=block.data.images[parseInt(igIdx)]||{src:'',alt:'',caption:''};block.data.images[parseInt(igIdx)].src=url;}
          rerender();
        });
      });
    });

    /* Key combo */
    blockEl.querySelectorAll('.jw-key-add-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);block.data.keys=block.data.keys||[];block.data.keys.push({type:'key',label:'Key'});rerender();}); });
    blockEl.querySelectorAll('.jw-key-add-plus-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);block.data.keys=block.data.keys||[];block.data.keys.push({type:'plus'});rerender();}); });
    blockEl.querySelectorAll('.jw-key-remove-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);var ki=parseInt(btn.getAttribute('data-key-idx'));block.data.keys.splice(ki,1);rerender();}); });

    /* Tab group */
    blockEl.querySelectorAll('.jw-tab-add-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);block.data.tabs=block.data.tabs||[];block.data.tabs.push({label:'New Tab',content:'Content here.'});rerender();}); });
    blockEl.querySelectorAll('.jw-tab-remove').forEach(function(el){ el.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);var ti=parseInt(el.getAttribute('data-tab-idx'));block.data.tabs.splice(ti,1);rerender();}); });
    blockEl.querySelectorAll('.js-tab-btn').forEach(function(btn){ btn.addEventListener('click',function(e){if(e.target.hasAttribute('contenteditable')||e.target.classList.contains('jw-tab-remove'))return;e.stopPropagation();var tgt=btn.getAttribute('data-tab-target');blockEl.querySelectorAll('.js-tab-btn').forEach(function(b){b.classList.remove('js-tab-active');});blockEl.querySelectorAll('.js-tab-panel').forEach(function(p){p.classList.remove('js-tab-panel-active');});btn.classList.add('js-tab-active');var panel=blockEl.querySelector('#'+tgt);if(panel)panel.classList.add('js-tab-panel-active');}); });

    /* Inline image */
    blockEl.querySelectorAll('.jw-inline-img-upload').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        triggerUpload('image/png,image/jpeg,image/gif,image/webp', function(url){
          block.data.src = url; rerender();
        });
      });
    });
    blockEl.querySelectorAll('.jw-inline-img-align').forEach(function(sel){
      sel.addEventListener('change', function(){ syncBlockFromEl(blockEl); block.data.align=this.value; rerender(); });
    });
    blockEl.querySelectorAll('.jw-inline-img-width').forEach(function(inp){
      inp.addEventListener('change', function(){ syncBlockFromEl(blockEl); block.data.width=this.value; rerender(); });
    });

    /* Two column — full nested-canvas binding */
    if (block.type === 'twoColumn') { bindTwoColumnEvents(blockEl, block); }

    /* Page nav */
    blockEl.querySelectorAll('.jw-nav-add-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();syncBlockFromEl(blockEl);block.data.links=block.data.links||[];block.data.links.push({anchor:'section',label:'Section'});rerender();}); });
    blockEl.querySelectorAll('.jw-nav-remove-btn').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();var nidx=parseInt(btn.getAttribute('data-nav-idx'));syncBlockFromEl(blockEl);block.data.links.splice(nidx,1);rerender();}); });

    /* ── Stat type pickers on chips and grid ── */
    blockEl.querySelectorAll('.jw-chip-stat-pick').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-chip-idx'));
        openStatPicker(btn, function(statKey) {
          syncBlockFromEl(blockEl);
          if (!block.data.statChips[idx]) block.data.statChips[idx] = {};
          block.data.statChips[idx].statKey = statKey;
          block.data.statChips[idx].label = statLabel(statKey);
          rerender();
        });
      });
    });
    blockEl.querySelectorAll('.jw-grid-stat-pick').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-grid-idx'));
        openStatPicker(btn, function(statKey) {
          syncBlockFromEl(blockEl);
          if (!block.data.statGrid[idx]) block.data.statGrid[idx] = {};
          block.data.statGrid[idx].statKey = statKey;
          block.data.statGrid[idx].label = statLabel(statKey);
          rerender();
        });
      });
    });

    /* ── Inline icon triggers ── */
    blockEl.querySelectorAll('.jw-inline-icon-trigger').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var targetField = btn.getAttribute('data-target');
        var targetEl = blockEl.querySelector('[data-field="'+targetField+'"]');
        if (targetEl) inlineIconOpen(targetEl, btn);
      });
    });

    /* ── Library save/load buttons ── */
    if (block.type === 'itemBlock' || block.type === 'abilityBlock') {
      var libType = block.type === 'itemBlock' ? 'items' : 'abilities';
      blockEl.querySelectorAll('.jw-lib-save-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          syncBlockFromEl(blockEl);
          libSaveEntry(libType, block.data);
        });
      });
      blockEl.querySelectorAll('.jw-lib-load-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          libOpen(libType, function(data) {
            block.data = data;
            rerender();
          });
        });
      });
    }

    /* ── ITEM BLOCK 2 events ── */
    if (block.type === 'itemBlock') {
      /* Icon picker */
      blockEl.querySelectorAll('.jw-ib-icon-pick').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          iconPickerOpen('item', block.data.type || 'weapon', function(result) {
            block.data.iconUrl = result.url;
            block.data.iconName = result.name;
            rerender();
          });
        });
      });
      blockEl.querySelectorAll('.jw-ib-type').forEach(function(sel){
        sel.addEventListener('change', function(e){ e.stopPropagation(); block.data.type=sel.value; rerender(); });
      });
      blockEl.querySelectorAll('input[data-field="hasPassive"], input[data-field="hasActive"]').forEach(function(cb){
        cb.addEventListener('change', function(e){ e.stopPropagation(); block.data[cb.getAttribute('data-field')]=cb.checked; rerender(); });
      });
      blockEl.querySelectorAll('[data-action="add-pstat"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); block.data.passiveStats=block.data.passiveStats||[]; block.data.passiveStats.push('+0 New Stat'); rerender(); });
      });
      blockEl.querySelectorAll('.jw-ib-pstat-del').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); var idx=parseInt(btn.getAttribute('data-pstat-idx')); block.data.passiveStats.splice(idx,1); rerender(); });
      });
      blockEl.querySelectorAll('[data-action="add-chip"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); block.data.statChips=block.data.statChips||[]; block.data.statChips.push({icon:'move',value:'+0',label:'New Stat',cond:''}); rerender(); });
      });
      blockEl.querySelectorAll('.jw-ib-chip-del').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); var idx=parseInt(btn.getAttribute('data-chip-idx')); block.data.statChips.splice(idx,1); rerender(); });
      });
      blockEl.querySelectorAll('[data-action="add-duration"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); block.data.duration='4.5'; rerender(); });
      });
      blockEl.querySelectorAll('[data-action="remove-duration"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); block.data.duration=''; rerender(); });
      });
    }

    /* ── ABILITY BLOCK 2 events ── */
    if (block.type === 'abilityBlock') {
      /* Icon picker */
      blockEl.querySelectorAll('.jw-ab-icon-pick').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          iconPickerOpen('ability', null, function(result) {
            block.data.iconUrl = result.url;
            block.data.iconHero = result.hero;
            block.data.iconFile = result.file;
            rerender();
          });
        });
      });
      blockEl.querySelectorAll('[data-action="add-pill"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); block.data.statPills=block.data.statPills||[]; block.data.statPills.push({icon:'range',value:'0m',label:'Range'}); rerender(); });
      });
      blockEl.querySelectorAll('[data-pill-idx]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); var idx=parseInt(btn.getAttribute('data-pill-idx')); block.data.statPills.splice(idx,1); rerender(); });
      });
      blockEl.querySelectorAll('[data-action="add-grid"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); block.data.statGrid=block.data.statGrid||[]; block.data.statGrid.push({icon:'spirit',value:'0',label:'New Stat',highlight:false}); rerender(); });
      });
      blockEl.querySelectorAll('[data-grid-idx]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); var idx=parseInt(btn.getAttribute('data-grid-idx')); block.data.statGrid.splice(idx,1); rerender(); });
      });
      blockEl.querySelectorAll('[data-action="add-upg"]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); block.data.upgrades=block.data.upgrades||[]; block.data.upgrades.push({cost:'1',value:'+0',label:'New Effect'}); rerender(); });
      });
      blockEl.querySelectorAll('[data-upg-idx]').forEach(function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); syncBlockFromEl(blockEl); var idx=parseInt(btn.getAttribute('data-upg-idx')); block.data.upgrades.splice(idx,1); rerender(); });
      });
    }
  }

  function bindBlockEvents() {
    canvasInner.querySelectorAll('.jw-block').forEach(function(blockEl) {
      var id    = blockEl.getAttribute('data-block-id');
      var block = blocks.find(function(b){ return b.id===id; });
      if (!block) return;

      blockEl.querySelectorAll('[data-action]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var action = btn.getAttribute('data-action');
          if (action === 'delete') {
            if (confirm('Delete this block?')) { blocks = blocks.filter(function(b){return b.id!==id;}); renderCanvas(); }
          } else if (action === 'code') {
            showBlockCode(id);
          }
        });
      });

      bindStandardBlockControls(blockEl, block, renderCanvas);
    });
  }

  /* ══════════════════════════════════════════════════
     DRAG & DROP
  ══════════════════════════════════════════════════ */

  /* ── Shared drag context: works across main canvas and column canvases ── */
  var jwDrag = { id: null, srcArr: null, srcRerender: null, prefabType: null };
  var dropIndicator = document.createElement('div');
  dropIndicator.className = 'jw-drop-indicator';

  /* Call this to register a block element as draggable in any context */
  function makeBlockDraggable(blockEl, block, srcArr, srcRerender) {
    blockEl.draggable = true;

    /* Only treat as a block-move if the drag originates from the drag handle.
       Drags starting on attachments, pills, buttons or contenteditable are NOT block moves. */
    var _blockDragActive = false;

    blockEl.addEventListener('dragstart', function(e) {
      var handle = blockEl.querySelector('.jw-drag-handle');
      var fromHandle = handle && (e.target === handle || handle.contains(e.target));
      /* Also block drag from anything inside attachment slots, pills, or buttons */
      var fromAtt = e.target.closest('.jw-att-slot, .jw-att-float, .jw-att-pill, .jw-att-resize-handle, .jw-col-insert-dropdown');
      var fromBtn = e.target.closest('button, input, select, [contenteditable]');

      if (!fromHandle || fromAtt || fromBtn) {
        /* Not a legitimate block drag — cancel it */
        e.preventDefault();
        e.stopPropagation();
        _blockDragActive = false;
        return;
      }

      _blockDragActive = true;
      jwDrag.id          = block.id;
      jwDrag.srcArr      = srcArr;
      jwDrag.srcRerender = srcRerender;
      blockEl.classList.add('jw-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.stopPropagation();
    });

    blockEl.addEventListener('dragend', function() {
      if (!_blockDragActive) return;
      _blockDragActive = false;
      blockEl.classList.remove('jw-dragging');
      if (dropIndicator.parentNode) dropIndicator.parentNode.removeChild(dropIndicator);
      /* Only clear jwDrag if this block was the one that set it */
      if (jwDrag.id === block.id) {
        jwDrag.id = null; jwDrag.srcArr = null; jwDrag.srcRerender = null;
      }
    });
  }

  /* Make a container accept drops — works for main canvas and column canvases */
  function makeDropTarget(containerEl, targetArr, targetRerender) {
    /* dragover on child blocks */
    containerEl.addEventListener('dragenter', function(e) {
      if (jwDrag.id || jwDrag.prefabType) containerEl.classList.add('jw-drag-over');
      /* Some browsers fire dragenter before dragstart sets jwDrag; check types too */
      if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.indexOf('text/plain') >= 0) {
        containerEl.classList.add('jw-drag-over');
      }
    });
    containerEl.addEventListener('dragover', function(e) {
      /* Always prevent default first — otherwise drop event never fires */
      e.preventDefault();
      if (!jwDrag.id && !jwDrag.prefabType) return;
      var over = e.target.closest('.jw-block');
      if (over && containerEl.contains(over)) {
        var rect = over.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) containerEl.insertBefore(dropIndicator, over);
        else containerEl.insertBefore(dropIndicator, over.nextSibling);
      } else if (!dropIndicator.parentNode || dropIndicator.parentNode !== containerEl) {
        containerEl.appendChild(dropIndicator);
      }
    });
    containerEl.addEventListener('dragleave', function(e) {
      if (!containerEl.contains(e.relatedTarget)) {
        if (dropIndicator.parentNode === containerEl) containerEl.removeChild(dropIndicator);
        containerEl.classList.remove('jw-drag-over');
      }
    });
    containerEl.addEventListener('drop', function(e) {
      e.preventDefault(); e.stopPropagation();
      if (dropIndicator.parentNode === containerEl) containerEl.removeChild(dropIndicator);
      containerEl.classList.remove('jw-drag-over');

      /* ── Prefab drop: insert a brand-new block ── */
      /* Check jwDrag first, fall back to dataTransfer */
      var droppedPrefabType = jwDrag.prefabType;
      if (!droppedPrefabType) {
        var dtData = e.dataTransfer.getData('text/plain');
        if (dtData && dtData.indexOf('prefab:') === 0) droppedPrefabType = dtData.slice(7);
      }
      if (droppedPrefabType) {
        var nb = buildPaletteType(droppedPrefabType);
        jwDrag.prefabType = null;
        var over = e.target.closest('.jw-block');
        if (over && containerEl.contains(over)) {
          var ti = targetArr.findIndex(function(b){ return b.id === over.getAttribute('data-block-id'); });
          var after = e.clientY > over.getBoundingClientRect().top + over.getBoundingClientRect().height / 2;
          if (ti < 0) targetArr.push(nb);
          else targetArr.splice(after ? ti + 1 : ti, 0, nb);
        } else {
          targetArr.push(nb);
        }
        targetRerender();
        return;
      }

      if (!jwDrag.id) return;
      var id       = jwDrag.id;
      var srcArr   = jwDrag.srcArr;
      var srcRR    = jwDrag.srcRerender;
      jwDrag.id = null; jwDrag.srcArr = null; jwDrag.srcRerender = null;

      /* find the block in its source */
      var si = srcArr.findIndex(function(b){ return b.id === id; });
      if (si < 0) return;
      var movingBlock = srcArr.splice(si, 1)[0];

      /* figure out drop position in target */
      var over = e.target.closest('.jw-block');
      if (over && containerEl.contains(over)) {
        var ti2 = targetArr.findIndex(function(b){ return b.id === over.getAttribute('data-block-id'); });
        var after2 = e.clientY > over.getBoundingClientRect().top + over.getBoundingClientRect().height / 2;
        if (ti2 < 0) targetArr.push(movingBlock);
        else targetArr.splice(after2 ? ti2 + 1 : ti2, 0, movingBlock);
      } else {
        targetArr.push(movingBlock);
      }

      /* re-render source (if different from target) then target */
      if (srcArr !== targetArr && srcRR) srcRR();
      targetRerender();
    });
  }

  /* ── One-time drop target registration for the main canvas ── */
  function initCanvasDropTarget() {
    if (_canvasDropTargetInit) return;
    _canvasDropTargetInit = true;

    canvasInner.addEventListener('dragenter', function(e) {
      if (jwDrag.id || jwDrag.prefabType) canvasInner.classList.add('jw-drag-over');
      if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.indexOf('text/plain') >= 0)
        canvasInner.classList.add('jw-drag-over');
    });

    canvasInner.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (!jwDrag.id && !jwDrag.prefabType) return;
      var over = e.target.closest('.jw-block:not(.jw-col-block)');
      if (over && canvasInner.contains(over) && !over.closest('.jw-two-col-block')) {
        var rect = over.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) canvasInner.insertBefore(dropIndicator, over);
        else canvasInner.insertBefore(dropIndicator, over.nextSibling);
      } else if (!dropIndicator.parentNode || dropIndicator.parentNode !== canvasInner) {
        canvasInner.appendChild(dropIndicator);
      }
    });

    canvasInner.addEventListener('dragleave', function(e) {
      if (!canvasInner.contains(e.relatedTarget)) {
        if (dropIndicator.parentNode === canvasInner) canvasInner.removeChild(dropIndicator);
        canvasInner.classList.remove('jw-drag-over');
      }
    });

    canvasInner.addEventListener('drop', function(e) {
      e.preventDefault(); e.stopPropagation();
      if (dropIndicator.parentNode === canvasInner) canvasInner.removeChild(dropIndicator);
      canvasInner.classList.remove('jw-drag-over');

      /* ── Prefab drop ── */
      var droppedPrefabType = jwDrag.prefabType;
      if (!droppedPrefabType) {
        var dtData = e.dataTransfer.getData('text/plain');
        if (dtData && dtData.indexOf('prefab:') === 0) droppedPrefabType = dtData.slice(7);
      }
      if (droppedPrefabType) {
        var nb = buildPaletteType(droppedPrefabType);
        jwDrag.prefabType = null;
        /* Find position based on drop indicator location */
        var over = e.target.closest('.jw-block:not(.jw-col-block)');
        if (over && canvasInner.contains(over) && !over.closest('.jw-two-col-block')) {
          var ti = blocks.findIndex(function(b){ return b.id === over.getAttribute('data-block-id'); });
          var after = e.clientY > over.getBoundingClientRect().top + over.getBoundingClientRect().height / 2;
          if (ti < 0) blocks.push(nb);
          else blocks.splice(after ? ti + 1 : ti, 0, nb);
        } else {
          blocks.push(nb);
        }
        renderCanvas();
        return;
      }

      /* ── Block reorder ── */
      if (!jwDrag.id) return;
      var id      = jwDrag.id;
      var srcArr  = jwDrag.srcArr;
      var srcRR   = jwDrag.srcRerender;
      jwDrag.id = null; jwDrag.srcArr = null; jwDrag.srcRerender = null;

      var si = srcArr.findIndex(function(b){ return b.id === id; });
      if (si < 0) return;
      var movingBlock = srcArr.splice(si, 1)[0];

      var over2 = e.target.closest('.jw-block:not(.jw-col-block)');
      if (over2 && canvasInner.contains(over2) && !over2.closest('.jw-two-col-block')) {
        var ti2 = blocks.findIndex(function(b){ return b.id === over2.getAttribute('data-block-id'); });
        var after2 = e.clientY > over2.getBoundingClientRect().top + over2.getBoundingClientRect().height / 2;
        if (ti2 < 0) blocks.push(movingBlock);
        else blocks.splice(after2 ? ti2 + 1 : ti2, 0, movingBlock);
      } else {
        blocks.push(movingBlock);
      }

      if (srcArr !== blocks && srcRR) srcRR();
      renderCanvas();
    });
  }

  function bindDragDrop() {
    initCanvasDropTarget();
    /* Only register draggables — drop target listeners are already bound once */
    canvasInner.querySelectorAll('.jw-block:not(.jw-col-block)').forEach(function(blockEl) {
      var id = blockEl.getAttribute('data-block-id');
      var block = blocks.find(function(b){ return b.id===id; });
      if (!block) return;
      makeBlockDraggable(blockEl, block, blocks, renderCanvas);
    });
  }

  /* ══════════════════════════════════════════════════
     BLOCK CODE MODAL
  ══════════════════════════════════════════════════ */

  var codeModal = document.createElement('div');
  codeModal.id = 'jw-code-modal';
  codeModal.innerHTML = '<div class="jw-code-modal-inner"><div class="jw-code-modal-header"><span class="jw-code-modal-title">Block Markup</span><button class="jw-code-modal-close" id="jw-code-close">✕</button></div><textarea class="jw-code-modal-textarea" id="jw-code-textarea" spellcheck="false"></textarea><div class="jw-code-modal-footer"><button class="jw-code-modal-apply" id="jw-code-apply">Apply Changes</button><button class="jw-code-modal-cancel" id="jw-code-cancel">Cancel</button></div></div>';
  var codeModalBlockId = null;

  var _codeCtx = null; /* { blockArr, rerender } or null = main canvas */

  function showBlockCode(id, blockArr, rerender) {
    var arr = blockArr || blocks;
    var block = arr.find(function(b){return b.id===id;}) || blocks.find(function(b){return b.id===id;});
    if (!block) return;
    codeModalBlockId = id;
    _codeCtx = blockArr ? { arr: blockArr, rerender: rerender } : null;
    var def = BLOCK_TYPES[block.type];
    document.getElementById('jw-code-textarea').value = def ? def.markup(block.data) : '';
    codeModal.classList.add('jw-code-modal--open');
  }

  document.addEventListener('click', function(e) {
    if (e.target.id==='jw-code-close'||e.target.id==='jw-code-cancel') { codeModal.classList.remove('jw-code-modal--open'); _codeCtx=null; }
    if (e.target.id==='jw-code-apply') {
      var newMarkup = document.getElementById('jw-code-textarea').value;
      var arr = _codeCtx ? _codeCtx.arr : blocks;
      var idx = arr.findIndex(function(b){return b.id===codeModalBlockId;});
      if (idx>=0) {
        var parsed=parseMarkup(newMarkup);
        if(parsed.length===1){arr[idx]=parsed[0];arr[idx].id=codeModalBlockId;}
        else{arr.splice.apply(arr,[idx,1].concat(parsed));}
        if (_codeCtx && _codeCtx.rerender) _codeCtx.rerender();
        else renderCanvas();
      }
      codeModal.classList.remove('jw-code-modal--open');
      _codeCtx = null;
    }
  });

  /* ══════════════════════════════════════════════════
     CODE VIEW (split)
  ══════════════════════════════════════════════════ */

  var isCodeView = false;
  var splitShell = document.createElement('div'); splitShell.id='jw-split-shell'; splitShell.style.display='none';
  var splitLeft=document.createElement('div'); splitLeft.id='jw-split-left';
  var splitTextarea=document.createElement('textarea'); splitTextarea.id='jw-split-textarea'; splitTextarea.spellcheck=false;
  splitLeft.appendChild(splitTextarea);
  var splitHandle=document.createElement('div'); splitHandle.id='jw-split-handle';
  var splitRight=document.createElement('div'); splitRight.id='jw-split-preview';
  splitShell.appendChild(splitLeft); splitShell.appendChild(splitHandle); splitShell.appendChild(splitRight);

  var previewDebounce;
  splitTextarea.addEventListener('input', function() { clearTimeout(previewDebounce); previewDebounce=setTimeout(function(){fetchAndRenderPreview(splitTextarea.value,splitRight);},600); });

  function fetchAndRenderPreview(wikitext, target) {
    var form=new FormData(); form.append('wikitext',wikitext); form.append('do','preview');
    fetch('/wiki/doku.php',{method:'POST',body:form}).then(function(r){return r.text();}).then(function(html){
      var tmp=document.createElement('div'); tmp.innerHTML=html;
      var preview=tmp.getElementById('preview');
      target.innerHTML = (preview&&preview.nextElementSibling) ? preview.nextElementSibling.innerHTML : html;
    });
  }

  function enterCodeView() { isCodeView=true; syncAllBlocks(); splitTextarea.value=blocksToMarkup(); canvas.style.display='none'; splitShell.style.display='flex'; fetchAndRenderPreview(splitTextarea.value,splitRight); codeViewBtn.textContent='⊞ Visual'; codeViewBtn.classList.add('jw-btn-active'); }
  function exitCodeView() { isCodeView=false; blocks=parseMarkup(splitTextarea.value); canvas.style.display='block'; splitShell.style.display='none'; renderCanvas(); codeViewBtn.textContent='</> Code'; codeViewBtn.classList.remove('jw-btn-active'); }

  /* ══════════════════════════════════════════════════
     TOPBAR
  ══════════════════════════════════════════════════ */

  /* ── TOPBAR ── */
  var topBar = document.createElement('div'); topBar.id='jw-topbar';

  var insertToggle = document.createElement('button');
  insertToggle.id = 'jw-insert-toggle';
  insertToggle.className = 'jw-toolbar-btn jw-insert-trigger';
  insertToggle.innerHTML = '⊞ Blocks';

  var tplBtn = document.createElement('div'); tplBtn.id='jw-tpl-btn';
  tplBtn.innerHTML = '<button class="jw-toolbar-btn" id="jw-tpl-trigger">Templates ▾</button><div class="jw-tpl-dropdown" id="jw-tpl-dropdown"><div class="jw-tpl-item" data-tpl="technique">Technique Page</div><div class="jw-tpl-item" data-tpl="hero">Hero Page</div><div class="jw-tpl-item" data-tpl="article">General Article</div><div class="jw-tpl-item" data-tpl="changelog">Changelog</div><div class="jw-tpl-item" data-tpl="guide">Guide</div></div>';

  var codeViewBtn = document.createElement('button'); codeViewBtn.id='jw-code-view-btn'; codeViewBtn.className='jw-toolbar-btn'; codeViewBtn.textContent='</> Code';
  codeViewBtn.addEventListener('click', function(){ isCodeView?exitCodeView():enterCodeView(); });

  var saveGroup = document.createElement('div'); saveGroup.id='jw-save-group';
  var nativeSaveBar = editBox.querySelector('#wiki__editBar, #wiki__editbar, .editBar');
  if (nativeSaveBar) { nativeSaveBar.id='jw-savebar'; saveGroup.appendChild(nativeSaveBar); }

  var spacer = document.createElement('div'); spacer.style.flex='1';
  topBar.appendChild(insertToggle); topBar.appendChild(spacer); topBar.appendChild(tplBtn); topBar.appendChild(codeViewBtn); topBar.appendChild(saveGroup);

  /* ── BLOCK PALETTE SIDEBAR ── */
  var PALETTE_GROUPS = [
    { label:'Headings',   items:[
      {type:'heading1',     icon:'H1',  label:'Main Heading'},
      {type:'heading2',     icon:'H2',  label:'Sub Heading'},
      {type:'heading3',     icon:'H3',  label:'Tertiary'},
      {type:'sectionBanner',icon:'▬',   label:'Banner'},
    ]},
    { label:'Content',    items:[
      {type:'paragraph',    icon:'¶',   label:'Paragraph'},
      {type:'quote',        icon:'"',   label:'Quote'},
      {type:'steps',        icon:'①',  label:'Steps'},
      {type:'collapsible',  icon:'▼',  label:'Collapsible'},
      {type:'tabGroup',     icon:'⊟',  label:'Tab Group'},
      {type:'divider',      icon:'—',  label:'Divider'},
    ]},
    { label:'Callouts',   items:[
      {type:'callout-tip',    icon:'✦', label:'Tip',     cls:'jw-pc-tip'},
      {type:'callout-warning',icon:'⚠', label:'Warning', cls:'jw-pc-warn'},
      {type:'callout-danger', icon:'✕', label:'Danger',  cls:'jw-pc-danger'},
      {type:'callout-info',   icon:'ℹ', label:'Info',    cls:'jw-pc-info'},
    ]},
    { label:'Cards',      items:[
      {type:'relatedCards', icon:'⬡',  label:'Related'},
      {type:'itemBlock',    icon:'◆',  label:'Item Block'},
      {type:'abilityBlock', icon:'✦',  label:'Ability'},
      {type:'pageNav',      icon:'≡',  label:'Page Nav'},
    ]},
    { label:'Input',      items:[
      {type:'keyCombo',   icon:'⌨',  label:'Key Combo'},
      {type:'inputTable', icon:'⌨',  label:'Input Table'},
    ]},
    { label:'Data',       items:[
      {type:'statTable',  icon:'📊', label:'Stat Table'},
      {type:'barChart',   icon:'▦',  label:'Bar Chart'},
      {type:'techCredit', icon:'★',  label:'Tech Credit'},
    ]},
    { label:'Media',      items:[
      {type:'inlineImage',icon:'🖼',  label:'Image'},
      {type:'twoColumn',  icon:'⊞',  label:'Two Column'},
      {type:'videoGrid',  icon:'▶',  label:'Video Grid'},
      {type:'imageGrid',  icon:'⊞',  label:'Image Grid'},
    ]},
  ];

  var palette = document.createElement('div');
  palette.id = 'jw-palette';
  palette.innerHTML = '<div class="jw-palette-header"><span class="jw-palette-title">Blocks</span><span class="jw-palette-hint">Drag onto canvas</span></div><div class="jw-palette-body" id="jw-palette-body"></div>';

  var paletteBody = palette.querySelector('#jw-palette-body');
  var paletteOpen = false;

  /* Ghost element shown while dragging a prefab */
  var prefabGhost = document.createElement('div');
  prefabGhost.id = 'jw-prefab-ghost';
  document.body.appendChild(prefabGhost);

  /* Currently dragging prefab type */
  var prefabDragType = null;

  function buildPaletteType(rawType) {
    var type = rawType, data = {};
    if(type==='callout-tip'){type='callout';data={style:'tip',label:'Tip',text:'Add content here.'};}
    else if(type==='callout-warning'){type='callout';data={style:'warning',label:'Warning',text:'Add content here.'};}
    else if(type==='callout-danger'){type='callout';data={style:'danger',label:'Danger',text:'Add content here.'};}
    else if(type==='callout-info'){type='callout';data={style:'',label:'Info',text:'Add content here.'};}
    else{data=getDefaultData(type);}
    return makeBlock(type, data);
  }

  function buildPalette() {
    paletteBody.innerHTML = '';
    PALETTE_GROUPS.forEach(function(g) {
      var sec = document.createElement('div');
      sec.className = 'jw-ps';
      var lbl = document.createElement('div'); lbl.className='jw-ps-label'; lbl.textContent=g.label;
      sec.appendChild(lbl);
      var grid = document.createElement('div'); grid.className='jw-ps-grid';
      g.items.forEach(function(it) {
        var chip = document.createElement('div');
        chip.className = 'jw-pc' + (it.cls ? ' '+it.cls : '');
        chip.draggable = true;
        chip.setAttribute('data-prefab-type', it.type);
        chip.innerHTML = '<span class="jw-pc-icon">'+it.icon+'</span><span class="jw-pc-label">'+it.label+'</span>';

        /* dragstart: carry type via dataTransfer + shared state */
        chip.addEventListener('dragstart', function(e) {
          prefabDragType = it.type;
          /* Store in dataTransfer so drop can read it even if jwDrag got cleared */
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', 'prefab:' + it.type);
          /* jwDrag signals drop targets */
          jwDrag.prefabType = it.type;
          jwDrag.id = null;
          /* Show ghost in a pre-rendered position so setDragImage works */
          prefabGhost.textContent = it.icon + ' ' + it.label;
          prefabGhost.style.display = 'block';
          prefabGhost.style.position = 'fixed';
          prefabGhost.style.top  = '-200px';
          prefabGhost.style.left = '0px';
          /* Use the chip itself as the drag image — already rendered and sized */
          e.dataTransfer.setDragImage(chip, chip.offsetWidth / 2, chip.offsetHeight / 2);
        });
        chip.addEventListener('dragend', function() {
          prefabDragType = null;
          prefabGhost.style.display = 'none';
          jwDrag.prefabType = null;
        });

        grid.appendChild(chip);
      });
      sec.appendChild(grid);
      paletteBody.appendChild(sec);
    });
  }

  function openPalette()  { paletteOpen=true;  palette.classList.add('jw-palette-open');  insertToggle.classList.add('jw-btn-active');  sizePaletteAndCanvas(); }
  function closePalette() { paletteOpen=false; palette.classList.remove('jw-palette-open'); insertToggle.classList.remove('jw-btn-active'); sizePaletteAndCanvas(); }
  function togglePalette(){ paletteOpen ? closePalette() : openPalette(); }

  insertToggle.addEventListener('click', function(e){ e.stopPropagation(); togglePalette(); });

  buildPalette();

  /* ══════════════════════════════════════════════════
     TEMPLATES
  ══════════════════════════════════════════════════ */

  var TEMPLATES = {
    technique: [
      makeBlock('heading1',{text:'Technique Name'}),makeBlock('paragraph',{text:'Brief description.'}),
      makeBlock('heading2',{text:'Overview'}),makeBlock('paragraph',{text:'Overview here.'}),
      makeBlock('callout',{style:'tip',label:'Tip',text:'Add a helpful tip here.'}),
      makeBlock('heading2',{text:'How to Execute'}),makeBlock('steps',{steps:[{title:'Step title',desc:'Describe.'},{title:'Step title',desc:'Describe.'}]}),
      makeBlock('heading2',{text:'Input Notation'}),makeBlock('keyCombo',getDefaultData('keyCombo')),makeBlock('inputTable',getDefaultData('inputTable')),
      makeBlock('heading2',{text:'Stats'}),makeBlock('statTable',getDefaultData('statTable')),
    ],
    hero: [makeBlock('heading1',{text:'Hero Name'}),makeBlock('paragraph',{text:'Brief overview.'}),makeBlock('heading2',{text:'Movement Tech'}),makeBlock('paragraph',{text:'Techniques for this hero.'}),makeBlock('heading2',{text:'Tips'}),makeBlock('callout',{style:'tip',label:'Tip',text:'Add a key tip here.'})],
    article: [makeBlock('heading1',{text:'Article Title'}),makeBlock('paragraph',{text:'Introduction.'}),makeBlock('heading2',{text:'Section'}),makeBlock('paragraph',{text:'Content here.'})],
    guide: [makeBlock('heading1',{text:'Guide Title'}),makeBlock('pageNav',getDefaultData('pageNav')),makeBlock('paragraph',{text:'What will the reader learn?'}),makeBlock('heading2',{text:'Introduction'}),makeBlock('steps',getDefaultData('steps')),makeBlock('heading2',{text:'Summary'}),makeBlock('paragraph',{text:'Summarise.'})],
    changelog: [makeBlock('heading1',{text:'Patch X.X.X'}),makeBlock('paragraph',{text:'Month DD, YYYY'}),makeBlock('heading2',{text:'Changes'}),makeBlock('callout',{style:'tip',label:'Buff',text:'Describe.'}),makeBlock('callout',{style:'danger',label:'Nerf',text:'Describe.'})],
  };

  /* ══════════════════════════════════════════════════
     TOPBAR INTERACTIONS
  ══════════════════════════════════════════════════ */

  var tplDropdownOpen=false;

  document.addEventListener('click', function(e) {
    if (e.target.id==='jw-tpl-trigger') {
      e.stopPropagation(); tplDropdownOpen=!tplDropdownOpen;
      var td=document.getElementById('jw-tpl-dropdown'); if(td)td.classList.toggle('js-tpl-open',tplDropdownOpen);
    } else if (!e.target.closest('#jw-tpl-dropdown') && !e.target.closest('#jw-palette')) {
      tplDropdownOpen=false;
      var td2=document.getElementById('jw-tpl-dropdown'); if(td2)td2.classList.remove('js-tpl-open');
    }

    /* Palette chips also support click-to-append as fallback */
    var chip = e.target.closest('[data-prefab-type]');
    if (chip && chip.closest('#jw-palette')) {
      var nb = buildPaletteType(chip.getAttribute('data-prefab-type'));
      blocks.push(nb); renderCanvas();
      setTimeout(function(){ var last=canvasInner.querySelector('.jw-block:last-of-type'); if(last)last.scrollIntoView({behavior:'smooth',block:'center'}); },100);
    }

    var tplItem = e.target.closest('.jw-tpl-item');
    if (tplItem) {
      var tpl=tplItem.getAttribute('data-tpl');
      if(TEMPLATES[tpl]&&(blocks.length===0||confirm('Load template? This will replace current content.'))){
        blocks=TEMPLATES[tpl].map(function(b){return makeBlock(b.type,JSON.parse(JSON.stringify(b.data)));});
        renderCanvas();
      }
      tplDropdownOpen=false; var td3=document.getElementById('jw-tpl-dropdown'); if(td3)td3.classList.remove('js-tpl-open');
    }
  });

  /* ══════════════════════════════════════════════════
     TEXT FORMATTING TOOLBAR
  ══════════════════════════════════════════════════ */

  var textToolbar = document.createElement('div');
  textToolbar.id = 'jw-text-toolbar';
  textToolbar.innerHTML =
    '<button class="jw-tt-btn" data-cmd="bold"         title="Bold">B</button>' +
    '<button class="jw-tt-btn" data-cmd="italic"       title="Italic">I</button>' +
    '<button class="jw-tt-btn" data-cmd="underline"    title="Underline">U</button>' +
    '<button class="jw-tt-btn" data-cmd="strikeThrough" title="Strikethrough">S</button>' +
    '<div class="jw-tt-sep"></div>' +
    '<select class="jw-tt-font" title="Font">' +
      '<option value="" style="font-family:sans-serif">— Font —</option>' +
      '<option value="Forevs, serif"       style="font-family:Forevs,serif">Forevs</option>' +
      '<option value="Radiance, sans-serif" style="font-family:Radiance,sans-serif">Radiance</option>' +
      '<option value="Valve Oracle, serif"  style="font-family:Valve Oracle,serif">Oracle</option>' +
      '<option value="Valve Pulp, serif"    style="font-family:Valve Pulp,serif">Pulp</option>' +
      '<option value="Valve Occult, serif"  style="font-family:Valve Occult,serif">Occult</option>' +
      '<option value="Georgia, serif"       style="font-family:Georgia,serif">Georgia</option>' +
      '<option value="Courier New, monospace" style="font-family:Courier New,monospace">Courier</option>' +
    '</select>' +
    '<select class="jw-tt-size" title="Font size">' +
      '<option value="">— Size —</option>' +
      '<option value="10px">10</option><option value="12px">12</option><option value="14px">14</option>' +
      '<option value="16px">16</option><option value="18px">18</option><option value="20px">20</option>' +
      '<option value="24px">24</option><option value="28px">28</option><option value="32px">32</option>' +
      '<option value="40px">40</option><option value="48px">48</option><option value="64px">64</option>' +
    '</select>' +
    '<div class="jw-tt-sep"></div>' +
    '<button class="jw-tt-btn" data-cmd="link"         title="Link">🔗</button>' +
    '<button class="jw-tt-btn" data-cmd="removeFormat" title="Clear formatting">✕</button>' +
    '<div class="jw-tt-sep"></div>' +
    '<button class="jw-tt-btn" id="jw-tt-icon-btn"    title="Insert stat icon">⊕ Icon</button>' +
    '<div class="jw-tt-sep"></div>' +
    '<div class="jw-tt-colors" title="Text color presets">' +
      '<span class="jw-tt-color-label">Color:</span>' +
      '<button class="jw-tt-color" data-color="#f0c060" style="background:#f0c060;" title="Weapon Damage (amber)"></button>' +
      '<button class="jw-tt-color" data-color="#e05050" style="background:#e05050;" title="Spirit Damage (red)"></button>' +
      '<button class="jw-tt-color" data-color="#60c060" style="background:#60c060;" title="Healing / Vitality (green)"></button>' +
      '<button class="jw-tt-color" data-color="#60c8f0" style="background:#60c8f0;" title="Move Speed / Range (teal)"></button>' +
      '<button class="jw-tt-color" data-color="#a080e0" style="background:#a080e0;" title="Spirit Power (purple)"></button>' +
      '<button class="jw-tt-color" data-color="#f09040" style="background:#f09040;" title="Fire / Bleed (orange)"></button>' +
      '<button class="jw-tt-color" data-color="#ffffff" style="background:#ffffff;border:1px solid #555;" title="White (bold terms)"></button>' +
      '<button class="jw-tt-color" data-color="remove" style="background:linear-gradient(135deg,#888 40%,#f00 40%);" title="Remove color"></button>' +
    '</div>';
  document.body.appendChild(textToolbar);

  var savedRange = null;

  document.addEventListener('selectionchange', function() {
    /* Don't hide toolbar while the inline icon modal is open */
    if (inlineIconModal && inlineIconModal.classList.contains('jw-inline-icon-open')) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { textToolbar.style.display='none'; return; }
    var node = sel.anchorNode;
    while (node && node !== document.body) {
      if (node.nodeType===1 && node.getAttribute && node.getAttribute('contenteditable')==='true') {
        savedRange = sel.getRangeAt(0).cloneRange();
        var rect = sel.getRangeAt(0).getBoundingClientRect();
        if (!rect || rect.width===0) { textToolbar.style.display='none'; return; }
        textToolbar.style.display = 'flex';
        var th=textToolbar.offsetHeight||56, tw=textToolbar.offsetWidth||380, gap=12;
        var left=rect.left+(rect.width/2)-(tw/2);
        left=Math.max(8,Math.min(left,window.innerWidth-tw-8));
        var topAbove=rect.top-th-gap, topBelow=rect.bottom+gap;
        var top=topAbove>=8?topAbove:topBelow;
        textToolbar.style.left=left+'px'; textToolbar.style.top=top+'px';
        return;
      }
      node = node.parentNode;
    }
    textToolbar.style.display = 'none';
  });

  function restoreSelection() {
    if (!savedRange) return;
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  textToolbar.addEventListener('mousedown', function(e) {
    var btn = e.target.closest('.jw-tt-btn');
    if (!btn) return;
    e.preventDefault();
    restoreSelection();
    var cmd = btn.getAttribute('data-cmd');
    if (cmd === 'link') { var url=prompt('Enter URL:'); if(url) document.execCommand('createLink',false,url); }
    else { document.execCommand(cmd,false,null); }
  });

  /* Color preset buttons */
textToolbar.querySelectorAll('.jw-tt-color').forEach(function(btn) {
    btn.addEventListener('mousedown', function(e) {
      e.preventDefault();
      if (savedRange) {
        try { var s=window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); } catch(e2) {}
      }
      var color = btn.getAttribute('data-color');

      /* Find the active contenteditable field from savedRange */
      var activeField = null;
      if (savedRange) {
        var n = savedRange.commonAncestorContainer;
        while (n && n !== document.body) {
          if (n.nodeType === 1 && n.getAttribute && n.getAttribute('contenteditable') === 'true') {
            activeField = n; break;
          }
          n = n.parentNode;
        }
      }

      if (color === 'remove') {
        document.execCommand('removeFormat', false, null);
        if (savedRange) {
          var sel = window.getSelection();
          if (sel && !sel.isCollapsed) {
            var range = sel.getRangeAt(0);
            var frag = range.extractContents();
            var tmp = document.createElement('div');
            tmp.appendChild(frag);
            range.insertNode(document.createTextNode(tmp.textContent));
          }
        }
        /* Clear filter and strip color from all icon spans in the field */
        if (activeField) {
activeField.querySelectorAll('.jw-icon-preview').forEach(function(sp) {
            var img = sp.querySelector('img');
            if (img) img.style.filter = '';
            var holder = sp.querySelector('span');
            if (holder) holder.textContent = holder.textContent
              .replace(/\{\{icon:([a-z_]+):[0-9a-f]{6}\}\}/g, '{{icon:$1}}');
          });
        }
      } else {
        document.execCommand('foreColor', false, color);
        /* Tint all icon spans in the active field to match */
        if (activeField) {
          var hex = color.replace('#', '').toLowerCase();
          var filterStr = colorHexToEditorFilter(hex);
activeField.querySelectorAll('.jw-icon-preview').forEach(function(sp) {
            var img = sp.querySelector('img');
            if (img) img.style.filter = filterStr;
            var holder = sp.querySelector('span');
            if (holder) holder.textContent = holder.textContent
              .replace(/\{\{icon:([a-z_]+)(?::[0-9a-f]{6})?\}\}/g, '{{icon:$1:' + hex + '}}');
          });
        }
      }
    });
  });
function rgbToHex(rgb) {
    var m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return '';
    return ('0' + parseInt(m[1]).toString(16)).slice(-2) +
           ('0' + parseInt(m[2]).toString(16)).slice(-2) +
           ('0' + parseInt(m[3]).toString(16)).slice(-2);
  }

var EDITOR_COLOR_FILTERS = {
    'f0c060': 'brightness(0) sepia(1) saturate(4) hue-rotate(10deg) brightness(1.4)',    /* amber */
    'e05050': 'brightness(0) sepia(1) saturate(5) hue-rotate(310deg) brightness(1.3)',   /* red */
    '60c060': 'brightness(0) sepia(1) saturate(3) hue-rotate(80deg) brightness(1.2)',    /* green */
    '60c8f0': 'brightness(0) sepia(1) saturate(4) hue-rotate(165deg) brightness(1.4)',   /* teal */
    'a080e0': 'brightness(0) sepia(1) saturate(4) hue-rotate(220deg) brightness(1.3)',   /* purple */
    'f09040': 'brightness(0) sepia(1) saturate(5) hue-rotate(340deg) brightness(1.3)',   /* orange */
    'ffffff': 'brightness(0) invert(1) brightness(1.5)',                                 /* white */
  };
  function colorHexToEditorFilter(hex) {
    return EDITOR_COLOR_FILTERS[hex.toLowerCase()] ||
           'brightness(0) sepia(1) saturate(3) hue-rotate(0deg) brightness(1.2)';
  }
  /* Inline icon button in toolbar */
  var ttIconBtn = document.getElementById('jw-tt-icon-btn');
  var ttIconTargetEl = null;
  if (ttIconBtn) {
    ttIconBtn.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      /* Capture target AND save the current selection range BEFORE it collapses */
      var sel = window.getSelection();
      if (sel && sel.anchorNode) {
        /* Save range explicitly so inlineIconInsert can restore it */
        if (sel.rangeCount > 0) {
          savedRange = sel.getRangeAt(0).cloneRange();
        }
        var n = sel.anchorNode;
        while (n && n !== document.body) {
          if (n.nodeType===1 && n.getAttribute && n.getAttribute('contenteditable')==='true') {
            ttIconTargetEl = n;
            break;
          }
          n = n.parentNode;
        }
      }
    });
    ttIconBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!ttIconTargetEl) return;
      /* Keep toolbar visible while modal is open */
      textToolbar.style.display = 'flex';
      inlineIconTarget = ttIconTargetEl;
      /* Position modal below toolbar button */
      var rect = ttIconBtn.getBoundingClientRect();
      var grid = document.getElementById('jw-inline-icon-grid');
      var icons = allInlineIcons();
      var cats = [];
      icons.forEach(function(ic){ if(cats.indexOf(ic.cat)<0) cats.push(ic.cat); });
      grid.innerHTML = cats.map(function(cat){
        return '<div class="jw-inline-cat-label">'+cat+'</div>' +
          icons.filter(function(ic){return ic.cat===cat;}).map(function(ic){
            var url = ic.url || (STAT_ICON_BASE + ic.file);
            return '<button class="jw-inline-icon-btn" data-key="'+ic.key+'" title="'+ic.label+'">' +
              '<img src="'+url+'" style="width:20px;height:20px;object-fit:contain;display:block;" />' +
              '</button>';
          }).join('');
      }).join('');
      inlineIconModal.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
      inlineIconModal.style.left = Math.max(8, rect.left + window.scrollX - 80) + 'px';
      inlineIconModal.classList.add('jw-inline-icon-open');
      grid.querySelectorAll('.jw-inline-icon-btn').forEach(function(btn) {
        btn.addEventListener('click', function(ev) {
          ev.stopPropagation();
          inlineIconInsert(btn.getAttribute('data-key'));
          inlineIconClose();
          ttIconTargetEl = null;
        });
      });
    });
  }

  textToolbar.querySelector('.jw-tt-font').addEventListener('change', function() {
    restoreSelection();
    if (this.value) {
      var sel=window.getSelection();
      if(sel&&!sel.isCollapsed){
        var range=sel.getRangeAt(0);
        var span=document.createElement('span');
        span.style.fontFamily=this.value;
        try{range.surroundContents(span);}catch(e){var frag=range.extractContents();span.appendChild(frag);range.insertNode(span);}
      }
    }
    this.value='';
  });

  textToolbar.querySelector('.jw-tt-size').addEventListener('change', function() {
    restoreSelection();
    if (this.value) {
      var sel=window.getSelection();
      if(sel&&!sel.isCollapsed){
        var range=sel.getRangeAt(0);
        var span=document.createElement('span');
        span.style.fontSize=this.value;
        try{range.surroundContents(span);}catch(e){var frag=range.extractContents();span.appendChild(frag);range.insertNode(span);}
      }
    }
    this.value='';
  });

  /* ══════════════════════════════════════════════════
     SAVE
  ══════════════════════════════════════════════════ */

  function saveToTextarea() {
    if (isCodeView) textarea.value=splitTextarea.value;
    else { syncAllBlocks(); textarea.value=blocksToMarkup(); }
  }

  var dwForm = document.getElementById('dw__editform');
  function submitWithAction(action) {
    saveToTextarea(); if(!dwForm)return;
    var hidden=document.createElement('input'); hidden.type='hidden'; hidden.name='do['+action+']'; hidden.value='1';
    dwForm.appendChild(hidden); dwForm.submit();
  }

  document.addEventListener('click', function(e) {
    var btn=e.target.closest('button[name^="do["]'); if(!btn)return;
    var action=btn.getAttribute('name').replace('do[','').replace(']','');
    e.preventDefault(); submitWithAction(action);
  });

  /* ══════════════════════════════════════════════════
     ENTRANCE MODAL
  ══════════════════════════════════════════════════ */

  if (textarea.value.trim()==='') {
    var modal=document.createElement('div'); modal.id='jw-entrance-modal';
    modal.innerHTML='<div class="jsem-overlay"><div class="jsem-header"><div class="jsem-eyebrow">New Page · JumpStart</div><div class="jsem-title">What are you creating?</div><div class="jsem-sub">Select a template to get started</div><div class="jsem-divider"></div></div><div class="jsem-grid"><div class="jsem-card active" data-tpl="technique"><div class="jsem-card-bg jsem-bg-movement"></div><div class="jsem-card-overlay"></div><div class="jsem-card-label"><span class="jsem-card-name">Movement Tech</span><span class="jsem-card-sub">Techniques · Mechanics</span></div></div><div class="jsem-card" data-tpl="hero"><div class="jsem-card-bg jsem-bg-characters"></div><div class="jsem-card-overlay"></div><div class="jsem-card-label"><span class="jsem-card-name">Characters</span><span class="jsem-card-sub">Hero Pages</span></div></div><div class="jsem-card" data-tpl="article"><div class="jsem-card-bg jsem-bg-items"></div><div class="jsem-card-overlay"></div><div class="jsem-card-label"><span class="jsem-card-name">Items & Abilities</span><span class="jsem-card-sub">Item Entries</span></div></div><div class="jsem-card" data-tpl="guide"><div class="jsem-card-bg jsem-bg-guides"></div><div class="jsem-card-overlay"></div><div class="jsem-card-label"><span class="jsem-card-name">Guides</span><span class="jsem-card-sub">Tutorials · Articles</span></div></div></div><div class="jsem-footer"><button class="jsem-btn-skip" id="jw-modal-skip">Skip</button><button class="jsem-btn-create" id="jw-modal-create">Create Page →</button></div></div>';
    document.body.appendChild(modal);
    var selectedTpl='technique';
    modal.querySelectorAll('.jsem-card').forEach(function(card){card.addEventListener('click',function(){modal.querySelectorAll('.jsem-card').forEach(function(c){c.classList.remove('active');});card.classList.add('active');selectedTpl=card.getAttribute('data-tpl');});});
    document.getElementById('jw-modal-create').addEventListener('click',function(){if(TEMPLATES[selectedTpl]){blocks=TEMPLATES[selectedTpl].map(function(b){return makeBlock(b.type,JSON.parse(JSON.stringify(b.data)));});renderCanvas();}modal.style.opacity='0';modal.style.transition='opacity 0.35s';setTimeout(function(){modal.style.display='none';},350);});
    document.getElementById('jw-modal-skip').addEventListener('click',function(){modal.style.opacity='0';modal.style.transition='opacity 0.35s';setTimeout(function(){modal.style.display='none';},350);});
  }

  /* ══════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════ */

  if (textarea.value.trim()) blocks=parseMarkup(textarea.value);

  editBox.style.position='absolute'; editBox.style.left='-9999px'; editBox.style.width='1px'; editBox.style.height='1px'; editBox.style.overflow='hidden';
  var dwContent=document.querySelector('#dokuwiki__content'); if(dwContent)dwContent.style.cssText='padding:0!important;margin:0!important;';
  var dwMain=document.querySelector('main.dw-container'); if(dwMain)dwMain.style.cssText='padding:0!important;margin:0!important;';

  document.body.appendChild(topBar);
  document.body.appendChild(palette);
  document.body.appendChild(canvas);
  document.body.appendChild(splitShell);
  document.body.appendChild(codeModal);

  var draft=document.getElementById('draft__status'); if(draft)draft.style.display='none';
  var footer=document.querySelector('footer'); if(footer)footer.style.cssText='height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;';

  document.documentElement.style.overflow='hidden';
  document.documentElement.style.height='100%';
  document.body.style.overflow='hidden';
  document.body.style.height='100%';

  renderCanvas();

  var PALETTE_W = 260;

  function sizePaletteAndCanvas() {
    var tbBottom = topBar.getBoundingClientRect().bottom;
    var available = window.innerHeight - tbBottom;
    /* palette */
    palette.style.top    = tbBottom + 'px';
    palette.style.height = available + 'px';
    /* canvas shifts right when palette is open */
    var leftOffset = paletteOpen ? PALETTE_W : 0;
    canvas.style.marginLeft    = leftOffset + 'px';
    splitShell.style.marginLeft= leftOffset + 'px';
    canvas.style.height    = available + 'px';
    splitShell.style.height= available + 'px';
  }

  /* alias for old call sites */
  var sizeCanvas = sizePaletteAndCanvas;

  setTimeout(sizePaletteAndCanvas, 200);
  setTimeout(sizePaletteAndCanvas, 600);
  window.addEventListener('resize', sizePaletteAndCanvas);



  /* ── INLINE ICONS — uses STAT_TYPES + Souls/Spirit ── */
  var INLINE_ICON_BASE = '/wiki/lib/tpl/bootstrap3/images/icons/';
  var EXTRA_INLINE_ICONS = [
    { key:'souls',  url: INLINE_ICON_BASE+'Souls.png',   label:'Souls',         cat:'Economy' },
    { key:'spirit', url: INLINE_ICON_BASE+'Spirit.png',  label:'Spirit Points', cat:'Economy' },
  ];
  function allInlineIcons() {
    return EXTRA_INLINE_ICONS.concat(STAT_TYPES);
  }

  /* Inline icon picker mini modal */
  var inlineIconModal = document.createElement('div');
  inlineIconModal.id = 'jw-inline-icon-modal';
  inlineIconModal.innerHTML = '<div id="jw-inline-icon-grid"></div>';
  document.body.appendChild(inlineIconModal);

  var inlineIconTarget = null; /* the contenteditable field to insert into */

  function inlineIconOpen(targetEl, anchorEl) {
    inlineIconTarget = targetEl;
    var grid = document.getElementById('jw-inline-icon-grid');
    var icons = allInlineIcons();
    var cats = [];
    icons.forEach(function(ic) { if (cats.indexOf(ic.cat) < 0) cats.push(ic.cat); });
    grid.innerHTML = cats.map(function(cat) {
      var catIcons = icons.filter(function(ic){ return ic.cat === cat; });
      return '<div class="jw-inline-cat-label">'+cat+'</div>' +
        catIcons.map(function(ic) {
          var url = ic.url || (STAT_ICON_BASE + ic.file);
          return '<button class="jw-inline-icon-btn" data-key="'+ic.key+'" title="'+ic.label+'">' +
            '<img src="'+url+'" style="width:20px;height:20px;object-fit:contain;display:block;" />' +
            '</button>';
        }).join('');
    }).join('');
    /* Position near anchor */
    var rect = anchorEl.getBoundingClientRect();
    inlineIconModal.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    inlineIconModal.style.left = (rect.left  + window.scrollX) + 'px';
    inlineIconModal.classList.add('jw-inline-icon-open');
    grid.querySelectorAll('.jw-inline-icon-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        inlineIconInsert(btn.getAttribute('data-key'));
        inlineIconClose();
      });
    });
  }

  function inlineIconClose() {
    inlineIconModal.classList.remove('jw-inline-icon-open');
    inlineIconTarget = null;
  }

  function inlineIconInsert(key) {
    if (!inlineIconTarget) return;
    var url = statIconUrl(key) || (key === 'souls' ? '/wiki/lib/tpl/bootstrap3/images/icons/Souls.png' : key === 'spirit' ? '/wiki/lib/tpl/bootstrap3/images/icons/Spirit.png' : STAT_ICON_BASE + key + '.png');

    /* Insert a text token {{icon:KEY}} into the contenteditable field.
       This survives DokuWiki's HTML Purifier completely — it's plain text.
       jumpstart-live.js scans all text nodes on the live page and replaces
       these tokens with actual <img> elements.
       In the editor, we also visually render it as a small icon span. */
/* Check if there's an active color selection to bake into the token */
    var activeColor = '';
    if (savedRange) {
      var sel0 = window.getSelection();
      if (sel0 && sel0.anchorNode) {
        var colorSpan = sel0.anchorNode.nodeType === 3
          ? sel0.anchorNode.parentElement : sel0.anchorNode;
        while (colorSpan && colorSpan !== document.body) {
          var cs = colorSpan.style && colorSpan.style.color;
          if (cs) { activeColor = cs; break; }
          colorSpan = colorSpan.parentElement;
        }
      }
    }
    function rgbToHex(rgb) {
    var m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return '';
    return ('0' + parseInt(m[1]).toString(16)).slice(-2) +
           ('0' + parseInt(m[2]).toString(16)).slice(-2) +
           ('0' + parseInt(m[3]).toString(16)).slice(-2);
  }
    var tokenColor = activeColor ? rgbToHex(activeColor) : '';
    var token = '{{icon:' + key + (tokenColor ? ':'+tokenColor : '') + '}}';
var EDITOR_COLOR_FILTERS = {
    'f0c060': 'invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(1.05)',
    'e05050': 'invert(1) sepia(1) saturate(4) hue-rotate(310deg) brightness(0.95)',
    '60c060': 'invert(1) sepia(1) saturate(2) hue-rotate(80deg) brightness(1.0)',
    '60c8f0': 'invert(1) sepia(1) saturate(3) hue-rotate(165deg) brightness(1.1)',
    'a080e0': 'invert(1) sepia(1) saturate(3) hue-rotate(220deg) brightness(1.05)',
    'f09040': 'invert(1) sepia(1) saturate(4) hue-rotate(340deg) brightness(1.0)',
    'ffffff': 'invert(1) brightness(2)',
  };
  function colorHexToEditorFilter(hex) {
    return EDITOR_COLOR_FILTERS[hex.toLowerCase()] ||
           'invert(1) sepia(1) saturate(3) hue-rotate(0deg)';
  }
    /* Visual preview in editor: a span showing the icon */
var preview = document.createElement('span');
    preview.className = 'jw-icon-preview';
    preview.setAttribute('contenteditable', 'false');
    preview.style.cssText = 'display:inline-block;width:20px;height:20px;vertical-align:middle;margin:0 1px;cursor:default;position:relative;overflow:hidden;';

    /* Actual <img> so CSS filter works reliably */
    var previewImg = document.createElement('img');
    previewImg.src = url;
    previewImg.style.cssText = 'width:20px;height:20px;object-fit:contain;display:block;pointer-events:none;';
    if (tokenColor) {
      previewImg.style.filter = colorHexToEditorFilter(tokenColor);
    }
    preview.appendChild(previewImg);

    /* Token stored as a hidden text node AFTER the img so innerHTML captures it */
    var tokenNode = document.createTextNode(token);
    var tokenHolder = document.createElement('span');
    tokenHolder.style.cssText = 'font-size:0;width:0;height:0;overflow:hidden;position:absolute;';
    tokenHolder.appendChild(tokenNode);
    preview.appendChild(tokenHolder);

    inlineIconTarget.focus();

    var range;
    if (savedRange) {
      try {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
        range = savedRange.cloneRange();
      } catch(e) {}
    }
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(inlineIconTarget);
      range.collapse(false);
    }

    range.deleteContents();
    range.insertNode(preview);
    range.setStartAfter(preview);
    range.collapse(true);
    var sel2 = window.getSelection();
    sel2.removeAllRanges();
    sel2.addRange(range);
    savedRange = range.cloneRange();
    inlineIconTarget.dispatchEvent(new Event('input', {bubbles:true}));
  }

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#jw-inline-icon-modal') &&
        !e.target.closest('.jw-inline-icon-trigger') &&
        !e.target.closest('#jw-tt-icon-btn')) {
      inlineIconClose();
    }
  });


  /* ── ICON DATA ── */
  var ICON_BASE = '/wiki/lib/tpl/bootstrap3/images/icons/';
  var ITEM_ICONS = {
    weapon: ["ActiveReload", "AlchemicalFire", "Armor PiercingRounds", "BallisticEnchantment", "Berserker", "BloodTribute", "Burst Fire", "Capacitor", "CloseQuarters", "CripplingHeadshot", "CrushingFists", "CultistSacrifice", "EscalatingResilience", "ExpressShot", "ExtendedMagazine", "Fleetfoot", "Frenzy", "GlassCannon", "Headhunter", "HeadshotBooster", "HeroicAura", "High-VelocityRounds", "HollowPoint", "Hunter_sAura", "IntensifyingMagazine", "KineticDash", "LongRange", "Lucky Shot", "MeleeCharge", "MonsterRounds", "MysticShot", "OpeningRounds", "PointBlank", "RapidRounds", "RechargingRush", "RestorativeShot", "Ricochet", "ShadowWeave", "Sharpshooter", "Silencer", "SlowingBullets", "Spellslinger", "Spirit Rend", "Spirit ShredderBullets", "SpiritualOverflow", "Split Shot", "Stalker", "SwiftStriker", "TeslaBullets", "TitanicMagazine", "ToxicBullets", "WeakeningHeadshot", "WeightedShots"],
    vitality: ["Battle Vest", "BulletLifesteal", "BulletResilience", "CheatDeath", "Colossus", "Counterspell", "DebuffReducer", "DispelMagic", "DivineBarrier", "Diviner_sKevlar", "Enchanter_sEmblem", "EnduringSpeed", "ExtraHealth", "ExtraRegen", "ExtraStamina", "Fortitude", "Fury Trance", "Grit", "GuardianWard", "Healbane", "HealingBooster", "HealingNova", "HealingRite", "HealingTempo", "Indomitable", "Infuser", "Inhibitor", "Juggernaut", "Leech", "Lifestrike", "MajesticLeap", "MeleeLifesteal", "Metal Skin", "PhantomStrike", "PlatedArmor", "ReactiveBarrier", "Rebuttal", "RescueBeam", "RestorativeLocket", "Return Fire", "SiphonBullets", "Spellbreaker", "SpiritLifesteal", "SpiritResilience", "SpiritShielding", "SprintBoots", "StaminaMastery", "Unstoppable", "VampiricBurst", "Veil Walker", "Warp Stone", "WeaponShielding", "Witchmail"],
    spirit: ["ArcaneSurge", "Arctic Blast", "BoundlessSpirit", "Bullet ResistShredder", "Cold Front", "CompressCooldown", "CursedRelic", "Decay", "DisarmingHex", "DurationExtender", "Echo Shard", "EscalatingExposure", "EtherealShift", "ExtraCharge", "ExtraSpirit", "Focus Lens", "GoldenGooseEgg", "GreaterExpansion", "ImprovedSpirit", "Knockdown", "LightningScroll", "MagicCarpet", "MercurialMagnum", "MysticBurst", "MysticExpansion", "MysticRegeneration", "MysticReverb", "MysticSlow", "MysticVulnerability", "QuicksilverReload", "RadiantRegeneration", "RapidRecharge", "Refresher", "RustedBarrel", "Scourge", "SilenceWave", "SlowingHex", "Spirit Burn", "Spirit Sap", "SpiritSnatch", "SpiritStrike", "SuperiorCooldown", "SuperiorDuration", "Suppressor", "Surge ofPower", "Tankbuster", "TormentPulse", "TranscendentCooldown", "Vortex Web"],
  };
  var ABILITY_ICONS = {"Abrams": ["bull_beef_psd", "bull_charge_psd", "bull_drain_psd", "bull_jump_psd"], "Bebop": ["bebop_hook_psd", "bebop_hyper_beam_psd", "bebop_sticky_bomb_psd", "bebop_uppercut_psd"], "Calico": ["nano_catform_psd", "nano_clustergrenade_psd", "nano_dash_psd", "nano_shadow_pulse_psd"], "Dynamo": ["sumo_pork_bun_psd", "sumo_quantum_psd", "sumo_stomp_psd", "sumo_vacuum_psd"], "Grey Talon": ["archer_charged_shot_psd", "archer_guided_arrow_psd", "archer_power_jump_psd", "imobolize_trap_psd"], "Haze": ["haze_bullet_flurry_psd", "haze_fixation_psd", "haze_sleep_dagger_psd", "haze_smoke_bomb_psd"], "Holliday": ["bounce_pad_psd", "gravity_lasso_psd", "inferno_bomb_v2_psd", "mirage_ethereal_bullets_psd"], "Infernus": ["inferno_bomb_psd", "inferno_dash_psd", "inferno_deflect_psd", "inferno_molotov_psd"], "Ivy": ["tengu_lightning_crash_psd", "tengu_stone_form_psd", "tengu_storm_flask_psd", "tengu_tether_psd"], "Kelvin": ["freezing_grenade_psd", "frozen_shelter_psd", "ice_beam_psd", "ice_path_psd"], "Lady Geist": ["ghost_blood_draw_psd", "ghost_LifeDrain_psd", "ghost_siphon_psd", "ghost_soul_bomb_psd"], "Lash": ["lash_death_slam_psd", "lash_flog_psd", "lash_grapple_psd", "lash_ground_strike_psd"], "McGinnis": ["engineer_fissure_2_psd", "engineer_resupply_psd", "engineer_rockets_psd", "engineer_turret_psd"], "Mirage": ["mirage_fire_beetles_psd", "mirage_sand_phantom_psd", "mirage_tornado_psd", "teleport_icon_psd"], "Mo & Krill": ["grappler_combo_psd", "grappler_regen_psd", "grappler_spin_psd", "grappler_throw_sand_psd"], "Paradox": ["chrono_swap_psd", "chrono_time_bomb_psd", "chrono_time_wall_psd", "duo_attack_psd"], "Pocket": ["synth_affliction_psd", "synth_barrage_psd", "synth_plasma_flux_psd", "synth_pulse_psd"], "Raven": ["operative_blindside_psd", "sprint_booster_psd", "sumo_pork_bun_psd", "wraith_aura_psd"], "Seven": ["giga_ball_psd", "giga_chain_psd", "giga_static_psd", "giga_storm_psd"], "Shiv": ["rutger_cheat_death_psd", "shiv_flash_psd", "shiv_killing_blow_psd", "shiv_toss_psd"], "Sinclair": ["magician_animalcurse_psd", "magician_cloneturret_psd", "magician_copyult_psd", "magician_magicbolt_psd"], "Vindicta": ["hornet_assassinate_psd", "hornet_crow_psd", "pestilence_chain_psd", "wasp_flight_psd"], "Viscous": ["damage_melee_psd", "viscous_goo_ball_psd", "viscous_goo_sphere_psd", "viscous_restorative_goo_psd"], "Vyper": ["viper_debuffdagger_psd", "viper_petrifybola_psd", "viper_snakedash_psd", "viper_venom_psd"], "Warden": ["warden_crowd_control_psd", "warden_high_alert_psd", "warden_lock_down_psd", "warden_riot_protocol_psd"], "Wraith": ["wraith_aura_psd", "wraith_card_trick_psd", "wraith_lift_psd", "wraith_teleport_psd"], "Yamato": ["yamato_blinding_steel_psd", "yamato_crimson_slash_psd", "yamato_flying_strike_psd", "yamato_power_slash_psd"]};

  /* Get item icon URL */
  function itemIconUrl(type, name) {
    if (!name) return '';
    var folder = type.charAt(0).toUpperCase() + type.slice(1);
    return ICON_BASE + folder + '/' + encodeURIComponent(name) + '.png';
  }
  /* Get ability icon URL */
  function abilityIconUrl(hero, iconFile) {
    if (!hero || !iconFile) return '';
    return ICON_BASE + 'Hero Abilities /' + encodeURIComponent(hero) + '/' + iconFile + '.png';
  }


  /* ── STAT TYPE PICKER — shared mini picker for chips and grid stats ── */
  var statPickerModal = document.createElement('div');
  statPickerModal.id = 'jw-stat-picker';
  statPickerModal.innerHTML = '<div id="jw-stat-picker-inner"><div id="jw-stat-picker-grid"></div></div>';
  document.body.appendChild(statPickerModal);
  var statPickerCb = null;

  function openStatPicker(anchorEl, cb) {
    statPickerCb = cb;
    var grid = document.getElementById('jw-stat-picker-grid');
    var cats = [];
    STAT_TYPES.forEach(function(s){ if(cats.indexOf(s.cat)<0) cats.push(s.cat); });
    grid.innerHTML = cats.map(function(cat){
      return '<div class="jw-sp-cat">'+cat+'</div>' +
        STAT_TYPES.filter(function(s){return s.cat===cat;}).map(function(s){
          var url = s.url || (STAT_ICON_BASE + s.file);
          return '<button class="jw-sp-btn" data-key="'+s.key+'" title="'+s.label+'">'+
            '<img src="'+url+'" /><span>'+s.label+'</span></button>';
        }).join('');
    }).join('');
    var rect = anchorEl.getBoundingClientRect();
    statPickerModal.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    statPickerModal.style.left = Math.max(0, rect.left + window.scrollX - 80) + 'px';
    statPickerModal.classList.add('jw-sp-open');
    grid.querySelectorAll('.jw-sp-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        if(statPickerCb) statPickerCb(btn.getAttribute('data-key'));
        statPickerModal.classList.remove('jw-sp-open');
        statPickerCb = null;
      });
    });
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest('#jw-stat-picker') && !e.target.closest('.jw-chip-stat-pick') && !e.target.closest('.jw-grid-stat-pick')){
      statPickerModal.classList.remove('jw-sp-open');
      statPickerCb = null;
    }
  });


  /* ══════════════════════════════════════════════════
     GAME DATA LIBRARY — ability/item reference picker
  ══════════════════════════════════════════════════ */

  /* ── Modal DOM ── */
  var libModal = document.createElement('div');
  libModal.id = 'jw-lib-modal';
  libModal.innerHTML = [
    '<div id="jw-lib-inner">',
      '<div id="jw-lib-header">',
        '<span id="jw-lib-title">Game Data Library</span>',
        '<input id="jw-lib-search" type="text" placeholder="Search..." autocomplete="off">',
        '<button id="jw-lib-close">×</button>',
      '</div>',
      '<div id="jw-lib-tabs">',
        '<button class="jw-lib-tab jw-lib-tab-active" data-type="abilities">Abilities</button>',
        '<button class="jw-lib-tab" data-type="items">Items</button>',
      '</div>',
      '<div id="jw-lib-list"></div>',
      '<div id="jw-lib-footer">',
        '<span id="jw-lib-status"></span>',
      '</div>',
    '</div>',
  ].join('');
  document.body.appendChild(libModal);

  /* ── ICON PICKER MODAL ── */
  var iconModal = document.createElement('div');
  iconModal.id = 'jw-icon-modal';
  iconModal.innerHTML = [
    '<div id="jw-icon-inner">',
      '<div id="jw-icon-header">',
        '<span id="jw-icon-title">Choose Icon</span>',
        '<input id="jw-icon-search" type="text" placeholder="Search..." autocomplete="off">',
        '<button id="jw-icon-close">×</button>',
      '</div>',
      '<div id="jw-icon-hero-row"></div>',
      '<div id="jw-icon-grid"></div>',
    '</div>',
  ].join('');
  document.body.appendChild(iconModal);

  var iconPickerCallback = null;
  var iconPickerMode = 'item'; /* 'item' or 'ability' */
  var iconPickerItemType = 'weapon';
  var iconPickerHero = null;

  function iconPickerOpen(mode, itemType, cb) {
    iconPickerCallback = cb;
    iconPickerMode = mode;
    iconPickerItemType = itemType || 'weapon';
    iconPickerHero = null;
    iconModal.classList.add('jw-icon-open');
    document.getElementById('jw-icon-search').value = '';
    document.getElementById('jw-icon-title').textContent = mode === 'ability' ? 'Choose Ability Icon' : 'Choose Item Icon';
    iconPickerRender('');
  }
  function iconPickerClose() {
    iconModal.classList.remove('jw-icon-open');
    iconPickerCallback = null;
  }

  function iconPickerRender(query) {
    query = (query || '').toLowerCase();
    var heroRow = document.getElementById('jw-icon-hero-row');
    var grid = document.getElementById('jw-icon-grid');

    if (iconPickerMode === 'ability') {
      /* Show hero selector first */
      heroRow.innerHTML = Object.keys(ABILITY_ICONS).map(function(hero) {
        return '<button class="jw-icon-hero-btn' + (hero === iconPickerHero ? ' active' : '') + '" data-hero="' + hero + '">' + hero + '</button>';
      }).join('');
      heroRow.querySelectorAll('.jw-icon-hero-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          iconPickerHero = btn.getAttribute('data-hero');
          iconPickerRender(document.getElementById('jw-icon-search').value);
        });
      });

      if (!iconPickerHero) {
        grid.innerHTML = '<div class="jw-icon-prompt">Select a hero above</div>';
        return;
      }
      var icons = ABILITY_ICONS[iconPickerHero] || [];
      if (query) icons = icons.filter(function(i) { return i.toLowerCase().indexOf(query) >= 0; });
      grid.innerHTML = icons.map(function(iconFile) {
        var url = abilityIconUrl(iconPickerHero, iconFile);
        var label = iconFile.replace(/_psd$/, '').replace(/_/g, ' ');
        return '<div class="jw-icon-item" data-hero="' + iconPickerHero + '" data-file="' + iconFile + '">' +
          '<img src="' + url + '" onerror="this.style.opacity=0.2" />' +
          '<span>' + label + '</span>' +
        '</div>';
      }).join('');
      grid.querySelectorAll('.jw-icon-item').forEach(function(el) {
        el.addEventListener('click', function() {
          var hero = el.getAttribute('data-hero');
          var file = el.getAttribute('data-file');
          if (iconPickerCallback) iconPickerCallback({ hero: hero, file: file, url: abilityIconUrl(hero, file) });
          iconPickerClose();
        });
      });
    } else {
      /* Item icons */
      heroRow.innerHTML = '';
      var items = ITEM_ICONS[iconPickerItemType] || [];
      if (query) items = items.filter(function(i) { return i.toLowerCase().indexOf(query) >= 0; });
      grid.innerHTML = items.map(function(name) {
        var url = itemIconUrl(iconPickerItemType, name);
        return '<div class="jw-icon-item" data-name="' + name + '" data-url="' + url + '">' +
          '<img src="' + url + '" onerror="this.style.opacity=0.2" />' +
          '<span>' + name.replace(/_/g, ' ') + '</span>' +
        '</div>';
      }).join('');
      grid.querySelectorAll('.jw-icon-item').forEach(function(el) {
        el.addEventListener('click', function() {
          if (iconPickerCallback) iconPickerCallback({ name: el.getAttribute('data-name'), url: el.getAttribute('data-url') });
          iconPickerClose();
        });
      });
    }
  }

  document.getElementById('jw-icon-close').addEventListener('click', iconPickerClose);
  iconModal.addEventListener('click', function(e) { if (e.target === iconModal) iconPickerClose(); });
  document.getElementById('jw-icon-search').addEventListener('input', function() {
    iconPickerRender(this.value);
  });


  var libCurrentType = 'abilities';
  var libCallback = null; /* function(data) called when entry selected */
  var libAllEntries = { abilities: [], items: [] };

  /* ── Load all entries from server ── */
  function libLoadAll(type, cb) {
    fetch('/wiki/doku.php?do=loadgamedata&type=' + type)
      .then(function(r) { return r.json(); })
      .then(function(data) { libAllEntries[type] = data.entries || []; if (cb) cb(); })
      .catch(function() { libAllEntries[type] = []; if (cb) cb(); });
  }

  /* ── Render list ── */
  function libRenderList(query) {
    var list = document.getElementById('jw-lib-list');
    var entries = libAllEntries[libCurrentType] || [];
    query = (query || '').toLowerCase().trim();
    var filtered = query ? entries.filter(function(e) {
      return e.name.toLowerCase().indexOf(query) >= 0;
    }) : entries;

    if (!filtered.length) {
      list.innerHTML = '<div class="jw-lib-empty">' + (query ? 'No results for "' + query + '"' : 'No entries saved yet.') + '</div>';
      return;
    }

    list.innerHTML = filtered.map(function(e, i) {
      var typeLabel = libCurrentType === 'abilities' ? (e.cooldown || '') : ('$' + (e.cost || '') + ' · Tier ' + (e.tier || ''));
      return '<div class="jw-lib-entry" data-idx="' + entries.indexOf(e) + '">' +
        '<div class="jw-lib-entry-name">' + escHtml(e.name) + '</div>' +
        '<div class="jw-lib-entry-meta">' + escHtml(typeLabel) + '</div>' +
        '<button class="jw-lib-entry-del" data-idx="' + entries.indexOf(e) + '" title="Delete">🗑</button>' +
      '</div>';
    }).join('');

    list.querySelectorAll('.jw-lib-entry').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (e.target.classList.contains('jw-lib-entry-del')) return;
        var idx = parseInt(el.getAttribute('data-idx'));
        var entry = entries[idx];
        if (entry && libCallback) libCallback(JSON.parse(JSON.stringify(entry)));
        libClose();
      });
    });
    list.querySelectorAll('.jw-lib-entry-del').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-idx'));
        if (!confirm('Delete "' + entries[idx].name + '"?')) return;
        entries.splice(idx, 1);
        libSaveAll(libCurrentType, function() { libRenderList(query); });
      });
    });
  }

  /* ── Save all entries ── */
  function libSaveAll(type, cb) {
    fetch('/wiki/doku.php?do=savegamedata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type, entries: libAllEntries[type] }),
    }).then(function() { if (cb) cb(); }).catch(function() {});
  }

  /* ── Save current block to library ── */
  function libSaveEntry(type, data) {
    var name = data.name || 'Unnamed';
    libLoadAll(type, function() {
      var existing = libAllEntries[type].findIndex(function(e) { return e.name === name; });
      var entry = JSON.parse(JSON.stringify(data));
      if (existing >= 0) {
        if (!confirm('Update existing entry "' + name + '"?')) return;
        libAllEntries[type][existing] = entry;
      } else {
        libAllEntries[type].push(entry);
      }
      libSaveAll(type, function() {
        var status = document.getElementById('jw-lib-status');
        if (status) { status.textContent = '✓ Saved "' + name + '"'; setTimeout(function() { status.textContent = ''; }, 2000); }
      });
    });
  }

  /* ── Open modal ── */
  function libOpen(type, cb) {
    libCurrentType = type;
    libCallback = cb;
    libModal.classList.add('jw-lib-open');
    document.getElementById('jw-lib-search').value = '';
    document.getElementById('jw-lib-status').textContent = '';
    document.querySelectorAll('.jw-lib-tab').forEach(function(t) {
      t.classList.toggle('jw-lib-tab-active', t.getAttribute('data-type') === type);
    });
    var list = document.getElementById('jw-lib-list');
    list.innerHTML = '<div class="jw-lib-empty">Loading...</div>';
    libLoadAll(type, function() { libRenderList(''); });
  }

  function libClose() {
    libModal.classList.remove('jw-lib-open');
    libCallback = null;
  }

  /* ── Events ── */
  document.getElementById('jw-lib-close').addEventListener('click', libClose);
  libModal.addEventListener('click', function(e) { if (e.target === libModal) libClose(); });
  document.getElementById('jw-lib-search').addEventListener('input', function() {
    libRenderList(this.value);
  });
  document.querySelectorAll('.jw-lib-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      libCurrentType = tab.getAttribute('data-type');
      document.querySelectorAll('.jw-lib-tab').forEach(function(t) {
        t.classList.toggle('jw-lib-tab-active', t === tab);
      });
      var list = document.getElementById('jw-lib-list');
      list.innerHTML = '<div class="jw-lib-empty">Loading...</div>';
      libLoadAll(libCurrentType, function() { libRenderList(document.getElementById('jw-lib-search').value); });
    });
  });


})();