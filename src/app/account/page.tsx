import ALink from '~/components/features/custom-link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | Sign In / Register',
  description: 'Access your account to view orders, manage addresses, and wishlist, or create a new account.'
};

export default function Page() {
  return (
    <main className="main account mt-6">
      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li>Account</li>
          </ul>
        </div>
      </nav>

      <div className="page-header" style={{ backgroundImage: `url( /images/page-header/contact-us.jpg )`, backgroundColor: '#92918f' }}>
        <div className="container">
          <h1 className="page-title font-weight-bold text-capitalize ls-l">My Account</h1>
        </div>
      </div>

      <div className="page-content mt-10 pt-4 mb-10 pb-2">
        <div className="container">
          <div className="row gutter-lg">
            <section className="col-lg-6 mb-6">
              <h2 className="title title-simple text-left mb-3">Sign In</h2>
              <form action="#" className="input-wrapper">
                <label>Email address *</label>
                <input type="email" className="form-control mb-3" name="email" placeholder="you@example.com" required />

                <label>Password *</label>
                <input type="password" className="form-control mb-3" name="password" placeholder="••••••••" required />

                <div className="form-checkbox d-flex justify-content-between align-items-center mb-4">
                  <input type="checkbox" className="custom-checkbox" id="remember" name="remember" />
                  <label className="form-control-label" htmlFor="remember">Remember me</label>
                  <ALink href="#" className="ml-auto">Forgot password?</ALink>
                </div>

                <button type="submit" className="btn btn-dark btn-rounded">Sign In</button>
              </form>
            </section>

            <section className="col-lg-6 mb-6">
              <h2 className="title title-simple text-left mb-3">Create Account</h2>
              <form action="#" className="input-wrapper">
                <label>Full Name *</label>
                <input type="text" className="form-control mb-3" name="name" placeholder="Your Name" required />

                <label>Email address *</label>
                <input type="email" className="form-control mb-3" name="email2" placeholder="you@example.com" required />

                <label>Password *</label>
                <input type="password" className="form-control mb-3" name="password2" placeholder="Create a password" required />

                <div className="form-checkbox mb-4">
                  <input type="checkbox" className="custom-checkbox" id="agree" name="agree" />
                  <label className="form-control-label" htmlFor="agree">I agree to the <ALink href="/terms-of-service">Terms</ALink> and <ALink href="/privacy-policy">Privacy Policy</ALink></label>
                </div>

                <button type="submit" className="btn btn-outline btn-dark btn-rounded">Create Account</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
