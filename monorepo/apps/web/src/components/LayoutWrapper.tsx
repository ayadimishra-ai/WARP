"use client";

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/signin' || pathname === '/register' || pathname === '/forgot-password';

  return (
    <>
      <div className="flex">
        {/* {!isAuthPage && <Sidebar />} */}
        <main className={`flex-1 ${!isAuthPage ? '' : 'w-full'}`}>
          {children}
        </main>
      </div>
      {/* {!isAuthPage && <Footer />} */}
    </>
  );
} 