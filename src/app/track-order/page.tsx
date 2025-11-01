'use client'
import ALink from '~/components/features/custom-link';

// export const metadata = {
//   title: 'Track My Order | TonyZone',
//   description: 'Track the status of your TonyZone order using your order number and email.'
// };

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Track My Order</li>
          </ul>
        </div>
      </nav>

      <div className="page-header pl-4 pr-4" style={{ backgroundColor: '#3C63A4' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold lh-1 text-white text-capitalize">Track My Order</h1>
          <p className="page-desc text-white mb-0">Enter your order number and email to see the latest status.</p>
        </div>
      </div>

      <div className="page-content mt-10 pt-10 pb-10">
        <div className="container">
          <section>
            <h2>Order Lookup</h2>
            <form className="row cols-md-2" onSubmit={(e) => e.preventDefault()}>
              <div className="col-md-6 mb-4">
                <label>Order Number</label>
                <input className="form-control" name="order" placeholder="e.g. TZ123456" />
              </div>
              <div className="col-md-6 mb-4">
                <label>Email</label>
                <input className="form-control" name="email" placeholder="you@example.com" />
              </div>
              <div className="col-12">
                <button className="btn btn-dark btn-rounded">Track Order</button>
              </div>
            </form>
            <p className="mt-4 text-grey">For carrier tracking, please allow up to 24–48 hours after shipment for updates to appear.</p>
          </section>
          <p className="mt-6">Need assistance? <ALink href="/contact-us">Contact Us</ALink>.</p>
        </div>
      </div>
    </main>
  );
}
