// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialisation locale du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Une erreur est survenue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 min-h-[80vh] px-2">
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Titre & Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            AuraSport
          </h1>
          <p className="text-sm text-slate-400">
            {isSignUp ? "Créez votre profil adaptatif" : "Reprenez là où vous vous étiez arrêté"}
          </p>
        </div>

        {/* Formulaire d'authentification */}
        <form onSubmit={handleAuth} className="p-6 space-y-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 backdrop-blur-md">
          {message && (
            <div
              className={`p-3 text-xs rounded-xl border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adresse Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 active:scale-[0.98] rounded-xl transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
          >
            {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        {/* Toggle Mode Inscription / Connexion */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition underline font-medium"
          >
            {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Créez-en un"}
          </button>
        </div>
      </div>
    </div>
  );
}
