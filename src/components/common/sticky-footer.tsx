import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

import ALink from '~/components/features/custom-link';

// import FooterSearchBox from '~/components/common/partials/footer-search-box';
import { showScrollTopHandler, stickyHeaderHandler } from '@/utils';
import { usePathname } from 'next/navigation';

export default function StickyFooter() {
    const prevScrollY = useRef<number>(0);

    const pathname = usePathname();

    useLayoutEffect(() => {
        document.querySelector('body')?.classList.remove('loaded');
    }, [pathname])

    useEffect(() => {
        const body = document.querySelector('body');
        if (!body) return;
        const bodyClasses = body.classList;
        for (let i = 0; i < bodyClasses.length; i++) {
            body.classList.remove(bodyClasses[i]);
        }
        setTimeout(() => {
            body.classList.add('loaded');
        }, 50);
    }, [pathname])

    const stickyFooterHandler = useCallback(() => {
        const pageContent = document.querySelector<HTMLElement>('.page-content');
        const header = document.querySelector<HTMLElement>('header');
        const top = pageContent && header ? pageContent.offsetTop + header.offsetHeight + 100 : 600;
        const stickyFooter = document.querySelector<HTMLElement>('.sticky-footer.sticky-content');
        const height = stickyFooter ? stickyFooter.offsetHeight : 0;

        const currentScrollY = window.scrollY;

        if (currentScrollY >= top && window.innerWidth < 768 && currentScrollY >= prevScrollY.current) {
            if (stickyFooter) {
                stickyFooter.classList.add('fixed');
                stickyFooter.style.marginBottom = '0';

                let wrapper = document.querySelector<HTMLElement>('.sticky-content-wrapper');
                if (!wrapper && stickyFooter.parentNode) {
                    const newNode = document.createElement('div');
                    newNode.className = 'sticky-content-wrapper';
                    stickyFooter.parentNode.insertBefore(newNode, stickyFooter);
                    newNode.appendChild(stickyFooter);
                    newNode.style.height = `${height}px`;
                    wrapper = newNode;
                }

                if (wrapper && !wrapper.getAttribute('style')) {
                    wrapper.style.height = `${height}px`;
                }
            }
        } else {
            if (stickyFooter) {
                stickyFooter.classList.remove('fixed');
                stickyFooter.style.marginBottom = `-${height}px`;
            }

            const wrapper = document.querySelector<HTMLElement>('.sticky-content-wrapper');
            if (wrapper) {
                wrapper.removeAttribute('style');
            }
        }

        if (window.innerWidth > 767) {
            const wrapper = document.querySelector<HTMLElement>('.sticky-content-wrapper');
            if (wrapper) {
                wrapper.style.height = 'auto';
            }
        }

        prevScrollY.current = currentScrollY;
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', showScrollTopHandler, { passive: true });
        window.addEventListener('scroll', stickyHeaderHandler, { passive: true });
        window.addEventListener('scroll', stickyFooterHandler, { passive: true });
        window.addEventListener('resize', stickyHeaderHandler);
        window.addEventListener('resize', stickyFooterHandler);

        return () => {
            window.removeEventListener('scroll', showScrollTopHandler);
            window.removeEventListener('scroll', stickyHeaderHandler);
            window.removeEventListener('scroll', stickyFooterHandler);
            window.removeEventListener('resize', stickyHeaderHandler);
            window.removeEventListener('resize', stickyFooterHandler);
        }
    }, [stickyFooterHandler])

    return (
        <div className="sticky-footer sticky-content fix-bottom">
            <ALink href="/" className="sticky-link active">
                <i className="d-icon-home"></i>
                <span>Home</span>
            </ALink>
            <ALink href="/products" className="sticky-link">
                <i className="d-icon-volume"></i>
                <span>Categories</span>
            </ALink>
            <ALink href="/wishlist" className="sticky-link">
                <i className="d-icon-heart"></i>
                <span>Wishlist</span>
            </ALink>
            <ALink href="/checkout" className="sticky-link">
                <i className="d-icon-card"></i>
                <span>Buy Now</span>
            </ALink>
            {/* <ALink href="/account" className="sticky-link">
                <i className="d-icon-user"></i>
                <span>Account</span>
            </ALink> */}

            {/* <FooterSearchBox /> */}
        </div>
    )
}