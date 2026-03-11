"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { EventCard } from "@/components/event-card";
import { Loader2, Plus, Calendar } from "lucide-react";

export default function EventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  useEffect(() => {
    if (!user) return;
    api.getEvents({ city: user.currentCity, upcoming: "true" })
      .then((res) => setEvents(res.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const event = await api.createEvent({
        title,
        description,
        location,
        city: user.currentCity,
        startsAt,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      });
      setEvents([event, ...events]);
      setShowForm(false);
      setTitle(""); setDescription(""); setLocation(""); setStartsAt(""); setMaxCapacity("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-brand-500" />
            Events
          </h1>
          <p className="text-surface-900/50 dark:text-surface-50/50 text-sm mt-1">
            Meetups and events in {user?.currentCity || "your city"}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Create Event"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-3">
          <input
            className="input"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Describe your event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="input"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <input
            type="number"
            className="input"
            placeholder="Max capacity (optional)"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
          />
          <button type="submit" disabled={creating} className="btn-primary text-sm flex items-center gap-2">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Event
          </button>
        </form>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-surface-900/50 dark:text-surface-50/50">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No upcoming events</p>
          <p className="text-sm mt-1">Be the first to organize a meetup for your community!</p>
        </div>
      )}
    </div>
  );
}
