// src/components/WorkoutForm.tsx
"use client";

import { useState, useEffect } from "react";

interface WorkoutFormProps {
  initialDuration: number;
  suggestedSport: string;
  onSubmit: (data: {
    sport: string;
    duration: number;
    intensity: number;
    forceIndoor: boolean;
  }) => void;
}

export default function WorkoutForm({
  initialDuration,
  suggestedSport,
  onSubmit,
}: WorkoutFormProps) {
  const [sport, setSport] = useState(suggestedSport);
  const [duration, setDuration] = useState(initialDuration);
  const [intensity, setIntensity] = useState(3);
  const [forceIndoor, setForceIndoor] = useState(false);

  // Synchronisation avec les données asynchrones (météo/santé) injectées par le dashboard
  useEffect(() => {
    setDuration(initialDuration);
    setSport(suggestedSport);
  }, [initialDuration, suggestedSport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sport, duration, intensity, forceIndoor });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl shadow-xl space-y-5 backdrop-blur-md"
    >
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        🏃‍♂️ Paramètres de la séance
      </h3>

      {/* Choix du Sport */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Discipline souhaitée
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["Course à pied", "Vélo", "Natation"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                sport === s
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {s === "Course à pied" ? "🏃 Courir" : s === "Vélo" ? "🚴 Vélo" : "🏊 Natation"}
            </button>
          ))}
        </div>
      </div>

      {/* Curseur de Durée (Minutes) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Temps disponible
          </label>
          <span className="text-sm font-black text-cyan-400 font-mono">
            {duration} min
          </span>
        </div>
        <input
          type="range"
          min="15"
          max="120"
          step="5"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>15 min</span>
          <span>60 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Curseur d'Intensité (1 à 5) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Intensité désirée
          </label>
          <span className="text-sm font-black text-emerald-400 font-mono">
            Niveau {intensity}/5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>Récupération</span>
          <span>Modéré</span>
          <span>Seuil / Max</span>
        </div>
      </div>

      {/* Pivot Forcer l'Indoor */}
      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800">
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-slate-300 cursor-pointer" htmlFor="forceIndoor">
            S'entraîner à l'intérieur
          </label>
          <p className="text-[10px] text-slate-500">
            Forcer le renforcement / Home Trainer (ex: météo trop instable)
          </p>
        </div>
        <input
          id="forceIndoor"
          type="checkbox"
          checked={forceIndoor}
          onChange={(e) => setForceIndoor(e.target.checked)}
          className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-400 focus:ring-offset-slate-900 accent-cyan-400"
        />
      </div>

      {/* Bouton de Soumission */}
      <button
        type="submit"
        className="w-full py-3.5 font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 active:scale-[0.99] rounded-xl transition shadow-lg shadow-cyan-500/10 uppercase tracking-wider"
      >
        Générer ma séance via Groq ✨
      </button>
    </form>
  );
}
