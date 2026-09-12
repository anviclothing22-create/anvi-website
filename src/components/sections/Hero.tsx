import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlidesData, type HeroSlide } from '../../data/hero';
import { getHeroBanners, subscribeCmsInvalidation } from '../../lib/cmsApi';
import './Hero.css';

export interface HeroProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

/**
 * ANVI Homepage Hero
 * Exact luxury fashion campaign implementation matching anviclothings.com reference.
 * Dynamically synchronized with Admin Command Storefront Content Studio in real time.
 */
export const Hero: React.FC<HeroProps> = ({
  slides: propSlides,
  autoPlayInterval = 7000,
}) => {
  const [liveSlides, setLiveSlides] = useState<HeroSlide[]>(() => propSlides || heroSlidesData);

  useEffect(() => {
    if (propSlides) return;
    let cancelled = false;

    const refresh = () => {
      void getHeroBanners()
        .then((banners) => {
          if (!cancelled && banners && banners.length > 0) {
            setLiveSlides(banners);
          }
        })
        .catch(() => {
          // fallback maintained
        });
    };

    refresh();
    const unsubscribe = subscribeCmsInvalidation(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [propSlides]);

  const activeSlides = propSlides || (liveSlides.length > 0 ? liveSlides : heroSlidesData);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = activeSlides.length;
  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || autoPlayInterval <= 0) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide]);

  const formattedCurrent = String(currentSlideIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalSlides).padStart(2, '0');

  return (
    <section
      className="anvi-hero"
      aria-label="Editorial Campaign"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Photography Slider */}
      <div className="anvi-hero-media-wrapper" aria-hidden="true">
        {activeSlides.map((slide, idx) => (
          <img
            key={slide.id}
            src={slide.imageSrc}
            alt=""
            className={`anvi-hero-slide-image ${
              idx === currentSlideIndex ? 'anvi-hero-slide-image--active' : ''
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/images/brand/hero_image.webp') {
                target.src = '/images/brand/hero_image.webp';
              }
            }}
          />
        ))}

        {/* Dark Cinematic Scrim for high text contrast */}
        <div className="anvi-hero-scrim" />
      </div>

      {/* Main Editorial Content */}
      <div className="anvi-hero-content-container">
        <div key={currentSlide.id} className="anvi-hero-text-block">
          {/* Haute Couture Eyebrow Badge */}
          <div className="anvi-hero-badge">
            <span className="anvi-hero-badge-sparkle" aria-hidden="true">
              ✦
            </span>
            <span className="anvi-hero-badge-text">{currentSlide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="anvi-hero-headline">
            <span className="anvi-hero-word-tradition">{currentSlide.headlineWord1}</span>
            <span className="anvi-hero-word-reimagined">{currentSlide.headlineWord2}</span>
          </h1>

          {/* Concise Tagline */}
          {currentSlide.tagline && (
            <p className="anvi-hero-tagline">{currentSlide.tagline}</p>
          )}

          {/* CTAs */}
          <div className="anvi-hero-actions">
            <a href={currentSlide.primaryCtaHref} className="anvi-hero-btn-primary">
              <span>{currentSlide.primaryCtaText}</span>
              <span className="anvi-hero-btn-arrow" aria-hidden="true">
                →
              </span>
            </a>

            {currentSlide.secondaryCtaText && (
              <a href={currentSlide.secondaryCtaHref} className="anvi-hero-btn-secondary">
                <span>{currentSlide.secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Slider Controls */}
      <div className="anvi-hero-bottom-controls" aria-label="Hero slider controls">
        <div className="anvi-hero-bottom-inner">
          {/* Left: Progress Dash Indicators */}
          <div className="anvi-hero-indicators" role="tablist">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${idx + 1}: ${slide.headlineWord1} ${slide.headlineWord2}`}
                  className="anvi-hero-indicator-btn"
                  onClick={() => setCurrentSlideIndex(idx)}
                >
                  <span
                    className={`anvi-hero-indicator-bar ${
                      isActive
                        ? 'anvi-hero-indicator-bar--active'
                        : 'anvi-hero-indicator-bar--inactive'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Counter & Arrows */}
          <div className="anvi-hero-pagination">
            <button
              type="button"
              className="anvi-hero-nav-arrow"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            <span className="anvi-hero-counter" aria-live="polite">
              <span className="anvi-hero-counter-active">{formattedCurrent}</span>
              <span>/</span>
              <span>{formattedTotal}</span>
            </span>

            <button
              type="button"
              className="anvi-hero-nav-arrow anvi-hero-nav-arrow--boxed"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
