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
      '<li><a href="custom-design.html#remodel">Remodel &amp; Restore</a></li>' +
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

  // Demo-only enquiry form handler
  var form = document.querySelector('[data-enquiry]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.innerHTML = '<div class="full"><h3>Thank you</h3><p>We\'ll be in touch within one business day to arrange your consultation. (Demo only: this form isn\'t connected yet.)</p></div>';
    });
  }
})();


// Suni: the robot bee from my247tutor, flying over every page. Tap Suni to chat.
// Replies are pre-written for now; a server endpoint can replace reply() later.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hello = "Hi, I'm Suni! What can I help you with today?";
  var specialise = 'Whitakers specialises in custom engagement rings, wedding bands made to match, and remodelling family jewellery into something new. Every piece is designed with you in our Charlestown showroom.';
  var topics = [
    ['engagement', "I'm planning an engagement"],
    ['wedding', 'I need wedding bands'],
    ['remodel', 'Remodel a family piece'],
    ['repairs', 'Repairs or valuations'],
    ['other', 'Something else']
  ];
  var replies = {
    engagement: 'Congratulations! We can design your ring from scratch or start from one of over 1,200 styles, natural or lab grown. Most couples begin with a relaxed consultation. <a href="contact.html#book">Book a time</a> or <a href="custom-design.html#engagement">see how it works</a>.',
    wedding: 'We make wedding bands to sit perfectly against your engagement ring, plus men\'s bands in every style. <a href="contact.html#book">Book a fitting</a> or <a href="custom-design.html#wedding">read more</a>.',
    remodel: 'We love giving family pieces a second life. Bring in the ring, stones or old gold and we\'ll talk through what\'s possible. <a href="contact.html#book">Book a remodel consultation</a>.',
    repairs: 'We handle repairs, resizing, valuations and insurance replacements in store. Call us on 02 4927 0100 or <a href="contact.html">find our showroom</a>.',
    other: 'Earrings, pendants, tennis bracelets or a one-off idea? Tell me about it, or <a href="contact.html#book">share your idea with the team</a>.',
    hours: 'We\'re open Tuesday to Friday 10am to 5pm and Saturday 9am to 3pm, at 212 Pacific Highway, Charlestown. We\'re closed Sundays, Mondays and public holidays.',
    free: 'Thanks! The team will be happy to help with that. <a href="contact.html#book">Leave your details</a> and we\'ll be in touch within one business day, or call 02 4927 0100.'
  };
  function pick(text) {
    var l = text.toLowerCase();
    if (/engag|propos|diamond/.test(l)) return 'engagement';
    if (/wedding|band/.test(l)) return 'wedding';
    if (/remodel|redesign|grand|mum|mother|nan|old gold|inherit|heirloom/.test(l)) return 'remodel';
    if (/repair|resiz|valu|insur|fix|broke/.test(l)) return 'repairs';
    if (/hour|open|when|where|address|park|locat/.test(l)) return 'hours';
    return 'free';
  }

  var root = document.createElement('div');
  root.className = 'suni-companion';
  root.innerHTML =
    '<div class="suni-chat" role="dialog" aria-label="Chat with Suni" hidden>' +
      '<div class="suni-chat__head"><div><strong>Suni</strong><small>Whitakers Jewellers</small></div><div>' +
        ('speechSynthesis' in window ? '<button type="button" class="suni-voice" aria-pressed="false" aria-label="Turn Suni\'s voice on" title="Voice">&#128264;</button>' : '') +
        '<button type="button" class="suni-close" aria-label="Close chat with Suni">&times;</button></div></div>' +
      '<div class="suni-msgs" aria-live="polite"></div>' +
      '<form><input type="text" id="suni-text" placeholder="Ask Suni..." aria-label="Message to Suni" autocomplete="off" maxlength="500"><button type="submit">Send</button></form>' +
    '</div>' +
    '<button type="button" class="suni-bubble" hidden></button>' +
    '<button type="button" class="suni-fly" aria-expanded="false" aria-label="Chat with Suni" title="Tap to chat">' +
      '<img src="assets/suni/' + (reduce ? 'still' : 'hover') + '.webp" alt="Suni, a friendly robot bumble bee" draggable="false"></button>';
  document.body.appendChild(root);

  var chat = root.querySelector('.suni-chat');
  var msgs = root.querySelector('.suni-msgs');
  var bubble = root.querySelector('.suni-bubble');
  var fly = root.querySelector('.suni-fly');
  var form = root.querySelector('form');
  var input = root.querySelector('#suni-text');
  var voiceBtn = root.querySelector('.suni-voice');
  var voiceOn = false;
  var started = false;

  function say(html) {
    if (!voiceOn) return;
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(tmp.textContent));
  }
  function add(who, html) {
    var d = document.createElement('div');
    d.className = 'msg msg--' + who;
    if (who === 'you') d.textContent = html; else d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function choices() {
    var c = document.createElement('div');
    c.className = 'suni-choices';
    topics.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = t[1]; b.setAttribute('data-topic', t[0]);
      c.appendChild(b);
    });
    msgs.appendChild(c);
  }
  function answer(text, topic) {
    add('you', text);
    var typing = add('suni', '&hellip;');
    setTimeout(function () { typing.innerHTML = replies[topic]; say(replies[topic]); msgs.scrollTop = msgs.scrollHeight; }, 500);
  }
  function setOpen(open) {
    chat.hidden = !open;
    root.classList.toggle('open', open);
    fly.setAttribute('aria-expanded', open ? 'true' : 'false');
    fly.setAttribute('aria-label', open ? 'Close chat with Suni' : 'Chat with Suni');
    if (open) {
      bubble.hidden = true;
      if (!started) { started = true; add('suni', hello); add('suni', specialise); choices(); }
      input.focus();
    } else if (voiceOn) window.speechSynthesis.cancel();
  }

  fly.addEventListener('click', function () { setOpen(chat.hidden); });
  bubble.addEventListener('click', function () { setOpen(true); });
  root.querySelector('.suni-close').addEventListener('click', function () { setOpen(false); });
  if (voiceBtn) voiceBtn.addEventListener('click', function () {
    voiceOn = !voiceOn;
    voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
    voiceBtn.setAttribute('aria-label', voiceOn ? "Turn Suni's voice off" : "Turn Suni's voice on");
    voiceBtn.innerHTML = voiceOn ? '&#128266;' : '&#128264;';
    if (!voiceOn) window.speechSynthesis.cancel();
  });
  msgs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-topic]');
    if (b) answer(b.textContent, b.getAttribute('data-topic'));
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    answer(v, pick(v));
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) setOpen(false); });

  // Suni says hello in a bubble a moment after the page opens.
  setTimeout(function () { if (chat.hidden) { bubble.textContent = hello + ' Tap me to chat.'; bubble.hidden = false; } }, 1500);
  setTimeout(function () { bubble.hidden = true; }, 10000);
})();
