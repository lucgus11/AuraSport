// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import MedicalBanner from "@/components/MedicalBanner";
import "./globals.css"; // Assurez-vous d'avoir ce fichier avec les directives Tailwind

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraSport - Entraînement IA sur-mesure",
  description: "Votre PWA d'entraînement sportif ultra-personnalisée et adaptative en temps réel.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AuraSport",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a", // Slate 900
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full bg-slate-900 text-slate-100">
      <body className={`${inter.className} flex flex-col min-h-screen antialiased`}>
        {/* Clause de non-responsabilité médicale en haut de l'application */}
        <MedicalBanner />
        
        {/* Conteneur principal optimisé pour l'affichage Mobile-First */}
        <main className="flex-1 flex flex-col max-w-md w-full mx-auto px-4 pb-24 pt-4">
          {children}
        </main>
        
        {/* Note : La navigation PWA basse peut être injectée ici si nécessaire */}
      </body>
    </html>
  );
}
