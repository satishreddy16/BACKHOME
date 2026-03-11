"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/match-card";
import { Loader2, Sparkles } from "lucide-react";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatches(50)
      .then((res) => setMatches(res.matches || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-500" />
          Your Matches
        </h1>
        <p className="text-surface-900/50 dark:text-surface-50/50 text-sm mt-1">
          People matched by hometown, university, profession, languages, and interests.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match: any) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-surface-900/50 dark:text-surface-50/50">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No matches yet</p>
          <p className="text-sm mt-1">Complete your profile with hometown, interests, and languages to find your community.</p>
        </div>
      )}
    </div>
  );
}
