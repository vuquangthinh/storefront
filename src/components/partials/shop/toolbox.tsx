"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import ALink from '~/components/features/custom-link';

import SidebarFilterThree from '~/components/partials/shop/sidebar/sidebar-filter-three';

export default function ToolBox ( props: { type?: string } ) {
    const { type = "left" } = props;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query: any = Object.fromEntries(searchParams.entries());
    const gridType = query.type ? query.type : 'grid';
    const perPage = query.per_page ? query.per_page : 12;

    let tmp = 0;
    const page = query.page ? query.page : 1;

    useEffect( () => {
        window.addEventListener( 'scroll', stickyToolboxHandler );

        return () => {
            window.removeEventListener( 'scroll', stickyToolboxHandler );
        }
    }, [] )

    const onChangeAttri = ( e: React.ChangeEvent<HTMLSelectElement>, attri: string ) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set(attri, e.target.value);
        params.set('page', '1');
        params.delete('grid');
        const url = `${pathname}?${params.toString()}`;
        router.push(url);
    }

    const showSidebar = () => {
        if ( type === "navigation" && window.innerWidth > 991 ) {
            const btn = document.querySelector('.navigation-toggle-btn') as HTMLElement | null;
            if (btn) btn.click();
        } else {
            const body = document.querySelector('body');
            if (body) body.classList.add(`${ type === "left" || type === "off-canvas" || type === "navigation" || type === "horizontal" ? "sidebar-active" : "right-sidebar-active" }`);
        }
    }
    const stickyToolboxHandler = ( e: any ) => {
        let top = 600;
        let stickyToolbox = document.querySelector( '.sticky-toolbox' ) as HTMLElement | null;
        let height = 0;

        if ( stickyToolbox ) {
            height = stickyToolbox.offsetHeight;
        }

        if ( window.pageYOffset >= top && window.innerWidth < 768 && e.currentTarget.scrollY < tmp ) {
            if ( stickyToolbox ) {
                stickyToolbox.classList.add( 'fixed' );
                const wrapSel = document.querySelector( '.sticky-toolbox-wrapper' ) as HTMLElement | null;
                if ( !wrapSel ) {
                    let newNode = document.createElement( "div" );
                    newNode.className = "sticky-toolbox-wrapper";
                    if (stickyToolbox.parentNode) {
                        stickyToolbox.parentNode.insertBefore( newNode, stickyToolbox );
                        const created = document.querySelector( '.sticky-toolbox-wrapper' ) as HTMLElement | null;
                        if (created) {
                            created.insertAdjacentElement( 'beforeend', stickyToolbox );
                            created.setAttribute( "style", "height: " + height + "px" );
                        }
                    }
                }

                const wrap = document.querySelector( '.sticky-toolbox-wrapper' ) as HTMLElement | null;
                if ( wrap && !wrap.getAttribute( "style" ) ) {
                    wrap.setAttribute( "style", "height: " + height + "px" );
                }
            }
        } else {
            if ( stickyToolbox ) {
                stickyToolbox.classList.remove( 'fixed' );
            }

            const wrap = document.querySelector( '.sticky-toolbox-wrapper' ) as HTMLElement | null;
            if ( wrap ) {
                wrap.removeAttribute( "style" );
            }
        }

        const wrap = document.querySelector( '.sticky-toolbox-wrapper' ) as HTMLElement | null;
        if ( window.outerWidth > 767 && wrap ) {
            wrap.style.height = 'auto';
        }

        tmp = e.currentTarget.scrollY;
    }

    return (
        <nav className={ `toolbox sticky-toolbox sticky-content fix-top ${ type === "horizontal" ? 'toolbox-horizontal' : '' }` }>
            {
                type === "horizontal" ? <SidebarFilterThree /> : ''
            }
            <div className="toolbox-left">
                {
                    type === "left" || type === "off-canvas" || type === "navigation" || type === "horizontal" ?
                        <ALink href="#" className={ `toolbox-item left-sidebar-toggle btn btn-outline btn-primary btn-rounded ${ type === "navigation" ? "btn-icon-left btn-sm" : "btn-sm btn-icon-right" } ${ type === "off-canvas" || type === "navigation" ? '' : "d-lg-none" }` } onClick={ showSidebar }>
                            {
                                type === "navigation" ? <i className="d-icon-filter-2"></i> : ''
                            }
                            Filter
                            {
                                type === "navigation" ? '' : <i className="d-icon-arrow-right"></i>
                            }
                        </ALink> : ''
                }

                {
                    type === "navigation" ? '' :
                        <div className={ `toolbox-item toolbox-sort ${ type === "boxed" || type === "banner" ? "select-box text-dark" : "select-menu" }` }>
                            {
                                type === "boxed" || type === "banner" || type === "left" ? <label>Sort By :</label> : ''
                            }
                            <select name="orderby" className="form-control" defaultValue={ query.sortby ? query.sortby : 'default' } onChange={ e => onChangeAttri( e, 'sortby' ) }>
                                <option value="default">Default</option>
                                <option value="popularity">Most Popular</option>
                                <option value="rating">Average rating</option>
                                <option value="date">Latest</option>
                                <option value="price-low">Sort forward price low</option>
                                <option value="price-high">Sort forward price high</option>
                                <option value="">Clear custom sort</option>
                            </select>
                        </div>
                }
            </div>

            <div className="toolbox-right">
                {
                    type === "navigation" ? '' :
                        <div className="toolbox-item toolbox-show select-box text-dark">
                            <label>Show :</label>
                            <select name="count" className="form-control" defaultValue={ perPage } onChange={ e => onChangeAttri( e, 'per_page' ) }>
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="36">36</option>
                            </select>
                        </div>
                }
                {
                    type === "navigation" ?
                        <div className={ `toolbox-item toolbox-sort ${ type === "boxed" || type === "banner" ? "select-box text-dark" : "select-menu" }` }>
                            <label>Sort By :</label>
                            <select name="orderby" className="form-control" defaultValue={ query.sortby ? query.sortby : 'default' } onChange={ e => onChangeAttri( e, 'sortby' ) }>
                                <option value="default">Default</option>
                                <option value="popularity">Most Popular</option>
                                <option value="rating">Average rating</option>
                                <option value="date">Latest</option>
                                <option value="price-low">Sort forward price low</option>
                                <option value="price-high">Sort forward price high</option>
                                <option value="">Clear custom sort</option>
                            </select>
                        </div> : ''
                }
                {/* <div className={ `toolbox-item toolbox-layout ${ type === "right" ? "mr-lg-0" : '' }` }>
                    <ALink href={ { pathname, query: { ...query, type: "list" } } } scroll={ false } className={ `d-icon-mode-list btn-layout ${ gridType === 'list' ? 'active' : '' }` }></ALink>
                    <ALink href={ { pathname, query: { ...query, type: "grid" } } } scroll={ false } className={ `d-icon-mode-grid btn-layout ${ gridType !== 'list' ? 'active' : '' }` }></ALink>
                </div> */}

                {
                    type === "right" ?
                        <ALink href="#" className="toolbox-item right-sidebar-toggle btn btn-sm btn-outline btn-primary btn-rounded btn-icon-right d-lg-none" onClick={ showSidebar }>Filter<i className="d-icon-arrow-left"></i></ALink> : ''
                }
            </div>
        </nav>
    )
}