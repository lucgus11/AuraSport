// src/app/api/cron/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Requis pour scanner toute la table sans restriction RLS utilisateur
);

// Simulation / Fonction d'envoi de notification push PWA (Web Push)
async function sendPushNotification(userId: string, title: string, message: string) {
  // En production, vous récupéreriez les 'subscriptions' push de l'utilisateur stockées en BDD
  // et utiliseriez la librairie 'web-push' pour envoyer la notification.
  console.log(`[PUSH NOTIFICATION] To User ${userId}: ${title} - ${message}`);
  return true;
}

export async function GET(request: Request) {
  // Sécurisation de la route Cron (Vercel ajoute un header CRON_SECRET pour authentifier l'appel)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Récupérer tous les objectifs actifs non encore échus
    const { data: activeObjectives, error: objError } = await supabase
      .from("objectives")
      .select("user_id, title, deadline")
      .gte("deadline", now.toISOString().split('T')[0]);

    if (objError) throw objError;
    if (!activeObjectives || activeObjectives.length === 0) {
      return NextResponse.json({ message: "Aucun objectif actif à analyser." });
    }

    let notificationsSent = 0;

    // 2. Analyser l'inactivité pour chaque utilisateur ayant un objectif
    for (const objective of activeObjectives) {
      // Récupérer la toute dernière séance complétée de cet utilisateur
      const { data: lastWorkouts, error: walkError } = await supabase
        .from("workouts_history")
        .select("created_at")
        .eq("user_id", objective.user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (walkError) continue;

      let daysSinceLastWorkout = 0;

      if (lastWorkouts && lastWorkouts.length > 0) {
        const lastWorkoutDate = new Date(lastWorkouts[0].created_at);
        const diffTime = Math.abs(now.getTime() - lastWorkoutDate.getTime());
        daysSinceLastWorkout = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        // Si aucune séance n'a jamais été enregistrée, on ne bloque pas mais on peut l'encourager à démarrer
        daysSinceLastWorkout = 4; 
      }

      // Logique Anti-Flemme Bienveillante (No-Forcing)
      // On se manifeste gentiment après 4 jours, puis 7 jours, sans forcer et avant la limite absolue des 21 jours (3 semaines)
      if (daysSinceLastWorkout >= 4 && daysSinceLastWorkout < 21) {
        let title = "Besoin d'un coup de boost ? ⚡";
        let message = `Votre objectif "${objective.title}" approche. Une petite séance légère aujourd'hui s'adaptera parfaitement à votre état !`;

        if (daysSinceLastWorkout >= 7) {
          title = "Prenez le temps, mais restez dans le rythme 🧘";
          message = `Déjà une semaine sans s'entraîner. Rappelez-vous pourquoi vous avez commencé cet objectif ! On s'y remet en douceur ?`;
        }

        await sendPushNotification(objective.user_id, title, message);
        notificationsSent++;
      } else if (daysSinceLastWorkout >= 21) {
        // Optionnel : Limite maximale des 3 semaines dépassée. 
        // L'application n'insiste plus lourdement ou propose de redéfinir l'objectif.
        console.log(`Utilisateur ${objective.user_id} a dépassé la limite de rupture de dynamique (3 semaines).`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processedObjectives: activeObjectives.length, 
      notificationsSent 
    });

  } catch (error: any) {
    console.error("Erreur lors de l'exécution du Cron Anti-Flemme:", error);
    return NextResponse.json({ error: "Erreur interne du Cron", details: error.message }, { status: 500 });
  }
}
