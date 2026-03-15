/**
 * WithSwag Cookie Consent Banner
 * GDPR + CCPA compliant. Blocks ad scripts until user consents.
 * Include this script on every page BEFORE the AdSense script tag.
 *
 * Usage: <script src="/cookie-consent.js"></script>
 *
 * API:
 *   window.WithSwagConsent.hasConsent()  → boolean
 *   window.WithSwagConsent.revoke()      → re-shows banner
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ws_cookie_consent';
  var CONSENT_VERSION = '1'; // bump to re-ask after policy changes

  // ── Check stored consent ──
  function getStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  function setStored(accepted) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accepted: accepted,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString()
      }));
    } catch (e) { /* silent */ }
  }

  function hasConsent() {
    var s = getStored();
    return s && s.accepted === true;
  }

  // ── Load AdSense only after consent ──
  function loadAdsense() {
    if (document.getElementById('ws-adsense-script')) return;
    var s = document.createElement('script');
    s.id = 'ws-adsense-script';
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8351430872646121';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  // ── Build banner ──
  function showBanner() {
    if (document.getElementById('ws-cookie-banner')) return;
    // Safety: wait for body to exist
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', showBanner);
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = 'ws-cookie-banner';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Cookie consent');
    overlay.setAttribute('aria-modal', 'false');

    overlay.innerHTML =
      '<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:0 16px 16px;pointer-events:none;animation:wsCookieSlideUp 0.4s ease-out;">' +
        '<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:24px 28px;pointer-events:auto;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;border:1px solid #e5e7eb;">' +
          '<div style="display:flex;align-items:flex-start;gap:14px;">' +
            '<span style="font-size:28px;line-height:1;flex-shrink:0;">🍪</span>' +
            '<div style="flex:1;">' +
              '<p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0f172a;">We value your privacy</p>' +
              '<p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">We use cookies and similar technologies to show you relevant ads and analyze site traffic. Your photos and files are always processed locally and never uploaded. You can change your preference anytime.</p>' +
              '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
                '<button id="ws-consent-accept" style="padding:10px 22px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;">Accept All</button>' +
                '<button id="ws-consent-reject" style="padding:10px 22px;background:#f1f5f9;color:#374151;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;">Reject Non-Essential</button>' +
                '<a href="/privacy.html" style="font-size:13px;color:#6366f1;text-decoration:none;margin-left:4px;">Privacy Policy</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Add slide-up animation
    var style = document.createElement('style');
    style.textContent = '@keyframes wsCookieSlideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}';
    overlay.appendChild(style);

    document.body.appendChild(overlay);

    // Button handlers
    document.getElementById('ws-consent-accept').addEventListener('click', function () {
      setStored(true);
      removeBanner();
      loadAdsense();
    });

    document.getElementById('ws-consent-reject').addEventListener('click', function () {
      setStored(false);
      removeBanner();
      // Don't load adsense — respect the choice
    });
  }

  function removeBanner() {
    var el = document.getElementById('ws-cookie-banner');
    if (el) el.parentNode.removeChild(el);
  }

  // ── Public API ──
  window.WithSwagConsent = {
    hasConsent: hasConsent,
    revoke: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      showBanner();
    }
  };

  // ── Init ──
  var stored = getStored();
  if (stored === null) {
    // No decision yet — show banner, don't load ads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  } else if (stored.accepted) {
    // Already accepted — load ads
    loadAdsense();
  }
  // If rejected, do nothing — no ads, no banner

})();
