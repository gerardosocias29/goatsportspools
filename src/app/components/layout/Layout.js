import React, { useState } from 'react';
import Sidebar from '../navigations/Sidebar';
import Navbar from '../navigations/Navbar';

const Layout = ({ children, currentUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = (collapsed) => {
    setSidebarCollapsed(collapsed); 
  };

  return (
    <main className="w-full relative">
      <Navbar currentUser={currentUser}/>
      <div className='h-screen pt-[64px]'>
        <div className="flex flex-no-wrap overflow-x-hidden h-full">
          <div className={`overflow-y-auto ${sidebarCollapsed ? 'w-30' : 'w-80'} transition-all transition-duration-300 ease-in bg-white text-black hidden lg:block`}>
            <Sidebar currentUser={currentUser} onToggleSidebar={handleToggleSidebar} /> 
          </div>
          <div id="main-content" className="overflow-y-auto w-full p-5 bg-[#eee]">
            {children}
          </div>
        </div>
      </div>
      
    </main>
  );
};

export default Layout;
