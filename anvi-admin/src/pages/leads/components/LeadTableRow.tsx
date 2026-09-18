import React from 'react';
import { Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';
import { formatDate } from '@/lib/formatDate';
import { LeadSourceBadge } from './LeadSourceBadge';
import { IconButton } from '@/components/ui/IconButton';

interface LeadTableRowProps {
  lead: Lead;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}

export const LeadTableRow: React.FC<LeadTableRowProps> = ({
  lead,
  onUpdateStatus,
  onDelete,
}) => {
  const patronName = lead.fullName || lead.name || 'Patron Client';
  const interest = lead.interestCategory || (lead.interests ? lead.interests.join(', ') : 'Bespoke Curation');
  const normalizedStatus = (lead.status || 'New').toLowerCase();

  return (
    <tr className="border-b border-anvi-sand/30 hover:bg-anvi-linen/30 transition-colors group">
      {/* Patron Contact */}
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          <p className="font-serif font-bold text-xs text-anvi-charcoal">
            {patronName}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-anvi-muted">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-anvi-maroon">
              <Phone className="w-3 h-3" />
              <span>{lead.phone}</span>
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-anvi-maroon">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{lead.email}</span>
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Inquiry Source */}
      <td className="py-3.5 px-4">
        <LeadSourceBadge source={lead.source} />
      </td>

      {/* Interest & Notes */}
      <td className="py-3.5 px-4 text-xs">
        <p className="font-semibold text-anvi-charcoal">{interest}</p>
        <p className="text-[11px] text-anvi-muted line-clamp-1">{lead.notes || 'No extra notes logged'}</p>
      </td>

      {/* Appointment Date / Logged */}
      <td className="py-3.5 px-4 text-xs text-anvi-muted">
        {lead.preferredDate ? (
          <div className="flex items-center gap-1 text-anvi-maroon font-medium">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(lead.preferredDate)}</span>
          </div>
        ) : (
          <span className="text-[11px]">{formatDate(lead.createdAt)}</span>
        )}
      </td>

      {/* Status Selector */}
      <td className="py-3.5 px-4">
        <select
          value={normalizedStatus}
          onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
          className={`px-2 py-1 rounded-lg text-xs font-medium border focus:outline-none capitalize ${
            normalizedStatus === 'converted'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : normalizedStatus === 'scheduled'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : normalizedStatus === 'contacted'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="scheduled">Fitting Scheduled</option>
          <option value="converted">Purchased / Converted</option>
          <option value="closed">Closed</option>
        </select>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <IconButton
          icon={Trash2}
          label="Delete Lead"
          onClick={() => onDelete(lead.id)}
          className="text-anvi-muted hover:text-rose-600"
        />
      </td>
    </tr>
  );
};
export default LeadTableRow;
