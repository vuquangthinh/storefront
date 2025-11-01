import ALink from '~/components/features/custom-link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for using our POD services.'
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </nav>
      <div className="page-header" style={{ backgroundImage: `url( /images/shop/page-header-back.jpg )`, backgroundColor: "#3C63A4" }}>
        <div className="container">
          <h1 className="page-title font-weight-bold text-capitalize ls-l">Terms of Service</h1>
        </div>
      </div>

      <div className="page-content mt-10 pt-7">
        <div className="container">
          <p>Welcome to our Print-on-Demand shop. By accessing or using our services, you agree to the following terms.</p>

          <section>
            <h2>1. Products & fulfillment</h2>
            <p>All items are made-to-order. Production typically takes 2–5 business days before shipment. Product images are mockups and may vary slightly from the final product.</p>
          </section>

          <section>
            <h2>2. Orders & cancellations</h2>
            <p>Orders enter production shortly after payment. Cancellations or edits may not be possible after 1 hour. Please contact support as soon as possible with your order number.</p>
          </section>

          <section>
            <h2>3. Shipping & delivery</h2>
            <p>Shipping times vary by destination. You will receive a tracking link when your order ships. We are not responsible for delays caused by carriers, customs, or incorrect addresses.</p>
          </section>

          <section>
            <h2>4. Returns & replacements</h2>
            <p>Due to the custom nature of POD, returns are accepted only for defective or incorrect items. Please report issues within 14 days of delivery with photos of the product and packaging.</p>
          </section>

          <section>
            <h2>5. Intellectual property</h2>
            <p>You must have the rights to the content you upload. You grant us a license to print and fulfill your items solely for your order. We reserve the right to refuse content that violates third-party rights.</p>
          </section>

          <section>
            <h2>6. Prohibited content</h2>
            <p>No illegal, hateful, or infringing content. We may cancel orders that violate these guidelines.</p>
          </section>

          <section>
            <h2>7. Pricing & taxes</h2>
            <p>Prices are shown at checkout. Taxes and duties may apply based on your location and are your responsibility unless stated otherwise.</p>
          </section>

          <section>
            <h2>8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, our liability is limited to the amount you paid for the order that gave rise to the claim.</p>
          </section>

          <section>
            <h2>9. Changes to terms</h2>
            <p>We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Questions? Email <a href="mailto:support@example.com">support@example.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
