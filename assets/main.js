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

// Suni welcome assistant (scripted replies; not connected to live chat yet)
(function () {
  var log = document.getElementById('suni-log');
  if (!log) return;
  var opts = document.getElementById('suni-options');
  var form = document.getElementById('suni-form');
  var input = document.getElementById('suni-text');
  var replies = {
    engagement: 'Congratulations! We can design your ring from scratch or start from one of over 1,200 styles, natural or lab grown. Most couples begin with a relaxed consultation. <a href="contact.html#book">Book a time with us</a> or <a href="custom-design.html#engagement">see how it works</a>.',
    wedding: 'We make wedding bands to sit perfectly against your engagement ring, plus men\'s bands in every style. <a href="contact.html#book">Book a fitting</a> or <a href="custom-design.html#wedding">read more</a>.',
    remodel: 'We love giving family pieces a second life. Bring in the ring, stones or old gold and we\'ll talk through what\'s possible. <a href="contact.html#book">Book a remodel consultation</a>.',
    repairs: 'We handle repairs, resizing, valuations and insurance replacements in store. Call us on 02 4927 0100 or <a href="contact.html">find our showroom</a>.',
    other: 'Earrings, pendants, tennis bracelets or a one-off idea? Tell us about it and we\'ll design it with you. <a href="contact.html#book">Share your idea</a>.',
    free: 'Thanks for your message. The team will be happy to help with that. <a href="contact.html#book">Leave your details</a> and we\'ll be in touch within one business day, or call 02 4927 0100.'
  };
  function add(cls, html) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    if (cls === 'msg--you') d.textContent = html; else d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function answer(text, topic) {
    add('msg--you', text);
    setTimeout(function () { add('msg--suni', replies[topic]); }, 450);
  }
  opts.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) answer(b.textContent, b.getAttribute('data-topic'));
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    var l = v.toLowerCase(), topic = 'free';
    if (/engag|propos|diamond/.test(l)) topic = 'engagement';
    else if (/wedding|band/.test(l)) topic = 'wedding';
    else if (/remodel|redesign|grand|mum|mother|old|inherit/.test(l)) topic = 'remodel';
    else if (/repair|resiz|valu|insur|fix/.test(l)) topic = 'repairs';
    answer(v, topic);
  });
})();
