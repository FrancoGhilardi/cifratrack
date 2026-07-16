import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { QueryProvider } from "@/shared/lib/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const description =
  "Gestiona tus ingresos, egresos e inversiones de manera simple y efectiva";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CifraTrack - Control Personal de Finanzas",
    template: "%s | CifraTrack",
  },
  description,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: ["/icon.png"],
    apple: ["/icon.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "CifraTrack",
    description,
    siteName: "CifraTrack",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
