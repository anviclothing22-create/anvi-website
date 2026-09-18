import { useState, useCallback, useEffect } from 'react';
import { initialMockLeads } from '../data/mockLeads';
import type { Lead, LeadStatus } from '../types/lead';
import { generateId } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase, requireAdmin } from '../lib/supabase';

const normalizeDbLead = (raw: any): Lead => ({
  id: String(raw.id),
  fullName: raw.full_name || raw.fullName || raw.name || 'Patron Client',
  name: raw.full_name || raw.fullName || raw.name || 'Patron Client',
  email: raw.email || undefined,
  phone: raw.phone || '',
  city: raw.city || undefined,
  source: raw.source || 'website_popup',
  interestCategory: raw.interest_category || raw.interestCategory || (raw.interests && raw.interests.length > 0 ? raw.interests.join(', ') : 'Privilege Patron'),
  interests: raw.interests || [],
  notes: raw.notes || (raw.coupon_unlocked_code ? `Unlocked coupon: ${raw.coupon_unlocked_code}` : undefined),
  status: (raw.status || 'new').toLowerCase() as LeadStatus,
  preferredDate: raw.preferred_date || raw.preferredDate || undefined,
  createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
});

const loadInitialLeads = (): Lead[] => {
  const cached = getStoredItem<Lead[]>(STORAGE_KEYS.LEADS, []);
  if (cached && cached.length > 0) return cached.map(normalizeDbLead);
  const adminRaw = localStorage.getItem('anvi_admin_leads');
  if (adminRaw) {
    try {
      const parsed = JSON.parse(adminRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeDbLead);
    } catch {
      // ignore
    }
  }
  return initialMockLeads.map(normalizeDbLead);
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(loadInitialLeads);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLiveLeads = useCallback(async () => {
    try {
      // Ensure admin authentication is active
      try {
        await requireAdmin();
      } catch {
        // Continue to attempt read
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const liveMapped = data.map(normalizeDbLead);
        // If Supabase has live leads, prioritize them. If empty, keep mock/local.
        const merged = liveMapped.length > 0 ? liveMapped : loadInitialLeads();
        setLeads(merged);
        localStorage.setItem('anvi_admin_leads', JSON.stringify(merged));
        setStoredItem(STORAGE_KEYS.LEADS, merged, 'LEADS_UPDATED');
      }
    } catch (err) {
      console.warn('[useLeads] Live leads fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveLeads();

    // Realtime listener for new lead submissions from storefront or contact form
    const channel = supabase
      .channel('admin-live-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        void fetchLiveLeads();
      })
      .subscribe();

    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'LEADS_UPDATED') {
        void fetchLiveLeads();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LEADS || e.key === 'anvi_admin_leads') {
        void fetchLiveLeads();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      supabase.removeChannel(channel);
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchLiveLeads]);

  const saveLeadsLocally = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem('anvi_admin_leads', JSON.stringify(updated));
    setStoredItem(STORAGE_KEYS.LEADS, updated, 'LEADS_UPDATED');
  };

  const addLead = useCallback(async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    const tempId = generateId('lead');
    const newLead: Lead = normalizeDbLead({
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    });

    // Optimistic UI update
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      localStorage.setItem('anvi_admin_leads', JSON.stringify(updated));
      setStoredItem(STORAGE_KEYS.LEADS, updated, 'LEADS_UPDATED');
      return updated;
    });

    try {
      await requireAdmin();
      const { data: dbLead, error } = await supabase
        .from('leads')
        .insert({
          full_name: data.fullName || data.name || 'Patron Client',
          email: data.email || null,
          phone: data.phone,
          source: data.source || 'walk_in',
          interest_category: data.interestCategory || 'Sarees',
          notes: data.notes || null,
          status: (data.status || 'new').toLowerCase(),
        })
        .select()
        .single();

      if (!error && dbLead) {
        const confirmed = normalizeDbLead(dbLead);
        setLeads((prev) => prev.map((l) => (l.id === tempId ? confirmed : l)));
        return confirmed;
      }
    } catch (err) {
      console.warn('[useLeads] DB lead insert fallback:', err);
    }
    return newLead;
  }, []);

  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    const cleanStatus = status.toLowerCase() as LeadStatus;

    // Optimistic local update
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, status: cleanStatus } : l));
      saveLeadsLocally(updated);
      return updated;
    });

    try {
      await requireAdmin();
      await supabase
        .from('leads')
        .update({
          status: cleanStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (err) {
      console.warn('[useLeads] DB lead update error:', err);
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    // Optimistic local update
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveLeadsLocally(updated);
      return updated;
    });

    try {
      await requireAdmin();
      await supabase.from('leads').delete().eq('id', id);
    } catch (err) {
      console.warn('[useLeads] DB lead delete error:', err);
    }
  }, []);

  return {
    leads,
    loading,
    addLead,
    updateLeadStatus,
    deleteLead,
    refreshLeads: fetchLiveLeads,
  };
}
