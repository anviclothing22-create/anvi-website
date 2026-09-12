/**
 * ANVI JOURNAL DATA — The Craft Gazette & Style Chronicles
 * An ongoing literary and visual publication covering handloom provenance,
 * draping masterclasses, weaver interviews, and heirloom textile preservation.
 */

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'Craft Provenance' | 'Drape & Styling' | 'Weavers of India' | 'Care & Heirlooms' | 'Studio Life';
  readTime: string;
  date: string;
  issue: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  image: string;
  alt: string;
  excerpt: string;
  content: {
    intro: string;
    paragraphs: string[];
    pullQuote?: string;
    pullQuoteAuthor?: string;
    takeaways?: string[];
  };
  featuredProduct?: {
    name: string;
    price: number;
    slug: string;
    image: string;
  };
}

export const journalCategories = [
  'All Chronicles',
  'Craft Provenance',
  'Drape & Styling',
  'Weavers of India',
  'Care & Heirlooms',
  'Studio Life',
] as const;

export const journalArticles: JournalArticle[] = [
  {
    id: 'journal-1',
    slug: 'the-living-indigo-alchemy',
    title: 'The Living Indigo: 14 Days Under the Southern Sun',
    subtitle: 'Why naturally fermented indigo leaves breathe with your body, while synthetic dye sits on the surface.',
    category: 'Craft Provenance',
    readTime: '6 min read',
    date: 'August 24, 2026',
    issue: 'Issue No. 08',
    author: {
      name: 'Nivetha R.',
      role: 'Founder & Creative Director',
    },
    image: '/images/campaigns/everyday_elevated.jpg',
    alt: 'Indigo natural vat dyeing process at the artisan cooperative',
    excerpt:
      'True indigo is not a pigment you dissolve; it is a biological organism that sleeps at night, breathes oxygen in the dawn air, and settles into organic cotton with an unshakeable bond.',
    content: {
      intro:
        'Step into the vat house of our artisan cluster in Tamil Nadu at 5:00 AM, and the first thing you perceive is not sight, but smell: sweet, fermented molasses, crushed leaves, and mineral-rich river water.',
      paragraphs: [
        'Unlike modern petroleum-based chemical dyes that coat the textile fibers like plastic film, natural indigo requires fourteen days of active fermentation with jaggery, lime, and wild herbs. When raw organic cotton yarn is plunged into the deep blue depths, it emerges completely green. Only as it meets the air does oxidation work its miraculous alchemy, shifting from leaf-green to turquoise, and finally to deep midnight ocean blue.',
        'This chemical-free cellular bond means the garment softens with each monsoon wash. It conforms to the contours of your shoulders, develops a gentle vintage patina, and carries natural antibacterial properties recognized across centuries of Indian wellness wisdom.',
        'At ANVI, every meter of our indigo co-ord collection is dipped by hand at least six times. We accept the subtle variations in hue between morning batches and afternoon sunshine—because perfection is industrial, but depth is human.',
      ],
      pullQuote:
        'Indigo is not a color; it is a living conversation between plant enzyme, river silt, and the artisan’s patience.',
      pullQuoteAuthor: '— Master Dyer Ramanathan, Coimbatore Cluster',
      takeaways: [
        'Fermented naturally with wild herbs and jaggery over 14 days',
        'Imparts natural cooling and hypoallergenic properties against sensitive skin',
        'Develops an emotional patina unique to how you live and wash it',
      ],
    },
    featuredProduct: {
      name: 'Indigo Kalamkari Co-ord Set',
      price: 2850,
      slug: 'indigo-kalamkari-co-ord-set',
      image: '/images/products/coord_indigo_1.jpg',
    },
  },
  {
    id: 'journal-2',
    slug: 'the-modern-drape-styling-guide',
    title: 'The Unhurried Drape: Wearing Heirlooms Beyond Ceremonies',
    subtitle: 'A quiet rebellion against saving your finest silks solely for weddings that come once a year.',
    category: 'Drape & Styling',
    readTime: '4 min read',
    date: 'July 18, 2026',
    issue: 'Issue No. 08',
    author: {
      name: 'Priyanka Sundaram',
      role: 'Styling & Wardrobe Editor',
    },
    image: '/images/hero/anvi_saree_hero.jpg',
    alt: 'Modern saree drape with unstructured linen blouse',
    excerpt:
      'The greatest tragedy of Indian handloom is the cedar trunk. Handloom silks were engineered to be kissed by human warmth and daily movement, not kept under locks.',
    content: {
      intro:
        'Generations of Indian women wore pure silk sarees to teach classes, stir boiling cardamom chai, write ledgers, and tend courtyards. Somewhere in the late twentieth century, we relegated our grandest textiles to bank lockers.',
      paragraphs: [
        'To style a Kanjeevaram or Chanderi silk for an impromptu Sunday lunch or an evening gallery opening requires unlearning theatrical stiffness. Pair a richly bordered silk saree with an unstructured, boxy raw linen shirt instead of an ornate blouse. Leave the pallu loosely tucked around your forearm without safety pins every two inches.',
        'Consider footwear: clean leather kolhapuris or minimalist terracotta mules immediately ground the look, transforming antique gold zari from opulent ballroom costume into relaxed everyday luxury.',
        'When your clothes have room to breathe, so do you. The drape reflects poise rather than performance.',
      ],
      pullQuote:
        'Elegance is never about dressing up for other people; it is the physical pleasure of wearing poetry against your own skin.',
      pullQuoteAuthor: '— The ANVI Styling Manifesto',
      takeaways: [
        'Swap heavy embroidery blouses with relaxed linen or ribbed knit tunics',
        'Avoid over-pinning pleats to allow natural movement and soft silken folds',
        'Ground ceremonial fabrics with unpolished silver and artisanal leather flats',
      ],
    },
    featuredProduct: {
      name: 'Kanjeevaram Antique Zari Saree',
      price: 12500,
      slug: 'kanjeevaram-antique-zari-silk-saree',
      image: '/images/campaigns/festive_campaign_main.jpg',
    },
  },
  {
    id: 'journal-3',
    slug: 'ajrakh-sixteen-stages-of-mud-resist',
    title: 'Mud, River & Starlight: The 16 Rites of Authentic Ajrakh',
    subtitle: 'From hard teak block carving to midnight alum washing—the sacred cadence of desert artisans.',
    category: 'Weavers of India',
    readTime: '8 min read',
    date: 'June 30, 2026',
    issue: 'Issue No. 07',
    author: {
      name: 'Nivetha R.',
      role: 'Founder & Creative Director',
    },
    image: '/images/products/saree_ajrakh_1.jpg',
    alt: 'Master artisan pressing carved teakwood block with natural resist paste',
    excerpt:
      'Ajrakh takes its name from "Aaj Rakh"—literally "keep it today, proceed tomorrow." Time is not an obstacle in this craft; it is the primary ingredient.',
    content: {
      intro:
        'The desert wind carries the scent of wild babool gum and iron rust. In a craft that dates back over four millennia to the Indus Valley civilization, nothing can be hurried without catastrophic collapse.',
      paragraphs: [
        'Each piece of ANVI Ajrakh Chanderi passes through sixteen distinct artisanal stages. First comes Saaji, scouring the raw fabric with castor oil and camel dung to open the cotton pores. Then Harde, tanning the cloth with yellow myrobalan nut wash.',
        'The printer uses a hand-carved teak block dipped in Kiryana (lime and Arabic gum paste) to resist-print the geometric astronomy patterns. The rhythmic thud of the palm striking wood echoes across the courtyard: "Dhak, dhak, dhak."',
        'Between dips into madder root and indigo cauldrons, the fabric is laid out across the baking sand beneath the stars. The mineral dew of morning seals the red and blue borders with permanent resonance.',
      ],
      pullQuote:
        'If a printer rushes by an hour, the mud cracks and the stars blur. The craft teaches you that what is worth keeping takes days.',
      pullQuoteAuthor: '— Ustad Khatri, Block Print Master',
      takeaways: [
        'Uses 100% natural vegetable pigments: wild madder, tamarind seed, and iron slag',
        'Sixteen specialized steps requiring up to 21 days per single drape',
        'Hand-carved seasoned teak blocks that align with millimeter precision',
      ],
    },
    featuredProduct: {
      name: 'Ajrakh Chanderi Silk Saree',
      price: 4850,
      slug: 'ajrakh-chanderi-silk-saree',
      image: '/images/products/saree_ajrakh_2.jpg',
    },
  },
  {
    id: 'journal-4',
    slug: 'heirloom-care-and-preservation-guide',
    title: 'The Heirloom Ritual: Caring for Pure Silks and Antique Zari',
    subtitle: 'How to ensure your grandmother’s drapes retain their shimmer for your own daughters.',
    category: 'Care & Heirlooms',
    readTime: '5 min read',
    date: 'May 12, 2026',
    issue: 'Issue No. 06',
    author: {
      name: 'Malarvizhi K.',
      role: 'Studio Textile Archivist',
    },
    image: '/images/occasions/occasion_premium.jpg',
    alt: 'Delicate care and folding of pure gold zari silk saree in muslin wrap',
    excerpt:
      'True silk is like good wine or seasoned teakwood: with mindful storage, it grows softer, more pliable, and infinitely more precious with each passing decade.',
    content: {
      intro:
        'We frequently meet patrons who bring sarees woven half a century ago into our Coimbatore boutique. The fabric is intact, glowing, and structurally supple. Their secret is not expensive dry cleaning—it is gentle, ancient home ritual.',
      paragraphs: [
        'Never wrap pure silk sarees in plastic covers. Plastic traps ambient humidity, attracting moth larvae and causing silver and gold zari to tarnish from enclosed moisture. Always wrap sarees in unbleached mulmul (muslin) cloth.',
        'Refold your silks every six months. Silks that lie folded in the exact same crease for years experience stress fractures along the fold lines. Changing the folds allows the warp threads to relax.',
        'Sunlight is medicine in moderation. Once a year, air your sarees in gentle morning sunlight for fifteen minutes before 8:00 AM, then let them cool in the shade before returning them to your wardrobe.',
      ],
      pullQuote:
        'Clothes made by human hands possess memory. If you treat them gently, they will outlive you.',
      pullQuoteAuthor: '— Malarvizhi K., Textile Archivist',
      takeaways: [
        'Store exclusively in breathable cotton or unbleached muslin wraps',
        'Change the fold creases every six months to prevent stress tears',
        'Avoid direct perfume sprays; perfume alcohol tarnishes pure silver zari',
      ],
    },
    featuredProduct: {
      name: 'Ivory Hand-Embroidered Suit Set',
      price: 4200,
      slug: 'ivory-hand-embroidered-suit-set',
      image: '/images/products/set_ivory_1.jpg',
    },
  },
  {
    id: 'journal-5',
    slug: 'coimbatore-studio-morning-chronicles',
    title: 'Studio Notes: Architecture, Light & The Coimbatore Afternoon',
    subtitle: 'A sensory walk through our Tatabad studio sanctuary where ideas turn into tactile reality.',
    category: 'Studio Life',
    readTime: '4 min read',
    date: 'April 04, 2026',
    issue: 'Issue No. 05',
    author: {
      name: 'Nivetha R.',
      role: 'Founder & Creative Director',
    },
    image: '/images/brand/store_front.webp',
    alt: 'The serene courtyard entrance of ANVI flagship boutique in Coimbatore',
    excerpt:
      'We deliberately designed our boutique with high ceilings, lime-plastered walls, and courtyard light. You cannot choose a drape under artificial fluorescent glare.',
    content: {
      intro:
        'The morning starts at 9:30 AM with the unbolting of our vintage rosewood doors. Filtered sunlight cuts across brass bowls filled with freshly plucked jasmine.',
      paragraphs: [
        'Most modern clothing retail is designed to disorient you: loud music, blinding spotlights, mirrors tilted to flatter artificial silhouettes. We built the ANVI Coimbatore studio as the exact antithesis.',
        'Here, there is silence except for the gentle rustle of silk tissue. Tea is poured in handmade clay tumblers. Clients sit cross-legged on hand-knotted dhurries while our drapers unfold twenty sarees without once checking the clock.',
        'Because when you are selecting a garment that took three weeks on a pit loom to emerge from warp and weft, an extra twenty minutes of unhurried contemplation is the least we can offer.',
      ],
      pullQuote:
        'A boutique should not be a transaction counter. It should be a pause button in an overcrowded world.',
      pullQuoteAuthor: '— ANVI Coimbatore Studio Note',
      takeaways: [
        'Natural daylight fitting rooms designed to reveal honest textile colors',
        'Bespoke tailoring and measurement consultations available by appointment',
        'An open tea corner for slow, thoughtful styling conversations',
      ],
    },
    featuredProduct: {
      name: 'Bagru Handblock Salwar Suit',
      price: 3450,
      slug: 'bagru-handblock-salwar-suit',
      image: '/images/products/salwar_bagru_1.jpg',
    },
  },
];
