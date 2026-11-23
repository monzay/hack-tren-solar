import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AvisoDemo from "@/components/AvisoDemo";
import Encabezado from "@/components/Encabezado";
import PieUrgencias from "@/components/PieUrgencias";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapa del delito · San Salvador de Jujuy",
  description:
    "Mapa de calor, estadísticas y reportes ciudadanos para la prevención del delito en San Salvador de Jujuy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AvisoDemo />
        <Encabezado />
        <main className="flex flex-1 flex-col">{children}</main>
        <PieUrgencias />
        <Toaster theme="light" richColors position="top-center" />
      </body>
    </html>
  );
}
