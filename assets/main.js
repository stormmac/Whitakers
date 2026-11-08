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
