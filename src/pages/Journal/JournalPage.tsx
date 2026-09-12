import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { journalArticles as staticArticles, journalCategories, type JournalArticle } from '../../data/journal';
import { getBlogPosts } from '../../lib/cmsApi';
import { formatPrice } from '../../lib/formatters';
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles, X, Share2, Check } from 'lucide-react';
import './JournalPage.css';

export const JournalPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/journal/:slug');
  const [activeCategory, setActiveCategory] = useState<string>('All Chronicles');
  // Live journal with bundled fallback
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>(staticArticles);

  useEffect(() => {
    let cancelled = false;
    void getBlogPosts()
      .then((posts) => {
        if (!cancelled && posts.length > 0) setJournalArticles(posts);
      })
      .catch(() => {
        // static fallback already rendered
      });
    return () => {
      cancelled = true;
    };
  }, []);
  // Derive selected article from route slug or manual click
  const routeArticle = match && params?.slug
    ? journalArticles.find((a) => a.slug === params.slug) || null
    : null;

  const [activeArticleState, setActiveArticleState] = useState<JournalArticle | null>(null);
  const selectedArticle = routeArticle || activeArticleState;

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSuccess, setNewsletterSuccess] = useState<boolean>(false);

  // Lock body scroll when reading modal is open
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArticle]);

  // Handle article selection
  const openArticle = (article: JournalArticle) => {
    setActiveArticleState(article);
    window.history.pushState(null, '', `/journal/${article.slug}`);
  };

  const closeArticle = () => {
    setActiveArticleState(null);
    window.history.pushState(null, '', '/journal');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }
  };

  // Filter articles by category
  const filteredArticles = activeCategory === 'All Chronicles'
    ? journalArticles
    : journalArticles.filter((a) => a.category === activeCategory);

  // Lead cover story is the first article
  const leadCoverStory = journalArticles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== leadCoverStory.id || activeCategory !== 'All Chronicles');

  return (
    <div className="anvi-journal-page" role="main">
      {/* ========================================================
          1. EDITORIAL GAZETTE MASTHEAD
          ======================================================== */}
      <header className="anvi-journal-masthead">
        <div className="anvi-journal-container">
          <div className="anvi-masthead-meta-bar">
            <span className="anvi-meta-issue">The Craft Gazette · Issue No. 08</span>
            <span className="anvi-meta-location">Coimbatore Studio, Tamil Nadu</span>
            <span className="anvi-meta-motto">Slow Textiles · Living Provenance</span>
          </div>

          <div className="anvi-masthead-title-wrap">
            <span className="anvi-masthead-kicker">Publications & Chronicles</span>
            <h1 className="anvi-masthead-title">The ANVI Journal</h1>
            <p className="anvi-masthead-subtitle">
              Essays on living handlooms, unhurried draping rituals, textile ecology, and the hands that weave them.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <nav className="anvi-journal-category-nav" aria-label="Journal Categories">
            <div className="anvi-journal-category-scroll">
              {journalCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`anvi-journal-category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* ========================================================
          2. LEAD COVER STORY FEATURE (When viewing All Chronicles)
          ======================================================== */}
      {activeCategory === 'All Chronicles' && leadCoverStory && (
        <section className="anvi-journal-cover-section" aria-label="Featured Cover Story">
          <div className="anvi-journal-container">
            <article
              className="anvi-journal-cover-card"
              onClick={() => openArticle(leadCoverStory)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openArticle(leadCoverStory)}
              aria-label={`Read cover feature: ${leadCoverStory.title}`}
            >
              <div className="anvi-cover-media-wrap">
                <img
                  src={leadCoverStory.image}
                  alt={leadCoverStory.alt}
                  className="anvi-cover-media-img"
                  loading="eager"
                />
                <span className="anvi-cover-badge">
                  <Sparkles size={11} aria-hidden="true" />
                  <span>Cover Story</span>
                </span>
              </div>

              <div className="anvi-cover-content">
                <div className="anvi-cover-meta-row">
                  <span className="anvi-article-category-tag">{leadCoverStory.category}</span>
                  <span className="anvi-article-dot" aria-hidden="true">·</span>
                  <span className="anvi-article-readtime">
                    <Clock size={12} aria-hidden="true" />
                    {leadCoverStory.readTime}
                  </span>
                  <span className="anvi-article-dot" aria-hidden="true">·</span>
                  <span className="anvi-article-date">
                    <Calendar size={12} aria-hidden="true" />
                    {leadCoverStory.date}
                  </span>
                </div>

                <h2 className="anvi-cover-heading">{leadCoverStory.title}</h2>
                <p className="anvi-cover-subtitle">{leadCoverStory.subtitle}</p>
                <p className="anvi-cover-excerpt">{leadCoverStory.excerpt}</p>

                <div className="anvi-cover-footer">
                  <div className="anvi-article-author-info">
                    <span className="anvi-author-name">{leadCoverStory.author.name}</span>
                    <span className="anvi-author-role">{leadCoverStory.author.role}</span>
                  </div>

                  <span className="anvi-cover-read-cta">
                    <span>Read Chronicle</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ========================================================
          3. EDITORIAL ARTICLES MAGAZINE GRID
          ======================================================== */}
      <section className="anvi-journal-grid-section" aria-label="Journal Articles">
        <div className="anvi-journal-container">
          <div className="anvi-journal-section-heading-bar">
            <h2 className="anvi-journal-section-title">
              {activeCategory === 'All Chronicles' ? 'Recent Chronicles' : activeCategory}
            </h2>
            <span className="anvi-journal-count">
              Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'Dispatch' : 'Dispatches'}
            </span>
          </div>

          <div className="anvi-journal-articles-grid">
            {(activeCategory === 'All Chronicles' ? regularArticles : filteredArticles).map((article) => (
              <article
                key={article.id}
                className="anvi-journal-card"
                onClick={() => openArticle(article)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openArticle(article)}
                aria-label={`Read ${article.title}`}
              >
                <div className="anvi-card-media-box">
                  <img
                    src={article.image}
                    alt={article.alt}
                    className="anvi-card-img"
                    loading="lazy"
                  />
                  <span className="anvi-card-category-pill">{article.category}</span>
                </div>

                <div className="anvi-card-body">
                  <div className="anvi-card-meta-line">
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="anvi-card-title">{article.title}</h3>
                  <p className="anvi-card-excerpt">{article.excerpt}</p>

                  <div className="anvi-card-footer">
                    <span className="anvi-card-author">{article.author.name}</span>
                    <span className="anvi-card-link-arrow">
                      <span>Read</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. "THE WEAVER'S VOICE" STUDIO SPOTLIGHT CALLOUT
          ======================================================== */}
      <section className="anvi-journal-quote-section" aria-label="Artisan Voice">
        <div className="anvi-journal-container">
          <div className="anvi-journal-quote-card">
            <span className="anvi-quote-eyebrow">The Master Weaver's Voice · Sivanadha Colony</span>
            <blockquote className="anvi-journal-blockquote">
              &ldquo;A power loom produces six meters in ten minutes; a human hands loom produces six inches.
              In those six inches live human breath, heartbeat, and an unbroken thread of memory.&rdquo;
            </blockquote>
            <cite className="anvi-journal-cite">
              — Ustad Ramanathan, Master Handloom Craftsman, Coimbatore
            </cite>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. PRINTED GAZETTE SUBSCRIPTION BANNER
          ======================================================== */}
      <section className="anvi-journal-newsletter-section" aria-label="Journal Newsletter">
        <div className="anvi-journal-container">
          <div className="anvi-journal-newsletter-box">
            <div className="anvi-newsletter-content">
              <span className="anvi-newsletter-badge">The Print Edition</span>
              <h2 className="anvi-newsletter-heading">Receive the ANVI Biannual Print Gazette</h2>
              <p className="anvi-newsletter-desc">
                Printed on unbleached textured paper in Coimbatore. Essays on textile geography,
                seasonal studio lookbooks, and invitations to intimate trunk shows.
              </p>
            </div>

            <form className="anvi-newsletter-form" onSubmit={handleNewsletterSubmit}>
              {newsletterSuccess ? (
                <div className="anvi-newsletter-success-msg">
                  <Check size={16} aria-hidden="true" />
                  <span>Thank you. Your maiden issue will arrive at the next solstice.</span>
                </div>
              ) : (
                <div className="anvi-newsletter-input-wrap">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="anvi-newsletter-input"
                    aria-label="Email address for print gazette"
                  />
                  <button type="submit" className="anvi-newsletter-submit-btn">
                    Subscribe
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. INTERACTIVE LONG-FORM ARTICLE READER MODAL / DRAWER
          ======================================================== */}
      {selectedArticle && (
        <div
          className="anvi-reader-backdrop"
          onClick={closeArticle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reader-article-title"
        >
          <article
            className="anvi-reader-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Actions */}
            <div className="anvi-reader-toolbar">
              <div className="anvi-reader-toolbar-left">
                <span className="anvi-reader-issue-tag">{selectedArticle.issue}</span>
                <span className="anvi-reader-category-tag">{selectedArticle.category}</span>
              </div>

              <div className="anvi-reader-toolbar-right">
                <button
                  type="button"
                  className="anvi-reader-action-btn"
                  onClick={handleShare}
                  aria-label="Share article"
                  title="Copy article link"
                >
                  {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  className="anvi-reader-close-btn"
                  onClick={closeArticle}
                  aria-label="Close article reader"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Article Body */}
            <div className="anvi-reader-body">
              {/* Header Headline */}
              <header className="anvi-reader-header">
                <div className="anvi-reader-meta-row">
                  <span>{selectedArticle.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
                <h1 id="reader-article-title" className="anvi-reader-title">
                  {selectedArticle.title}
                </h1>
                <p className="anvi-reader-subtitle">{selectedArticle.subtitle}</p>

                <div className="anvi-reader-author-bar">
                  <div className="anvi-reader-avatar">
                    <span>{selectedArticle.author.name.charAt(0)}</span>
                  </div>
                  <div>
                    <strong className="anvi-reader-author-name">{selectedArticle.author.name}</strong>
                    <span className="anvi-reader-author-role">{selectedArticle.author.role}</span>
                  </div>
                </div>
              </header>

              {/* Lead Image */}
              <div className="anvi-reader-hero-media">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.alt}
                  className="anvi-reader-hero-img"
                />
                <span className="anvi-reader-image-caption">{selectedArticle.alt}</span>
              </div>

              {/* Editorial Text Flow */}
              <div className="anvi-reader-prose">
                <p className="anvi-reader-lead-paragraph">{selectedArticle.content.intro}</p>

                {selectedArticle.content.paragraphs.map((para, i) => (
                  <p key={i} className="anvi-reader-paragraph">
                    {para}
                  </p>
                ))}

                {/* Callout Pull-Quote */}
                {selectedArticle.content.pullQuote && (
                  <blockquote className="anvi-reader-pull-quote">
                    <p>&ldquo;{selectedArticle.content.pullQuote}&rdquo;</p>
                    {selectedArticle.content.pullQuoteAuthor && (
                      <cite>{selectedArticle.content.pullQuoteAuthor}</cite>
                    )}
                  </blockquote>
                )}

                {/* Craft Notes & Takeaways */}
                {selectedArticle.content.takeaways && (
                  <div className="anvi-reader-takeaways-card">
                    <h4 className="anvi-takeaways-title">
                      <BookOpen size={16} aria-hidden="true" />
                      <span>Studio Craft Notes</span>
                    </h4>
                    <ul className="anvi-takeaways-list">
                      {selectedArticle.content.takeaways.map((point, idx) => (
                        <li key={idx}>
                          <span className="anvi-takeaway-bullet">✦</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Featured In This Chronicle Garment */}
                {selectedArticle.featuredProduct && (
                  <div className="anvi-reader-product-card">
                    <div className="anvi-reader-product-thumb-wrap">
                      <img
                        src={selectedArticle.featuredProduct.image}
                        alt={selectedArticle.featuredProduct.name}
                        className="anvi-reader-product-thumb"
                      />
                    </div>
                    <div className="anvi-reader-product-details">
                      <span className="anvi-reader-product-badge">Featured In This Chronicle</span>
                      <h4 className="anvi-reader-product-name">
                        {selectedArticle.featuredProduct.name}
                      </h4>
                      <span className="anvi-reader-product-price">
                        {formatPrice(selectedArticle.featuredProduct.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="anvi-reader-product-cta"
                      onClick={() => {
                        closeArticle();
                        setLocation(`/product/${selectedArticle.featuredProduct?.slug}`);
                      }}
                    >
                      <span>Shop Piece</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Reader Footer Navigation */}
              <footer className="anvi-reader-footer">
                <button
                  type="button"
                  className="anvi-reader-back-btn"
                  onClick={closeArticle}
                >
                  ← Back to All Chronicles
                </button>
              </footer>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
