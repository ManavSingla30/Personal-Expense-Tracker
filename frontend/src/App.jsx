import React, { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import {Outlet, useNavigate } from 'react-router-dom';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try{
      const res = await fetch('http://localhost:3000/api/user/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if(res.status === 200){
        setIsLoggedIn(false);
        setUser(null);
        navigate('/login');
      }
    }
    catch(err){
      console.error('Logout error:', err);
    }
  }

  useEffect(() => {
    const isLoggedIn = async() => {
      try{
        const res = await fetch('http://localhost:3000/isLoggedIn', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if(res.status === 200){
          setIsLoggedIn(true);
          setUser(data.user);
          navigate('/dashboard');
        }
        else{
          setIsLoggedIn(false);
          navigate('/login');
        }
      }
      catch(err){
        setIsLoggedIn(false);
        navigate('/login');
      }
    }
    isLoggedIn()
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
    </div>
  );
};

export default App;