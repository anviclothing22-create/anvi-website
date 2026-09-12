import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Sparkles, Heart, Store, BookOpen, CheckCircle } from 'lucide-react';
import './OurStoryPage.css';

/**
 * ANVI Our Story Page
 * Copywritten with warmth, psychological appeal, and authentic brand voice.
 * Curated with care by Nivetha ✨
 */
export const OurStoryPage: React.FC = () => {
  return (
    <div className="anvi-story-page">
      {/* ========================================================
          1. HERO: WARM EDITORIAL WELCOME
          ======================================================== */}
      <section className="anvi-story-hero" aria-labelledby="story-hero-heading">
        <div className="anvi-story-hero-header">
          <span className="anvi-story-eyebrow">🌸 Welcome to ANVI Clothing · Curated with Care</span>
          <h1 id="story-hero-heading" className="anvi-story-hero-title">
            Handpicked collections destined to become
            <br />
            <em>your wardrobe favourites.</em>
          </h1>
          <p className="anvi-story-hero-subtitle">
            Styles chosen with care for women who love effortless elegance. Combining style,
            comfort, quality, and affordability, we curate pieces you’ll love to wear every day. 🤍✨
          </p>
        </div>

        <div className="anvi-story-hero-image-wrap">
          <img
            src="/images/brand/hero_image.webp"
            alt="ANVI handpicked women's wear and saree collection curated by Nivetha"
            className="anvi-story-hero-img"
          />
        </div>
        <div className="anvi-story-hero-caption">
          Handpicked Favourites for Women &amp; Little Ones · Coimbatore, Tamil Nadu
        </div>
      </section>

      {/* ========================================================
          2. THE SIMPLE THOUGHT (HEARTFELT PHILOSOPHY)
          ======================================================== */}
      <section className="anvi-story-philosophy" aria-label="Brand Philosophy">
        <div className="anvi-story-philosophy-inner">
          <span className="anvi-story-section-tag">A Simple Thought</span>
          <blockquote className="anvi-story-quote">
            &ldquo;ANVI was created with a simple thought — to bring together collections that feel
            beautiful, comfortable, and truly wearable for everyday women and little girls. 🤍&rdquo;
          </blockquote>
          <p className="anvi-story-quote-desc">
            We believe fashion is not just about chasing fleeting trends — it’s about finding
            outfits that make you feel confident, graceful, and happy every single time you wear them. ✨
          </p>
        </div>
      </section>

      {/* ========================================================
          3. THE GROWING JOURNEY: ONLINE DREAM TO OFFLINE STORE
          ======================================================== */}
      <section className="anvi-story-narrative" aria-labelledby="journey-heading">
        <div className="anvi-story-grid">
          <div className="anvi-story-text-col">
            <span className="anvi-story-section-tag">Our Growing Journey</span>
            <h2 id="journey-heading" className="anvi-story-heading">
              What started as a small dream is growing into something even more special.
            </h2>
            <p className="anvi-story-para">
              What began as a genuine passion for curating beautiful outfits started as a carefully
              nurtured online journey. We spent hours listening to what women truly wanted in their
              day-to-day lives: garments that look effortless, breathe naturally, and stay cherished for years.
            </p>
            <p className="anvi-story-para">
              Every piece at ANVI is personally handpicked with love, keeping quality, elegance,
              comfort, and affordability in mind. From timeless sarees to charming kidswear, ANVI is built
              to be a space where every collection feels like a favourite waiting to enter your wardrobe.
            </p>
            <p className="anvi-story-para">
              <strong>And now… we’re excited to bring the real ANVI experience closer to you with our offline store 🛍️</strong>.
              A warm, welcoming boutique space in Coimbatore where you can experience the fabrics, see the vibrant
              colours up close, and find your favourites in person.
            </p>

            <div className="anvi-story-journey-highlights">
              <div className="anvi-story-journey-badge">
                <CheckCircle size={16} />
                <span>Handpicked by Nivetha</span>
              </div>
              <div className="anvi-story-journey-badge">
                <CheckCircle size={16} />
                <span>Quality &amp; Comfort First</span>
              </div>
              <div className="anvi-story-journey-badge">
                <CheckCircle size={16} />
                <span>Coimbatore Offline Store</span>
              </div>
            </div>
          </div>

          <div className="anvi-story-image-col">
            <div className="anvi-story-portrait-wrap">
              <img
                src="/images/brand/store_front.webp"
                alt="ANVI Coimbatore offline boutique store entrance"
                className="anvi-story-portrait-img"
              />
            </div>
            <div className="anvi-story-image-note">
              The ANVI Store · Coimbatore 🛍️
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. THE FOUR PILLARS: WHY PATRONS LOVE ANVI
          ======================================================== */}
      <section className="anvi-story-craft" aria-labelledby="pillars-heading">
        <div className="anvi-story-craft-container">
          <div className="anvi-story-craft-header">
            <span className="anvi-story-section-tag">Quality · Comfort · Affordability</span>
            <h2 id="pillars-heading" className="anvi-story-craft-title">
              Thoughtfully curated for your everyday life.
            </h2>
            <p className="anvi-story-craft-intro">
              At ANVI, we believe every wardrobe deserves pieces that are beautiful, comfortable, and timeless.
              Our collections are thoughtfully handpicked to bring you styles that effortlessly become your everyday favourites.
            </p>
          </div>

          <div className="anvi-story-craft-pillars four-cols">
            <div className="anvi-story-pillar">
              <div className="anvi-story-pillar-num">01</div>
              <h3 className="anvi-story-pillar-title">Handpicked with Love</h3>
              <p className="anvi-story-pillar-text">
                ANVI is more than a clothing store—it’s a collection of handpicked favourites. Every design
                is personally selected with care, chosen as if for our own wardrobe.
              </p>
            </div>

            <div className="anvi-story-pillar">
              <div className="anvi-story-pillar-num">02</div>
              <h3 className="anvi-story-pillar-title">Wearable Comfort</h3>
              <p className="anvi-story-pillar-text">
                We focus on bringing you collections that are not just trendy, but truly wearable and loved for
                years to come. Gentle, breathable fabrics that keep you at ease all day.
              </p>
            </div>

            <div className="anvi-story-pillar">
              <div className="anvi-story-pillar-num">03</div>
              <h3 className="anvi-story-pillar-title">Honest Affordability</h3>
              <p className="anvi-story-pillar-text">
                Looking graceful shouldn&apos;t come with exorbitant markups. We keep quality, comfort, and
                affordability at the heart of everything we do.
              </p>
            </div>

            <div className="anvi-story-pillar">
              <div className="anvi-story-pillar-num">04</div>
              <h3 className="anvi-story-pillar-title">Women &amp; Little Ones</h3>
              <p className="anvi-story-pillar-text">
                From elegant women’s wear to adorable kidswear, our boutique helps women and little ones feel
                confident, joyful, and effortlessly stylish every single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. A HEARTFELT NOTE FROM NIVETHA (FOUNDER CARD)
          ======================================================== */}
      <section className="anvi-story-founder-section" aria-labelledby="founder-letter-heading">
        <div className="anvi-story-founder-card">
          <div className="anvi-story-founder-emblem" aria-hidden="true">
            <Heart size={28} strokeWidth={1.5} />
          </div>
          <span className="anvi-story-founder-eyebrow">A Note from Our Founder</span>
          <h3 id="founder-letter-heading" className="anvi-story-founder-title">
            &ldquo;Thank you for growing with us and supporting our small dream.&rdquo;
          </h3>
          <p className="anvi-story-founder-text">
            ANVI is more than a clothing store—it’s a collection of handpicked favourites, chosen with love for your wardrobe.
            Whether you joined us on our online journey or walked through the doors of our offline store,
            thank you for being a part of this journey. Every single smile when you wear ANVI means the world to us. 🤍
          </p>
          <div className="anvi-story-founder-signature">
            <span className="founder-sign-name">Curated with care by Nivetha. ✨</span>
            <span className="founder-sign-role">Founder &amp; Curator, ANVI Clothing</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. OFFLINE STORE ANNOUNCEMENT CARD
          ======================================================== */}
      <section className="anvi-story-offline-strip" aria-labelledby="offline-store-heading">
        <div className="anvi-story-offline-card">
          <div className="anvi-story-offline-icon" aria-hidden="true">
            <Store size={26} strokeWidth={1.5} />
          </div>
          <div className="anvi-story-offline-info">
            <span className="anvi-story-offline-tag">Now Open in Coimbatore 🛍️</span>
            <h3 id="offline-store-heading" className="anvi-story-offline-title">
              Experience ANVI in Person at Our Offline Store
            </h3>
            <p className="anvi-story-offline-desc">
              Step in to feel our premium handloom textures, explore the newest handpicked arrivals,
              and find your perfect fit with warm, personalized assistance.
            </p>
          </div>
          <div className="anvi-story-offline-actions">
            <Link href="/contact" className="anvi-story-offline-btn">
              <span>Visit Our Store</span>
              <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. EDITORIAL BRIDGE: INVITE TO THE JOURNAL
          ======================================================== */}
      <section className="anvi-story-journal-bridge" aria-labelledby="journal-bridge-heading">
        <div className="anvi-story-journal-bridge-card">
          <div className="anvi-story-journal-bridge-icon">
            <BookOpen size={24} strokeWidth={1.5} />
          </div>
          <div className="anvi-story-journal-bridge-text">
            <span className="anvi-story-journal-bridge-tag">The Craft Gazette · Issue No. 08</span>
            <h3 id="journal-bridge-heading" className="anvi-story-journal-bridge-title">
              Looking for our textile chronicles &amp; styling guides?
            </h3>
            <p className="anvi-story-journal-bridge-desc">
              Explore <em>The ANVI Journal</em> for in-depth stories on craft origins, mindful handloom care,
              and unhurried draping rituals.
            </p>
          </div>
          <Link href="/journal" className="anvi-story-journal-bridge-btn">
            <span>Read The Journal</span>
            <ArrowRight size={15} style={{ marginLeft: 6 }} />
          </Link>
        </div>
      </section>

      {/* ========================================================
          8. CLOSING BANNER & SHOPPING INVITATION
          ======================================================== */}
      <section className="anvi-story-closing" aria-labelledby="closing-heading">
        <img
          src="/images/campaigns/everyday_elevated.jpg"
          alt="ANVI everyday elevated collection editorial mood"
          className="anvi-story-closing-bg"
        />

        <div className="anvi-story-closing-content">
          <span className="anvi-story-closing-eyebrow">
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Welcome to ANVI Clothing
          </span>
          <h2 id="closing-heading" className="anvi-story-closing-title">
            Find your next wardrobe favourite.
          </h2>
          <p className="anvi-story-closing-desc">
            Combining style, comfort, quality, and affordability, we curate pieces you’ll love to wear every day. 🤍✨
          </p>

          <div className="anvi-story-closing-actions">
            <Link href="/shop/sarees" className="anvi-story-primary-cta">
              <span>Explore Handpicked Sarees</span>
              <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </Link>
            <Link href="/shop" className="anvi-story-secondary-cta">
              Discover All Collections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStoryPage;
