"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { LazyLoadImage } from 'react-lazy-load-image-component';

import ALink from '~/components/features/custom-link';

import { GET_PRODUCTS, V_COLLECTIONS } from '@/server/queries';

import { toDecimal } from '~/utils';
import { useLazyQuery } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";

type VendureCollection = { id: string; name: string; slug: string; children?: VendureCollection[] };

function SearchForm () {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ search, setSearch ] = useState( "" );
    const [ category, setCategory ] = useState( searchParams.get('category') || '' );
    const [ searchProducts, { data } ] = useLazyQuery<{
        search: {
            items: Array<{
                slug: string;
                productName: string;
                productAsset?: { preview?: string } | null;
                priceWithTax?: { value?: number } | null;
            }>;
        };
    }>( GET_PRODUCTS );
    const [ timer, setTimer ] = useState<NodeJS.Timeout | null>( null );
    const { data: treeData } = useQuery<{ collections: { items: VendureCollection[] } }>(V_COLLECTIONS);
    const collections = useMemo(() => treeData?.collections?.items || [], [treeData]);

    useEffect( () => {
        document.querySelector( "body" )?.addEventListener( "click", onBodyClick );

        return ( () => {
            document.querySelector( "body" )?.removeEventListener( "click", onBodyClick );
        } )
    }, [] )

    useEffect( () => {
        setSearch( "" );
        setCategory( "" );
    }, [ pathname ] )

    useEffect( () => {
        if ( search.length > 2 ) {
            if ( timer ) clearTimeout( timer );
            let timerId = setTimeout( () => {
                searchProducts( { variables: { search: search, category: category } } );
                setTimer( null );
            }, 500 );

            setTimer( timerId );
        }
    }, [ search, category ] )

    useEffect( () => {
        const el = document.querySelector( '.header-search.show-results' );
        if ( el ) el.classList.remove( 'show-results' );
    }, [ pathname ] )

    // categories now come from Apollo V_COLLECTIONS

    function removeXSSAttacks ( html: string ) {

        const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

        // Removing the <script> tags
        while ( SCRIPT_REGEX.test( html ) ) {
            html = html.replace( SCRIPT_REGEX, "" );
        }

        // Removing all events from tags...
        html = html.replace( / on\w+="[^"]*"/g, "" );

        return {
            __html: html
        }
    }

    function matchEmphasize ( name: string ) {
        let regExp = new RegExp( search, "i" );
        return name.replace(
            regExp,
            ( match: string ) => "<strong>" + match + "</strong>"
        );
    }

    function onBodyClick ( e: any ) {
        const hs = e.target.closest?.( '.header-search' );
        if ( hs ) return hs.classList.contains( 'show-results' ) || hs.classList.add( 'show-results' );

        const showEl = document.querySelector( '.header-search.show' );
        if ( showEl ) showEl.classList.remove( 'show' );
        const showRes = document.querySelector( '.header-search.show-results' );
        if ( showRes ) showRes.classList.remove( 'show-results' );
    }

    function onSearchChange ( e: React.ChangeEvent<HTMLInputElement> ) {
        setSearch( e.target.value );
    }

    function onSubmitSearchForm ( e: React.FormEvent<HTMLFormElement> ) {
        e.preventDefault();
        if (category) {
            if (!search || search.trim() === '') {
                router.push(`/categories/${encodeURIComponent(category)}`);
                return;
            }

            router.push(`/categories/${encodeURIComponent(category)}?search=${encodeURIComponent(search)}`);
            return;
        }

        const url = `/products?search=${ encodeURIComponent(search) }`;
        router.push(url);
    }

    function setCategoryHandler ( e: React.ChangeEvent<HTMLSelectElement> ) {
        setCategory( e.target.value );
    }

    function showSearchBox ( e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLInputElement> | React.MouseEvent<HTMLAnchorElement> ) {
        e.preventDefault();
        e.stopPropagation();
        const box = e.currentTarget.closest( '.header-search' );
        if ( box ) box.classList.toggle( 'show' );
    }

    return (
        <div className="header-search hs-simple">
            <form action="#" method="get" className="input-wrapper" onSubmit={ onSubmitSearchForm }>
                <div className="select-box">
                    <select id="category" name="category" value={ category } onChange={ setCategoryHandler }>
                        <option value="">All Categories</option>
                        {collections.map((parent) => (
                          parent.children && parent.children.length > 0 ? (
                            <optgroup key={parent.slug} label={parent.name}>
                              {parent.children.map((child) => (
                                <option key={child.slug} value={child.slug}>{child.name}</option>
                              ))}
                            </optgroup>
                          ) : (
                            <option key={parent.slug} value={parent.slug}>{parent.name}</option>
                          )
                        ))}
                    </select>
                </div>
                <input type="text" className="form-control" name="search" autoComplete="off" value={ search } onChange={ onSearchChange } placeholder="Search..." required onClick={ showSearchBox } />
                <button className="btn btn-search" type="submit"><i className="d-icon-search"></i></button>

                <div className="live-search-list scrollable bg-white">
                    { search.length > 2 && data?.search?.items?.map( ( item: { slug: string; productName: string; productAsset?: { preview?: string } | null; priceWithTax?: { value?: number } | null }, index: number ) => {
                        const preview = item.productAsset?.preview || '';
                        const pathOnly = preview.replace(/^https?:\/\/[^/]+/, '');
                        const price = item.priceWithTax?.value ?? 0;
                        return (
                            <ALink href={ `/products/${ item.slug }` } className="autocomplete-suggestion" key={ `search-result-${ index }`}>
                                <LazyLoadImage src={ (process.env.NEXT_PUBLIC_ASSET_URI || '') + pathOnly } width={ 40 } height={ 40 } alt="product" />
                                <div className="search-name" dangerouslySetInnerHTML={ removeXSSAttacks( matchEmphasize( item.productName ) ) }></div>
                                <span className="search-price">
                                    <span className="new-price">${ toDecimal( (price || 0) / 100 ) }</span>
                                </span>
                            </ALink>
                        );
                    }) }
                </div>
            </form>
        </div>
    );
}

export default SearchForm;