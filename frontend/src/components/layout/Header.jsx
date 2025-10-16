import React from 'react';
import { Menu } from 'lucide-react';
export default function Header ({ setSidebarOpen }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 lg:flex-none">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Personal Expense System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </header>
  );
};