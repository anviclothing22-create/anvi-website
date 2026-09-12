import React from 'react';

interface CMSSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const CMSSection: React.FC<CMSSectionProps> = ({
  title,
  description,
  action,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 p-6 shadow-luxury-subtle space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-anvi-sand/40 pb-4">
        <div>
          <h3 className="text-base font-serif font-bold text-anvi-charcoal">{title}</h3>
          {description && <p className="text-xs text-anvi-muted mt-0.5">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
};
export default CMSSection;
