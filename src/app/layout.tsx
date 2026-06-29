import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import GlobalBackground from "@/components/GlobalBackground";

export const metadata: Metadata = {
  title: "GDG on Campus CIT — Community Portal",
  description: "The official community portal for Google Developer Groups on Campus, Coimbatore Institute of Technology.",
  icons: {
    icon: [
      { url: '/gdgoc-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/gdgoc-logo.png',
    shortcut: '/gdgoc-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="font-sans min-h-screen flex flex-col text-gray-900" style={{ position: 'relative' }}>
        {/* Global animated Google-themed background — fixed, z-0, behind everything */}
        <GlobalBackground />

        {/* Page content renders above the background */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

        {/* Google Identity Services client script */}
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
