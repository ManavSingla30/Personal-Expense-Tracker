import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, PieChart, LogOut, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ currentPage, setCurrentPage, onLogout, sidebarOpen, setSidebarOpen }) {
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: PieChart },
    { id: 'add-expense', name: 'Add Expense', icon: Plus },
    { id: 'expenses', name: 'Expense List', icon: FileText },
    { id: 'reports', name: 'Reports', icon: Calendar },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('https://personal-expense-tracker-psi.vercel.app/findUser', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data?.user) {
          setUsername(data.user.username);
          setUserEmail(data.user.email);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleClick = (id) => {
    navigate(`/${id}`);
    setCurrentPage(id);
  }

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-blue-500">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8" />
              <span className="text-xl font-bold">ExpenseTracker</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  handleClick(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  currentPage === item.id 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'hover:bg-blue-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-blue-500">
            <div className="flex items-center space-x-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center text-blue-900 font-bold">
                {username ? username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-medium">{username || 'Loading...'}</p>
                <p className="text-xs text-blue-200">{userEmail || '...'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
