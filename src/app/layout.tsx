import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: "GDG on Campus CIT — Community Portal",
  description: "The official community portal for Google Developer Groups on Campus, Coimbatore Institute of Technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="font-sans min-h-screen flex flex-col bg-gdg-bg text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Google Identity Services client script */}
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
