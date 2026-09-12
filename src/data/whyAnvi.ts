/**
 * ANVI CLOTHING — WHY ANVI (THE BOUTIQUE PRINCIPLES)
 * Heading: WHY WOMEN CHOOSE ANVI
 * Focus: High-trust, boutique intimacy, editorial typography, zero corporate bloat.
 */

export interface WhyAnviPrinciple {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface WhyAnviData {
  eyebrow: string;
  heading: string;
  subtext: string;
  principles: WhyAnviPrinciple[];
}

export const whyAnviData: WhyAnviData = {
  eyebrow: 'THE BOUTIQUE PROMISE',
  heading: 'WHY WOMEN CHOOSE ANVI',
  subtext: 'A quiet dedication to craftsmanship, comfort, and personal care in every thread.',
  principles: [
    {
      id: 'principle-1',
      number: '01',
      title: 'Thoughtfully Selected',
      description: 'Quality, comfort and design.',
    },
    {
      id: 'principle-2',
      number: '02',
      title: 'Made for Real Life',
      description: 'Styles designed to belong in your wardrobe.',
    },
    {
      id: 'principle-3',
      number: '03',
      title: 'Personal Service',
      description: 'A boutique experience online and offline.',
    },
    {
      id: 'principle-4',
      number: '04',
      title: 'Carefully Delivered',
      description: 'Every order packed with attention to detail.',
    },
  ],
};
