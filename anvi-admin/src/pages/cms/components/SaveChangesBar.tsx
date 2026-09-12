import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SaveChangesBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
}

export const SaveChangesBar: React.FC<SaveChangesBarProps> = ({
  hasChanges,
  onSave,
  onReset,
  loading = false,
}) => {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-anvi-charcoal text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-anvi-sand/20 flex items-center gap-4 animate-slide-in">
      <div className="flex items-center gap-2 text-xs">
        <AlertCircle className="w-4 h-4 text-anvi-gold shrink-0" />
        <span>Uncommitted changes to storefront content</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="xs" onClick={onReset} className="text-white/80 hover:text-white">
          Reset
        </Button>
        <Button size="xs" onClick={onSave} loading={loading} className="bg-anvi-gold text-anvi-charcoal hover:bg-anvi-gold-dark font-semibold">
          <Check className="w-3.5 h-3.5" />
          Save Live
        </Button>
      </div>
    </div>
  );
};
export default SaveChangesBar;
