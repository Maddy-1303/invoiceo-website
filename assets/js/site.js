/* Invoiceo website: menu, "recommended download", links from config.js,
   optional analytics. No libraries. */
(function () {
  'use strict';
  var C = window.INVOICEO || {};

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Year in the footer
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // Version / date
  document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = C.version || ''; });
  document.querySelectorAll('[data-release-date]').forEach(function (el) { el.textContent = C.releaseDate || ''; });

  // Links that come from config.js. data-hide-empty hides the element (or the
  // closest [data-block]) when the value is not set yet.
  function value(path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, C) || '';
  }
  document.querySelectorAll('[data-href]').forEach(function (el) {
    var url = value(el.getAttribute('data-href'));
    if (url) {
      el.setAttribute('href', url);
    } else {
      var block = el.closest('[data-block]') || el;
      if (el.hasAttribute('data-hide-empty')) {
        block.classList.add('hidden');
      } else {
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('title', 'Coming soon');
        el.removeAttribute('href');
      }
    }
  });

  // WhatsApp
  var wa = String(C.whatsapp || '').replace(/\D/g, '');
  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    if (wa) {
      el.setAttribute('href', 'https://wa.me/' + wa);
    } else {
      (el.closest('[data-block]') || el).classList.add('hidden');
    }
  });
  // Indian numbers read as +91 98765 43210; others as +<digits>.
  var waShown = /^91\d{10}$/.test(wa) ? '+91 ' + wa.slice(2, 7) + ' ' + wa.slice(7) : (wa ? '+' + wa : '');
  document.querySelectorAll('[data-whatsapp-number]').forEach(function (n) { n.textContent = waShown; });

  // Embedded customization form
  var frame = document.getElementById('customization-form');
  if (frame) {
    var embed = value('forms.customizationEmbed');
    var missing = document.getElementById('customization-form-missing');
    if (embed) { frame.src = embed; frame.classList.remove('hidden'); if (missing) missing.classList.add('hidden'); }
  }

  // Installer sizes
  document.querySelectorAll('[data-size]').forEach(function (el) {
    var s = value('sizes.' + el.getAttribute('data-size'));
    if (s) { el.textContent = ' · ' + s; }
  });

  // "Recommended for your computer"
  function detectOS() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var platform = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();
    if (/android|iphone|ipad|ipod/.test(ua)) return 'mobile';
    // iPadOS Safari says "Macintosh"; a touch screen gives it away.
    if ((platform.indexOf('mac') > -1 || ua.indexOf('mac os') > -1) && navigator.maxTouchPoints > 1) return 'mobile';
    if (platform.indexOf('win') > -1 || ua.indexOf('windows') > -1) return 'windows';
    if (platform.indexOf('mac') > -1 || ua.indexOf('mac os') > -1) return 'mac';
    if (platform.indexOf('linux') > -1 || ua.indexOf('linux') > -1) return 'linux';
    return 'other';
  }
  var os = detectOS();
  if (os === 'mobile') {
    document.querySelectorAll('[data-mobile-note]').forEach(function (n) { n.classList.remove('hidden'); });
  }
  var names = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
  document.querySelectorAll('[data-os-download]').forEach(function (btn) {
    var target = document.querySelector('[data-platform="' + os + '"] [data-primary-download]');
    var label = btn.querySelector('[data-os-label]');
    if (!names[os]) return;
    // On the Download page the button gets the installer itself; elsewhere
    // it keeps pointing at the Download page, which has the install steps.
    if (target) btn.setAttribute('href', target.getAttribute('href'));
    if (label) label.textContent = 'Download for ' + names[os];
  });
  document.querySelectorAll('[data-recommended]').forEach(function (box) {
    var target = document.querySelector('[data-platform="' + os + '"]');
    var name = box.querySelector('[data-recommended-name]');
    if (target && names[os]) {
      target.classList.add('is-recommended');
      if (name) name.textContent = names[os];
    } else {
      box.classList.add('hidden'); // phones / unknown systems: just show all three
    }
  });

  // Analytics only when an ID is set in config.js
  if (C.analyticsId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.analyticsId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.analyticsId, { anonymize_ip: true });
  }
})();
