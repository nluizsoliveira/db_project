import type { Metadata } from "next";
import "./globals.css";
import DebugButtonsWrapper from "@/components/DebugButtonsWrapper";
import AuthInitializer from "@/components/AuthInitializer";
import { QueryProvider } from "@/lib/queryClient";

export const metadata: Metadata = {
  title: "CEFER Management",
  description: "Sistema de gerenciamento do CEFER USP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://www.usp.br/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AuthInitializer />
          {children}
          <DebugButtonsWrapper />
        </QueryProvider>
      </body>
    </html>
  );
}
