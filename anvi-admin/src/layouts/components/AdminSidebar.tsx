import React from 'react';
import { SidebarBrand } from './SidebarBrand';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-[#460E1B] via-[#5B1727] to-[#380B15] text-white flex flex-col h-screen shrink-0 sticky top-0 border-r border-white/10 z-30 select-none shadow-xl">
      <SidebarBrand />
      <SidebarNavigation />
      <SidebarFooter />
    </aside>
  );
};
