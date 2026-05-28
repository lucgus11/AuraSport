// src/app/workout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PastWorkout {
  id: string;
  created_at: string;
  sport: string;
  duration: number;
  intensity: string;
  status: string;
  details: {
    title: string;
    coachNotes?: string;
  };
}

export default function WorkoutPage() {
  const [history, setHistory] = useState<PastWorkout[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // États pour la séance en cours (Simulation d'une séance active à lancer)
  const [activeWorkout, setActiveWorkout] = useState<{ title: string; duration: number } | null>({
    title: "Session Adaptative - Focus Endurance Basse",
    duration: 45, // minutes
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes en secondes

  // Gestion du Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Récupération de l'historique depuis Supabase
  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Requête sur Supabase
        const { data, error } = await supabase
          .from("workouts_history")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error("Erreur de récupération de l'historique :", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, []);

  // Formatage du Timer (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 flex flex-col h-full pb-12">
      {/* SECTION 1 : SÉANCE ACTIVE EN COURS */}
      {activeWorkout && (
        <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full uppercase tracking-wider">
              En cours
            </span>
            <button 
              onClick={() => setActiveWorkout(null)} 
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Abandonner
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeWorkout.title}</h2>
            <p className="text-xs text-slate-400 mt-1">L'IA adapte votre charge de travail en temps réel.</p>
          </div>

          {/* Affichage du Chrono */}
          <div className="flex justify-center py-6">
            <div className="text-5xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Contrôles du Timer */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-3 font-bold text-sm rounded-xl transition active:scale-[0.98] ${
                isTimerRunning 
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                  : "bg-emerald-400 text-slate-950 font-black hover:opacity-90"
              }`}
            >
              {isTimerRunning ? "Pause" : "Démarrer la séance"}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2 : HISTORIQUE DES SÉANCES */}
      <div className="space-y-4 flex-1">
        <h3 className="text-lg font-bold text-slate-200 tracking-tight flex items-center gap-2">
          📊 Historique de vos activités
        </h3>

        {loadingHistory ? (
          <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
            Chargement de vos statistiques...
          </div>
        ) : history.length === 0 ? (
          <div className="p-6 bg-slate-800/30 border border-dashed border-slate-700/60 rounded-2xl text-center text-sm text-slate-400">
            Aucune séance enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((workout) => (
              <div 
                key={workout.id}
                className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl flex justify-between items-center hover:border-slate-600 transition"
              >
                <div className="space-y-1 max-w-[70%]">
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-wide">{workout.sport}</p>
                  <h4 className="text-sm font-semibold text-white truncate">{workout.details?.title || "Séance sur-mesure"}</h4>
                  <p className="text-[11px] text-slate-400">
                    {new Date(workout.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-100">{workout.duration} min</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Intensité : {workout.intensity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
