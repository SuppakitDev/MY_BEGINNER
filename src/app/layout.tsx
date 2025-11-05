// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "sonner";


const heading = localFont({
  src: [
    { path: "./fonts/geist/Geist-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/geist/Geist-Regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-heading",
});

const body = localFont({
  src: [{ path: "./fonts/geist/Geist-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-body",
});

const label = localFont({
  src: [{ path: "./fonts/geist/Geist-Medium.woff2", weight: "500", style: "normal" }],
  variable: "--font-label",
});

const code = localFont({
  src: [{ path: "./fonts/geist-mono/GeistMono-Light.woff2", weight: "400", style: "normal" }],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "Dashboard Starter",
  description: "Cards + Table + Dark mode (no external deps)",
};

const themeInit = `
(function() {
  try {
    const ls = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = ls ? ls === 'dark' : prefersDark;
    if (shouldDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(_) {}
})();
`;

// TEST 


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${label.variable} ${code.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        
      </head>

      <body className="antialiased">
        <Toaster richColors position="top-right" />
        {children}
        </body>
    </html>
  );

  
}
