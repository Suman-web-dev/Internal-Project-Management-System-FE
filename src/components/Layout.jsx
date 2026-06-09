import React, { useState, createContext, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0`}>
          <Navbar />
          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;
