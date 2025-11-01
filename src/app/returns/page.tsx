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
          <p className="page-desc text-white mb-0">Our policies are designed to make every resolution quick and transparent.</p>
        </div>
      </div>

      <div className="page-content mt-10 pt-10">
        <div className="container">
          <section className="mb-6">
            <h2>Return &amp; Refund Policy</h2>
            <p className="text-grey">By placing an order you confirm that you have read, understood, and accepted the policy below.</p>
            <div className="alert alert-info">
              Effective Oct 01, 2025 we refreshed our resolution policy to better support every scenario. Choose a case below to see how we can help.
            </div>
            <ol className="policy-list">
              <li>
                <strong>Defective product</strong><br />
                Torn seams, printing errors, wrong color, or an incorrect item qualify for a <strong>100% refund or a free replacement</strong>—whichever you prefer.
              </li>
              <li>
                <strong>Order lost in transit</strong><br />
                If tracking confirms the parcel never arrives we will resend the order or issue a full refund.
              </li>
              <li>
                <strong>Not satisfied with product quality</strong><br />
                Because quality photos and descriptions are provided up front, dissatisfaction requests are reviewed individually. When approved we offer a <strong>40–55% refund</strong> with no return required.
              </li>
              <li>
                <strong>Fast shipping delays</strong><br />
                If delivery exceeds the timeline promised in our shipping policy, we refund the expedited shipping fee (orders placed on weekends may take 1–2 extra days).
              </li>
              <li>
                <strong>Customer change-of-mind returns</strong><br />
                Contact us for the return address. Once the item reaches our warehouse in original condition we issue a <strong>100% refund</strong>. Return postage is the customer’s responsibility.
              </li>
              <li>
                <strong>Incorrect or incomplete address</strong><br />
                We’ll help reroute and reship once a valid address is provided. Additional carrier fees may apply.
              </li>
            </ol>
          </section>

          <section className="mb-6">
            <h2>Returns</h2>
            <p className="text-grey">We accept returns only for items shipped by us that arrive damaged, defective, or incorrect. Requests must include proof of purchase.</p>
            <ul>
              <li>Return window: <strong>15 days</strong> from the delivered date. Requests after 15 days are not eligible.</li>
              <li>Do <strong>not</strong> send returns to the sender address on the label. We will provide the correct warehouse address.</li>
              <li>Ensure items are unworn, unwashed, undamaged, and include original packaging/tags.</li>
              <li>Non-returnable items include personalized products, intimate apparel, cosmetics, toiletries, pet accessories, and digital goods.</li>
              <li>Customer is responsible for return shipping unless otherwise agreed.</li>
            </ul>
            <p className="mb-0">Need to start a claim? <ALink href="/contact-us">Contact our support team</ALink> with your order number, photos of the issue, and the carrier tracking label.</p>
          </section>

          <section className="mb-6">
            <h2>Refunds &amp; Resolution</h2>
            <p className="text-grey">Once your return is received we’ll inspect it and email you with approval status. Approved refunds are credited back to the original payment method.</p>
            <ol>
              <li><strong>Not 100% happy?</strong> Reach out and we’ll evaluate partial refund options (typically 40–55%) without requiring a return.</li>
              <li><strong>Damaged, wrong, or missing items</strong> require an unboxing video, photos, and the shipping label. Replacements or refunds are issued after verification.</li>
              <li><strong>Lost packages</strong> can be replaced immediately. If you prefer a refund we must wait 30 days to ensure the parcel does not later arrive.</li>
              <li><strong>Post office disposals</strong> are resent when the original address was valid. We cannot refund or reship orders that were undeliverable due to an incorrect address.</li>
            </ol>
          </section>

          <section className="mb-6">
            <h2>Order Changes &amp; Cancellations</h2>
            <ul>
              <li>Cancel within the first hour to receive a <strong>100% refund</strong> (excluding tip).</li>
              <li>Cancellations after one hour but within 12 hours receive a <strong>70% refund</strong>, accounting for production and processing costs.</li>
              <li>Orders cannot be canceled or modified once production has begun.</li>
            </ul>
          </section>

          <section>
            <h2>Exchanges</h2>
            <p className="text-grey">We only exchange items that are defective or damaged. If you need a replacement for the same product, please submit a request through our <ALink href="/contact-us">support form</ALink>.</p>
          </section>

          <div className="alert alert-light mt-6">
            Have questions? Visit our <ALink href="/faqs">FAQs</ALink> or <ALink href="/contact-us">contact the support team</ALink> so we can help right away.
          </div>
        </div>
      </div>
    </main>
  );
}
