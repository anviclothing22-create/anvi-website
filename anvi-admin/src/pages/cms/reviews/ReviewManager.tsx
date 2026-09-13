import React, { useState, useMemo } from 'react';
import type { AdminReview } from '@/types/review';
import { ReviewCard } from './ReviewCard';
import { ReviewFormModal } from './ReviewFormModal';
import { Button } from '@/components/ui/Button';
import { Plus, Star, Users, CheckCircle2, EyeOff, Search } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ReviewManagerProps {
  reviews: AdminReview[];
  onAdd: (review: Omit<AdminReview, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<AdminReview>) => void;
  onDelete: (id: string) => void;
  onToggleApproval: (id: string) => void;
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  reviews,
  onAdd,
  onUpdate,
  onDelete,
  onToggleApproval,
}) => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<AdminReview | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const live = reviews.filter((r) => r.isApproved).length;
    const hidden = total - live;
    const avgRating =
      total > 0
        ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / total).toFixed(1)
        : '5.0';
    return { total, live, hidden, avgRating };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === 'live' && !r.isApproved) return false;
      if (filter === 'hidden' && r.isApproved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.reviewerName?.toLowerCase().includes(q);
        const matchesLoc = r.reviewerLocation?.toLowerCase().includes(q);
        const matchesText = r.body?.toLowerCase().includes(q);
        const matchesProd = r.purchasedProductName?.toLowerCase().includes(q);
        const matchesTitle = r.title?.toLowerCase().includes(q);
        return matchesName || matchesLoc || matchesText || matchesProd || matchesTitle;
      }
      return true;
    });
  }, [reviews, filter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review: AdminReview) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Omit<AdminReview, 'id' | 'createdAt'>) => {
    if (editingReview) {
      onUpdate(editingReview.id, data);
      addToast({
        title: 'Review Updated',
        description: `Updated review from ${data.reviewerName}. Changes synced to Supabase.`,
        variant: 'success',
      });
    } else {
      onAdd(data);
      addToast({
        title: 'Review Published',
        description: `Added new review from ${data.reviewerName}. Synced live to storefront.`,
        variant: 'success',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this customer review?')) {
      onDelete(id);
      addToast({
        title: 'Review Deleted',
        description: 'Review removed from database and storefront.',
        variant: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-anvi-charcoal">
              Customer Reviews & Community Voices
            </h3>
          </div>
          <p className="text-xs text-anvi-muted max-w-2xl">
            Curate authentic feedback, ratings, and quotes showcased in the &ldquo;Loved by Women
            Like You&rdquo; section on your storefront. Synchronized directly with Supabase.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Review</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-anvi-maroon/10 flex items-center justify-center text-anvi-maroon shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-anvi-muted">
              Total Reviews
            </p>
            <p className="text-xl font-serif font-bold text-anvi-charcoal">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-anvi-muted">
              Live on Store
            </p>
            <p className="text-xl font-serif font-bold text-emerald-700">{stats.live}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-anvi-muted">
              Hidden / Draft
            </p>
            <p className="text-xl font-serif font-bold text-gray-700">{stats.hidden}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-anvi-muted">
              Average Rating
            </p>
            <p className="text-xl font-serif font-bold text-anvi-charcoal">
              {stats.avgRating} <span className="text-xs font-normal text-anvi-muted">/ 5.0</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-anvi-sand/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-anvi-charcoal text-white font-semibold'
                : 'text-anvi-muted hover:text-anvi-charcoal hover:bg-anvi-linen/50'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilter('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'live'
                ? 'bg-anvi-maroon text-white font-semibold'
                : 'text-anvi-muted hover:text-anvi-charcoal hover:bg-anvi-linen/50'
            }`}
          >
            Live on Store ({stats.live})
          </button>
          <button
            type="button"
            onClick={() => setFilter('hidden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'hidden'
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-anvi-muted hover:text-anvi-charcoal hover:bg-anvi-linen/50'
            }`}
          >
            Hidden ({stats.hidden})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-anvi-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, city, weave..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-anvi-linen/30 rounded-xl border border-anvi-sand/50 focus:outline-none focus:border-anvi-maroon"
          />
        </div>
      </div>

      {/* Review Cards Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-anvi-sand">
          <Star className="w-10 h-10 text-anvi-sand mx-auto mb-3" />
          <h4 className="font-serif text-base font-bold text-anvi-charcoal mb-1">
            No Customer Reviews Found
          </h4>
          <p className="text-xs text-anvi-muted max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'No reviews match your current search query. Try clearing the filter.'
              : 'Add your first customer review or testimonial to build trust and show patron love on the storefront.'}
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Review
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onToggleApproval={onToggleApproval}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Review Modal */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        review={editingReview}
      />
    </div>
  );
};
