import ALink from '~/components/features/custom-link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | 404',
  description: 'Sorry, the page you requested could not be found.'
};

export default function Page() {
  return (
    <main className="main">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>404</li>
          </ul>
        </div>
      </nav>

      <div className="page-header" style={{ backgroundImage: `url( /images/page-header/404.jpg )`, backgroundColor: '#92918f' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold text-capitalize ls-l">Page Not Found</h1>
        </div>
      </div>

      <div className="page-content mt-10 pt-7 mb-10 pb-4">
        <div className="container text-center">
          <h2 className="mb-2">Oops! That page can’t be found.</h2>
          <p className="mb-6">It looks like nothing was found at this location.</p>

          <div className="d-flex justify-content-center gap-2">
            <ALink href="/" className="btn btn-dark btn-rounded mr-2">Go to Home</ALink>
            <ALink href="/products" className="btn btn-outline btn-dark btn-rounded">Browse Products</ALink>
          </div>
        </div>
      </div>
    </main>
  );
}
