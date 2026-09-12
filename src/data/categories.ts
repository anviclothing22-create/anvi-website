export interface Category {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  featured?: boolean;
}

export const categoriesData: Category[] = [
  {
    id: 'cat-sarees',
    name: 'Sarees',
    slug: 'sarees',
    shortDescription: 'Heritage weaves & celebratory silk drapes.',
    image: '/images/categories/sarees.jpg',
    featured: true,
  },
  {
    id: 'cat-salwars',
    name: 'Salwars',
    slug: 'salwars',
    shortDescription: 'Effortless kalidars & everyday elegance.',
    image: '/images/categories/salwars.jpg',
  },
  {
    id: 'cat-coords',
    name: 'Co-ord Sets',
    slug: 'co-ord-sets',
    shortDescription: 'Modern artisanal block-printed pairings.',
    image: '/images/categories/coords.jpg',
  },
  {
    id: 'cat-3piece',
    name: '3-Piece Sets',
    slug: '3-piece-sets',
    shortDescription: 'Zardozi-embroidered festive ensembles.',
    image: '/images/categories/three_piece.jpg',
  },
  {
    id: 'cat-kidswear',
    name: 'Kidswear',
    slug: 'kidswear',
    shortDescription: 'Handcrafted zari pattu pavadai miniatures.',
    image: '/images/categories/kidswear.jpg',
  },
];
