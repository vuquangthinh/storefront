import ALink from '~/components/features/custom-link';
import { CONTACT_INFO } from '@/constants/contact';

export const metadata = {
  title: 'Contact Us',
  description: 'Get support for orders, shipping, and custom POD requests.'
};

export default function Page() {
  return (
    <main className="main">
      {/* <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Contact Us</li>
          </ul>
        </div>
      </nav> */}
      <div className="page-header" style={{ backgroundColor: "#2563eb" }}>
        <div className="container">
          <h1 className="page-title font-weight-bold text-capitalize ls-l text-white">Contact Us</h1>
          <p className="page-desc text-white">We’re here to help with orders, shipping, and custom POD projects.</p>
        </div>
      </div>

      <div className="page-content mt-6 mb-10">
        <div className="container">
          <section className="mb-8">
            <div className="row cols-md-2 cols-sm-2 cols-1">
              <div className="icon-box text-center">
                <span className="icon-box-icon">
                  <i className="d-icon-phone"></i>
                </span>
                <div className="icon-box-content">
                  <h4 className="icon-box-title">Call us</h4>
                  <p className="mb-1"><a href={`tel:${CONTACT_INFO.phoneLabel}`}>{CONTACT_INFO.phoneLabel}</a></p>
                  <p className="text-grey">{CONTACT_INFO.hoursTitle} {CONTACT_INFO.hoursValue}</p>
                </div>
              </div>
              <div className="icon-box text-center">
                <span className="icon-box-icon">
                  <i className="d-icon-envelope"></i>
                </span>
                <div className="icon-box-content">
                  <h4 className="icon-box-title">Email</h4>
                  <p className="mb-1"><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></p>
                  <p className="text-grey">We typically respond within 1 business day.</p>
                </div>
              </div>
              {/* <div className="icon-box text-center">
                <span className="icon-box-icon">
                  <i className="d-icon-map"></i>
                </span>
                <div className="icon-box-content">
                  <h4 className="icon-box-title">Visit</h4>
                  <p className="mb-1">{CONTACT_INFO.address}</p>
                  <p className="mb-0"><a className="btn btn-link btn-underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`} target="_blank" rel="noopener noreferrer">Open in Maps</a></p>
                </div>
              </div> */}
            </div>
          </section>

          <section className="mb-8">
            <div className="row gutter-lg">
              <div className="col-lg-6">
                <h2 className="title title-simple">Send us a message</h2>
                <form action="/api/contact" method="post" className="contact-form">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <input type="text" className="form-control" name="name" placeholder="Your Name" required />
                    </div>
                    <div className="col-md-6 mb-4">
                      <input type="email" className="form-control" name="email" placeholder="Email Address" required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <input type="text" className="form-control" name="subject" placeholder="Subject" />
                  </div>
                  <div className="mb-4">
                    <textarea className="form-control" name="message" rows={5} placeholder="How can we help?" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-dark btn-rounded">Send message</button>
                  <div id="contact-status" className="alert mt-4" style={{ display: 'none' }}></div>
                </form>
                <script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}></script>
                <script dangerouslySetInnerHTML={{ __html: `
                (function(){
                  function init(){
                    var form = document.querySelector('form.contact-form');
                    if(!form) return;
                    var btn = form.querySelector('button[type="submit"]');
                    var statusEl = document.getElementById('contact-status');
                    function setStatus(text, variant){
                      if(!statusEl) return;
                      statusEl.style.display = 'block';
                      statusEl.className = 'alert mt-4 ' + (variant === 'success' ? 'alert-success' : 'alert-danger');
                      statusEl.textContent = text;
                    }
                
                    form.addEventListener('submit', function(e){
                      e.preventDefault();
                      var siteKey = '${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}';
                      var payload = {
                        name: form.name ? form.name.value : '',
                        email: form.email ? form.email.value : '',
                        subject: form.subject ? form.subject.value : '',
                        message: form.message ? form.message.value : ''
                      };
                      if(!payload.name || !payload.email || !payload.message){
                        setStatus('Vui lòng điền đầy đủ họ tên, email và nội dung.', 'error');
                        return;
                      }
                      if(btn){ btn.disabled = true; btn.classList.add('loading'); }
                
                      function submitWithToken(token){
                        if(token) payload.recaptchaToken = token;
                        fetch('/api/contact', {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify(payload)
                        })
                        .then(function(res){
                          return res.json().catch(function(){ return { ok: res.ok, error: 'Lỗi phân tích JSON' }; });
                        })
                        .then(function(data){
                          if(data && data.ok){
                            setStatus('Gửi liên hệ thành công. Cảm ơn bạn!', 'success');
                            form.reset();
                          } else {
                            setStatus((data && data.error) ? data.error : 'Gửi liên hệ thất bại.', 'error');
                          }
                        })
                        .catch(function(err){
                          setStatus('Lỗi mạng: ' + (err && err.message ? err.message : String(err)), 'error');
                        })
                        .finally(function(){
                          if(btn){ btn.disabled = false; btn.classList.remove('loading'); }
                        });
                      }
                
                      if(!siteKey || typeof window.grecaptcha === 'undefined'){
                        submitWithToken(undefined);
                        return;
                      }
                      window.grecaptcha.ready(function(){
                        window.grecaptcha.execute(siteKey, { action: 'contact' })
                          .then(function(token){ submitWithToken(token); })
                          .catch(function(){ submitWithToken(undefined); });
                      });
                    });
                  }
                  if(document.readyState === 'loading'){
                    document.addEventListener('DOMContentLoaded', init);
                  } else { init(); }
                })();
                ` }} />
                
              </div>
              <div className="col-lg-6">
                <h2 className="title title-simple">Order & fulfillment</h2>
                <p className="mb-4">Print-on-Demand orders are produced within 2–5 business days. You’ll receive a tracking link once shipped. If your order hasn’t arrived within the estimated window, contact us and include your order number.</p>
                <h4 className="title title-simple">Custom & bulk requests</h4>
                <p className="mb-4">Need bulk pricing, white-label, or branded packaging? Email our team with quantities, product types, and timeline.</p>
                <div className="alert alert-info mb-0">Tip: For urgent requests, call us so we can prioritize your ticket.</div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="title title-simple">FAQs</h2>
            <div className="accordion">
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq1" className="collapse">How do I place my order?</a>
                </div>
                <div id="faq1" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    Choose the style you love, click “Add To Cart”, and follow the checkout steps. We’ll confirm once your order is in production and send tracking details as soon as it ships.
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq2" className="collapse">How long will it take to ship my order?</a>
                </div>
                <div id="faq2" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    Production typically takes 0–7 business days because every item is made-to-order. Standard shipping to the United States is $6.99 and arrives in roughly 9–18 business days, so plan on 15–35 days from purchase to delivery. International orders usually require an extra 1–2 weeks of transit time.
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq3" className="collapse">My tracking number isn’t working—what should I do?</a>
                </div>
                <div id="faq3" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    Tracking links may take 1–2 business days to activate in the carrier’s system. If yours still doesn’t work after that window, reach out to the carrier or contact us so we can investigate.
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq4" className="collapse">My order is late—can you help?</a>
                </div>
                <div id="faq4" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    Orders usually ship within 5–10 business days. Domestic deliveries may take up to 10 business days, while international parcels can take 20. If you haven’t seen movement after those timelines, contact us with your order number for quick assistance.
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq5" className="collapse">What payment methods do you accept?</a>
                </div>
                <div id="faq5" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    We currently accept Visa, MasterCard, Discover, and American Express. Every transaction is protected with SSL encryption so your details remain secure.
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq6" className="collapse">How secure is my personal information?</a>
                </div>
                <div id="faq6" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">
                    We follow industry best practices to safeguard your data. Payment details are encrypted during checkout and never stored on our servers—your information is used only to complete the transaction.
                  </div>
                </div>
              </div>
            </div>
            <div className="row gutter-lg mt-6">
              <div className="col-md-6 mb-4">
                <h3 className="title title-simple">Customer Support</h3>
                <p className="mb-1 text-grey">Support Hours: Mon – Sat, 9:00 AM – 5:00 PM EST</p>
                <p className="mb-0 text-grey">Email: <a href="mailto:support@zattcap.com">support@zattcap.com</a></p>
              </div>
              <div className="col-md-3 mb-4">
                <h3 className="title title-simple">About Us</h3>
                <ul className="list list-unstyled text-grey mb-0">
                  <li><ALink href="/about-us">Our Story</ALink></li>
                  <li><ALink href="/contact-us">Contact Us</ALink></li>
                  <li><ALink href="/faqs">FAQs</ALink></li>
                </ul>
              </div>
              <div className="col-md-3 mb-4">
                <h3 className="title title-simple">Terms &amp; Policies</h3>
                <ul className="list list-unstyled text-grey mb-0">
                  <li><ALink href="/order-tracking">Track My Order</ALink></li>
                  <li><ALink href="/payment-method">Payment Method</ALink></li>
                  <li><ALink href="/payment-policy">Payment Policy</ALink></li>
                  <li><ALink href="/return-refund-policy">Return &amp; Refund Policy</ALink></li>
                  <li><ALink href="/shipping-policy">Shipping Policy</ALink></li>
                  <li><ALink href="/terms-of-service">Terms Of Service</ALink></li>
                  <li><ALink href="/privacy-policy">Privacy Policy</ALink></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
