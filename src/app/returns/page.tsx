import ALink from '~/components/features/custom-link';

export const metadata = {
  title: 'Returns & Refunds | TonyZone',
  description: 'Learn how to start a return, what items are eligible, and how refunds are processed at TonyZone.'
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Returns & Refunds</li>
          </ul>
        </div>
      </nav>

      <div className="page-header pl-4 pr-4" style={{ backgroundImage: `url( /images/page-header/contact-us.jpg )`, backgroundColor: '#3C63A4' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold lh-1 text-white text-capitalize">Returns & Refunds</h1>
          <p className="page-desc text-white mb-0">Simple, transparent returns for peace of mind.</p>
        </div>
      </div>

      <div className="page-content mt-10 pt-10">
        <div className="container">
          <section>
            <h2>Eligibility</h2>
            <ul>
              <li>Report issues within 14 days of delivery.</li>
              <li>Items must be unused and in original condition unless defective.</li>
              <li>Customized items may be replaced if printing is defective or item is damaged.</li>
            </ul>
          </section>
          <section>
            <h2>How to start a return</h2>
            <ol>
              <li>Include order number, photos (if damaged/defective), and reason.</li>
              <li>We will provide return or replacement instructions.</li>
            </ol>
          </section>
          <section>
            <h2>Refunds</h2>
            <p>Refunds are issued to the original payment method once the return is approved and processed.</p>
          </section>
          <p>Need help? Visit <ALink href="/pages/contact-us">Contact Us</ALink>.</p>
        </div>
      </div>
    </main>
  );
}
