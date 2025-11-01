import ALink from '~/components/features/custom-link';

export const metadata = {
  title: 'About TonyZone | Print‑On‑Demand Apparel & Gifts',
  description: 'TonyZone is a print‑on‑demand brand delivering premium custom T‑shirts, hoodies, mugs, and accessories. Designed on demand. Printed with care. Shipped worldwide.',
  keywords: [
    'TonyZone',
    'print on demand',
    'custom t‑shirts',
    'hoodies',
    'mugs',
    'merchandise',
    'DTG printing',
    'embroidery',
    'personalized gifts'
  ]
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>About Us</li>
          </ul>
        </div>
      </nav>
      <div className="page-header pl-4 pr-4" style={{ backgroundColor: "#266BCA" }}>
        <div className="container">
          {/* <h3 className="text page-subtitle font-weight-bold">Welcome to TonyZone</h3> */}
          <h1 className="page-title font-weight-bold lh-1 text-white text-capitalize">Print‑On‑Demand Apparel & Gifts</h1>
          <p className="page-desc text-white mb-0">Premium custom T‑shirts, hoodies, mugs, and more — designed on demand, printed with care, shipped worldwide.</p>
        </div>
      </div>

      <div className="page-content mt-5 pt-5 mb-10">
        <div className="container">
          <p>
            TonyZone is a modern print‑on‑demand studio. We help creators and brands launch high‑quality merchandise without inventory risk — from idea to doorstep.
          </p>

          <section>
            <h2>What We Do</h2>
            <ul>
              <li>Custom apparel: T‑shirts, hoodies, sweatshirts, caps</li>
              <li>Drinkware: mugs and tumblers for daily use or gifting</li>
              <li>Accessories: tote bags, stickers, phone cases</li>
              <li>On‑demand production with reliable global shipping</li>
            </ul>
          </section>

          <section>
            <h2>How It Works</h2>
            <ol>
              <li>Share your artwork or choose from curated designs.</li>
              <li>Select the product (T‑shirt, hoodie, mug, etc.), size, and color.</li>
              <li>We print, pack, and ship directly to you or your customers.</li>
            </ol>
          </section>

          <section>
            <h2>Quality You Can Feel</h2>
            <p>
              We work with trusted print partners and use industry‑leading DTG, embroidery, and UV technologies to ensure consistent color, comfort, and durability.
            </p>
          </section>

          <section>
            <h2>Why Choose TonyZone</h2>
            <ul>
              <li>Fast, reliable fulfillment with tracking</li>
              <li>Made‑to‑order to reduce waste and overstock</li>
              <li>Flexible catalog: T‑shirts, hoodies, mugs, and more</li>
              <li>Creator‑friendly pricing and simple reorders</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Have a project in mind or need support? Visit <a href="https://tonyzone.shop" target="_blank" rel="noopener noreferrer">tonyzone.shop</a> or email us at <a href="mailto:support@tonyzone.shop">support@tonyzone.shop</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
