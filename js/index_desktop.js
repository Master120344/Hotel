function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
  return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
}

function smoothScrollTo(target) {
  var el = typeof target === "string" ? qs(target) : target;
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var offset = window.pageYOffset + rect.top - 72;
  window.scrollTo({
    top: offset < 0 ? 0 : offset,
    behavior: "smooth"
  });
}

/* rest of the JS from last message – scroll buttons, FAQ toggles,
   demo simulation, counters, bar animations, etc. */
document.addEventListener("DOMContentLoaded", function () {
  setupScrollButtons();
  setupMobileNav();
  animateCounters();
  loopPayoutStream();
  animateBars();
  setupFaq();
  setupRoleToggle();
  setupWaitlistForm();
  runDemoSimulation();
  setYear();
  setupHeroDemoButton();
  setupFocusStyles();
});
