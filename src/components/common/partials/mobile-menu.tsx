import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import ALink from '~/components/features/custom-link';
import Card from '~/components/features/accordion/card';

type VendureCollection = {
    id: string;
    name: string;
    slug: string;
    assets?: { source: string; width: number; height: number }[] | [];
    parent?: { id: string | null; name?: string } | null;
};

const COLS_QUERY = gql`
  query COLS { collections(options:{ take: 50, sort:{ name: ASC }}) { items { id name slug parent { id name } } } }
`;

function MobileMenu ( props ) {
    const [ search, setSearch ] = useState( "" );
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { data, loading, error } = useQuery(COLS_QUERY, { fetchPolicy: 'cache-and-network' });

    const collections: VendureCollection[] = (data as any)?.collections?.items || [];

    const parents = useMemo(
        () => collections.filter((c) => c.parent && c.parent.name === '__root_collection__'),
        [collections]
    );

    const childrenByParent = useMemo(() => {
        const map: Record<string, VendureCollection[]> = {};
        for (const collection of collections) {
            if (collection.parent && collection.parent.name && collection.parent.name !== '__root_collection__') {
                const parentId = collection.parent.id as string;
                if (!map[parentId]) map[parentId] = [];
                map[parentId].push(collection);
            }
        }
        return map;
    }, [collections]);

    const isActivePath = (href: string) => {
        if (!pathname) return false;
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    useEffect( () => {
        window.addEventListener( 'resize', hideMobileMenuHandler );
        document.querySelector( "body" ).addEventListener( "click", onBodyClick );

        return () => {
            window.removeEventListener( 'resize', hideMobileMenuHandler );
            document.querySelector( "body" ).removeEventListener( "click", onBodyClick );
        }
    }, [] )

    useEffect( () => {
        setSearch( "" );
    }, [ searchParams.get( 'slug' ) ] )

    const hideMobileMenuHandler = () => {
        if ( window.innerWidth > 991 ) {
            document.querySelector( 'body' ).classList.remove( 'mmenu-active' );
        }
    }

    const hideMobileMenu = () => {
        document.querySelector( 'body' ).classList.remove( 'mmenu-active' );
    }

    function onSearchChange ( e ) {
        setSearch( e.target.value );
    }

    function onBodyClick ( e ) {
        if ( e.target.closest( '.header-search' ) ) return e.target.closest( '.header-search' ).classList.contains( 'show-results' ) || e.target.closest( '.header-search' ).classList.add( 'show-results' );

        document.querySelector( '.header-search.show' ) && document.querySelector( '.header-search.show' ).classList.remove( 'show' );
        document.querySelector( '.header-search.show-results' ) && document.querySelector( '.header-search.show-results' ).classList.remove( 'show-results' );
    }

    function onSubmitSearchForm ( e ) {
        e.preventDefault();
        router.push( `/products?search=${ encodeURIComponent( search ) }` );
    }

    return (
        <div className="mobile-menu-wrapper">
            <div className="mobile-menu-overlay" onClick={ hideMobileMenu }>
            </div>

            <ALink className="mobile-menu-close" href="#" onClick={ hideMobileMenu }><i className="d-icon-times"></i></ALink>

            <div className="mobile-menu-container scrollable">
                <form action="#" className="input-wrapper" onSubmit={ onSubmitSearchForm }>
                    <input type="text" className="form-control" name="search" autoComplete="off" value={ search } onChange={ onSearchChange }
                        placeholder="Search your keyword..." required />
                    <button className="btn btn-search" type="submit">
                        <i className="d-icon-search"></i>
                    </button>
                </form>

                <ul className="mobile-menu mmenu-anim">
                    <li className={isActivePath('/') ? 'active' : ''}>
                        <ALink href="/">Home</ALink>
                    </li>

                    <li>
                        <Card title="Shop" type="mobile" url="/products">
                            <ul>
                                {loading && <li className="text-grey">Loading...</li>}
                                {error && <li className="text-danger">Unable to load categories</li>}
                                {!loading && !error && parents.map((parent) => {
                                    const parentHref = `/categories/${parent.slug}`;
                                    const childCollections = childrenByParent[parent.id] ?? [];
                                    const parentActive = isActivePath(parentHref) || childCollections.some((child) => isActivePath(`/categories/${child.slug}`));

                                    return (
                                        <li key={`parent-${parent.slug}`} className={parentActive ? 'active' : ''}>
                                            <Card title={parent.name} type="mobile" url={parentHref}>
                                                <ul>
                                                    {childCollections.length > 0 ? (
                                                        childCollections.map((child) => {
                                                            const childHref = `/categories/${child.slug}`;
                                                            return (
                                                                <li key={`child-${child.slug}`} className={isActivePath(childHref) ? 'active' : ''}>
                                                                    <ALink href={childHref}>{child.name}</ALink>
                                                                </li>
                                                            );
                                                        })
                                                    ) : (
                                                        <li className="text-grey">No subcategories</li>
                                                    )}
                                                </ul>
                                            </Card>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>
                    </li>

                    <li className={isActivePath('/about-us') ? 'active' : ''}>
                        <ALink href="/about-us">About Us</ALink>
                    </li>
                    <li className={isActivePath('/contact-us') ? 'active' : ''}>
                        <ALink href="/contact-us">Contact</ALink>
                    </li>
                    {/* <li className={isActivePath('/faqs') ? 'active' : ''}>
                        <ALink href="/faqs">FAQs</ALink>
                    </li> */}
                    <li className={isActivePath('/cart') ? 'active' : ''}>
                        <ALink href="/cart">Cart</ALink>
                    </li>
                    <li className={isActivePath('/checkout') ? 'active' : ''}>
                        <ALink href="/checkout">Checkout</ALink>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default React.memo( MobileMenu );