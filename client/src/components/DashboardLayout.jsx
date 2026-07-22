import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0b0f19]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar />
        
        <main className="flex-grow p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
