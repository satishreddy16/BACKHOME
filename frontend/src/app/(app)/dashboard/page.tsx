"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PostCard } from "@/components/post-card";
import { MatchCard } from "@/components/match-card";
import { MapPin, Users, Newspaper, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getPosts({ city: user.currentCity, limit: "5" }).catch(() => ({ posts: [] })),
      api.getMatches(5).catch(() => ({ matches: [] })),
    ]).then(([postsRes, matchesRes]) => {
      setPosts(postsRes.posts || []);
      setMatches(matchesRes.matches || []);
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card p-8 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
            <p className="mt-1 text-white/80 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {user.hometown} → {user.currentCity}
            </p>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Matches", value: matches.length, icon: Users, href: "/matches" },
            { label: "Feed Posts", value: posts.length, icon: Newspaper, href: "/feed" },
            { label: "Events", value: "View", icon: Calendar, href: "/events" },
          ].map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors"
            >
              <Icon className="h-5 w-5 mb-2" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-white/70">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Community Feed</h2>
            <Link href="/feed" className="text-brand-500 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-200 dark:bg-surface-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-surface-200 dark:bg-surface-800" />
                      <div className="h-3 w-full rounded bg-surface-200 dark:bg-surface-800" />
                      <div className="h-3 w-2/3 rounded bg-surface-200 dark:bg-surface-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="card p-8 text-center text-surface-900/50 dark:text-surface-50/50">
              <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No posts in your city yet. Be the first!</p>
              <Link href="/feed" className="btn-primary mt-4 inline-block text-sm">
                Create a Post
              </Link>
            </div>
          )}
        </div>

        {/* Matches sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Matches</h2>
            <Link href="/matches" className="text-brand-500 text-sm font-medium flex items-center gap-1 hover:underline">
              See All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 rounded-full bg-surface-200 dark:bg-surface-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-surface-200 dark:bg-surface-800" />
                      <div className="h-3 w-24 rounded bg-surface-200 dark:bg-surface-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            matches.map((match: any) => <MatchCard key={match.id} match={match} />)
          ) : (
            <div className="card p-8 text-center text-surface-900/50 dark:text-surface-50/50">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Complete your profile to find matches!</p>
              <Link href="/profile" className="btn-primary mt-4 inline-block text-sm">
                Edit Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
