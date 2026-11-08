// Whitakers Jewellers — shared behaviour
(function () {
  // Shared footer, injected into <footer data-footer>
  var footer = document.querySelector('[data-footer]');
  if (footer) {
    footer.className = 'footer';
    footer.innerHTML =
      '<div class="wrap">' +
      '<div class="footer__grid">' +
      '<div><a class="logo" href="index.html"><span class="logo__name">WHITAKERS</span><span class="logo__sub">Jewellers since 1903</span></a>' +
      '<p style="margin-top:18px">Four generations of custom jewellery design in Newcastle and the Hunter.</p>' +
      '<div class="social"><a href="https://www.facebook.com/WhitakersJewellers">Facebook</a><a href="https://www.instagram.com/whitakersjewellers/">Instagram</a><a href="https://au.pinterest.com/whitakersAU/">Pinterest</a></div></div>' +
      '<div><h4>Create</h4><ul>' +
      '<li><a href="custom-design.html">Custom Design</a></li>' +
      '<li><a href="custom-design.html#engagement">Engagement Rings</a></li>' +
      '<li><a href="custom-design.html#wedding">Wedding Rings</a></li>' +
      '<li><a href="index.html#heirloom">Heirloom Redesign</a></li>' +
      '<li><a href="https://whitakers.com.au/collections/shop-all">Shop Ready to Wear</a></li></ul></div>' +
      '<div><h4>Customer Service</h4><ul>' +
      '<li><a href="contact.html#book">Make an Appointment</a></li>' +
      '<li><a href="contact.html">Contact</a></li>' +
      '<li><a href="https://whitakers.com.au/pages/company-policies">Company Policies</a></li>' +
      '<li><a href="https://whitakers.com.au/pages/diamond-faq">FAQ</a></li>' +
      '<li><a href="https://whitakers.com.au/pages/diamond-education">Diamond Education</a></li>' +
      '<li><a href="https://whitakers.com.au/policies/terms-of-service">Terms of Service</a></li>' +
      '<li><a href="https://whitakers.com.au/policies/privacy-policy">Privacy Policy</a></li></ul></div>' +
      '<div><h4>Newsletter</h4><p>Be the first to hear about the latest news, exclusive offers, special events &amp; more.</p>' +
      '<form class="newsletter" onsubmit="event.preventDefault();this.innerHTML=\'<p>Thanks, you\\\'re on the list.</p>\'"><input type="email" placeholder="Email address" aria-label="Email address" required><button type="submit">Join</button></form>' +
      '<p style="margin-top:22px">212 Pacific Highway, Charlestown NSW<br><a href="tel:0249270100">02 4927 0100</a> &middot; <a href="mailto:retail@whitakers.com.au">retail@whitakers.com.au</a></p></div>' +
      '</div>' +
      '<div class="footer__base"><span>&copy; ' + new Date().getFullYear() + ' Whitakers Jewellers</span><span>Complimentary shipping on all orders</span></div>' +
      '</div>';
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mega menus open on tap at small widths
  document.querySelectorAll('.nav__item > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 860px)').matches) {
        e.preventDefault();
        a.parentElement.classList.toggle('is-open');
      }
    });
  });

  // Show which photos were added to the enquiry form
  var photos = document.getElementById('photos');
  if (photos) photos.addEventListener('change', function () {
    var list = document.getElementById('photo-list');
    list.textContent = photos.files.length ? photos.files.length + ' photo' + (photos.files.length > 1 ? 's' : '') + ' added: ' + Array.prototype.map.call(photos.files, function (f) { return f.name; }).join(', ') : '';
  });

  // Demo-only enquiry form handler
  var form = document.querySelector('[data-enquiry]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.innerHTML = '<div class="full"><h3>Thank you</h3><p>We\'ll be in touch within one business day to arrange your consultation. (Demo only: this form isn\'t connected yet.)</p></div>';
    });
  }
})();



// Dee: the Whitakers dragonfly, flying over every page (same pattern as Suni in my247tutor). Tap Dee to chat; Dee talks back.
// Live replies come from /api/dee (Claude). Where that isn't reachable (a plain preview), Dee uses pre-written replies.
(function () {
  var hello = "Hi, I'm Dee! What can I help you with today?";
  var specialise = "Whitakers specialises in heirloom redesign. We take the stones from old and inherited jewellery and set them into modern pieces you'll wear every day. We also design custom engagement rings and wedding bands.";
  var topics = [
    ['remodel', 'Redesign an heirloom'],
    ['engagement', "I'm planning an engagement"],
    ['wedding', 'I need wedding bands'],
    ['repairs', 'Repairs or valuations'],
    ['other', 'Something else']
  ];
  var scripted = {
    engagement: 'Congratulations! We can design your ring from scratch or start from one of over 1,200 styles, natural or lab grown. Most couples begin with a relaxed consultation in the showroom.',
    wedding: "We make wedding bands to sit perfectly against your engagement ring, plus men's bands in every style. Come in for a fitting and we'll show you the options.",
    remodel: "That's our speciality. Bring in the rings, brooches or old gold, and we'll lift out the stones and design a modern piece around them. You'll see a 3D render before anything is taken apart. You can also send photos through the booking page first.",
    repairs: 'We handle repairs, resizing, valuations and insurance replacements in store. Call us on 02 4927 0100 or drop into the showroom.',
    other: "Earrings, pendants, tennis bracelets or a one-off idea? Tell me about it and the team will design it with you.",
    hours: "We're open Tuesday to Friday 10am to 5pm and Saturday 9am to 3pm, at 212 Pacific Highway, Charlestown. We're closed Sundays, Mondays and public holidays.",
    free: "Thanks! The team will be happy to help with that. Leave your details on the booking page and we'll be in touch within one business day, or call 02 4927 0100."
  };
  function pick(text) {
    var l = text.toLowerCase();
    if (/engag|propos|diamond/.test(l)) return 'engagement';
    if (/wedding|band/.test(l)) return 'wedding';
    if (/remodel|redesign|grand|mum|mother|nan|old gold|inherit|heirloom|family/.test(l)) return 'remodel';
    if (/repair|resiz|valu|insur|fix|broke/.test(l)) return 'repairs';
    if (/hour|open|when|where|address|park|locat/.test(l)) return 'hours';
    if (/earring|pendant|necklace|bracelet|something else/.test(l)) return 'other';
    return 'free';
  }

  // ---------- Voice (same approach as my247tutor: Azure's Australian voice if set up, else the device's) ----------
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  var voiceOn = store.get('whitakers.dee-voice') !== 'off';
  var cloud = false;
  var audio = null;
  fetch('api/speech').then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) { cloud = !!(b && b.enabled); }).catch(function () {});
  function pickVoice() {
    var voices = canSpeak ? window.speechSynthesis.getVoices() : [];
    var english = voices.filter(function (v) { return /^en/i.test(v.lang); });
    function rank(v) {
      var lang = v.lang.toLowerCase().replace('_', '-');
      var region = lang === 'en-au' ? 0 : lang === 'en-gb' ? 1 : lang === 'en-nz' ? 2 : 3;
      var friendly = /karen|catherine|female|samantha|serena|kate|libby|natasha/i.test(v.name) ? 0 : 1;
      var natural = /natural|neural|online|enhanced|premium/i.test(v.name) ? 0 : 1;
      return region * 4 + natural * 2 + friendly;
    }
    return english.sort(function (a, b) { return rank(a) - rank(b); })[0] || null;
  }
  if (canSpeak) window.speechSynthesis.getVoices();
  function chunks(text) {
    var parts = text.match(/[^.!?]+[.!?]*\s*/g) || [text], out = [], cur = '';
    parts.forEach(function (p) { if ((cur + p).length > 380 && cur) { out.push(cur.trim()); cur = ''; } cur += p; });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function stopTalking() {
    if (audio) { audio.pause(); audio = null; }
    if (canSpeak) window.speechSynthesis.cancel();
    root.classList.remove('talking');
  }
  var talkTimer = null;
  function mouthFor(text) {
    root.classList.add('talking');
    clearTimeout(talkTimer);
    talkTimer = setTimeout(function () { root.classList.remove('talking'); }, Math.min(12000, 600 + text.length * 55));
  }
  function say(text, force) {
    if (!voiceOn && !force) return mouthFor(text);
    stopTalking();
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) return;
    root.classList.add('talking');
    var done = function () { root.classList.remove('talking'); };
    if (cloud) {
      var queue = chunks(text);
      var next = function () {
        var line = queue.shift();
        if (!line) return done();
        audio = new Audio('api/speech?text=' + encodeURIComponent(line));
        audio.onended = next;
        audio.onerror = function () { cloud = false; audio = null; say(line + ' ' + queue.join(' '), true); };
        audio.play().catch(audio.onerror);
      };
      return next();
    }
    if (!canSpeak) return done();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'en-AU';
    u.rate = 0.95; u.pitch = 1.15;
    u.onend = done; u.onerror = done;
    clearTimeout(talkTimer);
    talkTimer = setTimeout(done, 1500 + text.length * 80);
    window.speechSynthesis.speak(u);
  }

  // ---------- Listening: hold the microphone to talk ----------
  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---------- Markup ----------
  var root = document.createElement('div');
  root.className = 'dee-companion';
  root.innerHTML =
    '<div class="dee-chat" role="dialog" aria-label="Chat with Dee" hidden>' +
      '<div class="dee-chat__head"><div><strong>Dee</strong><small>Whitakers Jewellers</small></div><div>' +
        (canSpeak ? '<button type="button" class="dee-voice" title="Voice"></button>' : '') +
        '<button type="button" class="dee-close" aria-label="Close chat with Dee">&times;</button></div></div>' +
      '<div class="dee-msgs" aria-live="polite"></div>' +
      '<p class="dee-mic-status" hidden></p>' +
      '<form><input type="text" id="dee-text" placeholder="Ask Dee..." aria-label="Message to Dee" autocomplete="off" maxlength="1000">' +
        (Recognition ? '<button type="button" class="dee-mic" aria-label="Hold to talk to Dee" title="Hold to talk">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' : '') +
        '<button type="submit" class="dee-send">Send</button></form>' +
    '</div>' +
    '<button type="button" class="dee-bubble" hidden></button>' +
    '<button type="button" class="dee-fly" aria-expanded="false" aria-label="Chat with Dee" title="Tap to chat">' +
      '<span class="dee" role="img" aria-label="Dee, a cheerful dragonfly">' +
        '<img class="dee-body" src="assets/dee/dee-base.webp" alt="" draggable="false">' +
        '<img class="dee-arm" src="assets/dee/dee-arm.webp" alt="" draggable="false">' +
        '<img class="dee-jaw" src="assets/dee/dee-jaw.webp" alt="" draggable="false"></span></button>';
  document.body.appendChild(root);

  var chat = root.querySelector('.dee-chat');
  var msgs = root.querySelector('.dee-msgs');
  var bubble = root.querySelector('.dee-bubble');
  var fly = root.querySelector('.dee-fly');
  var form = root.querySelector('form');
  var input = root.querySelector('#dee-text');
  var sendBtn = root.querySelector('.dee-send');
  var voiceBtn = root.querySelector('.dee-voice');
  var micBtn = root.querySelector('.dee-mic');
  var micStatus = root.querySelector('.dee-mic-status');
  var started = false, busy = false, live = true;
  var turns = [];

  function showVoice() {
    if (!voiceBtn) return;
    voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
    voiceBtn.setAttribute('aria-label', voiceOn ? "Turn Dee's voice off" : "Turn Dee's voice on");
    voiceBtn.innerHTML = voiceOn ? '&#128266;' : '&#128264;';
  }
  showVoice();

  var BOOK_LINK = '<a class="dee-book" href="contact.html#book">Book a consultation &rarr;</a>';
  function add(who, text, withBook) {
    var d = document.createElement('div');
    d.className = 'msg msg--' + who;
    var span = document.createElement('span');
    span.textContent = text;
    d.appendChild(span);
    if (who === 'dee' && withBook) d.insertAdjacentHTML('beforeend', '<br>' + BOOK_LINK);
    if (who === 'dee' && text !== '…') {
      var again = document.createElement('button');
      again.type = 'button'; again.className = 'msg-say'; again.setAttribute('aria-label', 'Say it again');
      again.innerHTML = '&#128266;';
      again.addEventListener('click', function () { say(text, true); });
      d.appendChild(again);
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function choices() {
    var c = document.createElement('div');
    c.className = 'dee-choices';
    topics.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = t[1];
      c.appendChild(b);
    });
    msgs.appendChild(c);
  }
  function setBusy(on) { busy = on; sendBtn.disabled = on; fly.classList.toggle('thinking', on); }

  function reply(text) {
    var book = /book|consult|showroom|come in|appointment/i.test(text);
    msgs.removeChild(msgs.lastChild);
    add('dee', text, book);
    turns.push({ role: 'assistant', content: text });
    say(text);
    setBusy(false);
  }
  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    stopTalking();
    add('you', text);
    turns.push({ role: 'user', content: text });
    setBusy(true);
    add('dee', '…');
    if (!live) return setTimeout(function () { reply(scripted[pick(text)]); }, 500);
    fetch('api/dee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turns: turns.slice(-30) })
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (b) { return { ok: r.ok, status: r.status, body: b }; });
    }).then(function (res) {
      if (res.ok && res.body && res.body.reply) return reply(res.body.reply);
      // No live Dee here (a static preview, or no key set yet): use the pre-written replies from now on.
      if (!res.body || res.status === 404 || res.status === 405 || res.status === 503 && !/busy|moment/i.test(res.body.error || '')) {
        live = false;
        return reply(scripted[pick(text)]);
      }
      // Busy or a hiccup: say so, and leave the question out of the conversation so it can be asked again.
      turns.pop();
      msgs.removeChild(msgs.lastChild);
      add('dee', res.body.error || "Sorry, I couldn't answer just then. Could you try again?");
      setBusy(false);
    }).catch(function () { live = false; reply(scripted[pick(text)]); });
  }

  function setOpen(open) {
    chat.hidden = !open;
    root.classList.toggle('open', open);
    fly.setAttribute('aria-expanded', open ? 'true' : 'false');
    fly.setAttribute('aria-label', open ? 'Close chat with Dee' : 'Chat with Dee');
    if (open) {
      bubble.hidden = true;
      if (!started) {
        started = true;
        add('dee', hello); add('dee', specialise); choices();
        turns.push({ role: 'assistant', content: hello + ' ' + specialise });
      }
      say(turns.filter(function (x) { return x.role === 'assistant'; }).pop().content);
      input.focus();
    } else stopTalking();
  }

  fly.addEventListener('click', function () { setOpen(chat.hidden); });
  bubble.addEventListener('click', function () { setOpen(true); });
  root.querySelector('.dee-close').addEventListener('click', function () { setOpen(false); });
  if (voiceBtn) voiceBtn.addEventListener('click', function () {
    voiceOn = !voiceOn;
    store.set('whitakers.dee-voice', voiceOn ? 'on' : 'off');
    if (!voiceOn) stopTalking();
    showVoice();
  });
  msgs.addEventListener('click', function (e) {
    var b = e.target.closest('.dee-choices button');
    if (b) ask(b.textContent);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) setOpen(false); });

  // Hold the microphone to talk: the words fill the box as they're said, and letting go sends them.
  if (micBtn) {
    var rec = null, heard = '', listening = false;
    var status = function (text) { micStatus.hidden = !text; micStatus.textContent = text || ''; };
    var start = function (e) {
      e.preventDefault();
      if (listening || busy) return;
      stopTalking();
      heard = ''; listening = true;
      micBtn.classList.add('listening'); micBtn.setAttribute('aria-pressed', 'true');
      status("Listening… let go when you've finished.");
      rec = new Recognition();
      rec.lang = 'en-AU'; rec.interimResults = true; rec.continuous = true;
      rec.onresult = function (ev) {
        heard = Array.prototype.map.call(ev.results, function (r) { return r[0].transcript; }).join(' ');
        input.value = heard;
      };
      rec.onerror = function (ev) {
        status(ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
          ? 'Dee needs permission to use the microphone. Allow it in your browser, or type instead.'
          : "Dee didn't catch that. Try again, or type instead.");
      };
      rec.onend = function () {
        listening = false;
        micBtn.classList.remove('listening'); micBtn.setAttribute('aria-pressed', 'false');
        if (micStatus.textContent.indexOf('Listening') === 0) status('');
        if (heard.trim()) { input.value = ''; ask(heard); }
      };
      try { rec.start(); } catch (err) { listening = false; status('The microphone isn\'t available here. Type instead.'); }
    };
    var stop = function () { if (rec && listening) rec.stop(); };
    micBtn.addEventListener('pointerdown', start);
    micBtn.addEventListener('pointerup', stop);
    micBtn.addEventListener('pointercancel', stop);
    micBtn.addEventListener('pointerleave', stop);
    micBtn.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    micBtn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') stop(); });
    micBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Dee says hello in a bubble a moment after the page opens.
  setTimeout(function () { if (chat.hidden) { bubble.textContent = hello + ' Tap me to chat.'; bubble.hidden = false; } }, 1500);
  setTimeout(function () { bubble.hidden = true; }, 10000);
})();
