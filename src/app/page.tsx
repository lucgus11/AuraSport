// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import WorkoutForm from "@/components/WorkoutForm";
import WorkoutCard from "@/components/WorkoutCard";

// Types temporaires alignés avec src/types/index.ts
interface UserObjective {
  title: string;
  deadline: string;
  mainSport: string;
}

export default function DashboardPage() {
  // 1. États de l'application
  const [objective, setObjective] = useState<UserObjective | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2. Simulation des Hooks de données externes (Health & Weather)
  // En production, ces données proviendront de @/hooks/useHealthData et @/hooks/useWeather
  const [healthData, setHealthData] = useState({
    sleepScore: 78, // sur 100
    fatigueLevel: "Modérée", // Basse, Modérée, Élevée
    recommendedDuration: 45, // calculé en minutes de manière adaptative
  });

  const [weatherData, setWeatherData] = useState({
    temp: 14,
    condition: "Pluie forte", // Déclenchera l'alternative indoor de l'IA
    isFavorable: false,
  });

  // 3. Chargement initial des données utilisateur (Exemple Supabase mocké)
  useEffect(() => {
    // Simulation d'une requête Supabase pour récupérer l'objectif actif
    setObjective({
      title: "Courir 20 km",
      deadline: "2026-06-22",
      mainSport: "Course à pied",
    });
  }, []);

  // 4. Soumission du formulaire et appel à l'API Groq
  const handleGenerateWorkout = async (formData: {
    sport: string;
    duration: number;
    intensity: number;
    forceIndoor: boolean;
  }) => {
    setLoading(true);
    setError(null);
    setGeneratedWorkout(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userSelection: formData,
          health: healthData,
          weather: weatherData,
          objective: objective,
          // Historique fictif envoyé pour que l'IA calcule la charge de travail restante
          historySummary: "3 dernières séances complétées cette semaine. Volume total : 25km de course, 1h de natation.",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de la séance par l'IA.");
      }

      const data = await response.json();
      setGeneratedWorkout(data.workout);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col justify-between h-full">
      {/* Header & Objectif */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            AuraSport
          </h1>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-emerald-400 rounded-full border border-emerald-500/20">
            Mode PWA Actif
          </span>
        </div>

        {objective && (
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Objectif en vue</p>
            <p className="text-lg font-bold text-white">{objective.title}</p>
            <div className="flex justify-between items-center mt-2 text-sm text-slate-300">
              <span>Échéance : {new Date(objective.deadline).toLocaleDateString("fr-FR")}</span>
              <span className="text-cyan-400 font-medium">{objective.mainSport}</span>
            </div>
          </div>
        )}
      </div>

      {/* Zone d'action principale : Formulaire ou Résultat de l'IA */}
      <div className="flex-1 py-2">
        {!generatedWorkout && !loading && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
              ⚡ <strong>Ajustement IA :</strong> Météo actuelle (<em>{weatherData.condition}</em>) et fatigue détectée (<em>{healthData.fatigueLevel}</em>). Le formulaire s'est auto-adapté.
            </div>
            
            <WorkoutForm 
              initialDuration={healthData.recommendedDuration}
              suggestedSport={weatherData.isFavorable ? "Course à pied" : "Renforcement / PPG"}
              onSubmit={handleGenerateWorkout} 
            />
          </div>
        )}

        {/* État de chargement Groq */}
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300 font-medium animate-pulse">
              L'IA génère votre séance sur-mesure via Groq...
            </p>
            <p className="text-xs text-slate-500 max-w-xs">
              Analyse de la météo, de votre sommeil et de la charge de votre objectif en cours.
            </p>
          </div>
        )}

        {/* Affichage de l'erreur */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="text-xs mt-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-3 text-xs underline font-semibold"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Affichage du résultat généré par l'IA */}
        {generatedWorkout && (
          <div className="space-y-4">
            <WorkoutCard workout={generatedWorkout} />
            <button
              onClick={() => setGeneratedWorkout(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
            >
              Modifier les paramètres / Nouvelle séance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
