import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ReduxProvider from "@/components/ReduxProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eproc Vendor Portal - Premium E-Procurement Platform",
  description: "Join the leading e-procurement platform for vendors. Submit bids, manage tenders, and grow your business with Eproc.",
  keywords: "e-procurement, vendor portal, tenders, bids, business, supply chain",
  authors: [{ name: "Eproc Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Eproc Vendor Portal",
    description: "Premium e-procurement platform for vendors",
    type: "website",
    locale: "en_US",
    siteName: "Eproc Vendor Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eproc Vendor Portal",
    description: "Premium e-procurement platform for vendors",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '0.75rem',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
