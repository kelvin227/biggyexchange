import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import ContextProvider from '@/components/context-provider';

import '../../../../app/globals.css';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import Header from './header';
import { NavItems } from './config';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'This is the Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <body className={inter.className}>
        <ContextProvider>
          <SessionProvider>
            <SidebarProvider>
            <AppSidebar navItems={NavItems} />
            <main className="w-full">
              <div className="ml-5 mt-4 mr-3">
                  <Header />
                {children}
                <Toaster richColors />
                </div>
              </main>
            </SidebarProvider>
            </SessionProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
