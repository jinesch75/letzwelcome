"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

interface MainShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  children: React.ReactNode;
}

export default function MainShell({ user, children }: MainShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onMenuToggle={() => setMobileNavOpen(true)} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <Footer />
      <MobileNav
        user={user}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
