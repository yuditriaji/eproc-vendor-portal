import type { Metadata, Viewport } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { Toaster } from "react-hot-toast";
import ReduxProvider from "@/components/ReduxProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: "Eproc Vendor Portal - Premium E-Procurement Platform",
  description: "Join the leading e-procurement platform for vendors. Submit bids, manage tenders, and grow your business with Eproc.",
  keywords: "e-procurement, vendor portal, tenders, bids, business, supply chain",
  authors: [{ name: "Eproc Team" }],
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
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                colorSuccess: '#52c41a',
                colorWarning: '#faad14',
                colorError: '#f5222d',
                colorInfo: '#1890ff',
                borderRadius: 6,
                wireframe: false,
              },
              components: {
                Layout: {
                  bodyBg: '#f5f5f5',
                  headerBg: '#ffffff',
                },
                Card: {
                  borderRadiusLG: 8,
                },
                Button: {
                  borderRadius: 6,
                },
              },
            }}
          >
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
                    borderRadius: '6px',
                    padding: '16px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#52c41a',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#f5222d',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </ReduxProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
