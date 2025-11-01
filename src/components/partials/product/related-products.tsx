import OwlCarousel from '~/components/features/owl-carousel';

import ProductTwo from '~/components/features/product/product-two';

import { relatedProductSlider } from '~/utils/data/carousel';

export default function RelatedProducts ( props ) {
    const { products, adClass = "" } = props;

    return (
        products.length > 0 ?
            <section className={ `${ adClass }` }>
                <h2 className="title text-normal text-center d-block mb-5">Related Products</h2>

                <OwlCarousel adClass="owl-carousel owl-theme owl-nav-full" options={ relatedProductSlider }>
                    {
                        products && products.slice( 0, 5 ).map( ( item, index ) =>
                            <ProductTwo product={ item } key={ 'product-two-' + index } />
                        )
                    }
                </OwlCarousel>
            </section> : ''
    )
}