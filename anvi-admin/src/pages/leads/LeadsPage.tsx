import React, { useState, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LeadsTable } from './components/LeadsTable';
import { useLeads } from '@/hooks/useLeads';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/forms/FormField';
import { LeadSource } from '@/types/lead';

export const LeadsPage: React.FC = () => {
  const { leads, addLead, updateLeadStatus, deleteLead } = useLeads();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Lead form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('walk_in');
  const [interestCategory, setInterestCategory] = useState('Sarees');
  const [notes, setNotes] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const name = l.fullName || l.name || '';
      const interest = l.interestCategory || (l.interests ? l.interests.join(', ') : '');

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = name.toLowerCase().includes(q);
        const matchPhone = l.phone.includes(q);
        const matchInterest = interest.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchInterest) return false;
      }

      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (statusFilter !== 'all' && l.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      return true;
    });
  }, [leads, searchQuery, sourceFilter, statusFilter]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      fullName,
      phone,
      email: email || undefined,
      source,
      interestCategory,
      notes: notes || undefined,
      status: 'New',
    });

    setFullName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patron Inquiries & Storefront Leads"
        subtitle="Manage Tatabad boutique walk-ins, fitting appointments, and WhatsApp inquiries."
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
            <Plus className="w-4 h-4" />
            <span>Log In-Store Walk-In</span>
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-anvi-sand/60 shadow-luxury-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patron name, phone, or outfit interest..."
            className="pl-9 h-10 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-anvi-muted hover:text-anvi-charcoal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-44">
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-10 text-xs"
          >
            <option value="all">All Channels</option>
            <option value="walk_in">Store Walk-In</option>
            <option value="fitting_booking">Fitting Session</option>
            <option value="styling_consultation">Styling Consult</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="website">Website</option>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="scheduled">Scheduled</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </div>

      <LeadsTable
        leads={filteredLeads}
        onUpdateStatus={updateLeadStatus}
        onDelete={deleteLead}
      />

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Boutique Patron Inquiry"
        description="Record a walk-in client or bespoke customization request."
        size="md"
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <FormField label="Patron Full Name" required>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyadharshini K."
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Phone" required>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </FormField>

            <FormField label="Email (Optional)">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@gmail.com"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Inquiry Channel" required>
              <Select value={source} onChange={(e) => setSource(e.target.value as any)}>
                <option value="walk_in">Tatabad Store Walk-In</option>
                <option value="fitting_booking">Fitting Booking</option>
                <option value="styling_consultation">Styling Consultation</option>
                <option value="whatsapp">WhatsApp Chat</option>
                <option value="phone_inquiry">Phone Inquiry</option>
              </Select>
            </FormField>

            <FormField label="Garment of Interest" required>
              <Input
                value={interestCategory}
                onChange={(e) => setInterestCategory(e.target.value)}
                placeholder="e.g. Ajrakh Silk Sarees"
                required
              />
            </FormField>
          </div>

          <FormField label="Styling Notes / Preferences">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Looking for festive saree for Diwali wedding reception. Prefers jewel tones."
              rows={3}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-anvi-sand/80 bg-white focus:outline-none focus:ring-2 focus:ring-anvi-gold/40 focus:border-anvi-gold text-anvi-charcoal"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-anvi-sand/40">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Patron Inquiry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default LeadsPage;
