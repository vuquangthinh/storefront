import ALink from '~/components/features/custom-link';

export const metadata = {
  title: 'Custom Service | TonyZone',
  description: 'Work with TonyZone to create custom print‑on‑demand apparel and gifts tailored to your brand or event.'
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Custom Service</li>
          </ul>
        </div>
      </nav>

      <div className="page-header pl-4 pr-4" style={{ backgroundColor: '#3C63A4' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold lh-1 text-white text-capitalize">Custom Service</h1>
          <p className="page-desc text-white mb-0">From concept to delivery — bulk orders, branded merch, and event apparel.</p>
        </div>
      </div>

      <div className="page-content mt-10 pt-10">
        <div className="container">
          <section>
            <h2>What we offer</h2>
            <ul>
              <li>Bulk and team orders for T‑shirts, hoodies, mugs, and more</li>
              <li>Artwork preparation: print‑ready files, color matching</li>
              <li>Branding: neck labels, packaging notes, and gift inserts</li>
              <li>Flexible fulfillment: ship‑to‑one or ship‑to‑many addresses</li>
            </ul>
          </section>

          <section>
            <h2>How to start</h2>
            <ol>
              <li>Share your brief (quantities, products, artwork, deadline).</li>
              <li>We’ll propose materials, pricing, and timelines.</li>
              <li>Approve the proof — we print, pack, and ship.</li>
            </ol>
          </section>

          <section>
            <h2>Contact our team</h2>
            <p>
              Tell us about your project at <a href="https://tonyzone.shop" target="_blank" rel="noopener noreferrer">tonyzone.shop</a> or email <a href="mailto:support@tonyzone.shop">support@tonyzone.shop</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
