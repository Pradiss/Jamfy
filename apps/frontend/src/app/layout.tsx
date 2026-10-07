import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { RouteTransition } from "@/components/layout/route-transition";
import { ThemeListener } from "@/components/layout/theme-listener";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jamfy — encontre e contrate artistas",
  description:
    "Marketplace para descobrir músicos e bandas e solicitar contratações para o seu evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-zinc-950 dark:text-zinc-50">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeListener />
        <AuthProvider>
          <Header />
          <main className="flex flex-1 flex-col">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <Footer />
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
