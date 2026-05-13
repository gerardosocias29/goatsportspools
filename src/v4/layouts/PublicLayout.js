import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/header/PublicHeader';
import Footer from '../components/footer/Footer';

const PublicLayout = () => {
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 mt-[calc(61px+var(--lucky-ticker-h,0px))] transition-[margin-top] duration-200">

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </>
  );
};

export default PublicLayout;
