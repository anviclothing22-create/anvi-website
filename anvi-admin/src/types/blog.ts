export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  readTime: string;
  isPublished: boolean;
  publishedDate?: string;
  publishedAt?: string;
  taggedProduct?: string;
  tags?: string[];
}
