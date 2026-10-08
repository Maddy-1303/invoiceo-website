/* Invoiceo website: menu, "recommended download", links from config.js,
   install help after a download starts, optional analytics. No libraries. */
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Year in the footer
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // Version / date
  document.querySelectorAll('[data-version]').forEach(function (el) { if (C.version) el.textContent = C.version; });
  document.querySelectorAll('[data-release-date]').forEach(function (el) { if (C.releaseDate) el.textContent = C.releaseDate; });

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
  var names = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
  var sizeKey = { windows: 'windows', mac: 'mac', linux: 'linuxDeb' };
  var myCard = document.querySelector('[data-platform="' + os + '"]');

  if (os === 'mobile') {
    document.querySelectorAll('[data-mobile-note]').forEach(function (n) { n.classList.remove('hidden'); });
  }
  // Highlight the card for this computer (none on phones or unknown systems).
  document.querySelectorAll('[data-platform]').forEach(function (card) {
    card.classList.toggle('is-recommended', card === myCard && !!names[os]);
  });

  // Hero button: the installer for this computer, or the download section.
  document.querySelectorAll('[data-os-download]').forEach(function (btn) {
    var label = btn.querySelector('[data-os-label]');
    var mark = btn.querySelector('[data-os-icon]');
    if (os === 'mobile') {
      if (label) label.textContent = 'Get it for your computer';
      return;
    }
    var target = myCard && myCard.querySelector('[data-primary-download]');
    if (!names[os] || !target) return;
    btn.setAttribute('href', target.getAttribute('href'));
    if (label) label.textContent = 'Download for ' + names[os];
    var logo = myCard.querySelector('.tile svg');
    if (mark && logo) { mark.textContent = ''; mark.appendChild(logo.cloneNode(true)); }
  });

  // The small line under the hero buttons
  var meta = document.querySelector('[data-hero-meta]');
  if (meta) {
    if (os === 'mobile') {
      meta.textContent = 'Invoiceo is a desktop app for Windows, macOS and Linux. Open this page on your computer to install it.';
    } else if (names[os] && myCard) {
      var size = value('sizes.' + sizeKey[os]);
      var others = Object.keys(names).filter(function (k) { return k !== os; }).map(function (k) { return names[k]; }).join(' and ');
      meta.textContent = ['Free', 'Version ' + (C.version || ''), size, myCard.getAttribute('data-req-short')]
        .filter(Boolean).join(' · ') + ' · Also for ';
      var more = document.createElement('a');
      more.href = '#download';
      more.textContent = others;
      meta.appendChild(more);
    }
  }

  // Install help that appears once a download starts
  function installer(href) {
    var m = /\/releases\/(?:latest\/)?download\/(?:[^/]+\/)?([^/?#]+)$/.exec(href);
    if (!m) return null;
    var file = m[1];
    var platform = /windows|\.exe$/i.test(file) ? 'windows'
      : /macos|\.dmg$/i.test(file) ? 'mac'
      : /\.deb$/i.test(file) ? 'linux_deb'
      : /\.appimage$/i.test(file) ? 'linux_appimage' : null;
    return platform ? { file: file, platform: platform } : null;
  }
  var HELP = {
    windows: ['Open the file when it has downloaded. If Windows says <b>“Windows protected your PC”</b>, click <b>More info</b>, then <b>Run anyway</b>.', 'windows'],
    mac: ['Open the file and drag Invoiceo into Applications. The first time, macOS may block it: open <b>System Settings → Privacy &amp; Security</b> and click <b>Open Anyway</b>.', 'macos'],
    linux_deb: ['Install it with <code>sudo apt install ./Invoiceo-Linux.deb</code> in the folder you downloaded it to.', 'linux'],
    linux_appimage: ['Make it runnable with <code>chmod +x Invoiceo-Linux.AppImage</code>, then open it.', 'linux']
  };
  var toast = null;
  function showHelp(platform) {
    var help = HELP[platform];
    if (!help) return;
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'dl-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
      + '<div><b>Your download has started.</b> ' + help[0] + ' <a href="download.html#' + help[1] + '">Full install steps</a></div>'
      + '<button type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    toast.querySelector('button').addEventListener('click', function () { toast.remove(); toast = null; });
  }

  // Analytics only when an ID is set in config.js, and never on a local preview.
  if (C.analyticsId && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.analyticsId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // Visit counts only: no Google signals or ad personalisation.
    window.gtag('config', C.analyticsId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  // Download tracking (only sends anything when analytics is on).
  //   download_click       a click on an installer link (GitHub release file)
  //   download_page_click  a click on a link that leads to the Download page or section
  function placement(a) {
    if (a.closest('.site-header')) return 'header';
    if (a.closest('.site-footer')) return 'footer';
    if (a.closest('.dl-toast')) return 'install_help';
    if (a.closest('[data-platform]')) return 'platform_card';
    if (a.closest('.hero')) return 'hero';
    if (a.closest('.cta-band')) return 'cta_band';
    var section = a.closest('section[id]');
    return section ? section.id : 'page_body';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.href;
    var file = installer(href);
    if (file) showHelp(file.platform);
    if (typeof window.gtag !== 'function') return;
    if (file) {
      window.gtag('event', 'download_click', {
        platform: file.platform,
        file_name: file.file,
        placement: placement(a),
        detected_os: os,
        page_path: location.pathname,
        transport_type: 'beacon'
      });
    } else if (/\/download\.html(?:[?#]|$)|#download$/.test(href)) {
      window.gtag('event', 'download_page_click', {
        placement: placement(a),
        link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        detected_os: os,
        page_path: location.pathname,
        transport_type: 'beacon'
      });
    }
  });
})();
