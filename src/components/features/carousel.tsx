"use client";

import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  forwardRef,
  type ReactNode,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type ResponsiveSetting = {
  items?: number;
  margin?: number;
  nav?: boolean;
  dots?: boolean;
};

export type CarouselOptions = {
  items?: number;
  loop?: boolean;
  margin?: number;
  nav?: boolean;
  navText?: [string, string];
  dots?: boolean;
  smartSpeed?: number;
  autoplay?: boolean;
  autoplayTimeout?: number;
  autoHeight?: boolean;
  responsive?: Record<number, ResponsiveSetting>;
};

export interface CarouselHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

interface CarouselProps {
  adClass?: string;
  options?: CarouselOptions;
  events?: { onTranslated?: (e: { item: { index: number } }) => void };
  onChangeRef?: (ref: React.RefObject<HTMLDivElement>) => void;
  onChangeIndex?: (index: number) => void;
  children?: ReactNode;
}

const Carousel = forwardRef<CarouselHandle, CarouselProps>(
  ({ adClass = "", options = {}, events, onChangeRef, onChangeIndex, children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const swiperRef = useRef<SwiperClass | null>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const dotsRef = useRef<HTMLDivElement>(null);

    const slides = useMemo(() => React.Children.toArray(children), [children]);
    const count = slides.length;

    const settings: Required<CarouselOptions> = {
      items: options.items ?? 1,
      loop: options.loop ?? false,
      margin: options.margin ?? 0,
      nav: options.nav ?? true,
      navText: options.navText ?? [
        '<i class="d-icon-angle-left"></i>',
        '<i class="d-icon-angle-right"></i>',
      ],
      dots: options.dots ?? false,
      smartSpeed: options.smartSpeed ?? 400,
      autoplay: options.autoplay ?? false,
      autoplayTimeout: options.autoplayTimeout ?? 5000,
      autoHeight: options.autoHeight ?? false,
      responsive: options.responsive ?? {},
    };

    const navigationEnabled = settings.nav && count > settings.items;
    const dotsEnabled = settings.dots && count > settings.items;

    const breakpoints = useMemo(() => {
      const entries = Object.entries(settings.responsive);
      if (!entries.length) return undefined;
      return entries.reduce<Record<number, { slidesPerView?: number; spaceBetween?: number }>>(
        (acc, [width, conf]) => {
          const key = Number(width);
          if (!Number.isNaN(key)) {
            acc[key] = {
              slidesPerView: conf.items ?? settings.items,
              spaceBetween: conf.margin ?? settings.margin,
            };
          }
          return acc;
        },
        {}
      );
    }, [settings.items, settings.margin, settings.responsive]);

    useEffect(() => {
      onChangeRef?.(containerRef);
    }, [onChangeRef]);

    const pageCount = useMemo(() => {
      const slidesPerView = Math.max(1, settings.items);
      return Math.max(1, Math.ceil(count / slidesPerView));
    }, [count, settings.items]);

    const slideTo = useCallback(
      (target: number) => {
        const swiper = swiperRef.current;
        if (!swiper) return;
        if (settings.loop) {
          swiper.slideToLoop(target, settings.smartSpeed);
        } else {
          swiper.slideTo(target, settings.smartSpeed);
        }
      },
      [settings.loop, settings.smartSpeed]
    );

    useImperativeHandle(
      ref,
      () => ({
        goTo: slideTo,
        next: () => swiperRef.current?.slideNext(settings.smartSpeed),
        prev: () => swiperRef.current?.slidePrev(settings.smartSpeed),
      }),
      [slideTo, settings.smartSpeed]
    );

    const handleBeforeInit = useCallback(
      (swiper: SwiperClass) => {
        swiperRef.current = swiper;
        if (navigationEnabled) {
          const params = swiper.params.navigation;
          if (params && typeof params === "object") {
            Object.assign(params, {
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            });
          }
        }
        if (dotsEnabled) {
          const params = swiper.params.pagination;
          if (params && typeof params === "object") {
            Object.assign(params, {
              el: dotsRef.current,
              clickable: true,
            });
          }
        }
      },
      [dotsEnabled, navigationEnabled]
    );

    const handleSlideChange = useCallback(
      (swiper: SwiperClass) => {
        const realIndex = swiper.realIndex ?? swiper.activeIndex ?? 0;
        onChangeIndex?.(realIndex);
        events?.onTranslated?.({ item: { index: realIndex } });
      },
      [events, onChangeIndex]
    );

    useEffect(() => {
      if (!settings.autoHeight) return;
      const id = requestAnimationFrame(() => swiperRef.current?.updateAutoHeight());
      return () => cancelAnimationFrame(id);
    }, [slides, settings.autoHeight]);

    if (!count) return null;

    return (
      <div ref={containerRef} className={`carousel ${adClass}`}>
        <Swiper
          modules={[
            ...(navigationEnabled ? [Navigation] : []),
            ...(dotsEnabled ? [Pagination] : []),
            ...(settings.autoplay ? [Autoplay] : []),
          ]}
          onBeforeInit={handleBeforeInit}
          onSlideChange={handleSlideChange}
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          slidesPerView={Math.max(1, settings.items)}
          spaceBetween={Math.max(0, settings.margin)}
          loop={settings.loop}
          speed={settings.smartSpeed}
          autoHeight={settings.autoHeight}
          autoplay={
            settings.autoplay
              ? {
                  delay: settings.autoplayTimeout,
                  disableOnInteraction: false,
                }
              : false
          }
          navigation={navigationEnabled ? { prevEl: prevRef.current, nextEl: nextRef.current } : false}
          pagination={dotsEnabled ? { el: dotsRef.current, clickable: true } : false}
          breakpoints={breakpoints}
        >
          {slides.map((child, index) => (
            <SwiperSlide key={index}>{child}</SwiperSlide>
          ))}
        </Swiper>

        {/* {navigationEnabled && pageCount > 1 && (
          <div className="carousel-nav">
            <button
              ref={prevRef}
              type="button"
              className="carousel-prev"
              aria-label="Previous"
              dangerouslySetInnerHTML={{ __html: settings.navText[0] }}
            />
            <button
              ref={nextRef}
              type="button"
              className="carousel-next"
              aria-label="Next"
              dangerouslySetInnerHTML={{ __html: settings.navText[1] }}
            />
          </div>
        )} */}

        {dotsEnabled && pageCount > 1 && <div ref={dotsRef} className="carousel-dots" />}
      </div>
    );
  }
);

Carousel.displayName = "Carousel";

export default React.memo(Carousel);
