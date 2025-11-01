import ALink from '~/components/features/custom-link';

import CartMenu from '~/components/common/partials/cart-menu';
import MainMenu from '~/components/common/partials/main-menu';
import MobileMenuLink from './partials/mobile-menu-link';
import dynamic from 'next/dynamic';
import { CONTACT_INFO } from '@/constants/contact';

const SearchBox = dynamic(() => import('./partials/search-box'), { ssr: false });

export default function Header() {
    return (
        <header className="header">
            <div className="header-top">
                <div className="container">
                    <div className="header-left">
                        {/* <p className="welcome-msg">Welcome to Riode store message or remove it!</p> */}
                    </div>
                    <div className="header-right">
                        <span className="divider"></span>
                        <ALink href="/contact-us" className="contact d-lg-show"><i className="d-icon-map"></i>Contact</ALink>
                        <ALink href="/about-us" className="help d-lg-show"><i className="d-icon-info"></i>About Us</ALink>

                        {/* Login temporarily disabled */}
                    </div>
                </div>
            </div>

            <div className="header-middle sticky-header fix-top sticky-content">
                <div className="container">
                    <div className="header-left">
                        <MobileMenuLink />

                        <ALink href="/" className="logo">
                            <img src='/images/home/logo.png' alt="logo" width="153" height="44" />
                        </ALink>

                        <SearchBox />
                    </div>

                    <div className="header-right">
                        {CONTACT_INFO.callUsNow && (
                            <>
                                <ALink href={`tel:${CONTACT_INFO.callUsNow}`} className="icon-box icon-box-side">
                                    <div className="icon-box-icon mr-0 mr-lg-2">
                                        <i className="d-icon-phone"></i>
                                    </div>
                                    <div className="icon-box-content d-lg-show">
                                        <h4 className="icon-box-title">Call Us Now:</h4>
                                        <p>{CONTACT_INFO.callUsNow}</p>
                                    </div>
                                </ALink>

                                <span className="divider"></span>
                            </>
                        )}

                        <ALink href="/wishlist" className="wishlist">
                            <i className="d-icon-heart"></i>
                        </ALink>

                        <span className="divider"></span>

                        <CartMenu />
                    </div>
                </div>
            </div>

            <div className="header-bottom d-lg-show">
                <div className="container">
                    <div className="header-left">
                        <MainMenu />
                    </div>
                    {/* 
                    <div className="header-right">
                        <ALink href="https://d-themes.com/buynow/riodereact" target="_blank" className="ml-6">Buy Riode!</ALink>
                    </div> */}
                </div>
            </div>
        </header >
    );
}