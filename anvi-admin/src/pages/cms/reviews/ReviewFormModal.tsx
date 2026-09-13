import React, { useState, useEffect } from 'react';
import type { AdminReview } from '@/types/review';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Star } from 'lucide-react';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AdminReview, 'id' | 'createdAt'>) => void;
  review?: AdminReview | null;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  review,
}) => {
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerLocation, setReviewerLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [purchasedProductName, setPurchasedProductName] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    if (review) {
      setReviewerName(review.reviewerName || '');
      setReviewerLocation(review.reviewerLocation || '');
      setRating(review.rating || 5);
      setTitle(review.title || '');
      setBody(review.body || '');
      setPurchasedProductName(review.purchasedProductName || '');
      setIsVerified(review.isVerified ?? true);
      setIsApproved(review.isApproved ?? true);
    } else {
      setReviewerName('');
      setReviewerLocation('Coimbatore, Tamil Nadu');
      setRating(5);
      setTitle('');
      setBody('');
      setPurchasedProductName('');
      setIsVerified(true);
      setIsApproved(true);
    }
  }, [review, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !body.trim()) return;

    onSubmit({
      reviewerName: reviewerName.trim(),
      reviewerLocation: reviewerLocation.trim() || undefined,
      rating,
      title: title.trim() || undefined,
      body: body.trim(),
      purchasedProductName: purchasedProductName.trim() || undefined,
      isVerified,
      isApproved,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={review ? 'Edit Customer Review' : 'Add New Customer Review'}
      description="Curate authentic patron experiences and testimonials for the storefront."
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!reviewerName.trim() || !body.trim()}
          >
            {review ? 'Update Review' : 'Publish Review'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Rating Picker */}
        <div>
          <label className="block text-xs font-semibold text-anvi-charcoal mb-1.5">
            Star Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating ?? rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-anvi-charcoal ml-2">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Reviewer Name and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-anvi-charcoal mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Dr. Radhika Menon"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-anvi-charcoal mb-1">
              City / Location
            </label>
            <Input
              value={reviewerLocation}
              onChange={(e) => setReviewerLocation(e.target.value)}
              placeholder="e.g. Coimbatore, Tamil Nadu"
            />
          </div>
        </div>

        {/* Headline / Title */}
        <div>
          <label className="block text-xs font-semibold text-anvi-charcoal mb-1">
            Review Headline / Summary (Optional)
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The drape is extraordinary & genuinely authentic"
          />
        </div>

        {/* Detailed Review Text */}
        <div>
          <label className="block text-xs font-semibold text-anvi-charcoal mb-1">
            Testimonial / Review Text <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Describe the customer experience with the handloom weave, fabric comfort, or drape..."
            required
          />
        </div>

        {/* Purchased Product Name */}
        <div>
          <label className="block text-xs font-semibold text-anvi-charcoal mb-1">
            Purchased Garment / Product (Optional)
          </label>
          <Input
            value={purchasedProductName}
            onChange={(e) => setPurchasedProductName(e.target.value)}
            placeholder="e.g. Handwoven Ajrakh Chanderi Saree"
          />
        </div>

        {/* Toggles: Verified Buyer & Approved / Live */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-anvi-sand/40">
          <div className="flex items-center justify-between p-3 bg-anvi-linen/30 rounded-xl border border-anvi-sand/40">
            <div>
              <p className="text-xs font-semibold text-anvi-charcoal">Verified Customer Badge</p>
              <p className="text-[11px] text-anvi-muted">Display gold checkmark on review card</p>
            </div>
            <Switch checked={isVerified} onChange={setIsVerified} />
          </div>

          <div className="flex items-center justify-between p-3 bg-anvi-linen/30 rounded-xl border border-anvi-sand/40">
            <div>
              <p className="text-xs font-semibold text-anvi-charcoal">Live on Storefront</p>
              <p className="text-[11px] text-anvi-muted">Visible in Loved by Women Like You section</p>
            </div>
            <Switch checked={isApproved} onChange={setIsApproved} />
          </div>
        </div>
      </form>
    </Modal>
  );
};
