import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Financial Center",
  description: "Your complete personal finance hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
