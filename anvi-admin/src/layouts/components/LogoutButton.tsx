import React from 'react';
import { LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { ROUTES } from '../../config/routes';
import { supabase } from '../../lib/supabase';

export const LogoutButton: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // session cleared locally regardless
    }
    try {
      localStorage.removeItem('anvi_admin_auth');
    } catch {
      // ignore
    }
    setLocation(ROUTES.AUTH.LOGIN);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 rounded-md transition-colors text-left"
    >
      <LogOut size={14} className="shrink-0" />
      <span>Sign Out</span>
    </button>
  );
};
