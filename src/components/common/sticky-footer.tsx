import { useEffect, useLayoutEffect } from 'react';

import ALink from '~/components/features/custom-link';

// import FooterSearchBox from '~/components/common/partials/footer-search-box';
import { showScrollTopHandler, stickyHeaderHandler } from '@/utils';
import { usePathname } from 'next/navigation';

export default function StickyFooter() {
    let tmp = 0;

    const pathname = usePathname();

    useLayoutEffect(() => {
        document.querySelector('body')?.classList.remove('loaded');
    }, [pathname])

    useEffect(() => {
        window.addEventListener('scroll', showScrollTopHandler, true);
        window.addEventListener('scroll', stickyHeaderHandler, true);
        window.addEventListener('scroll', stickyFooterHandler, true);
        window.addEventListener('resize', stickyHeaderHandler, true);
        window.addEventListener('resize', stickyFooterHandler, true);

        return () => {
            window.removeEventListener('scroll', showScrollTopHandler, true);
            window.removeEventListener('scroll', stickyHeaderHandler, true);
            window.removeEventListener('scroll', stickyFooterHandler, true);
            window.removeEventListener('resize', stickyHeaderHandler, true);
            window.removeEventListener('resize', stickyFooterHandler, true);
        }
    }, [])

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

    useEffect(() => {
        window.addEventListener('scroll', stickyFooterHandler);

        return () => {
            window.removeEventListener('scroll', stickyFooterHandler);
        }
    }, [])

    const stickyFooterHandler = (e) => {
        let top = document.querySelector('.page-content') ? document.querySelector('.page-content').offsetTop + document.querySelector('header').offsetHeight + 100 : 600;
        let stickyFooter = document.querySelector('.sticky-footer.sticky-content');
        let height = 0;

        if (stickyFooter) {
            height = stickyFooter.offsetHeight;
        }

        if (window.pageYOffset >= top && window.innerWidth < 768 && e.currentTarget.scrollY >= tmp) {
            if (stickyFooter) {
                stickyFooter.classList.add('fixed');
                stickyFooter.setAttribute('style', "margin-bottom: 0")
                if (!document.querySelector('.sticky-content-wrapper')) {
                    let newNode = document.createElement("div");
                    newNode.className = "sticky-content-wrapper";
                    stickyFooter.parentNode.insertBefore(newNode, stickyFooter);
                    document.querySelector('.sticky-content-wrapper').insertAdjacentElement('beforeend', stickyFooter);
                    document.querySelector('.sticky-content-wrapper').setAttribute("style", "height: " + height + "px");
                }

                if (!document.querySelector('.sticky-content-wrapper').getAttribute("style")) {
                    document.querySelector('.sticky-content-wrapper').setAttribute("style", "height: " + height + "px");
                }
            }
        } else {
            if (stickyFooter) {
                stickyFooter.classList.remove('fixed');
                stickyFooter.setAttribute('style', `margin-bottom: -${height}px`)
            }

            if (document.querySelector('.sticky-content-wrapper')) {
                document.querySelector('.sticky-content-wrapper').removeAttribute("style");
            }
        }

        if (window.innerWidth > 767 && document.querySelector('.sticky-content-wrapper')) {
            document.querySelector('.sticky-content-wrapper').style.height = 'auto';
        }

        tmp = e.currentTarget.scrollY;
    }

    return (
        <div className="sticky-footer sticky-content fix-bottom">
            <ALink href="/" className="sticky-link active">
                <i className="d-icon-home"></i>
                <span>Home</span>
            </ALink>
            <ALink href="/shop" className="sticky-link">
                <i className="d-icon-volume"></i>
                <span>Categories</span>
            </ALink>
            <ALink href="/pages/wishlist" className="sticky-link">
                <i className="d-icon-heart"></i>
                <span>Wishlist</span>
            </ALink>
            <ALink href="/pages/account" className="sticky-link">
                <i className="d-icon-user"></i>
                <span>Account</span>
            </ALink>

            {/* <FooterSearchBox /> */}
        </div>
    )
}