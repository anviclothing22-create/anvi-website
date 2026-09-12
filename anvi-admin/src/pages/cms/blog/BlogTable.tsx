import React from 'react';
import { BlogPost } from '@/types/blog';
import { formatDate } from '@/lib/formatDate';
import { BlogPostActions } from './BlogPostActions';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface BlogTableProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, published: boolean) => void;
}

export const BlogTable: React.FC<BlogTableProps> = ({
  posts,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
          <tr>
            <th className="py-3.5 px-4 text-left">Article & Cover</th>
            <th className="py-3.5 px-4 text-left">Author</th>
            <th className="py-3.5 px-4 text-left">Read Time</th>
            <th className="py-3.5 px-4 text-left">Published Date</th>
            <th className="py-3.5 px-4 text-left">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-anvi-sand/20">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-anvi-linen/30 transition-colors">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border border-anvi-sand/60 bg-stone-50 shrink-0">
                    <ImagePreview
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-serif font-bold text-xs text-anvi-charcoal line-clamp-1">{post.title}</p>
                    <p className="text-[11px] text-anvi-muted line-clamp-1">{post.excerpt}</p>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4 text-xs text-anvi-charcoal font-medium">
                {post.author}
              </td>

              <td className="py-3.5 px-4 text-xs text-anvi-muted font-mono">
                {post.readTime}
              </td>

              <td className="py-3.5 px-4 text-xs text-anvi-muted">
                {formatDate(post.publishedAt || post.publishedDate || '')}
              </td>

              <td className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => onToggleStatus(post.id, post.isPublished)}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    post.isPublished
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {post.isPublished ? 'Live' : 'Draft'}
                </button>
              </td>

              <td className="py-3.5 px-4 text-right">
                <BlogPostActions
                  post={post}
                  onEdit={() => onEdit(post)}
                  onDelete={() => onDelete(post.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BlogTable;
