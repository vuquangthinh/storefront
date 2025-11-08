"use client";
import { useEffect, useLayoutEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { usePathname } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.min.css';
// import 'react-image-lightbox/style.css';
import 'react-input-range/lib/css/index.css';

import ALink from '~/components/features/custom-link';

import Header from '~/components/common/header';
import Footer from '~/components/common/footer';
import StickyFooter from '~/components/common/sticky-footer';
import Quickview from '~/components/features/product/common/quickview-modal';
import VideoModal from '~/components/features/modals/video-modal';
import MobileMenu from '~/components/common/partials/mobile-menu';

import { showScrollTopHandler, scrollTopHandler, stickyHeaderHandler, stickyFooterHandler } from '~/utils';
import { QuickviewProvider, useQuickview } from '@/context/quickview/QuickviewContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, slug, data, closeQuickview } = useQuickview();
  return (
    <>
      <div className="page-wrapper">
        <Header />

        { children }

        <Footer />

        <StickyFooter />
      </div>

      <ALink id="scroll-top" href="#" title="Top" role="button" className="scroll-top" onClick={ () => scrollTopHandler( false ) }><i className="d-icon-arrow-up"></i></ALink>

      <MobileMenu />

      <ToastContainer
        autoClose={ 3000 }
        // duration={ 300 }
        // newestOnTo={ true }
        className="toast-container"
        position="bottom-left"
        closeButton={ false }
        hideProgressBar={ true }
        newestOnTop={ true }
      />

      <Quickview slug={slug ?? ''} isOpen={isOpen} closeQuickview={closeQuickview} data={data} />

      <VideoModal />
    </>
  );
}

function Layout ( { children }: { children: React.ReactNode } ) {
  return (
    <QuickviewProvider>
      <LayoutContent>{children}</LayoutContent>
    </QuickviewProvider>
  );
}

export default Layout;