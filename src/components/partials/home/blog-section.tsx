import React from 'react';
import Reveal from 'react-awesome-reveal';

import OwlCarousel from '~/components/features/owl-carousel';

import PostSix from '~/components/features/post/post-six';

import { fadeInUpShorter, fadeIn } from '~/utils/data/keyframes';
import { mainSlider12 } from '~/utils/data/carousel';

function BlogSection ( props ) {
    const { posts } = props;

    if (!posts) return null;

    return (
        <Reveal keyframes={ fadeIn } delay={ 300 } duration={ 1200 } triggerOnce>
            <section className="blog container mt-10 pt-2 mb-10 pb-10">
                <h2 className="title title-simple text-left">From our Blog</h2>

                <OwlCarousel adClass="owl-theme" options={ mainSlider12 }>
                    {
                        posts && posts.length ?
                            posts.slice( 15, 19 ).map( ( post, index ) => (
                                <React.Fragment key={ "post-three" + index }>
                                    <Reveal keyframes={ fadeInUpShorter } duration={ 1000 } delay={ index * 200 + 300 } triggerOnce>
                                        <PostSix post={ post } adClass="overlay-zoom" isCalender={ true } isOriginal={ true } isAuthor={ false } btnAdClass="btn btn-link btn-underline" btnText="Read More" />
                                    </Reveal>
                                </React.Fragment>
                            ) ) : ''
                    }
                </OwlCarousel>
            </section>
        </Reveal>
    )
}

export default React.memo( BlogSection );