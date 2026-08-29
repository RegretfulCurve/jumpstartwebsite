/* hero-init.js
   Adds body.hero class for pages in heroes: or characters: namespace
*/
(function() {
  var pageId = document.body.getAttribute('data-page-id') || '';
  if (pageId.indexOf('heroes:') === 0 || pageId.indexOf('characters:') === 0) {
    document.body.classList.add('hero');
  }
})();