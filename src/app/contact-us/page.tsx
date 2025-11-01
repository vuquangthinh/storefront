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
                <form action={`mailto:${CONTACT_INFO.email}`} method="post" className="contact-form">
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
                </form>
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
                  <a href="#faq1" className="collapse">What is your return policy?</a>
                </div>
                <div id="faq1" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">We accept returns for defective items within 14 days of delivery. Contact support with photos and your order number.</div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq2" className="collapse">Do you ship internationally?</a>
                </div>
                <div id="faq2" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">Yes, we ship worldwide. Shipping rates and times vary by destination and will be calculated at checkout.</div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq3" className="collapse">How long does production take?</a>
                </div>
                <div id="faq3" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">Most POD items are produced within 2–5 business days. High-volume or customized orders may require additional time.</div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq4" className="collapse">Can I change or cancel my order?</a>
                </div>
                <div id="faq4" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">We can modify or cancel orders only before production starts. Contact us as soon as possible with your order number.</div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq5" className="collapse">What payment methods do you accept?</a>
                </div>
                <div id="faq5" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">We accept major credit/debit cards and popular digital wallets. For bulk orders, bank transfer is available upon request.</div>
                </div>
              </div>
              <div className="card border-0 mb-2">
                <div className="card-header p-0">
                  <a href="#faq6" className="collapse">How do I get bulk pricing?</a>
                </div>
                <div id="faq6" className="expanded">
                  <div className="card-body p-0 pt-2 text-grey">Email us your target quantities, product types, and timeline. Our team will reply with a tailored quote.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
