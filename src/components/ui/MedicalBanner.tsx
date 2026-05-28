// src/components/MedicalBanner.tsx
"use client";

import { useState } from "react";

export default function MedicalBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center relative backdrop-blur-md">
      <div className="max-w-md mx-auto pr-6 flex items-center justify-center gap-2">
        <span className="text-amber-400 text-sm">⚠️</span>
        <p className="text-[11px] text-amber-200/90 leading-normal text-left font-medium">
          <strong>Avertissement médical :</strong> L'IA d'AuraSport fournit des suggestions d'entraînement et ne remplace pas un avis médical. Consultez un médecin avant d'entreprendre des activités physiques intenses. Écoutez votre corps.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-white text-xs p-1 font-bold transition"
        aria-label="Fermer l'avertissement"
      >
        ✕
      </button>
    </div>
  );
}
