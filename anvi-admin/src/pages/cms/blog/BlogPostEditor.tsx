import React from 'react';
import { Textarea } from '@/components/ui/Textarea';

interface BlogPostEditorProps {
  content: string;
  onChange: (val: string) => void;
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-anvi-muted">
        <label className="font-semibold uppercase tracking-wider text-[11px] text-anvi-charcoal">
          Article Body (Supports Markdown)
        </label>
        <span>Supports headings, bullet points, and quotes</span>
      </div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Craft your editorial narrative detailing artisan traditions, fabric weaves, and styling advice..."
        rows={10}
        className="font-mono text-xs leading-relaxed"
        required
      />
    </div>
  );
};
export default BlogPostEditor;
