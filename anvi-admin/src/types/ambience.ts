export interface AmbienceImage {
  id: string;
  url?: string;
  caption?: string;
  title?: string;
  imageUrl?: string;
  order?: number;
  displayOrder?: number;
}

export type AmbiencePhoto = AmbienceImage;

export interface StoreAmbience {
  storeName: string;
  headline?: string;
  tagline?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  city?: string;
  visitingHours?: string;
  timings?: string;
  phone: string;
  heroImage?: string;
  mapEmbedUrl?: string;
  description?: string;
  photos?: AmbiencePhoto[];
  galleryImages?: AmbienceImage[];
}

export type StoreAmbienceConfig = StoreAmbience;
