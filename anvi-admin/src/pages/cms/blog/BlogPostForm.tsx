import React, { useState } from 'react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { BlogPost } from '@/types/blog';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { BlogPostEditor } from './BlogPostEditor';

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>;
  onSubmit: (data: Omit<BlogPost, 'id'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Publish Article',
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [author, setAuthor] = useState(initialData?.author || 'Nivetha & ANVI Curators');
  const [readTime, setReadTime] = useState(initialData?.readTime || '4 min read');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      readTime,
      isPublished,
      publishedAt: initialData?.publishedAt || new Date().toISOString(),
      tags: initialData?.tags || ['craftsmanship', 'heritage'],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Article Headline" required>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. The Living Heritage of Ajrakh: Ancient Vegetable Dye Traditions"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="URL Slug" required>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="heritage-of-ajrakh"
            required
          />
        </FormField>

        <FormField label="Author" required>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ImagePicker
            label="Cover Editorial Imagery"
            value={coverImage}
            onChange={setCoverImage}
            required
            bucket="blog-images"
            helpText="Upload a picture from your device or paste an image URL."
          />
        </div>

        <div>
          <FormField label="Estimated Reading Time">
            <Input
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="e.g. 5 min read"
            />
          </FormField>
        </div>
      </div>

      <FormField label="Short Teaser / Excerpt" required>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A brief 1-2 sentence lead summary appearing on preview cards..."
          rows={2}
          required
        />
      </FormField>

      <BlogPostEditor content={content} onChange={setContent} />

      <div className="pt-2">
        <Switch
          checked={isPublished}
          onChange={setIsPublished}
          label="Publish to Customer Storefront Journal"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-anvi-sand/40">
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
export default BlogPostForm;
