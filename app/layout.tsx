
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LavanFlow - Modern Laundry OS",
  description: "Enterprise solutions for laundry management with RBAC and AI integration.",
};

// Fix: Used Readonly for props to align with standard Next.js 14/15 boilerplate patterns
// which can resolve certain TypeScript property missing errors in the layout pipeline.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Fix: Passing children explicitly as a prop to the AuthProvider can bypass issues where 
              TSX children are not correctly mapped to the 'children' prop in specific environments. */}
          <AuthProvider children={children} />
        </ThemeProvider>
      </body>
    </html>
  );
}
