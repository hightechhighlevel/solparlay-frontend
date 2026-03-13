import type { Metadata } from "next";
// import Head from "next/head";
import localFont from "next/font/local";
import "./globals.css";
// import Head from 'next/head';
import AppWalletProvider from "./components/AppWalletProvider";
import { Providers } from "./components/providers";
import { ThemeScript } from "./components/theme-script";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastProvider from "./components/ToastProvider";
import StatusChecker from "./components/StatusChecker";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Solparlay",
  description: "Automate & Chain Transactions.",
  // icons: {
  //   icon: "/favicon.ico",
  // },
  openGraph: {
    title: "Solparlay",
    description: "Automate & Chain Transactions.",
    images: "/favicon.ico",
    url: "https://solparlay.com/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      {/* <MyContextProvider> */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <ThemeScript />
        </head>
        {/* <Head>
          <title>Solparlay</title>
          <meta name="description" content="This website is for users to trade."/>
          <meta name="keyword" content="solparlay, trade"/>
          <meta property="og:title" content="Solparlay"/>
          <meta property="og:description" content="This website is for users to trade."/>
          <meta property="og:image" content="/favicon.svg"/>
          <meta property="og:url" content="https://solparlay.com/"/>
          <link rel="icon" href="/favicon.svg" />
        </Head> */}
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <AppWalletProvider>
              <ErrorBoundary>
                <ToastProvider>
                  {children}
                  <StatusChecker />
                </ToastProvider>
              </ErrorBoundary>
            </AppWalletProvider>
          </Providers>
        </body>
      </html>
      {/* </MyContextProvider> */}
    </>
  );
}
