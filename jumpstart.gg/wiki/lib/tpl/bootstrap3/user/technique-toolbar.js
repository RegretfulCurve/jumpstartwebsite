/**
 * JUMPSTART — technique-toolbar.js
 * Location: lib/tpl/bootstrap3/user/technique-toolbar.js
 * Load via: lib/tpl/bootstrap3/user/footer.html
 *
 * Injects a floating snippet toolbar into the DokuWiki editor
 * when editing any page in a configured namespace.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIGURATION
     Set NAMESPACES to an array of namespace prefixes that
     should show the toolbar. Use an empty array [] to show
     the toolbar on ALL pages in edit mode (useful for testing).

     Examples:
       ['universaltech']         — only universaltech: namespace
       ['universaltech', 'tech'] — multiple namespaces
       []                        — every edit page (dev/test mode)
  ══════════════════════════════════════════════════════ */
  var NAMESPACES = ['universaltech'];

  function init() {

  /* ── Only runs in edit mode (textarea must exist) ── */
  var textarea = document.getElementById('wiki__text');
  if (!textarea) return;

  /* ── Namespace check ── */
  if (NAMESPACES.length > 0) {
    if (typeof JSINFO === 'undefined' || !JSINFO.id) return;
    var pageId = JSINFO.id;
    var allowed = NAMESPACES.some(function (ns) {
      return pageId.indexOf(ns + ':') === 0 || pageId === ns;
    });
    if (!allowed) return;
  }

  /* ══════════════════════════════════════════════════════
     SNIPPETS
     Each entry: { label, icon, snippet }
     Use @@CURSOR@@ to mark where caret should land after insert.
  ══════════════════════════════════════════════════════ */
  var groups = [
    {
      label: 'Templates',
      buttons: [
        {
          label: 'Technique Page',
          icon: '▣',
          snippet: [
            '====== @@CURSOR@@Technique Name ======',
            '',
            '<html>',
            '<div class="js-technique-wrap">',
            '',
            '  <aside class="js-infostrip">',
            '    <span class="js-infostrip-label">Difficulty</span>',
            '    <div class="js-chip js-chip-advanced"><span class="js-chip-dot"></span>Advanced</div>',
            '    <span class="js-infostrip-label">Tier</span>',
            '    <div class="js-chip js-chip-tier-s"><span class="js-chip-dot" style="background:#c2883a;"></span>S-Tier</div>',
            '    <span class="js-infostrip-label">Works on</span>',
            '    <a href="/wiki/doku.php?id=heroes:all" class="js-hero-tag"><span class="js-hero-tag-icon"></span>All Heroes</a>',
            '    <span class="js-infostrip-label">Category</span>',
            '    <div class="js-chip" style="border-left-color:#3a6e9e;color:#7ab4cf;"><span class="js-chip-dot" style="background:#3a6e9e;"></span>Movement</div>',
            '  </aside>',
            '',
            '  <div class="js-technique-body">',
            '    <header class="js-page-header">',
            '      <span class="js-page-eyebrow">Movement · Techniques</span>',
            '      <h1 class="js-page-title">Technique Name</h1>',
            '      <p class="js-page-subtitle">One or two sentences describing what this technique does and why it matters.</p>',
            '    </header>',
            '  </div>',
            '',
            '</div>',
            '</html>',
            '',
            '===== Overview =====',
            '',
            'Write your overview here.',
            '',
            '===== How to Execute =====',
            '',
            '<html>',
            '<div class="js-steps">',
            '  <div class="js-step">',
            '    <div class="js-step-num">01</div>',
            '    <div class="js-step-content">',
            '      <div class="js-step-title">Step title</div>',
            '      <p class="js-step-desc">Describe this step.</p>',
            '    </div>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Input Notation =====',
            '',
            '<html>',
            '<table class="js-input-table">',
            '  <thead><tr><th>Action</th><th>Input</th><th>Timing</th><th>Notes</th></tr></thead>',
            '  <tbody>',
            '    <tr><td>Action</td><td><span class="js-key">Space</span></td><td>Timing</td><td>Notes</td></tr>',
            '  </tbody>',
            '</table>',
            '</html>',
            '',
            '===== Stats =====',
            '',
            '<html>',
            '<table class="js-stat-table">',
            '  <thead><tr><th>Metric</th><th>Base</th><th>With Technique</th><th>Notes</th></tr></thead>',
            '  <tbody>',
            '    <tr><td>Stat</td><td>000</td><td><span class="js-stat-val">000</span></td><td><span class="js-stat-note">Notes</span></td></tr>',
            '  </tbody>',
            '</table>',
            '</html>',
            '',
            '===== Video Examples =====',
            '',
            '<html>',
            '<div class="js-video-block">',
            '  <div class="js-video-wrap">',
            '    <video autoplay muted loop playsinline>',
            '      <source src="/wiki/lib/exe/fetch.php?media=universaltech:clip.mp4" type="video/mp4">',
            '    </video>',
            '  </div>',
            '  <div class="js-video-caption">Caption text</div>',
            '</div>',
            '</html>',
            '',
            '===== Related Techniques =====',
            '',
            '<html>',
            '<div class="js-related">',
            '  <a href="/wiki/doku.php?id=universaltech:related" class="js-related-card">',
            '    <span class="js-related-card-name">Related Technique</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '</div>',
            '</html>',
          ].join('\n')
        },
        {
          label: 'Hero Page',
          icon: '◈',
          snippet: [
            '====== @@CURSOR@@Hero Name ======',
            '',
            '<html>',
            '<div class="js-hero-wrap">',
            '',
            '  <aside class="js-infostrip">',
            '    <span class="js-infostrip-label">Role</span>',
            '    <div class="js-chip" style="border-left-color:#3a6e9e;color:#7ab4cf;"><span class="js-chip-dot" style="background:#3a6e9e;"></span>Flex</div>',
            '    <span class="js-infostrip-label">Difficulty</span>',
            '    <div class="js-chip js-chip-intermediate"><span class="js-chip-dot"></span>Intermediate</div>',
            '    <span class="js-infostrip-label">Tier</span>',
            '    <div class="js-chip js-chip-tier-a"><span class="js-chip-dot" style="background:#3a9e6a;"></span>A-Tier</div>',
            '  </aside>',
            '',
            '  <div class="js-technique-body">',
            '    <header class="js-page-header">',
            '      <span class="js-page-eyebrow">Heroes</span>',
            '      <h1 class="js-page-title">Hero Name</h1>',
            '      <p class="js-page-subtitle">One sentence describing the hero\'s playstyle and role.</p>',
            '    </header>',
            '  </div>',
            '',
            '</div>',
            '</html>',
            '',
            '===== Overview =====',
            '',
            'Write a general overview of the hero here.',
            '',
            '===== Movement Tech =====',
            '',
            'List and link relevant movement techniques for this hero.',
            '',
            '===== Tips & Tricks =====',
            '',
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar tip"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Tip</span>',
            '    <p class="js-callout-text">Add a key tip here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Related Techniques =====',
            '',
            '<html>',
            '<div class="js-related">',
            '  <a href="/wiki/doku.php?id=universaltech:related" class="js-related-card">',
            '    <span class="js-related-card-name">Technique</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '</div>',
            '</html>',
          ].join('\n')
        },
        {
          label: 'General Article',
          icon: '☰',
          snippet: [
            '====== @@CURSOR@@Article Title ======',
            '',
            '<html>',
            '<header class="js-page-header">',
            '  <span class="js-page-eyebrow">Category · Sub-category</span>',
            '  <h1 class="js-page-title">Article Title</h1>',
            '  <p class="js-page-subtitle">One sentence describing what this article covers.</p>',
            '</header>',
            '</html>',
            '',
            '===== Overview =====',
            '',
            'Write your overview here.',
            '',
            '===== Section One =====',
            '',
            'Content here.',
            '',
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Note</span>',
            '    <p class="js-callout-text">Add an important note here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Section Two =====',
            '',
            'Content here.',
            '',
            '===== Related Pages =====',
            '',
            '<html>',
            '<div class="js-related">',
            '  <a href="/wiki/doku.php?id=namespace:page" class="js-related-card">',
            '    <span class="js-related-card-name">Related Page</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '</div>',
            '</html>',
          ].join('\n')
        },
        {
          label: 'Changelog / Patch Notes',
          icon: '◎',
          snippet: [
            '====== @@CURSOR@@Patch X.X.X — Month DD, YYYY ======',
            '',
            '<html>',
            '<header class="js-page-header">',
            '  <span class="js-page-eyebrow">Changelog</span>',
            '  <h1 class="js-page-title">Patch X.X.X</h1>',
            '  <p class="js-page-subtitle">Month DD, YYYY — Summary of what changed.</p>',
            '</header>',
            '</html>',
            '',
            '===== Movement Changes =====',
            '',
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar tip"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Buff</span>',
            '    <p class="js-callout-text">Describe the buff here.</p>',
            '  </div>',
            '</div>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar danger"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Nerf</span>',
            '    <p class="js-callout-text">Describe the nerf here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Hero Changes =====',
            '',
            '<html>',
            '<table class="js-stat-table">',
            '  <thead><tr><th>Hero</th><th>Change</th><th>Old Value</th><th>New Value</th></tr></thead>',
            '  <tbody>',
            '    <tr><td>Hero Name</td><td>Stat name</td><td><span class="js-stat-note">old</span></td><td><span class="js-stat-val">new</span></td></tr>',
            '  </tbody>',
            '</table>',
            '</html>',
            '',
            '===== Bug Fixes =====',
            '',
            'List bug fixes here.',
          ].join('\n')
        },
        {
          label: 'Guide',
          icon: '◆',
          snippet: [
            '====== @@CURSOR@@Guide Title ======',
            '',
            '<html>',
            '<div class="js-technique-wrap">',
            '',
            '  <aside class="js-infostrip">',
            '    <span class="js-infostrip-label">Difficulty</span>',
            '    <div class="js-chip js-chip-beginner"><span class="js-chip-dot"></span>Beginner</div>',
            '    <span class="js-infostrip-label">Type</span>',
            '    <div class="js-chip" style="border-left-color:#9b3ab8;color:#cf8ae8;"><span class="js-chip-dot" style="background:#9b3ab8;"></span>Guide</div>',
            '  </aside>',
            '',
            '  <div class="js-technique-body">',
            '    <header class="js-page-header">',
            '      <span class="js-page-eyebrow">Guides</span>',
            '      <h1 class="js-page-title">Guide Title</h1>',
            '      <p class="js-page-subtitle">One sentence describing what this guide teaches.</p>',
            '    </header>',
            '  </div>',
            '',
            '</div>',
            '</html>',
            '',
            '===== Introduction =====',
            '',
            'Write your introduction here. What will the reader learn?',
            '',
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar tip"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Before you start</span>',
            '    <p class="js-callout-text">Any prerequisites or things the reader should know first.</p>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Step 1 — Topic =====',
            '',
            'Content here.',
            '',
            '===== Step 2 — Topic =====',
            '',
            'Content here.',
            '',
            '===== Step 3 — Topic =====',
            '',
            'Content here.',
            '',
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar warning"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Common Mistake</span>',
            '    <p class="js-callout-text">Describe a common mistake to avoid.</p>',
            '  </div>',
            '</div>',
            '</html>',
            '',
            '===== Summary =====',
            '',
            'Summarise what was covered.',
            '',
            '===== Related =====',
            '',
            '<html>',
            '<div class="js-related">',
            '  <a href="/wiki/doku.php?id=namespace:page" class="js-related-card">',
            '    <span class="js-related-card-name">Related Page</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '</div>',
            '</html>',
          ].join('\n')
        },
      ]
    },
    {
      label: 'Page Structure',
      buttons: [
        {
          label: 'Page Header',
          icon: '⬛',
          snippet: [
            '<html>',
            '<header class="js-page-header">',
            '  <span class="js-page-eyebrow">Movement · Techniques</span>',
            '  <h1 class="js-page-title">@@CURSOR@@Technique Name</h1>',
            '  <p class="js-page-subtitle">One sentence describing what this technique does and why it matters.</p>',
            '</header>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Section Heading',
          icon: '▶',
          snippet: '\n===== @@CURSOR@@Section Title =====\n\n'
        },
        {
          label: 'Sub-heading',
          icon: '▷',
          snippet: '\n==== @@CURSOR@@Sub-section Title ====\n\n'
        },
      ]
    },
    {
      label: 'Content Blocks',
      buttons: [
        {
          label: 'How-to Steps',
          icon: '①',
          snippet: [
            '<html>',
            '<div class="js-steps">',
            '',
            '  <div class="js-step">',
            '    <div class="js-step-num">01</div>',
            '    <div class="js-step-content">',
            '      <div class="js-step-title">@@CURSOR@@Step title</div>',
            '      <p class="js-step-desc">Describe this step.</p>',
            '    </div>',
            '  </div>',
            '',
            '  <div class="js-step">',
            '    <div class="js-step-num">02</div>',
            '    <div class="js-step-content">',
            '      <div class="js-step-title">Step title</div>',
            '      <p class="js-step-desc">Describe this step.</p>',
            '    </div>',
            '  </div>',
            '',
            '  <div class="js-step">',
            '    <div class="js-step-num">03</div>',
            '    <div class="js-step-content">',
            '      <div class="js-step-title">Step title</div>',
            '      <p class="js-step-desc">Describe this step.</p>',
            '    </div>',
            '  </div>',
            '',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Single Step',
          icon: '→',
          snippet: [
            '<html>',
            '  <div class="js-step">',
            '    <div class="js-step-num">@@CURSOR@@01</div>',
            '    <div class="js-step-content">',
            '      <div class="js-step-title">Step title</div>',
            '      <p class="js-step-desc">Describe this step.</p>',
            '    </div>',
            '  </div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Input Table',
          icon: '⌨',
          snippet: [
            '<html>',
            '<table class="js-input-table">',
            '  <thead>',
            '    <tr>',
            '      <th>Action</th>',
            '      <th>Input</th>',
            '      <th>Timing</th>',
            '      <th>Notes</th>',
            '    </tr>',
            '  </thead>',
            '  <tbody>',
            '    <tr>',
            '      <td>@@CURSOR@@Action name</td>',
            '      <td><span class="js-key">Space</span></td>',
            '      <td>On ground</td>',
            '      <td>Notes here</td>',
            '    </tr>',
            '    <tr>',
            '      <td>Action name</td>',
            '      <td><span class="js-key">Shift</span><span class="js-input-plus">+</span><span class="js-key">W</span></td>',
            '      <td>Hold throughout</td>',
            '      <td>Notes here</td>',
            '    </tr>',
            '  </tbody>',
            '</table>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Input Row',
          icon: '↵',
          snippet: [
            '    <tr>',
            '      <td>@@CURSOR@@Action name</td>',
            '      <td><span class="js-key">Key</span></td>',
            '      <td>Timing</td>',
            '      <td>Notes</td>',
            '    </tr>'
          ].join('\n')
        },
        {
          label: 'Stat Table',
          icon: '📊',
          snippet: [
            '<html>',
            '<table class="js-stat-table">',
            '  <thead>',
            '    <tr>',
            '      <th>Metric</th>',
            '      <th>Base</th>',
            '      <th>With Technique</th>',
            '      <th>Notes</th>',
            '    </tr>',
            '  </thead>',
            '  <tbody>',
            '    <tr>',
            '      <td>@@CURSOR@@Stat label</td>',
            '      <td>000</td>',
            '      <td><span class="js-stat-val">000</span></td>',
            '      <td><span class="js-stat-note">Notes</span></td>',
            '    </tr>',
            '    <tr>',
            '      <td>Stat label</td>',
            '      <td>000</td>',
            '      <td><span class="js-stat-val">000</span></td>',
            '      <td><span class="js-stat-note">Notes</span></td>',
            '    </tr>',
            '  </tbody>',
            '</table>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Stat Row',
          icon: '—',
          snippet: [
            '    <tr>',
            '      <td>@@CURSOR@@Stat label</td>',
            '      <td>000</td>',
            '      <td><span class="js-stat-val">000</span></td>',
            '      <td><span class="js-stat-note">Notes</span></td>',
            '    </tr>'
          ].join('\n')
        },
        {
          label: 'Related Techniques',
          icon: '⬡',
          snippet: [
            '<html>',
            '<div class="js-related">',
            '',
            '  <a href="/wiki/doku.php?id=techniques:@@CURSOR@@related-1" class="js-related-card">',
            '    <span class="js-related-card-name">Related Technique</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '',
            '  <a href="/wiki/doku.php?id=techniques:related-2" class="js-related-card">',
            '    <span class="js-related-card-name">Related Technique</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>',
            '',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Related Card',
          icon: '↗',
          snippet: [
            '  <a href="/wiki/doku.php?id=techniques:@@CURSOR@@page-id" class="js-related-card">',
            '    <span class="js-related-card-name">Technique Name</span>',
            '    <span class="js-related-card-desc">One-line description</span>',
            '  </a>'
          ].join('\n')
        },
      ]
    },
    {
      label: 'Callouts',
      buttons: [
        {
          label: 'Info',
          icon: 'ℹ',
          snippet: [
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Note</span>',
            '    <p class="js-callout-text">@@CURSOR@@Write your note here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Tip',
          icon: '✦',
          snippet: [
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar tip"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Tip</span>',
            '    <p class="js-callout-text">@@CURSOR@@Write your tip here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Warning',
          icon: '⚠',
          snippet: [
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar warning"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Warning</span>',
            '    <p class="js-callout-text">@@CURSOR@@Write your warning here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Danger',
          icon: '✕',
          snippet: [
            '<html>',
            '<div class="js-callout">',
            '  <div class="js-callout-bar danger"></div>',
            '  <div class="js-callout-inner">',
            '    <span class="js-callout-label">Danger</span>',
            '    <p class="js-callout-text">@@CURSOR@@Write your danger note here.</p>',
            '  </div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
      ]
    },
    {
      label: 'Media',
      buttons: [
        {
          label: 'Video (single)',
          icon: '▶',
          snippet: [
            '<html>',
            '<div class="js-video-block">',
            '  <div class="js-video-wrap">',
            '    <video autoplay muted loop playsinline>',
            '      <source src="/wiki/lib/exe/fetch.php?media=techniques:@@CURSOR@@clip.mp4" type="video/mp4">',
            '    </video>',
            '  </div>',
            '  <div class="js-video-caption">Caption text</div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Video Grid (2-up)',
          icon: '▶▶',
          snippet: [
            '<html>',
            '<div class="js-video-grid">',
            '',
            '  <div class="js-video-block">',
            '    <div class="js-video-wrap">',
            '      <video autoplay muted loop playsinline>',
            '        <source src="/wiki/lib/exe/fetch.php?media=techniques:@@CURSOR@@clip1.mp4" type="video/mp4">',
            '      </video>',
            '    </div>',
            '    <div class="js-video-caption">Caption for clip one</div>',
            '  </div>',
            '',
            '  <div class="js-video-block">',
            '    <div class="js-video-wrap">',
            '      <video autoplay muted loop playsinline>',
            '        <source src="/wiki/lib/exe/fetch.php?media=techniques:clip2.mp4" type="video/mp4">',
            '      </video>',
            '    </div>',
            '    <div class="js-video-caption">Caption for clip two</div>',
            '  </div>',
            '',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
        {
          label: 'Image',
          icon: '🖼',
          snippet: [
            '<html>',
            '<div class="js-media-block">',
            '  <img src="/wiki/lib/exe/fetch.php?media=techniques:@@CURSOR@@image.png" alt="Description">',
            '  <div class="js-media-caption">Caption text</div>',
            '</div>',
            '</html>',
            ''
          ].join('\n')
        },
      ]
    },
    {
      label: 'Infostrip',
      buttons: [
        {
          label: 'Chip: Beginner',
          icon: '◉',
          snippet: '<div class="js-chip js-chip-beginner"><span class="js-chip-dot"></span>@@CURSOR@@Beginner</div>\n'
        },
        {
          label: 'Chip: Intermediate',
          icon: '◉',
          snippet: '<div class="js-chip js-chip-intermediate"><span class="js-chip-dot"></span>@@CURSOR@@Intermediate</div>\n'
        },
        {
          label: 'Chip: Advanced',
          icon: '◉',
          snippet: '<div class="js-chip js-chip-advanced"><span class="js-chip-dot"></span>@@CURSOR@@Advanced</div>\n'
        },
        {
          label: 'Chip: Expert',
          icon: '◉',
          snippet: '<div class="js-chip js-chip-expert"><span class="js-chip-dot"></span>@@CURSOR@@Expert</div>\n'
        },
        {
          label: 'Tier: S',
          icon: 'S',
          snippet: '<div class="js-chip js-chip-tier-s"><span class="js-chip-dot" style="background:#c2883a;"></span>S-Tier</div>\n'
        },
        {
          label: 'Tier: A',
          icon: 'A',
          snippet: '<div class="js-chip js-chip-tier-a"><span class="js-chip-dot" style="background:#3a9e6a;"></span>A-Tier</div>\n'
        },
        {
          label: 'Tier: B',
          icon: 'B',
          snippet: '<div class="js-chip js-chip-tier-b"><span class="js-chip-dot" style="background:#3a6e9e;"></span>B-Tier</div>\n'
        },
        {
          label: 'Hero Tag',
          icon: '⬟',
          snippet: '<a href="/wiki/doku.php?id=heroes:@@CURSOR@@hero-name" class="js-hero-tag"><span class="js-hero-tag-icon"></span>Hero Name</a>\n'
        },
        {
          label: 'Strip Label',
          icon: '—',
          snippet: '<span class="js-infostrip-label">@@CURSOR@@Label</span>\n'
        },
      ]
    },
  ];

  /* ══════════════════════════════════════════════════════
     INSERT AT CURSOR
  ══════════════════════════════════════════════════════ */
  function insertSnippet(snippet) {
    textarea.focus();
    var start = textarea.selectionStart;
    var end   = textarea.selectionEnd;
    var val   = textarea.value;

    /* Ensure we start on a new line */
    var prefix = (start > 0 && val[start - 1] !== '\n') ? '\n' : '';

    /* Strip @@CURSOR@@ marker and remember offset */
    var cursorMarker = '@@CURSOR@@';
    var cursorOffset = snippet.indexOf(cursorMarker);
    var clean = snippet.replace(cursorMarker, '');

    textarea.value = val.slice(0, start) + prefix + clean + val.slice(end);

    /* Place caret */
    var caretPos;
    if (cursorOffset !== -1) {
      caretPos = start + prefix.length + cursorOffset;
    } else {
      caretPos = start + prefix.length + clean.length;
    }
    textarea.selectionStart = caretPos;
    textarea.selectionEnd   = caretPos;
    textarea.focus();

    /* Flash feedback on the button */
    return true;
  }

  /* ══════════════════════════════════════════════════════
     BUILD TOOLBAR DOM
  ══════════════════════════════════════════════════════ */
  var panel = document.createElement('div');
  panel.id = 'js-snippet-panel';

  /* Header row */
  var header = document.createElement('div');
  header.className = 'jstb-header';
  header.innerHTML = '<span class="jstb-title">JUMPSTART</span><span class="jstb-sub">Snippet Toolbar</span>';

  /* Collapse toggle */
  var collapseBtn = document.createElement('button');
  collapseBtn.className = 'jstb-collapse';
  collapseBtn.title = 'Collapse toolbar';
  collapseBtn.textContent = '◀';
  header.appendChild(collapseBtn);
  panel.appendChild(header);

  /* Body (collapsible) */
  var body = document.createElement('div');
  body.className = 'jstb-body';

  groups.forEach(function (group) {
    var section = document.createElement('div');
    section.className = 'jstb-section';

    var sectionLabel = document.createElement('div');
    sectionLabel.className = 'jstb-section-label';
    sectionLabel.textContent = group.label;
    section.appendChild(sectionLabel);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'jstb-btns';

    group.buttons.forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'jstb-btn';
      btn.title = item.label;
      btn.innerHTML = '<span class="jstb-btn-label">' + item.label + '</span>';

      btn.addEventListener('click', function () {
        insertSnippet(item.snippet);
        btn.classList.add('jstb-btn--flash');
        setTimeout(function () { btn.classList.remove('jstb-btn--flash'); }, 400);
      });

      btnWrap.appendChild(btn);
    });

    section.appendChild(btnWrap);
    body.appendChild(section);
  });

  panel.appendChild(body);

  /* Collapsed tab (visible when collapsed) */
  var tab = document.createElement('div');
  tab.id = 'js-snippet-tab';
  tab.title = 'Open snippet toolbar';
  tab.innerHTML = '<span>S<br>N<br>I<br>P</span>';

  /* ══════════════════════════════════════════════════════
     COLLAPSE / EXPAND
  ══════════════════════════════════════════════════════ */
  var collapsed = localStorage.getItem('jstb-collapsed') === '1';

  function applyState() {
    if (collapsed) {
      panel.classList.add('jstb-collapsed');
      tab.classList.add('jstb-visible');
      collapseBtn.textContent = '▶';
      collapseBtn.title = 'Expand toolbar';
    } else {
      panel.classList.remove('jstb-collapsed');
      tab.classList.remove('jstb-visible');
      collapseBtn.textContent = '◀';
      collapseBtn.title = 'Collapse toolbar';
    }
  }

  collapseBtn.addEventListener('click', function () {
    collapsed = !collapsed;
    localStorage.setItem('jstb-collapsed', collapsed ? '1' : '0');
    applyState();
  });

  tab.addEventListener('click', function () {
    collapsed = false;
    localStorage.setItem('jstb-collapsed', '0');
    applyState();
  });

  applyState();

  /* ══════════════════════════════════════════════════════
     DRAG TO REPOSITION
  ══════════════════════════════════════════════════════ */
  var isDragging = false;
  var dragStartY = 0;
  var panelStartTop = 0;

  header.addEventListener('mousedown', function (e) {
    if (e.target === collapseBtn) return;
    isDragging = true;
    dragStartY = e.clientY;
    panelStartTop = panel.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dy = e.clientY - dragStartY;
    var newTop = Math.max(80, panelStartTop + dy);
    panel.style.top = newTop + 'px';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  /* ══════════════════════════════════════════════════════
     MOUNT
     Styles live in editor.css — no inline injection needed.
  ══════════════════════════════════════════════════════ */
  document.body.appendChild(panel);
  document.body.appendChild(tab);

}

/* Defer until the page is fully loaded so Bootstrap3/DokuWiki
   can't wipe the body after we append. Falls back to immediate
   execution if the page is already complete. */
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();