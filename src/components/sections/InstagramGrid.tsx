import React, { useState, useEffect, useRef } from 'react';
import { instagramData, type InstagramSectionData, type InstagramPost } from '../../data/instagram';
import { formatPrice } from '../../lib/formatters';
import { getInstagram, subscribeCmsInvalidation } from '../../lib/cmsApi';
import './InstagramGrid.css';

export interface InstagramGridProps {
  data?: InstagramSectionData;
  /**
   * Optional direct Elfsight Widget ID prop.
   * Can also be set in src/data/instagram.ts -> elfsightWidgetId
   */
  elfsightWidgetId?: string;
  onPostClick?: (post: InstagramPost) => void;
  onFollowClick?: () => void;
}

export const InstagramGrid: React.FC<InstagramGridProps> = ({
  data = instagramData,
  elfsightWidgetId: propWidgetId,
  onFollowClick,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [cmsWidgetId, setCmsWidgetId] = useState<string>('');

  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = (): void => {
      void getInstagram()
        .then((g) => {
          if (!cancelled) setCmsWidgetId(g.elfsightWidgetId ?? '');
        })
        .catch(() => {
          // static fallback (empty widget id → marquee mode)
        });
    };
    refresh();
    const unsubscribe = subscribeCmsInvalidation(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Determine active Elfsight widget ID (cleans prefix if user passes "elfsight-app-...")
  const activeWidgetId = (propWidgetId || cmsWidgetId || data.elfsightWidgetId || '')
    .replace(/^elfsight-app-/, '')
    .trim();

  // Dynamically load Elfsight Platform script when widget ID is configured
  useEffect(() => {
    if (!activeWidgetId) return;

    const SCRIPT_ID = 'elfsight-platform-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If already appended, re-initialize widgets for dynamic SPA navigation
      const globalWindow = window as unknown as { ElfsightPlatform?: { init?: () => void } };
      if (globalWindow.ElfsightPlatform?.init) {
        try {
          globalWindow.ElfsightPlatform.init();
        } catch {
          // ignore
        }
      }
    }
  }, [activeWidgetId]);

  // Duplicate posts for seamless infinite marquee loop (fallback mode)
  const marqueePosts = [...data.posts, ...data.posts, ...data.posts];

  const openPostModal = (post: InstagramPost) => {
    setSelectedPost(post);
    setIsPlaying(true);
    setVideoProgress(0);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  // Close modal on ESC key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    if (selectedPost) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  const toggleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (modalVideoRef.current) {
      if (modalVideoRef.current.paused) {
        modalVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        modalVideoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (modalVideoRef.current && modalVideoRef.current.duration) {
      const pct = (modalVideoRef.current.currentTime / modalVideoRef.current.duration) * 100;
      setVideoProgress(pct);
    }
  };

  return (
    <section className="anvi-instagram-section" aria-labelledby="instagram-section-heading">
      <div className="anvi-instagram-container">
        {/* Header: Visual Diary & Brand Handle */}
        <div className="anvi-instagram-header">
          <div className="anvi-instagram-live-pill">
            <span className="anvi-instagram-live-dot" aria-hidden="true" />
            <span>Studio Social Live</span>
          </div>

          <h2 id="instagram-section-heading" className="anvi-instagram-heading">
            {data.heading}
          </h2>

          <p className="anvi-instagram-subtext">{data.subtext}</p>
        </div>
      </div>

      {/* =======================================================
          MAIN CONTENT: ELFSIGHT LIVE WIDGET OR SILK-WAVE MARQUEE
          ======================================================= */}
      {activeWidgetId ? (
        /* Live Elfsight Instagram Reels Stream */
        <div
          className="anvi-elfsight-container"
          aria-label={`Live Instagram Reels from ${data.handle}`}
        >
          <div className={`elfsight-app-${activeWidgetId}`} data-elfsight-app-lazy />
        </div>
      ) : (
        /* Curated Silk-Wave Video Marquee Track (Seamless while widget is created) */
        <div
          className="anvi-instagram-marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          role="region"
          aria-label="Interactive Instagram visual reel marquee"
        >
          <div className={`anvi-instagram-track ${isPaused ? 'anvi-instagram-track--paused' : ''}`}>
            {marqueePosts.map((post, idx) => {
              const isWaveOffset = idx % 2 === 1;

              return (
                <div
                  key={`${post.id}-${idx}`}
                  className={`anvi-instagram-card ${isWaveOffset ? 'anvi-instagram-card--offset' : ''}`}
                  onClick={() => openPostModal(post)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Watch reel: ${post.caption}`}
                >
                  {/* Visual Media (Video or Image) */}
                  <div className="anvi-instagram-media-frame">
                    {post.videoUrl ? (
                      <video
                        src={post.videoUrl}
                        poster={post.image}
                        className="anvi-instagram-card-video"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => {
                          try {
                            e.currentTarget.play().catch(() => {});
                          } catch {
                            // Ignore autoplay restrictions
                          }
                        }}
                        onMouseLeave={(e) => {
                          try {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          } catch {
                            // Ignore
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={post.image}
                        alt={post.alt}
                        className="anvi-instagram-card-img"
                        loading="lazy"
                        decoding="async"
                      />
                    )}

                    {/* Top Badges */}
                    <div className="anvi-instagram-card-top-bar">
                      <span className="anvi-instagram-badge-reel">
                        <span className="anvi-play-glyph">▶</span>
                        <span>{post.views || 'Reel'}</span>
                      </span>

                      {/* Animated Equalizer Sound Bars */}
                      <div className="anvi-instagram-sound-wave" aria-label="Audio track">
                        <span className="anvi-eq-bar b1" />
                        <span className="anvi-eq-bar b2" />
                        <span className="anvi-eq-bar b3" />
                      </div>
                    </div>

                    {/* Floating Center Play / Inspect Button on Hover */}
                    <div className="anvi-instagram-center-action" aria-hidden="true">
                      <div className="anvi-instagram-glass-orb">
                        <span className="anvi-orb-triangle">▶</span>
                      </div>
                    </div>

                    {/* Bottom Vignette & Information */}
                    <div className="anvi-instagram-card-info">
                      {/* Caption */}
                      <p className="anvi-instagram-card-caption">{post.caption}</p>

                      {/* Audio track info */}
                      <div className="anvi-instagram-audio-ticker">
                        <span className="anvi-music-note">♫</span>
                        <span className="anvi-audio-title">{post.audio}</span>
                      </div>

                      {/* Interactive "Shop Look" Pill Tag */}
                      {post.taggedProduct && (
                        <div className="anvi-instagram-shop-chip">
                          <span className="anvi-chip-bag-icon">✦</span>
                          <span className="anvi-chip-title">
                            {post.taggedProduct.name} · {formatPrice(post.taggedProduct.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Follow Button & Community Stats Footer */}
      <div className="anvi-instagram-footer-bar">
        <a
          href={data.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="anvi-instagram-follow-btn"
          onClick={onFollowClick}
          aria-label={`Follow ${data.handle} on Instagram`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anvi-ig-icon"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span>{data.ctaText}</span>
          <span className="anvi-instagram-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>

      {/* =======================================================
          INTERACTIVE REEL & STORY THEATER MODAL (FALLBACK MODE)
          ======================================================= */}
      {selectedPost && !activeWidgetId && (
        <div
          className="anvi-story-modal-backdrop"
          onClick={closePostModal}
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Reel Viewer"
        >
          <div
            className="anvi-story-modal-viewport"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="anvi-story-close-btn"
              onClick={closePostModal}
              aria-label="Close story"
            >
              ✕
            </button>

            {/* Story Progress Bar */}
            <div className="anvi-story-progress-bar">
              <div
                className="anvi-story-progress-fill"
                style={
                  selectedPost.videoUrl
                    ? { width: `${videoProgress}%`, animation: 'none' }
                    : undefined
                }
              />
            </div>

            {/* Story Header */}
            <div className="anvi-story-header">
              <div className="anvi-story-avatar">
                <span>A</span>
              </div>
              <div className="anvi-story-meta">
                <span className="anvi-story-handle">{data.handle}</span>
                <span className="anvi-story-time">
                  Coimbatore Studio · {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>

              {selectedPost.videoUrl && (
                <button
                  type="button"
                  className="anvi-story-sound-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  aria-label={isMuted ? 'Unmute reel audio' : 'Mute reel audio'}
                  title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
                >
                  {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
                </button>
              )}
            </div>

            {/* Main Portrait Video/Image */}
            <div
              className="anvi-story-media-box"
              onClick={() => togglePlayPause()}
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? 'Pause reel' : 'Play reel'}
            >
              {selectedPost.videoUrl ? (
                <video
                  ref={modalVideoRef}
                  src={selectedPost.videoUrl}
                  poster={selectedPost.image}
                  className="anvi-story-full-video"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.alt}
                  className="anvi-story-full-img"
                />
              )}

              {/* Centered Play Indicator on Pause */}
              {!isPlaying && (
                <div className="anvi-story-paused-indicator" aria-hidden="true">
                  <span>▶</span>
                </div>
              )}

              {/* Side Floating Reaction Icons */}
              <div
                className="anvi-story-side-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={`anvi-story-heart-btn ${likedPosts[selectedPost.id] ? 'liked' : ''}`}
                  onClick={(e) => toggleLike(e, selectedPost.id)}
                  aria-label="Like this reel"
                >
                  <span className="anvi-heart-symbol">
                    {likedPosts[selectedPost.id] ? '♥' : '♡'}
                  </span>
                  <span className="anvi-heart-count">
                    {likedPosts[selectedPost.id] ? 'Liked' : selectedPost.likes}
                  </span>
                </button>
              </div>

              {/* Bottom Tagged Product Card & Direct Link */}
              <div
                className="anvi-story-bottom-sheet"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="anvi-story-caption">{selectedPost.caption}</p>

                <div className="anvi-story-audio-line">
                  <span>♫ {selectedPost.audio}</span>
                </div>

                {selectedPost.taggedProduct && (
                  <div className="anvi-story-product-card">
                    <div className="anvi-story-product-details">
                      <span className="anvi-story-product-label">Featured In This Drape</span>
                      <h4 className="anvi-story-product-name">{selectedPost.taggedProduct.name}</h4>
                      <span className="anvi-story-product-price">
                        {formatPrice(selectedPost.taggedProduct.price)}
                      </span>
                    </div>

                    <a
                      href={`/product/${selectedPost.taggedProduct.slug}`}
                      className="anvi-story-shop-btn"
                    >
                      <span>Shop Piece</span>
                      <span>→</span>
                    </a>
                  </div>
                )}

                <a
                  href={selectedPost.url || data.reelsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anvi-story-external-link"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Watch on Instagram @anviclothing_coimbatore</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramGrid;
