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

function setupScrollButtons() {
  qsa("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-scroll");
      smoothScrollTo(target);
    });
  });
}

function setupMobileNav() {
  var burger = qs("#ds-header-burger");
  var nav = qs("#ds-mobile-nav");
  if (!burger || !nav) return;
  burger.addEventListener("click", function () {
    nav.classList.toggle("ds-mobile-nav-open");
  });
  qsa(".ds-mobile-link", nav).forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("ds-mobile-nav-open");
    });
  });
}

function animateCounters() {
  var counters = qsa("[data-counter]");
  if (!counters.length) return;
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute("data-counter"), 10) || 0;
      var duration = 850;
      var start = 0;
      var startTime = null;
      function tick(ts) {
        if (!startTime) startTime = ts;
        var progress = ts - startTime;
        var ratio = progress / duration;
        if (ratio > 1) ratio = 1;
        var eased = 1 - Math.pow(1 - ratio, 3);
        var value = Math.floor(start + (target - start) * eased);
        el.textContent = value.toLocaleString();
        if (ratio < 1) {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.45 });
  counters.forEach(function (el) {
    observer.observe(el);
  });
}

function loopPayoutStream() {
  var stream = qs("#payout-stream");
  if (!stream) return;
  var originalItems = qsa(".ds-floating-item", stream);
  if (!originalItems.length) return;
  originalItems.forEach(function (item) {
    var clone = item.cloneNode(true);
    stream.appendChild(clone);
  });
  var scrollPos = 0;
  function step() {
    scrollPos += 0.16;
    if (scrollPos >= stream.scrollHeight / 2) {
      scrollPos = 0;
    }
    stream.scrollTop = scrollPos;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateBars() {
  var bars = qsa(".ds-chart-bar");
  if (!bars.length) return;
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var value = parseInt(el.getAttribute("data-bar"), 10) || 0;
      var scale = value / 100;
      if (scale <= 0) scale = 0.1;
      el.style.transform = "scaleY(" + scale + ")";
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  bars.forEach(function (el) {
    observer.observe(el);
  });
}

function setupFaq() {
  qsa(".ds-faq-item").forEach(function (item) {
    var btn = qs(".ds-faq-question", item);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = item.classList.contains("ds-faq-item-open");
      qsa(".ds-faq-item").forEach(function (it) {
        it.classList.remove("ds-faq-item-open");
      });
      if (!open) {
        item.classList.add("ds-faq-item-open");
      }
    });
  });
}

function setupRoleToggle() {
  var options = qsa(".ds-pill-option");
  var hidden = qs("#role-input");
  var hotelRow = qs("#hotel-name-row");
  if (!options.length || !hidden || !hotelRow) return;
  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var role = btn.getAttribute("data-role");
      options.forEach(function (o) {
        o.classList.remove("ds-pill-option-active");
      });
      btn.classList.add("ds-pill-option-active");
      hidden.value = role;
      if (role === "hotel" || role === "operator") {
        hotelRow.style.display = "flex";
      } else {
        hotelRow.style.display = "none";
      }
    });
  });
}

function setupWaitlistForm() {
  var form = qs("#waitlist-form");
  var message = qs("#waitlist-message");
  if (!form || !message) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var role = fd.get("role") || "";
    var name = (fd.get("name") || "").toString().trim();
    if (!name) {
      message.textContent = "Add your name so we know who to reach out to.";
      return;
    }
    var email = (fd.get("email") || "").toString().trim();
    if (!email || email.indexOf("@") === -1) {
      message.textContent = "Use a valid email; this is how we contact you.";
      return;
    }
    var label;
    if (role === "hotel") label = "a hotel lead";
    else if (role === "operator") label = "a multi-property operator";
    else label = "an early guest";
    message.textContent = "Got it. You are on our early list as " + label + ".";
    form.reset();
  });
}

function formatTime(num) {
  return num.toFixed(1) + "s";
}

function addDemoEvent(list, time, text) {
  var li = document.createElement("li");
  li.className = "ds-demo-event";
  var t = document.createElement("span");
  t.className = "ds-demo-event-time";
  t.textContent = formatTime(time);
  var body = document.createElement("span");
  body.textContent = text;
  li.appendChild(t);
  li.appendChild(body);
  list.appendChild(li);
}

function runDemoSimulation() {
  var btn = qs("#demo-run");
  var reset = qs("#demo-reset");
  var list = qs("#demo-events");
  var status = qs("#demo-status");
  var authMetric = qs("#metric-auth");
  var payoutMetric = qs("#metric-payout");
  var totalMetric = qs("#metric-total");
  if (!btn || !reset || !list || !status || !authMetric || !payoutMetric || !totalMetric) return;
  var running = false;
  btn.addEventListener("click", function () {
    if (running) return;
    running = true;
    list.innerHTML = "";
    status.textContent = "Running...";
    var authTime = 0.6 + Math.random() * 0.6;
    var payoutTime = 1.4 + Math.random() * 0.9;
    var totalTime = authTime + payoutTime;
    authMetric.textContent = formatTime(authTime);
    payoutMetric.textContent = formatTime(payoutTime);
    totalMetric.textContent = formatTime(totalTime);
    addDemoEvent(list, 0.0, "Guest clicks confirm booking.");
    setTimeout(function () {
      addDemoEvent(list, authTime, "Card authorized and booking confirmed.");
    }, authTime * 520);
    setTimeout(function () {
      addDemoEvent(list, authTime + 0.4, "DirectStay splits funds between hotel and platform.");
    }, (authTime + 0.4) * 520);
    setTimeout(function () {
      addDemoEvent(list, totalTime, "Hotel paid out and status updated.");
      status.textContent = "Complete";
      running = false;
    }, totalTime * 520);
  });
  reset.addEventListener("click", function () {
    if (running) return;
    list.innerHTML = "";
    status.textContent = "Idle";
    authMetric.textContent = "0.0s";
    payoutMetric.textContent = "0.0s";
    totalMetric.textContent = "0.0s";
  });
}

function setYear() {
  var el = qs("#ds-year");
  if (!el) return;
  el.textContent = new Date().getFullYear().toString();
}

function setupHeroDemoButton() {
  var trigger = qs("#demo-trigger");
  var runBtn = qs("#demo-run");
  if (!trigger || !runBtn) return;
  trigger.addEventListener("click", function () {
    smoothScrollTo("#demo");
    setTimeout(function () {
      runBtn.click();
    }, 700);
  });
}

function setupFocusStyles() {
  qsa("button, a, input, textarea").forEach(function (el) {
    el.addEventListener("keyup", function (e) {
      if (e.key === "Tab") {
        el.classList.add("ds-focus-ring");
      }
    });
    el.addEventListener("blur", function () {
      el.classList.remove("ds-focus-ring");
    });
  });
}

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
