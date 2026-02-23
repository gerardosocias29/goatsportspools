import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import AdminSidebar from '../components/admin/sidebar/AdminSidebar';
import AdminHeader from '../components/admin/header/AdminHeader';
import Backdrop from '../components/admin/common/Backdrop';

const ContentLoader = () => (
  <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-400 dark:text-gray-500">Loading...</span>
    </div>
  </div>
);

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AdminSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AdminHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
