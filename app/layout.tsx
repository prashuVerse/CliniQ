import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VitalSync | Medical Intelligence Layer",
  description: "Transforming fragmented records into clinical context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>

        <div className="bg-amber-100 text-amber-900 text-xs font-semibold text-center py-2 px-4 border-b border-amber-200">
          ⚠️ DEMO SYSTEM: This platform aggregates records but does NOT provide medical advice, diagnosis, or prescriptions. Always verify with original documents.
        </div>
        
        {children}
        
      </body>
    </html>
  );
}