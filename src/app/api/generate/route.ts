// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// Initialisation des clients (Assurez-vous d'avoir ces variables dans votre .env.local)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Utilisez la clé de service (service_role) si vous contournez le RLS en backend, 
// ou la clé anon si vous passez le token d'auth de l'utilisateur.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userSelection, health, weather, objective, historySummary } = body;

    // 1. Validation rapide des données requises
    if (!userSelection) {
      return NextResponse.json(
        { error: "Les choix de l'utilisateur sont requis." },
        { status: 400 }
      );
    }

    // 2. Construction du Prompt Système pour formater l'IA en coach sportif strict
    const systemPrompt = `Tu es un entraîneur sportif d'élite et un expert en physiologie. 
Ton rôle est de générer une séance d'entraînement ultra-personnalisée et adaptative sous forme de JSON strict.
Tu dois t'adapter aux contraintes météo, à l'état de fatigue de l'utilisateur et à son objectif final.

Règles impératives :
1. Si la météo est défavorable (ex: pluie forte, tempête) et que le sport choisi est extérieur, ou si forceIndoor est vrai, pivote obligatoirement vers une alternative indoor (PPG, Renforcement, Home Trainer).
2. Adapte l'intensité et le volume selon le score de sommeil (${health.sleepScore}/100) et le niveau de fatigue ("${health.fatigueLevel}").
3. Prends en compte l'objectif final ("${objective?.title || "Rester en forme"}") et l'échéance (${objective?.deadline || "N/A"}).

Tu dois obligatoirement répondre TOUT EN FRANÇAIS et uniquement avec un objet JSON respectant scrupuleusement la structure suivante, sans aucun texte avant ou après :
{
  "title": "Nom de la séance accrocheur et motivant",
  "sport": "Le sport final retenu (ex: Renforcement au chaud, Course à pied)",
  "globalIntensity": "Basse" | "Modérée" | "Élevée",
  "estimatedDuration": 45, // en minutes, proche de la demande
  "warmup": [
    { "action": "Description de l'exercice", "duration": "5 min" }
  ],
  "mainWorkout": [
    { "action": "Description de la série / bloc", "duration": "20 min", "intensity": "Zone 3 / Modérée" }
  ],
  "cooldown": [
    { "action": "Retour au calme / Étirements", "duration": "5 min" }
  ],
  "coachNotes": "Conseil personnalisé du coach expliquant pourquoi cette séance est adaptée aujourd'hui (météo/fatigue/historique)."
}`;

    // 3. Prompt Utilisateur injectant le contexte dynamique
    const userPrompt = `Génère ma séance sur-mesure avec les données actuelles :
- Sport souhaité par l'utilisateur : ${userSelection.sport}
- Durée demandée : ${userSelection.duration} minutes
- Intensité souhaitée : Niveau ${userSelection.intensity}/5
- Forcer l'indoor : ${userSelection.forceIndoor ? "Oui" : "Non"}

Contexte de récupération & Environnement :
- Sommeil : ${health.sleepScore}/100, Fatigue : ${health.fatigueLevel}
- Météo actuelle : ${weather.temp}°C, Condition : "${weather.condition}" (Favorable : ${weather.isFavorable ? "Oui" : "Non"})
- Objectif à long terme : ${objective ? `${objective.title} (${objective.mainSport}) prévu le ${objective.deadline}` : "Entretien physique"}
- Historique récent : ${historySummary || "Aucune séance récente."}`;

    // 4. Appel à l'API Groq avec le modèle ultra-rapide Llama 3 (ou Mixtral)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama3-8b-8192", // Modèle ultra-rapide et performant pour le JSON
      temperature: 0.3, // Température basse pour éviter les hallucinations et forcer la structure
      response_format: { type: "json_object" }, // Mode JSON natif supporté par Groq
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error("L'IA n'a renvoyé aucune réponse.");
    }

    const workoutData = JSON.parse(rawResponse);

    // 5. Sauvegarde de la séance générée dans Supabase (Historique)
    // Note : On récupère idealement l'ID de l'utilisateur connecté via l'auth Supabase au préalable.
    // Ici, nous simulons l'insertion. Si pas d'auth configurée, commentez cette partie ou adaptez le user_id.
    const { data: authUser } = await supabase.auth.getUser();
    
    if (authUser?.user) {
      await supabase.from("workouts_history").insert({
        user_id: authUser.user.id,
        sport: workoutData.sport,
        duration: workoutData.estimatedDuration,
        intensity: workoutData.globalIntensity,
        details: workoutData, // On stocke l'intégralité du JSON généré
        status: "generated" // Passera à "completed" une fois validé par l'utilisateur
      });
    }

    // 6. Retour de la réponse au Frontend
    return NextResponse.json({ workout: workoutData });

  } catch (error: any) {
    console.error("Erreur API Generate:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de la génération.", details: error.message },
      { status: 500 }
    );
  }
}
