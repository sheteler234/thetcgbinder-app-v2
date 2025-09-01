import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Cart from '../../components/ui/Cart';
import NotificationSystem from '../../components/NotificationSystem';
import AdminSideMenu from '../../components/ui/AdminSideMenu';
import OrdersSideMenu from '../../components/ui/OrdersSideMenu';
import EmailTemplateAdmin from '../../components/ui/EmailTemplateAdmin';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <Cart />
      <AdminSideMenu />
      <OrdersSideMenu />
      <EmailTemplateAdmin />
      <NotificationSystem />
    </div>
  );
};

export default RootLayout;
