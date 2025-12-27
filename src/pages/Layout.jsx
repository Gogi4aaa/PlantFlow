
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Toaster } from 'sonner';
import { createPageUrl } from '@/utils';
import { set } from 'date-fns';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('plantpulse_user');
      const publicPages = ['/register', '/signin'];
      const isPublicPage = publicPages.some(page => location.pathname.includes(page));
      
      if (!user && !isPublicPage) {
        // Redirect to login
        navigate(createPageUrl('SignIn'));
        setIsLoading(false);
      } else if (user && isPublicPage) {
        // Already logged in, redirect to dashboard
        navigate(createPageUrl('Dashboard'));
        setIsLoading(false);
      } else {
        setIsAuthenticated(!!user);
        setIsLoading(false);
      }
    };
    setIsLoading(false);
    // checkAuth();
  }, [navigate, location.pathname]);
  


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Loading PlantPulse...</p>
        </div>
      </div>
    );
  }

  // Public pages (SignIn/Register) don't need the layout
  const publicPages = ['/register', '/signin'];
  const isPublicPage = publicPages.some(page => location.pathname.includes(page));
  
  if (isPublicPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-green-50/40">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 min-h-screen flex flex-col lg:ml-0">
          <TopBar 
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <Toaster position="top-right" richColors />
      
      <style>{`
        :root {
          --color-primary: #10B981;
          --color-primary-light: #34D399;
          --color-emerald: #059669;
        }
      `}</style>
    </div>
  );
}
