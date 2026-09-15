import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SpotIQChat from '../chatbot/SpotIQChat';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b] dark:bg-[#121214] ">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <SpotIQChat />
    </div>
  );
};

export default Layout;
