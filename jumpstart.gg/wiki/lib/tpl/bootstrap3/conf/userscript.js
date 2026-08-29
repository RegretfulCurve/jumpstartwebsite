/**
 * JUMPSTART — conf/userscript.js
 * Loaded automatically by DokuWiki on every page.
 *
 * Adds a "Technique Blocks" picker dropdown to the editor toolbar
 * when editing pages in the universaltech: namespace.
 *
 * Uses DokuWiki's native toolbar API — no DOM injection needed.
 *
 * After uploading: touch conf/local.php on the server and do a
 * hard refresh (Ctrl+Shift+R) on the editor page to bust the JS cache.
 */

/* ── Custom addBtnAction handler for snippet insertion ── */
function addBtnActionJsSnippet($btn, props, edid) {
  $btn.on('click', function () {
    insertAtCarret(edid, props.insert);
    pickerClose();
    return false;
  });
  return edid;
}

/* ── Only extend toolbar when it exists (edit mode only) ── */
if (typeof window.toolbar !== 'undefined') {

  /* ── Only add buttons for universaltech: namespace ── */
  if (typeof JSINFO !== 'undefined' &&
      JSINFO.id &&
      JSINFO.id.indexOf('universaltech:') === 0) {

    /* ════════════════════════════════════════════════════
       SNIPPET DEFINITIONS
       Each entry in a picker list:
         key   = the text inserted at cursor
         value = icon filename in lib/images/toolbar/
                 (use 'wrap_center.png' etc — standard DW icons)
    ════════════════════════════════════════════════════ */

    /* ── Page Structure ── */
    toolbar.push({
      type:  'picker',
      title: 'Page Structure',
      icon:  '../plugins/wrap/images/toolbar/wrap_center.png',
      list: [
        '\n<html>\n<header class="js-page-header">\n  <span class="js-page-eyebrow">Movement \xb7 Techniques</span>\n  <h1 class="js-page-title">Technique Name</h1>\n  <p class="js-page-subtitle">One sentence describing what this technique does.</p>\n</header>\n</html>\n',
        '\n===== Section Title =====\n\n',
        '\n==== Sub-section Title ====\n\n'
      ],
      icobase: 'toolbar'
    });

    /* ── Content Blocks ── */
    toolbar.push({
      type:  'picker',
      title: 'Content Blocks',
      icon:  'list.png',
      list: [
        /* How-to Steps */
        '\n<html>\n<div class="js-steps">\n\n  <div class="js-step">\n    <div class="js-step-num">01</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title</div>\n      <p class="js-step-desc">Describe this step.</p>\n    </div>\n  </div>\n\n  <div class="js-step">\n    <div class="js-step-num">02</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title</div>\n      <p class="js-step-desc">Describe this step.</p>\n    </div>\n  </div>\n\n  <div class="js-step">\n    <div class="js-step-num">03</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title</div>\n      <p class="js-step-desc">Describe this step.</p>\n    </div>\n  </div>\n\n</div>\n</html>\n',
        /* Single Step */
        '\n<html>\n  <div class="js-step">\n    <div class="js-step-num">01</div>\n    <div class="js-step-content">\n      <div class="js-step-title">Step title</div>\n      <p class="js-step-desc">Describe this step.</p>\n    </div>\n  </div>\n</html>\n',
        /* Input Table */
        '\n<html>\n<table class="js-input-table">\n  <thead>\n    <tr><th>Action</th><th>Input</th><th>Timing</th><th>Notes</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Action name</td>\n      <td><span class="js-key">Space</span></td>\n      <td>On ground</td>\n      <td>Notes here</td>\n    </tr>\n    <tr>\n      <td>Action name</td>\n      <td><span class="js-key">Shift</span><span class="js-input-plus">+</span><span class="js-key">W</span></td>\n      <td>Hold throughout</td>\n      <td>Notes here</td>\n    </tr>\n  </tbody>\n</table>\n</html>\n',
        /* Input Row */
        '    <tr>\n      <td>Action name</td>\n      <td><span class="js-key">Key</span></td>\n      <td>Timing</td>\n      <td>Notes</td>\n    </tr>\n',
        /* Stat Table */
        '\n<html>\n<table class="js-stat-table">\n  <thead>\n    <tr><th>Metric</th><th>Base</th><th>With Technique</th><th>Notes</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Stat label</td>\n      <td>000</td>\n      <td><span class="js-stat-val">000</span></td>\n      <td><span class="js-stat-note">Notes</span></td>\n    </tr>\n    <tr>\n      <td>Stat label</td>\n      <td>000</td>\n      <td><span class="js-stat-val">000</span></td>\n      <td><span class="js-stat-note">Notes</span></td>\n    </tr>\n  </tbody>\n</table>\n</html>\n',
        /* Stat Row */
        '    <tr>\n      <td>Stat label</td>\n      <td>000</td>\n      <td><span class="js-stat-val">000</span></td>\n      <td><span class="js-stat-note">Notes</span></td>\n    </tr>\n',
        /* Related Techniques */
        '\n<html>\n<div class="js-related">\n\n  <a href="/wiki/doku.php?id=universaltech:related-1" class="js-related-card">\n    <span class="js-related-card-name">Related Technique</span>\n    <span class="js-related-card-desc">One-line description</span>\n  </a>\n\n  <a href="/wiki/doku.php?id=universaltech:related-2" class="js-related-card">\n    <span class="js-related-card-name">Related Technique</span>\n    <span class="js-related-card-desc">One-line description</span>\n  </a>\n\n</div>\n</html>\n',
        /* Related Card */
        '  <a href="/wiki/doku.php?id=universaltech:page-id" class="js-related-card">\n    <span class="js-related-card-name">Technique Name</span>\n    <span class="js-related-card-desc">One-line description</span>\n  </a>\n'
      ],
      icobase: 'toolbar'
    });

    /* ── Callouts ── */
    toolbar.push({
      type:  'picker',
      title: 'Callouts',
      icon:  'quote.png',
      list: [
        /* Info */
        '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Note</span>\n    <p class="js-callout-text">Write your note here.</p>\n  </div>\n</div>\n</html>\n',
        /* Tip */
        '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar tip"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Tip</span>\n    <p class="js-callout-text">Write your tip here.</p>\n  </div>\n</div>\n</html>\n',
        /* Warning */
        '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar warning"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Warning</span>\n    <p class="js-callout-text">Write your warning here.</p>\n  </div>\n</div>\n</html>\n',
        /* Danger */
        '\n<html>\n<div class="js-callout">\n  <div class="js-callout-bar danger"></div>\n  <div class="js-callout-inner">\n    <span class="js-callout-label">Danger</span>\n    <p class="js-callout-text">Write your danger note here.</p>\n  </div>\n</div>\n</html>\n'
      ],
      icobase: 'toolbar'
    });

    /* ── Media ── */
    toolbar.push({
      type:  'picker',
      title: 'Media',
      icon:  'image.png',
      list: [
        /* Single video */
        '\n<html>\n<div class="js-video-block">\n  <div class="js-video-wrap">\n    <video autoplay muted loop playsinline>\n      <source src="/wiki/lib/exe/fetch.php?media=universaltech:clip.mp4" type="video/mp4">\n    </video>\n  </div>\n  <div class="js-video-caption">Caption text</div>\n</div>\n</html>\n',
        /* Video grid */
        '\n<html>\n<div class="js-video-grid">\n\n  <div class="js-video-block">\n    <div class="js-video-wrap">\n      <video autoplay muted loop playsinline>\n        <source src="/wiki/lib/exe/fetch.php?media=universaltech:clip1.mp4" type="video/mp4">\n      </video>\n    </div>\n    <div class="js-video-caption">Caption for clip one</div>\n  </div>\n\n  <div class="js-video-block">\n    <div class="js-video-wrap">\n      <video autoplay muted loop playsinline>\n        <source src="/wiki/lib/exe/fetch.php?media=universaltech:clip2.mp4" type="video/mp4">\n      </video>\n    </div>\n    <div class="js-video-caption">Caption for clip two</div>\n  </div>\n\n</div>\n</html>\n',
        /* Image */
        '\n<html>\n<div class="js-media-block">\n  <img src="/wiki/lib/exe/fetch.php?media=universaltech:image.png" alt="Description">\n  <div class="js-media-caption">Caption text</div>\n</div>\n</html>\n'
      ],
      icobase: 'toolbar'
    });

    /* ── Infostrip ── */
    toolbar.push({
      type:  'picker',
      title: 'Infostrip',
      icon:  'chars.png',
      list: [
        '<div class="js-chip js-chip-beginner"><span class="js-chip-dot"></span>Beginner</div>\n',
        '<div class="js-chip js-chip-intermediate"><span class="js-chip-dot"></span>Intermediate</div>\n',
        '<div class="js-chip js-chip-advanced"><span class="js-chip-dot"></span>Advanced</div>\n',
        '<div class="js-chip js-chip-expert"><span class="js-chip-dot"></span>Expert</div>\n',
        '<div class="js-chip js-chip-tier-s"><span class="js-chip-dot" style="background:#c2883a;"></span>S-Tier</div>\n',
        '<div class="js-chip js-chip-tier-a"><span class="js-chip-dot" style="background:#3a9e6a;"></span>A-Tier</div>\n',
        '<div class="js-chip js-chip-tier-b"><span class="js-chip-dot" style="background:#3a6e9e;"></span>B-Tier</div>\n',
        '<a href="/wiki/doku.php?id=heroes:hero-name" class="js-hero-tag"><span class="js-hero-tag-icon"></span>Hero Name</a>\n',
        '<span class="js-infostrip-label">Label</span>\n'
      ],
      icobase: 'toolbar'
    });

  }
}
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

function jsEditorReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

jsEditorReady(function () {
(function () {
  'use strict';

  var textarea = document.getElementById('wiki__text');
  if (!textarea) return;

  /* ── Find the edit box wrapper ── */
  var editBox = textarea.closest('.editBox') || textarea.closest('#dokuwiki__content');
  if (!editBox) return;

  /* ── Build the split layout ── */

  /* Outer shell — fills the content area */
  var shell = document.createElement('div');
  shell.id = 'js-editor-shell';

  /* Left pane — contains existing editor DOM */
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

  /* Move the existing editBox content into leftPane */
  var parent = editBox.parentNode;
  parent.insertBefore(shell, editBox);
  leftPane.appendChild(editBox);
  shell.appendChild(leftPane);
  shell.appendChild(handle);
  shell.appendChild(rightPane);

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

    /* Build form data the same way DokuWiki's own preview does */
    var pageId = (typeof JSINFO !== 'undefined' && JSINFO.id) ? JSINFO.id : '';
    var params = new URLSearchParams();
    params.append('call', 'preview');
    params.append('id', pageId);
    params.append('wikitext', content);

    fetch('/wiki/lib/exe/ajax.php', {
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
      previewBody.innerHTML = html;

      /* Re-apply syntax highlighting if DokuWiki loaded it */
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
}); // jsEditorReady