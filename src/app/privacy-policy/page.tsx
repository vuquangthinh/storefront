import ALink from '~/components/features/custom-link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Understand what data we collect, how we use it, and your privacy rights.'
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li className="delimiter">/</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </nav>
      <div className="page-header" style={{ backgroundImage: `url( /images/shop/page-header-back.jpg )`, backgroundColor: "#3C63A4" }}>
        <div className="container">
          <h1 className="page-title font-weight-bold text-capitalize ls-l">Privacy Policy</h1>
        </div>
      </div>

      <div className="page-content mt-10 pt-7">
        <div className="container">
          <p>Your privacy is important to us. This policy explains what we collect, how we use it, and your rights.</p>

          <section>
            <h2>Information we collect</h2>
            <ul>
              <li>Account details (name, email) when you sign up or contact us</li>
              <li>Order and shipping details needed to fulfill your purchases</li>
              <li>Usage data (cookies, analytics) to improve our store experience</li>
            </ul>
          </section>

          <section>
            <h2>How we use information</h2>
            <ul>
              <li>Process orders, provide support, and communicate updates</li>
              <li>Prevent fraud, secure our services, and comply with the law</li>
              <li>Improve our products and website usability</li>
            </ul>
          </section>

          <section>
            <h2>Sharing</h2>
            <p>We share data with print/fulfillment partners, payment processors, and carriers strictly to complete your orders. We do not sell your personal information.</p>
          </section>

          <section>
            <h2>Cookies & analytics</h2>
            <p>We use cookies and similar technologies for essential site features and analytics. You can control cookies in your browser settings.</p>
          </section>

          <section>
            <h2>Data retention</h2>
            <p>We retain data as long as necessary to provide services and for legitimate business or legal purposes.</p>
          </section>

          <section>
            <h2>Your rights</h2>
            <ul>
              <li>Access, update, or delete your personal data</li>
              <li>Opt-out of marketing communications at any time</li>
              <li>For GDPR/CCPA requests, contact us using the email below</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Privacy requests: <a href="mailto:privacy@example.com">privacy@example.com</a></p>
          </section>
        </div>
      </div>
    </main>
  );
}
