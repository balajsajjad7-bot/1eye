/* 1EYE website behaviour (home page) */
(() => {
  const $ = id => document.getElementById(id);
  $('yr').textContent = new Date().getFullYear();
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slot = $('slot');
  const hasEye = typeof Eye !== 'undefined';
  if (hasEye && !still) {
    Eye.init($('space'));
    Eye.anchor(slot, 1);
    addEventListener('scroll', () => { const r = slot.getBoundingClientRect(); Eye.anchor(r.bottom < 0 ? null : slot, r.bottom < 0 ? .25 : 1); }, { passive: true });
  } else $('space').remove();

  // recommend the right download for this device
  const UA = navigator.userAgent, dw = $('dlwin'), da = $('dlapk');
  if (/Android/i.test(UA)) { da.classList.add('primary'); dw.classList.remove('primary'); da.parentNode.insertBefore(da, dw); }
  else if (/iPhone|iPad/i.test(UA)) { dw.outerHTML = '<a class="btn primary" href="guides/iphone-to-windows-file-transfer.html"><span>Using an iPhone?<small>No app needed: see how</small></span></a>'; }
  else if (/Macintosh|Mac OS X/i.test(UA)) { dw.outerHTML = '<a class="btn primary" href="#all"><span>Download for macOS<small>Apple Silicon or Intel · 8 MB</small></span></a>'; }
  else if (/Linux|X11/i.test(UA)) { dw.outerHTML = '<a class="btn primary" data-dl href="downloads/1EYE-Linux-x64" download="1EYE-Linux-x64"><span>Download for Linux<small>1EYE-Linux-x64 · 8 MB</small></span></a>'; }

  // AirDrop-style download: the eye's particles stream into the button, then the file arrives
  document.querySelectorAll('[data-dl]').forEach(b => {
    b.insertAdjacentHTML('beforeend', '<span class="st"></span>');
    b.addEventListener('click', e => {
      if (still || !hasEye || b.classList.contains('sending')) return;
      e.preventDefault();
      const st = b.querySelector('.st'), name = b.getAttribute('download');
      b.classList.add('sending'); st.textContent = 'Receiving from 1EYE…';
      if (slot.getBoundingClientRect().bottom < 0) Eye.anchor(null, 1);
      Eye.airdrop(b, () => {
        const a = document.createElement('a'); a.href = b.href; a.download = name; document.body.append(a); a.click(); a.remove();
        b.classList.remove('sending'); b.classList.add('got'); st.textContent = '✓ ' + name + ' received';
        setTimeout(() => b.classList.remove('got'), 3500);
      });
    });
  });
  document.querySelectorAll('[data-copy]').forEach(c => c.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(c.textContent).then(() => { const t = c.textContent; c.textContent = 'Copied ✓ — paste it into Terminal'; setTimeout(() => c.textContent = t, 1800); }); });

  const host = location.hostname.replace(/^www\./, ''), eye = $('openeye');
  if (/^[\d.]+$|localhost|pages\.dev$/.test(host)) eye.parentElement.style.display = 'none'; else eye.href = 'https://eye.' + host;

  // one place to turn on the support button: paste your Lemon Squeezy / Gumroad link here
  const SUPPORT_URL = '';
  if (SUPPORT_URL) { $('support').style.display = ''; $('supportbtn').href = SUPPORT_URL; }

  const SITE = 'https://1eye.dpdns.org', MSG = 'AirDrop for Windows + Android: send files, chat and links between your phone and PC. Free, no account:', enc = encodeURIComponent;
  $('sh-wa').href = 'https://wa.me/?text=' + enc(MSG + ' ' + SITE);
  $('sh-x').href = 'https://x.com/intent/post?text=' + enc(MSG) + '&url=' + enc(SITE);
  $('sh-fb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc(SITE);
  $('sh-rd').href = 'https://www.reddit.com/submit?url=' + enc(SITE) + '&title=' + enc('1EYE — AirDrop for Windows and Android');
  $('sh-copy').onclick = e => { e.preventDefault(); navigator.clipboard && navigator.clipboard.writeText(SITE).then(() => { e.target.textContent = 'Copied ✓'; }); };
})();
