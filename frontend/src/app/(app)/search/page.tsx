"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/avatar";
import { Search, MapPin, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [hometown, setHometown] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.q = query;
      if (hometown) params.hometown = hometown;
      if (city) params.city = city;
      const res = await api.searchUsers(params);
      setResults(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Search className="h-6 w-6 text-brand-500" />
        Find People
      </h1>

      <form onSubmit={handleSearch} className="card p-5 space-y-3">
        <input
          className="input"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Filter by hometown..."
            value={hometown}
            onChange={(e) => setHometown(e.target.value)}
          />
          <input
            className="input"
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((user: any) => (
            <Link key={user.id} href={`/profile/${user.id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
              <Avatar
                src={user.avatarUrl}
                firstName={user.firstName}
                lastName={user.lastName}
                size="lg"
                verified={user.verifiedBadge}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-surface-900/60 dark:text-surface-50/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.hometown} → {user.currentCity}
                  </span>
                  {user.university && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {user.university}
                    </span>
                  )}
                  {user.profession && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {user.profession}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : searched ? (
        <div className="card p-12 text-center text-surface-900/50 dark:text-surface-50/50">
          <p>No results found. Try different search terms.</p>
        </div>
      ) : null}
    </div>
  );
}
