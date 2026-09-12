import React from 'react';
import { Hero } from '../components/sections/Hero';
import { ShopByCategory } from '../components/sections/ShopByCategory';
import { Bestsellers } from '../components/sections/Bestsellers';
import { WhyAnvi } from '../components/sections/WhyAnvi';
import { CustomerReviews } from '../components/sections/CustomerReviews';
import { FinalConversion } from '../components/sections/FinalConversion';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { WhatsAppFloat } from '../components/ui/WhatsAppFloat';

/**
 * ANVI Homepage
 * Complete luxury editorial composition:
 * 1. Hero Campaign Banner
 * 2. Category Discovery (Find Your Anvi)
 * 3. Bestsellers Showcase
 * 4. Why Women Choose ANVI (Core Boutique Principles)
 * 5. Customer Reviews (Loved by Women Like You)
 * 6. Final Conversion (Find something that feels like you)
 * 7. Instagram Community Rail (@anviclothing_coimbatore)
 * 8. Corner WhatsApp Boutique Concierge Widget
 */
export const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <Bestsellers />
      <WhyAnvi />
      <CustomerReviews />
      <FinalConversion />
      <InstagramGrid />
      <WhatsAppFloat />
    </>
  );
};

export default HomePage;
