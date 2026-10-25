import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DesktopLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Navbar */}
        <Navbar pageTitle={pageTitle} />

        {/* Content Area */}
        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
