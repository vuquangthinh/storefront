'use client'
import ALink from '~/components/features/custom-link';

const MobileMenuLink = () => {

  const showMobileMenu = () => {
    document.querySelector('body')?.classList.add('mmenu-active');
  }

  return (
    <ALink href="#" className="mobile-menu-toggle" onClick={showMobileMenu}>
      <i className="d-icon-bars2"></i>
    </ALink>
  );
}

export default MobileMenuLink;