import { useState, useCallback, useEffect } from 'react';
import { initialMockLeads } from '../data/mockLeads';
import type { Lead, LeadStatus } from '../types/lead';
import { generateId } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';

const normalizeLead = (lead: Lead): Lead => ({
  ...lead,
  fullName: lead.fullName || lead.name || 'Patron Client',
  interestCategory: lead.interestCategory || (lead.interests ? lead.interests.join(', ') : 'Sarees & Heritage'),
});

const loadMergedLeads = (): Lead[] => {
  const storeLeads = getStoredItem<Lead[]>(STORAGE_KEYS.LEADS, []);
  const adminRaw = localStorage.getItem('anvi_admin_leads');
  const adminLeads: Lead[] = adminRaw ? JSON.parse(adminRaw) : initialMockLeads;

  // Combine unique leads prioritizing recently captured storefront leads
  const seenIds = new Set<string>();
  const merged: Lead[] = [];

  for (const l of storeLeads) {
    if (l && l.id && !seenIds.has(l.id)) {
      seenIds.add(l.id);
      merged.push(normalizeLead(l));
    }
  }

  for (const l of adminLeads) {
    if (l && l.id && !seenIds.has(l.id)) {
      seenIds.add(l.id);
      merged.push(normalizeLead(l));
    }
  }

  return merged.length > 0 ? merged : initialMockLeads.map(normalizeLead);
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(loadMergedLeads);

  useEffect(() => {
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'LEADS_UPDATED' || event.type === 'PRODUCTS_UPDATED') {
        setLeads(loadMergedLeads());
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LEADS || e.key === 'anvi_admin_leads') {
        setLeads(loadMergedLeads());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem('anvi_admin_leads', JSON.stringify(updated));
    setStoredItem(STORAGE_KEYS.LEADS, updated, 'LEADS_UPDATED');
  };

  const addLead = useCallback((data: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = normalizeLead({
      ...data,
      id: generateId('lead'),
      createdAt: new Date().toISOString(),
    });
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      localStorage.setItem('anvi_admin_leads', JSON.stringify(updated));
      setStoredItem(STORAGE_KEYS.LEADS, updated, 'LEADS_UPDATED');
      return updated;
    });
    return newLead;
  }, []);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, status } : l));
      saveLeads(updated);
      return updated;
    });
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveLeads(updated);
      return updated;
    });
  }, []);

  return {
    leads,
    addLead,
    updateLeadStatus,
    deleteLead,
  };
}

