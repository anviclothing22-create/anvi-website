import React from 'react';
import { Lead, LeadStatus } from '@/types/lead';
import { LeadTableRow } from './LeadTableRow';
import { LeadsEmptyState } from './LeadsEmptyState';

interface LeadsTableProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onUpdateStatus,
  onDelete,
}) => {
  if (leads.length === 0) {
    return <LeadsEmptyState />;
  }

  return (
    <div className="bg-white rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-anvi-linen/50 border-b border-anvi-sand/60 text-[11px] font-sans font-semibold uppercase tracking-wider text-anvi-muted">
            <tr>
              <th className="py-3.5 px-4 text-left">Patron & Contact Details</th>
              <th className="py-3.5 px-4 text-left">Inquiry Channel</th>
              <th className="py-3.5 px-4 text-left">Garment Interest</th>
              <th className="py-3.5 px-4 text-left">Target Date / Logged</th>
              <th className="py-3.5 px-4 text-left">Pipeline Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anvi-sand/20">
            {leads.map((lead) => (
              <LeadTableRow
                key={lead.id}
                lead={lead}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default LeadsTable;
