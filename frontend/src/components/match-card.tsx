"use client";

import { useState } from "react";
import { Avatar } from "./avatar";
import { api } from "@/lib/api";
import { MapPin, GraduationCap, Briefcase, Sparkles, UserPlus, MessageCircle, Loader2 } from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    hometown: string;
    currentCity: string;
    university?: string;
    profession?: string;
    verifiedBadge: boolean;
    matchScore: number;
    matchReasons: string[];
  };
}

export function MatchCard({ match }: MatchCardProps) {
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleIntro = async () => {
    setLoading(true);
    try {
      const res = await api.generateIntro(match.id);
      setIntroMessage(res.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await api.sendConnection(match.id);
      setConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Score to color
  const scoreColor =
    match.matchScore >= 50 ? "text-emerald-500" :
    match.matchScore >= 30 ? "text-brand-500" :
    "text-surface-900/50 dark:text-surface-50/50";

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <Avatar
          src={match.avatarUrl}
          firstName={match.firstName}
          lastName={match.lastName}
          size="lg"
          verified={match.verifiedBadge}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {match.firstName} {match.lastName}
            </h3>
            <span className={`font-bold text-sm ${scoreColor}`}>
              {match.matchScore}% match
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-surface-900/60 dark:text-surface-50/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {match.hometown}
            </span>
            {match.university && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {match.university}
              </span>
            )}
            {match.profession && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {match.profession}
              </span>
            )}
          </div>

          {/* Match reasons */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {match.matchReasons.map((reason, i) => (
              <span key={i} className="badge-brand text-xs">
                {reason}
              </span>
            ))}
          </div>

          {/* AI Introduction */}
          {introMessage && (
            <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-sm border border-brand-200 dark:border-brand-500/20">
              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Suggested Intro
              </div>
              <p className="text-surface-900/80 dark:text-surface-50/80">{introMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleConnect}
              disabled={connected}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              {connected ? "Request Sent" : "Connect"}
            </button>
            <button
              onClick={handleIntro}
              disabled={loading || !!introMessage}
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              {introMessage ? "Intro Generated" : "AI Intro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
