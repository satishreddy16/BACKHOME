"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Avatar } from "./avatar";
import { api } from "@/lib/api";
import { MapPin, Clock, Users, Check } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    city: string;
    startsAt: string;
    endsAt?: string;
    maxCapacity?: number;
    tags: string[];
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    _count: { rsvps: number };
  };
}

export function EventCard({ event }: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);

  const handleRsvp = async (status: string) => {
    try {
      await api.rsvpEvent(event.id, status);
      setRsvpStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Gradient header */}
      <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600" />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-surface-900/60 dark:text-surface-50/60">
              <Avatar
                src={event.creator.avatarUrl}
                firstName={event.creator.firstName}
                lastName={event.creator.lastName}
                size="sm"
              />
              <span className="ml-1">
                {event.creator.firstName} {event.creator.lastName}
              </span>
            </div>
          </div>

          {/* Date badge */}
          <div className="text-center bg-brand-50 dark:bg-brand-500/10 rounded-xl px-3 py-2">
            <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              {new Date(event.startsAt).toLocaleDateString("en-US", { month: "short" })}
            </div>
            <div className="text-xl font-bold text-brand-700 dark:text-brand-300">
              {new Date(event.startsAt).getDate()}
            </div>
          </div>
        </div>

        <p className="text-sm text-surface-900/70 dark:text-surface-50/70 mt-3 line-clamp-2">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-surface-900/50 dark:text-surface-50/50">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateTime(event.startsAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event._count.rsvps}{event.maxCapacity ? `/${event.maxCapacity}` : ""} attending
          </span>
        </div>

        {event.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3">
            {event.tags.map((tag) => (
              <span key={tag} className="badge-brand text-xs">#{tag}</span>
            ))}
          </div>
        )}

        {/* RSVP buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleRsvp("GOING")}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
              rsvpStatus === "GOING"
                ? "bg-emerald-500 text-white"
                : "btn-primary"
            }`}
          >
            {rsvpStatus === "GOING" ? (
              <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Going</span>
            ) : "RSVP"}
          </button>
          <button
            onClick={() => handleRsvp("INTERESTED")}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
              rsvpStatus === "INTERESTED"
                ? "bg-brand-500 text-white"
                : "btn-secondary"
            }`}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
}
