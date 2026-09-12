import React from 'react';
import { Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Announcement } from '@/types/announcement';
import { IconButton } from '@/components/ui/IconButton';
import { Switch } from '@/components/ui/Switch';

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onEdit,
  onDelete,
  onToggle,
}) => {
  return (
    <div className="p-4 rounded-xl border border-anvi-sand/60 bg-anvi-linen/30 hover:bg-anvi-linen/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-anvi-maroon">
            #{announcement.order}
          </span>
          <p className="text-xs font-medium text-anvi-charcoal">{announcement.text}</p>
        </div>
        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-anvi-muted hover:text-anvi-maroon underline"
          >
            <span>{announcement.link}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Switch
          checked={announcement.isActive}
          onChange={onToggle}
          label={announcement.isActive ? 'Active' : 'Off'}
        />
        <IconButton icon={Edit2} label="Edit" onClick={onEdit} className="text-anvi-muted hover:text-anvi-maroon" />
        <IconButton icon={Trash2} label="Delete" onClick={onDelete} className="text-anvi-muted hover:text-rose-600" />
      </div>
    </div>
  );
};
export default AnnouncementCard;
