"use client";
import { useState, useEffect } from 'react';

import ALink from '~/components/features/custom-link';
import Carousel, { CarouselHandle } from '~/components/features/carousel';

import ThumbOne from '~/components/partials/product/thumb/thumb-one';
import ThumbTwo from '~/components/partials/product/thumb/thumb-two';

import { mainSlider3 } from '~/utils/data/carousel';

export default function MediaOne ( props: { product: any; adClass?: string } ) {
    const { product, adClass = '' } = props;
    const [ index, setIndex ] = useState<number>( 0 );
    const [ isOpen, setOpenState ] = useState<boolean>( false );
    const mediaRef = useRef<CarouselHandle | null>( null );

    let lgImages = product.large_pictures ? product.large_pictures : product.pictures;

    useEffect( () => {
        setIndex( 0 );
    }, [ window.location.pathname ] )

    useEffect( () => {
        if ( mediaRef.current && index >= 0 ) {
            mediaRef.current.goTo( index );
        }
    }, [ index ] )

    const setIndexHandler = ( mediaIndex: number ) => {
        if ( mediaIndex !== index ) {
            setIndex( mediaIndex );
        }
    }

    const changeRefHandler = ( carRef: React.RefObject<HTMLDivElement> ) => {
        if ( carRef?.current ) {
            mediaRef.current = carRef as unknown as CarouselHandle;
        }
    }

    const changeOpenState = (openState: boolean) => {
        setOpenState( openState );
    }

    const openLightBox = () => {
        setOpenState( true );
    }

    let events = {
        onTranslated: function ( e: { item: { index: number } } ) {
            const thumbs = document.querySelector( '.product-thumbs' );
            const active = thumbs?.querySelector( '.product-thumb.active' );
            active?.classList.remove( 'active' );
            const list = thumbs?.querySelectorAll( '.product-thumb' );
            const el = list?.[ e.item.index ] as HTMLElement | undefined;
            el?.classList.add( 'active' );
        }
    }

    return (
        <>
            <div className={ `product-gallery pg-vertical media-default ${ adClass }` } style={ { top: "88px" } }>
                <div className="product-label-group">
                    {
                        product.stock === 0 ?
                            <label className="product-label label-out">out</label> : ""
                    }

                    {
                        product.is_top ?
                            <label className="product-label label-top">top</label> : ""
                    }

                    {
                        product.is_new ?
                            <label className="product-label label-new">new</label> : ""
                    }

                    {
                        product.discount ?
                            <label className="product-label label-sale">sale</label> : ""
                    }
                </div>

                <Carousel adClass="product-single-carousel owl-theme owl-nav-inner"
                    options={ mainSlider3 }
                    onChangeIndex={ setIndexHandler }
                    onChangeRef={ changeRefHandler }
                    events={ events }
                    ref={ mediaRef }
                >
                    {
                        lgImages.map( ( image: any, index: number ) =>
                            <div key={ (image?.url || 'img') + '-' + index }>
                                <img
                                    src={ (process.env.NEXT_PUBLIC_ASSET_URI || '') + image.url }
                                    alt="Product"
                                    className="product-image large-image"
                                />
                            </div>
                        ) }
                </Carousel>

                <ALink href="#" className="product-image-full" onClick={ openLightBox }><i className="d-icon-zoom"></i></ALink>

                <ThumbOne product={ product } index={ index } onChangeIndex={ setIndexHandler } />
                <ThumbTwo product={ product } index={ index } onChangeIndex={ setIndexHandler } />
            </div>

            {/* Lightbox disabled to avoid external dependency */}
        </>
    )
}