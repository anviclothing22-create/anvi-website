import React from 'react';
import type { AdminReview } from '@/types/review';
import { Star, MapPin, CheckCircle2, Edit3, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReviewCardProps {
  review: AdminReview;
  onEdit: (review: AdminReview) => void;
  onDelete: (id: string) => void;
  onToggleApproval: (id: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onToggleApproval,
}) => {
  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
        review.isApproved
          ? 'bg-white border-anvi-sand/70 hover:border-anvi-gold/60 shadow-luxury-subtle hover:shadow-luxury-card'
          : 'bg-anvi-linen/30 border-dashed border-gray-300 opacity-80'
      }`}
    >
      <div>
        {/* Header: Stars + Status badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
            <span className="text-xs font-semibold text-anvi-charcoal ml-1">
              {review.rating}.0
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {review.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                review.isApproved
                  ? 'bg-anvi-maroon/10 text-anvi-maroon border border-anvi-maroon/20'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {review.isApproved ? 'Live on Store' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* Title if provided */}
        {review.title && (
          <h4 className="font-serif text-sm font-bold text-anvi-charcoal mb-1 line-clamp-1">
            {review.title}
          </h4>
        )}

        {/* Body review text */}
        <blockquote className="text-xs text-anvi-charcoal/80 leading-relaxed italic mb-4 line-clamp-4">
          “{review.body}”
        </blockquote>
      </div>

      {/* Reviewer details & footer */}
      <div>
        <div className="pt-3 border-t border-anvi-sand/40 space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-anvi-charcoal">{review.reviewerName}</span>
            {review.createdAt && (
              <span className="text-[11px] text-anvi-muted">
                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {review.reviewerLocation && (
            <div className="flex items-center gap-1 text-[11px] text-anvi-muted">
              <MapPin className="w-3 h-3 text-anvi-sand" />
              <span>{review.reviewerLocation}</span>
            </div>
          )}

          {review.purchasedProductName && (
            <div className="flex items-center gap-1 text-[11px] text-anvi-maroon font-medium">
              <Tag className="w-3 h-3 text-anvi-gold" />
              <span className="truncate">{review.purchasedProductName}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-anvi-sand/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleApproval(review.id)}
            title={review.isApproved ? 'Hide from Storefront' : 'Publish to Storefront'}
            className="text-xs h-7 px-2"
          >
            {review.isApproved ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[11px]">Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-600">Publish</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(review)}
            title="Edit Review"
            className="text-xs h-7 px-2 text-anvi-charcoal hover:text-anvi-maroon"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Edit</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(review.id)}
            title="Delete Review"
            className="text-xs h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
