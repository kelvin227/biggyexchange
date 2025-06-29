import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import ContextProvider from "@/components/context-provider";

import "@/app/globals.css";

import Header from "./header";
//import { TooltipProvider } from "@/components/ui/tooltip"; 
import { SidebarProvider } from "@/components/ui/sidebar"; 
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "user Dashboard",
  description: "This is the user Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={inter.className}>
        <ContextProvider>
          <SessionProvider> {/* Fixed missing session prop */}
            {/* <TooltipProvider> */}
              <SidebarProvider> 
                {/* <AppSidebar navItems={NavItems} />  */}
                <main className="w-full">
                  <Header />
                  <div className="ml-5 mt-4 mr-3">
                    {children}
                    <Toaster richColors />
                  </div>
                </main>
              </SidebarProvider>
            {/* </TooltipProvider> */}
          </SessionProvider>
        </ContextProvider>
      </body>
    </html>
  );
}