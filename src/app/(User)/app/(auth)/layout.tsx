import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body
        >
            {children}
            <Toaster richColors />
    
        </body>
      </html>
    );
  }
  