/**
 * JUMPSTART — editor-preview.js
 * Location: lib/tpl/bootstrap3/user/editor-preview.js
 * Load via: lib/tpl/bootstrap3/user/footer.html
 *
 * Transforms the DokuWiki editor into a split-pane layout:
 * - Left: syntax editor (existing textarea)
 * - Right: live preview updating as you type via DokuWiki AJAX
 *
 * Only activates in edit mode (wiki__text must exist).
 */

(function () {
  'use strict';

  var textarea = document.getElementById('wiki__text');
  if (!textarea) return;

  /* ── Find the edit box wrapper ── */
  var editBox = textarea.closest('.editBox') || textarea.closest('#dokuwiki__content');
  if (!editBox) return;

  /* ══════════════════════════════════════════════════
     ENTRANCE MODAL
     Only show on new/empty pages
  ══════════════════════════════════════════════════ */

  var isNewPage = textarea.value.trim() === '' || textarea.value.trim() === '====== @@TITLE@@ ======';

  var entranceModal = null;

  if (isNewPage) {
    entranceModal = document.createElement('div');
    entranceModal.id = 'js-entrance-modal';
    entranceModal.innerHTML = [
      '<div class="jsem-overlay">',
        '<div class="jsem-header">',
          '<div class="jsem-eyebrow">New Page · JumpStart</div>',
          '<div class="jsem-title">What are you creating?</div>',
          '<div class="jsem-sub">Select a category to load your template</div>',
          '<div class="jsem-divider"></div>',
        '</div>',
        '<div class="jsem-grid">',
          '<div class="jsem-card active" data-cat="movement">',
            '<div class="jsem-card-bg jsem-bg-movement"></div>',
            '<div class="jsem-card-overlay"></div>',
            '<div class="jsem-card-label">',
              '<span class="jsem-card-name">Movement Tech</span>',
              '<span class="jsem-card-sub">Techniques · Mechanics · Combos</span>',
            '</div>',
          '</div>',
          '<div class="jsem-card" data-cat="characters">',
            '<div class="jsem-card-bg jsem-bg-characters"></div>',
            '<div class="jsem-card-overlay"></div>',
            '<div class="jsem-card-label">',
              '<span class="jsem-card-name">Characters</span>',
              '<span class="jsem-card-sub">Hero Pages · Ability Breakdowns</span>',
            '</div>',
          '</div>',
          '<div class="jsem-card" data-cat="items">',
            '<div class="jsem-card-bg jsem-bg-items"></div>',
            '<div class="jsem-card-overlay"></div>',
            '<div class="jsem-card-label">',
              '<span class="jsem-card-name">Items & Abilities</span>',
              '<span class="jsem-card-sub">Item Entries · Build Guides</span>',
            '</div>',
          '</div>',
          '<div class="jsem-card" data-cat="guides">',
            '<div class="jsem-card-bg jsem-bg-guides"></div>',
            '<div class="jsem-card-overlay"></div>',
            '<div class="jsem-card-label">',
              '<span class="jsem-card-name">Guides</span>',
              '<span class="jsem-card-sub">Tutorials · Articles · Changelogs</span>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="jsem-subtypes">',
          '<span class="jsem-subtype-label">Page type</span>',
          '<div class="jsem-pills" id="jsem-pills"></div>',
        '</div>',
        '<div class="jsem-footer">',
          '<button class="jsem-btn-skip" id="jsem-skip">Skip</button>',
          '<button class="jsem-btn-create" id="jsem-create">Create Page →</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(entranceModal);

    /* Category data */
    var catData = {
      movement: { color: '#b04040', pills: ['Technique Entry', 'Mechanic Overview', 'Combo / Route'], tpl: 'technique' },
      characters: { color: '#3a9e6a', pills: ['Hero Page', 'Ability Breakdown', 'Matchup Guide'], tpl: 'hero' },
      items: { color: '#c2883a', pills: ['Item Entry', 'Ability Detail', 'Build Guide'], tpl: 'article' },
      guides: { color: '#6B4FBB', pills: ['Tutorial', 'General Article', 'Changelog'], tpl: 'guide' }
    };

    var activeCat = 'movement';
    var activeTpl = 'technique';

    function renderPills(cat) {
      var container = document.getElementById('jsem-pills');
      if (!container) return;
      container.innerHTML = catData[cat].pills.map(function(p, i) {
        return '<button class="jsem-pill' + (i === 0 ? ' active' : '') + '" data-tpl="' + catData[cat].tpl + '">' + p + '</button>';
      }).join('');
      activeTpl = catData[cat].tpl;
      container.querySelectorAll('.jsem-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
          container.querySelectorAll('.jsem-pill').forEach(function(p) { p.classList.remove('active'); });
          pill.classList.add('active');
          activeTpl = pill.getAttribute('data-tpl');
        });
      });
    }

    entranceModal.querySelectorAll('.jsem-card').forEach(function(card) {
      card.addEventListener('click', function() {
        entranceModal.querySelectorAll('.jsem-card').forEach(function(c) { c.classList.remove('active'); });
        card.classList.add('active');
        activeCat = card.getAttribute('data-cat');
        renderPills(activeCat);
      });
    });

    function closeModal(loadTpl) {
      entranceModal.style.opacity = '0';
      entranceModal.style.transition = 'opacity 0.4s ease';
      setTimeout(function() {
        entranceModal.style.display = 'none';
        if (loadTpl && templates[activeTpl]) {
          textarea.value = templates[activeTpl];
          fetchPreview(textarea.value);
        }
      }, 400);
    }

    document.getElementById('jsem-create').addEventListener('click', function() { closeModal(true); });
    document.getElementById('jsem-skip').addEventListener('click', function() { closeModal(false); });

    renderPills('movement');
  }

  /* ── Build the split layout ── */

  /* Unified top bar — spans full width above the split */
  var topBar = document.createElement('div');
  topBar.id = 'js-editor-topbar';

  /* Template picker button */
  var templateBtn = document.createElement('div');
  templateBtn.id = 'js-template-picker';
  templateBtn.innerHTML =
    '<button class="js-tpl-btn" id="js-tpl-trigger">Templates ▾</button>' +
    '<div class="js-tpl-dropdown" id="js-tpl-dropdown">' +
      '<div class="js-tpl-item" data-tpl="technique">Technique Page</div>' +
      '<div class="js-tpl-item" data-tpl="hero">Hero Page</div>' +
      '<div class="js-tpl-item" data-tpl="article">General Article</div>' +
      '<div class="js-tpl-item" data-tpl="changelog">Changelog / Patch Notes</div>' +
      '<div class="js-tpl-item" data-tpl="guide">Guide</div>' +
    '</div>';

  /* Save actions group — cloned from native save bar */
  var saveGroup = document.createElement('div');
  saveGroup.id = 'js-editor-actions';
  var nativeSaveBar = editBox.querySelector('#wiki__editBar, #wiki__editbar, .editBar');
  var draftStatus   = editBox.querySelector('#draft__status');

  if (nativeSaveBar) {
    /* Move (not clone) so it keeps its event handlers */
    nativeSaveBar.id = 'js-savebar'; /* rename to avoid CSS hide rule */
    saveGroup.appendChild(nativeSaveBar);
  }

  /* Toolbar placeholder — will be populated once DokuWiki initializes it */
  var toolbarSlot = document.createElement('div');
  toolbarSlot.id = 'js-toolbar-slot';

  /* ── Prefab insert button ── */
  var prefabBtn = document.createElement('div');
  prefabBtn.id = 'js-prefab-picker';
  prefabBtn.innerHTML =
    '<button class="js-prefab-trigger" id="js-prefab-trigger">+ Insert ▾</button>' +
    '<div class="js-prefab-dropdown" id="js-prefab-dropdown">' +

      '<div class="js-prefab-section">' +
        '<div class="js-prefab-group-label">Headings</div>' +
        '<div class="js-prefab-grid js-prefab-grid-4">' +
          '<div class="js-prefab-card" data-prefab="heading-main"><span class="js-prefab-card-icon">H1</span><span class="js-prefab-card-label">Main</span></div>' +
          '<div class="js-prefab-card" data-prefab="heading-sub"><span class="js-prefab-card-icon">H2</span><span class="js-prefab-card-label">Sub</span></div>' +
          '<div class="js-prefab-card" data-prefab="heading-tertiary"><span class="js-prefab-card-icon">H3</span><span class="js-prefab-card-label">Tertiary</span></div>' +
          '<div class="js-prefab-card" data-prefab="heading-banner"><span class="js-prefab-card-icon">▬</span><span class="js-prefab-card-label">Banner</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="js-prefab-section">' +
        '<div class="js-prefab-group-label">Content Blocks</div>' +
        '<div class="js-prefab-grid js-prefab-grid-4">' +
          '<div class="js-prefab-card" data-prefab="tech-entry"><span class="js-prefab-card-icon">⚡</span><span class="js-prefab-card-label">Tech Entry</span></div>' +
          '<div class="js-prefab-card" data-prefab="steps"><span class="js-prefab-card-icon">①</span><span class="js-prefab-card-label">Steps</span></div>' +
          '<div class="js-prefab-card" data-prefab="related"><span class="js-prefab-card-icon">⬡</span><span class="js-prefab-card-label">Related</span></div>' +
          '<div class="js-prefab-card" data-prefab="quote-block"><span class="js-prefab-card-icon">"</span><span class="js-prefab-card-label">Quote</span></div>' +
          '<div class="js-prefab-card" data-prefab="item-block"><span class="js-prefab-card-icon">◆</span><span class="js-prefab-card-label">Item Block</span></div>' +
          '<div class="js-prefab-card" data-prefab="ability-block"><span class="js-prefab-card-icon">✦</span><span class="js-prefab-card-label">Ability Block</span></div>' +
          '<div class="js-prefab-card" data-prefab="divider"><span class="js-prefab-card-icon">—</span><span class="js-prefab-card-label">Divider</span></div>' +
          '<div class="js-prefab-card" data-prefab="input-table"><span class="js-prefab-card-icon">⌨</span><span class="js-prefab-card-label">Input Table</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="js-prefab-section">' +
        '<div class="js-prefab-group-label">Callouts</div>' +
        '<div class="js-prefab-grid js-prefab-grid-4">' +
          '<div class="js-prefab-card js-prefab-callout-tip" data-prefab="callout-tip"><span class="js-prefab-card-icon">✦</span><span class="js-prefab-card-label">Tip</span></div>' +
          '<div class="js-prefab-card js-prefab-callout-warning" data-prefab="callout-warning"><span class="js-prefab-card-icon">⚠</span><span class="js-prefab-card-label">Warning</span></div>' +
          '<div class="js-prefab-card js-prefab-callout-danger" data-prefab="callout-danger"><span class="js-prefab-card-icon">✕</span><span class="js-prefab-card-label">Danger</span></div>' +
          '<div class="js-prefab-card js-prefab-callout-info" data-prefab="callout-info"><span class="js-prefab-card-icon">ℹ</span><span class="js-prefab-card-label">Info</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="js-prefab-section">' +
        '<div class="js-prefab-group-label">Media</div>' +
        '<div class="js-prefab-grid js-prefab-grid-4">' +
          '<div class="js-prefab-card" data-prefab="video"><span class="js-prefab-card-icon">▶</span><span class="js-prefab-card-label">Video</span></div>' +
          '<div class="js-prefab-card" data-prefab="video-grid"><span class="js-prefab-card-icon">⊞</span><span class="js-prefab-card-label">Video Grid</span></div>' +
          '<div class="js-prefab-card" data-prefab="image"><span class="js-prefab-card-icon">🖼</span><span class="js-prefab-card-label">Image</span></div>' +
          '<div class="js-prefab-card" data-prefab="image-grid"><span class="js-prefab-card-icon">⊟</span><span class="js-prefab-card-label">Image Grid</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="js-prefab-section">' +
        '<div class="js-prefab-group-label">Data</div>' +
        '<div class="js-prefab-grid js-prefab-grid-4">' +
          '<div class="js-prefab-card" data-prefab="stat-table"><span class="js-prefab-card-icon">📊</span><span class="js-prefab-card-label">Stat Table</span></div>' +
          '<div class="js-prefab-card" data-prefab="bar-chart"><span class="js-prefab-card-icon">▦</span><span class="js-prefab-card-label">Bar Chart</span></div>' +
          '<div class="js-prefab-card" data-prefab="key-badge"><span class="js-prefab-card-icon">⌨</span><span class="js-prefab-card-label">Key Badge</span></div>' +
        '</div>' +
      '</div>' +

    '</div>';

  /* Assemble topbar: INSERT | toolbar slot | templates | save actions */
  topBar.appendChild(prefabBtn);
  topBar.appendChild(toolbarSlot);
  topBar.appendChild(templateBtn);
  topBar.appendChild(saveGroup);

  /* Outer shell */
  var shell = document.createElement('div');
  shell.id = 'js-editor-shell';

  /* Left pane */
  var leftPane = document.createElement('div');
  leftPane.id = 'js-editor-left';

  /* Resize handle */
  var handle = document.createElement('div');
  handle.id = 'js-editor-handle';
  handle.title = 'Drag to resize';

  /* Right pane — live preview */
  var rightPane = document.createElement('div');
  rightPane.id = 'js-editor-right';

  var previewHeader = document.createElement('div');
  previewHeader.id = 'js-preview-header';
  previewHeader.innerHTML =
    '<span class="js-preview-label">Live Preview</span>' +
    '<div class="js-preview-status">' +
      '<span class="js-preview-status-text">ready</span>' +
      '<div class="js-preview-dot"></div>' +
    '</div>';

  var previewBody = document.createElement('div');
  previewBody.id = 'js-preview-body';
  previewBody.innerHTML = '<div class="js-preview-empty">Start typing to see a preview</div>';

  rightPane.appendChild(previewHeader);
  rightPane.appendChild(previewBody);

  /* Hide native save bar since we cloned it */
  if (nativeSaveBar) nativeSaveBar.style.display = 'none';
  if (draftStatus)   draftStatus.style.display = 'none';

  /* ── Watch for DokuWiki's toolbar to initialize and move it into topbar ── */
  function grabToolbar() {
    if (toolbarMoved) return;
    var toolbar = document.getElementById('tool__bar') ||
                  document.querySelector('.tool__bar.btn-group') ||
                  document.querySelector('div[id^="tool__bar"]') ||
                  editBox.querySelector('[id*="tool__bar"]');
    if (toolbar && toolbar.querySelectorAll('button').length > 0) {
      toolbarMoved = true;
      toolbarObserver.disconnect();
      toolbarSlot.appendChild(toolbar);
      /* Recalculate shell padding after toolbar appears */
      shell.style.paddingTop = (70 + topBar.getBoundingClientRect().height) + 'px';
    }
  }

  var toolbarMoved = false;
  var toolbarObserver = new MutationObserver(grabToolbar);
  toolbarObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

  /* Try at multiple intervals to catch DokuWiki's toolbar init */
  [100, 300, 500, 1000, 2000].forEach(function(delay) {
    setTimeout(grabToolbar, delay);
  });

  /* Hide all existing page content above the editor */
  var mainContainer = document.querySelector('main.dw-container');
  if (mainContainer) mainContainer.style.cssText = 'padding:0!important;margin:0!important;';

  /* Hide everything inside the content area except what we move */
  var pageContent = document.querySelector('#dokuwiki__content');
  if (pageContent) pageContent.style.cssText = 'padding:0!important;margin:0!important;';

  /* Append topbar and shell directly to body, after the navbar */
  document.body.appendChild(topBar);
  document.body.appendChild(shell);
  leftPane.appendChild(editBox);
  shell.appendChild(leftPane);
  shell.appendChild(handle);
  shell.appendChild(rightPane);

  /* ── Independent pane scrolling via JS ── */
  function setupScroll() {
    var shellTop = shell.getBoundingClientRect().top;
    var available = window.innerHeight - shellTop;

    shell.style.height = available + 'px';
    shell.style.minHeight = '0';
    shell.style.overflow = 'hidden';

    leftPane.style.height = '100%';
    leftPane.style.overflowY = 'auto';

    rightPane.style.height = '100%';
    rightPane.style.overflowY = 'auto';
  }

  setTimeout(setupScroll, 300);
  setTimeout(setupScroll, 800); /* second pass after all layout settles */
  window.addEventListener('resize', setupScroll);

  /* Force textarea to fill left pane — DokuWiki sets height:300px inline */
  function fixTextareaHeight() {
    textarea.style.setProperty('height', '100%', 'important');
    textarea.style.setProperty('min-height', '0', 'important');
    textarea.style.setProperty('resize', 'none', 'important');
    textarea.style.setProperty('flex', '1', 'important');
  }
  setTimeout(fixTextareaHeight, 100);
  setTimeout(fixTextareaHeight, 500);

  /* Prevent page scroll on edit pages only — only panes should scroll */
  if (document.body.classList.contains('mode_edit')) {
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
  }

  /* Hide the footer — it contains our script tag so can't use display:none in CSS
     Instead collapse it to zero height after the script has executed */
  var footer = document.querySelector('footer') ||
               document.getElementById('dw__footer');
  if (footer) {
    footer.style.cssText = 'height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;border:none!important;';
  }

  /* Pull shell up to sit just below topbar, regardless of what's above it */
  setTimeout(function() {
    var topbarBottom = topBar.getBoundingClientRect().bottom;
    var shellTop = shell.getBoundingClientRect().top;
    var offset = shellTop - topbarBottom;
    if (offset > 0) {
      shell.style.marginTop = '-' + offset + 'px';
    }
  }, 200);
  var templates = {
    technique: '====== @@TITLE@@ ======\n\n<html>\n<div class="js-technique-wrap">\n\n  <aside class="js-infostrip">\n    <span class="js-infostrip-label">Difficulty</span>\n    <div class="js-chip js-chip-advanced"><span class="js-chip-dot"></span>Advanced</div>\n    <span class="js-infostrip-label">Tier</span>\n    <div class="js-chip js-chip-tier-s"><span class="js-chip-dot" style="background:#c2883a;"></span>S-Tier</div>\n    <span class="js-infostrip-label">Category</span>\n    <div class="js-chip" style="border-left-color:#3a6e9e;color:#7ab4cf;"><span class="js-chip-dot" style="background:#3a6e9e;"></span>Movement</div>\n  </aside>\n\n  <div class="js-technique-body">\n    <header class="js-page-header">\n      <span class="js-page-eyebrow">Movement · Techniques</span>\n      <h1 class="js-page-title">Technique Name</h1>\n      <p class="js-page-subtitle">One or two sentences describing what this technique does.</p>\n    </header>\n  </div>\n\n</div>\n</html>\n\n===== Overview =====\n\nWrite your overview here.\n\n===== How to Execute =====\n\n<html>\n<div class="js-steps">\n  <div class="js-step"><div class="js-step-num">01</div><div class="js-step-content"><div class="js-step-title">Step title</div><p class="js-step-desc">Describe this step.</p></div></div>\n</div>\n</html>\n\n===== Related Techniques =====\n\n<html>\n<div class="js-related">\n  <a href="/wiki/doku.php?id=universaltech:related" class="js-related-card"><span class="js-related-card-name">Related</span><span class="js-related-card-desc">Description</span></a>\n</div>\n</html>\n',
    hero: '====== @@HERO NAME@@ ======\n\n<html>\n\n<!-- ═══════════════════════════════════════\n     HERO BANNER\n     Replace js-hero-banner-img style with:\n     background-image: url(\'/wiki/lib/exe/fetch.php?media=heroes:heroname_banner.jpg\')\n════════════════════════════════════════ -->\n<div class="js-hero-banner">\n  <div class="js-hero-banner-lines"></div>\n  <div class="js-hero-banner-img" style="background-image: url(\'\');"></div>\n  <div class="js-hero-banner-vig"></div>\n  <div class="js-hero-banner-line"></div>\n  <div class="js-hero-banner-id">\n\n    <!-- Replace img src with hero portrait -->\n    >\n      <span class="js-hero-eyebrow">Characters · Heroes</span>\n      <span class="js-hero-name">@@HERO NAME@@</span>\n      <div class="js-hero-tags">\n        <!-- Role: js-hero-tag-role -->\n        <!-- Type: js-hero-tag-type -->\n        <!-- Tier: js-hero-tag-tier-s / tier-a / tier-b / tier-c -->\n        <!-- Difficulty: js-hero-tag-diff -->\n        <span class="js-hero-tag js-hero-tag-role">Brawler</span>\n        <span class="js-hero-tag js-hero-tag-type">Tank</span>\n        <span class="js-hero-tag js-hero-tag-tier-s">S-Tier</span>\n        <span class="js-hero-tag js-hero-tag-diff">Hard</span>\n      </div>\n    </div>\n\n  </div>\n</div>\n\n<!-- ═══════════════════════════════════════\n     MOVEMENT STAT STRIP\n════════════════════════════════════════ -->\n<div class="js-hero-stat-strip">\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Move Speed</span>\n    <span class="js-hero-stat-value">0.0<span class="js-hero-stat-unit">m/s</span></span>\n  </div>\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Sprint Speed</span>\n    <span class="js-hero-stat-value">0.0<span class="js-hero-stat-unit">m/s</span></span>\n  </div>\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Dash Speed</span>\n    <span class="js-hero-stat-value">0.0<span class="js-hero-stat-unit">m/s</span></span>\n  </div>\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Stamina</span>\n    <span class="js-hero-stat-value">0</span>\n  </div>\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Stamina Bucket</span>\n    <span class="js-hero-stat-value">0</span>\n  </div>\n  <div class="js-hero-stat">\n    <span class="js-hero-stat-label">Stamina CD</span>\n    <span class="js-hero-stat-value">0.0<span class="js-hero-stat-unit">s</span></span>\n  </div>\n</div>\n\n<!-- ═══════════════════════════════════════\n     PAGE BODY\n════════════════════════════════════════ -->\n<div class="js-hero-body">\n\n  <!-- Quote — delete if no quote -->\n  <div class="js-hero-quote">\n    <span class="js-hero-quote-mark">"</span>\n    <span class="js-hero-quote-text">Hero quote goes here.</span>\n  </div>\n\n</html>\n\n===== Overview =====\n\nWrite a brief overview of the hero here. Describe their playstyle, strengths, and role in the game.\n\n<html>\n\n  <div class="js-hero-h2">Movement Tech</div>\n\n  <!-- ═══════════════════════════════════════\n       TECH ENTRY — duplicate this block for each technique\n       Tech Type: Universal Tech / Character Tech\n       Difficulty: js-tech-diff-beginner / intermediate / advanced / expert\n  ════════════════════════════════════════ -->\n  <div class="js-tech-entry">\n    <div class="js-tech-h3">Technique Name</div>\n    <div class="js-tech-inner">\n\n      <div class="js-tech-prose">\n        <p>Describe the technique here. Explain what it is, how it works mechanically, and why it matters for movement.</p>\n        <p>Add more paragraphs as needed. Reference abilities in <em>italics</em>, key terms in <strong>bold</strong>, and speed values in <code>code style</code>.</p>\n        <p>Link related techniques or wiki pages using normal wiki links.</p>\n      </div>\n\n      <div class="js-tech-side">\n        <div class="js-tech-video">\n          <div class="js-tech-video-wrap">\n            <!-- Replace src with your video path -->\n            <video autoplay muted loop playsinline>\n              <source src="/wiki/lib/exe/fetch.php?media=techniques:heroname_techname.mp4" type="video/mp4">\n            </video>\n          </div>\n          <div class="js-tech-video-cap">Caption describing the clip</div>\n        </div>\n        <div class="js-tech-meta">\n          <div class="js-tech-meta-row">\n            <span class="js-tech-meta-key">Tech Type</span>\n            <span class="js-tech-meta-val js-tech-type-character">Character Tech</span>\n          </div>\n          <div class="js-tech-meta-row">\n            <span class="js-tech-meta-key">Difficulty</span>\n            <span class="js-tech-meta-val js-tech-diff-intermediate">Intermediate</span>\n          </div>\n          <div class="js-tech-meta-row">\n            <span class="js-tech-meta-key">Inputs</span>\n            <div class="js-tech-meta-val">\n              Ability Name <span class="js-tech-arrow">→</span><br>\n              (Cancel) <span class="js-tech-arrow">→</span><br>\n              (Jump / Slide)\n            </div>\n          </div>\n        </div>\n      </div>\n\n    </div>\n  </div>\n\n  <!-- Add more js-tech-entry blocks above this line -->\n\n  <div class="js-hero-h2">Tips & Common Mistakes</div>\n\n  <div class="js-hero-callout">\n    <div class="js-hero-callout-bar tip"></div>\n    <div class="js-hero-callout-inner">\n      <span class="js-hero-callout-label">Tip</span>\n      <p class="js-hero-callout-text">Add a useful tip here.</p>\n    </div>\n  </div>\n\n  <div class="js-hero-callout">\n    <div class="js-hero-callout-bar warning"></div>\n    <div class="js-hero-callout-inner">\n      <span class="js-hero-callout-label">Common Mistake</span>\n      <p class="js-hero-callout-text">Describe a common mistake here.</p>\n    </div>\n  </div>\n\n</div><!-- end js-hero-body -->\n</html>\n',
    article: '====== @@TITLE@@ ======\n\n<html>\n<header class="js-page-header">\n  <span class="js-page-eyebrow">Category</span>\n  <h1 class="js-page-title">Article Title</h1>\n  <p class="js-page-subtitle">One sentence description.</p>\n</header>\n</html>\n\n===== Overview =====\n\nWrite your overview here.\n\n===== Section =====\n\nContent here.\n',
    changelog: '====== Patch X.X.X ======\n\n<html>\n<header class="js-page-header">\n  <span class="js-page-eyebrow">Changelog</span>\n  <h1 class="js-page-title">Patch X.X.X</h1>\n  <p class="js-page-subtitle">Month DD, YYYY</p>\n</header>\n</html>\n\n===== Movement Changes =====\n\n<html>\n<div class="js-callout"><div class="js-callout-bar tip"></div><div class="js-callout-inner"><span class="js-callout-label">Buff</span><p class="js-callout-text">Describe the buff.</p></div></div>\n<div class="js-callout"><div class="js-callout-bar danger"></div><div class="js-callout-inner"><span class="js-callout-label">Nerf</span><p class="js-callout-text">Describe the nerf.</p></div></div>\n</html>\n\n===== Bug Fixes =====\n\nList bug fixes here.\n',
    guide: '====== @@TITLE@@ ======\n\n<html>\n<header class="js-page-header">\n  <span class="js-page-eyebrow">Guides</span>\n  <h1 class="js-page-title">Guide Title</h1>\n  <p class="js-page-subtitle">What will the reader learn?</p>\n</header>\n</html>\n\n===== Introduction =====\n\nWrite your introduction here.\n\n===== Step 1 =====\n\nContent here.\n\n===== Step 2 =====\n\nContent here.\n\n===== Summary =====\n\nSummarise what was covered.\n'
  };

  /* Template picker interaction */
  var trigger = document.getElementById('js-tpl-trigger');
  var dropdown = document.getElementById('js-tpl-dropdown');

  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('js-tpl-open');
    prefabDropdown.classList.remove('js-prefab-open');
  });

  document.addEventListener('click', function() {
    dropdown.classList.remove('js-tpl-open');
    prefabDropdown.classList.remove('js-prefab-open');
  });

  document.querySelectorAll('.js-tpl-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var tpl = templates[item.getAttribute('data-tpl')];
      if (tpl) {
        textarea.value = tpl;
        textarea.focus();
        dropdown.classList.remove('js-tpl-open');
        fetchPreview(tpl);
      }
    });
  });

  /* ── Prefab snippets ── */
  var prefabs = {
    'heading-main':
      '\n====== Section Title ======\n',

    'heading-sub':
      '\n===== Section Title =====\n',

    'heading-tertiary':
      '\n==== Section Title ====\n',

    'heading-banner':
      '\n<html>\n<div class="js-section-banner">\n  <div class="js-section-banner-inner">\n    <span class="js-section-banner-eyebrow">Category</span>\n    <h2 class="js-section-banner-title">Section Title</h2>\n    <p class="js-section-banner-sub">Brief description of this section.</p>\n  </div>\n</div>\n</html>\n',

    'quote-block':
      '\n<html>\n<div class="js-hero-quote">\n  <span class="js-hero-quote-mark">\"</span>\n  <span class="js-hero-quote-text">Quote text goes here.</span>\n</div>\n</html>\n',

    'divider':
      '\n<html>\n<hr class="js-divider">\n</html>\n',

    'tech-entry':
      '\n<html>\n<div class="js-tech-entry">\n  <div class="js-tech-h3">Technique Name</div>\n  <div class="js-tech-inner">\n    <div class="js-tech-prose">\n      <p>Describe the technique here.</p>\n    </div>\n    <div class="js-tech-side">\n      <div class="js-tech-video">\n        <div class="js-tech-video-wrap">\n          <video autoplay muted loop playsinline>\n            <source src="/wiki/lib/exe/fetch.php?media=techniques:example.mp4" type="video/mp4">\n          </video>\n        </div>\n        <div class="js-tech-video-cap">Caption here</div>\n      </div>\n      <div class="js-tech-meta">\n        <div class="js-tech-meta-row"><span class="js-tech-meta-key">Tech Type</span><span class="js-tech-meta-val js-tech-type-character">Character Tech</span></div>\n        <div class="js-tech-meta-row"><span class="js-tech-meta-key">Difficulty</span><span class="js-tech-meta-val js-tech-diff-intermediate">Intermediate</span></div>\n        <div class="js-tech-meta-row"><span class="js-tech-meta-key">Inputs</span><div class="js-tech-meta-val">Ability <span class="js-tech-arrow">→</span><br>(Cancel)</div></div>\n      </div>\n    </div>\n  </div>\n</div>\n</html>\n',

    'steps':
      '\n<html>\n<div class="js-steps">\n  <div class="js-step">\n    <div class="js-step-num">01</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title here</div>\n      <p class="js-step-desc">Describe this step in detail.</p>\n    </div>\n  </div>\n  <div class="js-step">\n    <div class="js-step-num">02</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title here</div>\n      <p class="js-step-desc">Describe this step in detail.</p>\n    </div>\n  </div>\n  <div class="js-step">\n    <div class="js-step-num">03</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title here</div>\n      <p class="js-step-desc">Describe this step in detail.</p>\n    </div>\n  </div>\n</div>\n</html>\n',

    'related':
      '\n<html>\n<div class="js-related">\n  <a href="/wiki/doku.php?id=universaltech:related" class="js-related-card">\n    <span class="js-related-card-name">Related Technique</span>\n    <span class="js-related-card-desc">One-line description</span>\n  </a>\n  <a href="/wiki/doku.php?id=universaltech:related2" class="js-related-card">\n    <span class="js-related-card-name">Related Technique</span>\n    <span class="js-related-card-desc">One-line description</span>\n  </a>\n</div>\n</html>\n',

    'item-block':
      '\n<html>\n<div class="js-item-block">\n  <div class="js-item-block-header">\n    <div class="js-item-block-icon"></div>\n    <div class="js-item-block-meta">\n      <span class="js-item-block-name">Item Name</span>\n      <span class="js-item-block-category">Category · Tier</span>\n    </div>\n    <div class="js-item-block-cost">000 souls</div>\n  </div>\n  <p class="js-item-block-desc">Describe what this item does and why it\'s relevant to this technique.</p>\n  <div class="js-item-block-stats">\n    <span class="js-item-stat"><span class="js-item-stat-label">Stat</span><span class="js-item-stat-val">+000</span></span>\n    <span class="js-item-stat"><span class="js-item-stat-label">Stat</span><span class="js-item-stat-val">+000</span></span>\n  </div>\n</div>\n</html>\n',

    'ability-block':
      '\n<html>\n<div class="js-ability-block">\n  <div class="js-ability-block-header">\n    <div class="js-ability-block-icon"></div>\n    <span class="js-ability-block-name">Ability Name</span>\n    <div class="js-ability-block-meta">\n      <span class="js-ability-meta-stat">↻ 0s</span>\n      <span class="js-ability-meta-stat">⌛ 0s</span>\n    </div>\n  </div>\n  <p class="js-ability-block-desc">Describe the ability and how it relates to this technique or page.</p>\n  <div class="js-ability-block-upgrades">\n    <div class="js-ability-upgrade"><span class="js-upgrade-tier">① T1</span><span class="js-upgrade-desc">Upgrade description</span></div>\n    <div class="js-ability-upgrade"><span class="js-upgrade-tier">② T2</span><span class="js-upgrade-desc">Upgrade description</span></div>\n    <div class="js-ability-upgrade"><span class="js-upgrade-tier">⑤ T3</span><span class="js-upgrade-desc">Upgrade description</span></div>\n  </div>\n</div>\n</html>\n',

    'input-table':
      '\n<html>\n<table class="js-input-table">\n  <thead>\n    <tr><th>Action</th><th>Input</th><th>Timing</th><th>Notes</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Action name</td>\n      <td><span class="js-key">Space</span></td>\n      <td>On ground</td>\n      <td>Notes here</td>\n    </tr>\n    <tr>\n      <td>Action name</td>\n      <td><span class="js-key">Shift</span><span class="js-input-plus">+</span><span class="js-key">W</span></td>\n      <td>Hold throughout</td>\n      <td>Notes here</td>\n    </tr>\n  </tbody>\n</table>\n</html>\n',

    'callout-tip':
      '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar tip"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Tip</span>\n    <p class="js-callout-text">Add a helpful tip here.</p>\n  </div>\n</div>\n</html>\n',

    'callout-warning':
      '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar warning"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Warning</span>\n    <p class="js-callout-text">Add a warning here.</p>\n  </div>\n</div>\n</html>\n',

    'callout-danger':
      '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar danger"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Danger</span>\n    <p class="js-callout-text">Add a danger notice here.</p>\n  </div>\n</div>\n</html>\n',

    'callout-info':
      '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Info</span>\n    <p class="js-callout-text">Add info here.</p>\n  </div>\n</div>\n</html>\n',

    'video':
      '\n<html>\n<div class="js-video-block">\n  <div class="js-video-wrap">\n    <video autoplay muted loop playsinline>\n      <source src="/wiki/lib/exe/fetch.php?media=techniques:example.mp4" type="video/mp4">\n    </video>\n  </div>\n  <div class="js-video-caption">Caption here</div>\n</div>\n</html>\n',

    'video-grid':
      '\n<html>\n<div class="js-video-grid">\n  <div class="js-video-block">\n    <div class="js-video-wrap">\n      <video autoplay muted loop playsinline>\n        <source src="/wiki/lib/exe/fetch.php?media=techniques:example1.mp4" type="video/mp4">\n      </video>\n    </div>\n    <div class="js-video-caption">Caption one</div>\n  </div>\n  <div class="js-video-block">\n    <div class="js-video-wrap">\n      <video autoplay muted loop playsinline>\n        <source src="/wiki/lib/exe/fetch.php?media=techniques:example2.mp4" type="video/mp4">\n      </video>\n    </div>\n    <div class="js-video-caption">Caption two</div>\n  </div>\n</div>\n</html>\n',

    'image':
      '\n<html>\n<div class="js-image-block">\n  <img src="/wiki/lib/exe/fetch.php?media=wiki:image.png" alt="Description" class="js-image">\n  <div class="js-image-caption">Caption here</div>\n</div>\n</html>\n',

    'image-grid':
      '\n<html>\n<div class="js-image-grid">\n  <div class="js-image-block">\n    <img src="/wiki/lib/exe/fetch.php?media=wiki:image1.png" alt="Description" class="js-image">\n    <div class="js-image-caption">Caption one</div>\n  </div>\n  <div class="js-image-block">\n    <img src="/wiki/lib/exe/fetch.php?media=wiki:image2.png" alt="Description" class="js-image">\n    <div class="js-image-caption">Caption two</div>\n  </div>\n</div>\n</html>\n',

    'stat-table':
      '\n<html>\n<table class="js-stat-table">\n  <thead>\n    <tr><th>Metric</th><th>Base Value</th><th>With Technique</th><th>Notes</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Stat label</td><td>000</td>\n      <td><span class="js-stat-val">000</span></td>\n      <td><span class="js-stat-note">Notes</span></td>\n    </tr>\n    <tr>\n      <td>Stat label</td><td>000</td>\n      <td><span class="js-stat-val">000</span></td>\n      <td><span class="js-stat-note">Notes</span></td>\n    </tr>\n  </tbody>\n</table>\n</html>\n',

    'bar-chart':
      '\n<html>\n<div class="js-bar-chart" data-title="Chart Title">\n  <div class="js-bar-chart-inner">\n    <div class="js-bar-row"><span class="js-bar-label">Label A</span><div class="js-bar-track"><div class="js-bar-fill" style="width:80%"></div></div><span class="js-bar-val">80</span></div>\n    <div class="js-bar-row"><span class="js-bar-label">Label B</span><div class="js-bar-track"><div class="js-bar-fill" style="width:60%"></div></div><span class="js-bar-val">60</span></div>\n    <div class="js-bar-row"><span class="js-bar-label">Label C</span><div class="js-bar-track"><div class="js-bar-fill" style="width:45%"></div></div><span class="js-bar-val">45</span></div>\n    <div class="js-bar-row"><span class="js-bar-label">Label D</span><div class="js-bar-track"><div class="js-bar-fill" style="width:90%"></div></div><span class="js-bar-val">90</span></div>\n  </div>\n</div>\n</html>\n',

    'key-badge':
      '<span class="js-key">Key</span>'
  };

  /* Insert snippet at cursor position */
  function insertAtCursor(text) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var before = textarea.value.substring(0, start);
    var after = textarea.value.substring(end);
    textarea.value = before + text + after;
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    fetchPreview(textarea.value);
  }

  /* Prefab picker interaction */
  var prefabTrigger = document.getElementById('js-prefab-trigger');
  var prefabDropdown = document.getElementById('js-prefab-dropdown');

  prefabTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    prefabDropdown.classList.toggle('js-prefab-open');
    dropdown.classList.remove('js-tpl-open');
  });

  document.querySelectorAll('.js-prefab-card').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var snippet = prefabs[item.getAttribute('data-prefab')];
      if (snippet) {
        insertAtCursor(snippet);
        prefabDropdown.classList.remove('js-prefab-open');
      }
    });
  });

  /* ══════════════════════════════════════════════════
     LIVE PREVIEW via DokuWiki AJAX
     POST to /wiki/lib/exe/ajax.php?call=preview
     with the current textarea content
  ══════════════════════════════════════════════════ */

  var debounceTimer = null;
  var lastContent = '';
  var isLoading = false;

  function setStatus(state) {
    var dot = document.querySelector('.js-preview-dot');
    var txt = document.querySelector('.js-preview-status-text');
    if (!dot || !txt) return;
    dot.className = 'js-preview-dot js-preview-dot--' + state;
    var labels = { ready: 'ready', loading: 'updating…', error: 'error' };
    txt.textContent = labels[state] || state;
  }

  function fetchPreview(content) {
    if (isLoading) return;
    if (content === lastContent) return;
    lastContent = content;
    isLoading = true;
    setStatus('loading');

    /* Use DokuWiki's preview action via doku.php */
    var pageId = (typeof JSINFO !== 'undefined' && JSINFO.id) ? JSINFO.id : '';
    var params = new URLSearchParams();
    params.append('id', pageId);
    params.append('do', 'preview');
    params.append('wikitext', content);

    fetch('/wiki/doku.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    .then(function (r) { return r.text(); })
    .then(function (html) {
      isLoading = false;
      setStatus('ready');
      var empty = previewBody.querySelector('.js-preview-empty');
      if (empty) empty.remove();

      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');

      /* DokuWiki renders preview content after the h1#preview label.
         Grab everything after that h1 inside the editBox */
      var previewHeading = doc.getElementById('preview');
      var output = '';

      if (previewHeading) {
        var el = previewHeading.nextElementSibling;
        while (el) {
          output += el.outerHTML;
          el = el.nextElementSibling;
        }
      }

      /* Fallback: grab the editBox and strip the toolbar/form */
      if (!output) {
        var editBox = doc.querySelector('.editBox');
        if (editBox) {
          /* Remove toolbar, form elements, script tags */
          editBox.querySelectorAll('.tool_bar, form, script, #draft__status').forEach(function(el) {
            el.remove();
          });
          output = editBox.innerHTML;
        }
      }

      previewBody.innerHTML = output || '<p style="color:rgba(184,173,219,0.4);font-family:Forevs,serif;font-size:0.8rem;letter-spacing:0.1em;">Nothing to preview yet.</p>';

      /* Remove DokuWiki's "this is a preview" notice */
      var notice = previewBody.querySelector('p:first-child');
      if (notice && notice.textContent.indexOf('preview') !== -1 && notice.querySelector('strong')) {
        notice.remove();
      }

      if (window.prettyPrint) window.prettyPrint();
    })
    .catch(function () {
      isLoading = false;
      setStatus('error');
    });
  }

  /* Debounced input handler — 600ms pause */
  textarea.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      fetchPreview(textarea.value);
    }, 600);
  });

  /* Initial preview on load */
  setTimeout(function () {
    if (textarea.value.trim()) fetchPreview(textarea.value);
  }, 300);

  /* ══════════════════════════════════════════════════
     RESIZABLE HANDLE
  ══════════════════════════════════════════════════ */

  var isDragging = false;
  var startX = 0;
  var startLeftWidth = 0;

  handle.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.clientX;
    startLeftWidth = leftPane.getBoundingClientRect().width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var shellWidth = shell.getBoundingClientRect().width;
    var newLeftWidth = Math.max(280, Math.min(shellWidth - 300, startLeftWidth + dx));
    var pct = (newLeftWidth / shellWidth * 100).toFixed(2);
    leftPane.style.width = pct + '%';
    rightPane.style.width = (100 - parseFloat(pct) - 0.4) + '%';
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

})();